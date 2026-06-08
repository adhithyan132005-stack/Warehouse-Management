const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const OTP = require('../Model/otp-model');
const User = require('../Model/user-model');
const { SendEmailOTPSchema, SendPhoneOTPSchema, VerifyOTPSchema, OTPLoginSchema } = require('../Validation/otp-validators');

const OTPController = {};

// Helper to generate a 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// --- NODEMAILER CONFIG ---
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can change this based on your provider
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- TWILIO CONFIG ---
let twilioClient;
try {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
} catch (error) {
    console.error("Twilio Initialization Error:", error.message);
}

// 1. Send Email OTP
OTPController.sendEmailOTP = async (req, res) => {
    try {
        const { error, value } = SendEmailOTPSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details.map(e => e.message) });

        const email = value.email;
        const otpCode = generateOTP();

        // Delete any existing unverified OTPs for this email to prevent spam/confusion
        await OTP.deleteMany({ identifier: email, type: 'email' });

        const newOTP = new OTP({
            identifier: email,
            otp: otpCode,
            type: 'email',
            expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes expiry
        });
        await newOTP.save();

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Adhi Warehouse - Login Verification Code',
                text: `Your verification code is: ${otpCode}. It is valid for 5 minutes. Do not share this with anyone.`,
                html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center;">
                        <h2 style="color: #00A19B;">Adhi Warehouse</h2>
                        <p>Your login verification code is:</p>
                        <h1 style="font-size: 32px; letter-spacing: 4px; color: #333; background: #f4f4f4; padding: 10px; border-radius: 8px;">${otpCode}</h1>
                        <p style="color: #666; font-size: 14px;">This code is valid for 5 minutes. Do not share it with anyone.</p>
                       </div>`
            };
            await transporter.sendMail(mailOptions);
        } else {
            console.log(`[MOCK MODE] Email OTP for ${email}: ${otpCode}`);
            // We proceed even in mock mode for testing without real credentials
        }

        res.json({ message: "OTP sent successfully to email.", type: 'email' });
    } catch (err) {
        console.error("Error sending Email OTP:", err);
        res.status(500).json({ error: "Failed to send OTP", details: err.message });
    }
};

// 2. Send Phone OTP
OTPController.sendPhoneOTP = async (req, res) => {
    try {
        const { error, value } = SendPhoneOTPSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details.map(e => e.message) });

        const phone = value.phone;
        const otpCode = generateOTP();

        await OTP.deleteMany({ identifier: phone, type: 'phone' });

        const newOTP = new OTP({
            identifier: phone,
            otp: otpCode,
            type: 'phone',
            expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes expiry
        });
        await newOTP.save();

        if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
            await twilioClient.messages.create({
                body: `Your Adhi Warehouse verification code is: ${otpCode}. Valid for 5 minutes.`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phone
            });
        } else {
            console.log(`[MOCK MODE] Phone OTP for ${phone}: ${otpCode}`);
        }

        res.json({ message: "OTP sent successfully to phone number.", type: 'phone' });
    } catch (err) {
        console.error("Error sending Phone OTP:", err);
        res.status(500).json({ error: "Failed to send OTP. Please check the phone number and Twilio configuration.", details: err.message });
    }
};

// 3. Verify OTP
OTPController.verifyOTP = async (req, res) => {
    try {
        const { error, value } = VerifyOTPSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details.map(e => e.message) });

        const { identifier, otp, type } = value;

        const otpRecord = await OTP.findOne({ identifier, type, otp });

        if (!otpRecord) {
            return res.status(400).json({ error: "Invalid OTP code." });
        }

        if (otpRecord.expiresAt < new Date()) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ error: "OTP has expired. Please request a new one." });
        }

        // Mark as verified
        otpRecord.verified = true;
        await otpRecord.save();

        res.json({ message: "OTP verified successfully.", verified: true });
    } catch (err) {
        console.error("Error verifying OTP:", err);
        res.status(500).json({ error: "Failed to verify OTP", details: err.message });
    }
};

// 4. OTP Login (Called immediately after successful verifyOTP if it's a login flow)
OTPController.otpLogin = async (req, res) => {
    try {
        const { error, value } = OTPLoginSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details.map(e => e.message) });

        const { identifier, type } = value;

        // Ensure there's a *verified* OTP record for this identifier
        const otpRecord = await OTP.findOne({ identifier, type, verified: true });
        
        if (!otpRecord) {
            return res.status(401).json({ error: "Please verify OTP first before attempting to login." });
        }

        // Find user by email or phone
        let user;
        if (type === 'email') {
            user = await User.findOne({ email: identifier });
        } else {
            user = await User.findOne({ phone: identifier });
        }

        if (!user) {
            // Optional: Auto-create user if they don't exist (like a magic link)
            // Or force them to register first. We'll return an error indicating they need to register.
            return res.status(404).json({ error: "User not found. Please register first." });
        }

        // Clean up verified OTP
        await OTP.deleteOne({ _id: otpRecord._id });

        // Generate JWT
        const TokenData = { userId: user._id, role: user.role };
        const token = jwt.sign(TokenData, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.json({ token: token, username: user.username, role: user.role });

    } catch (err) {
        console.error("Error in OTP Login:", err);
        res.status(500).json({ error: "Login failed", details: err.message });
    }
};

module.exports = OTPController;
