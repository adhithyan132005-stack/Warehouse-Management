const { OAuth2Client } = require('google-auth-library');
const User = require('../Model/user-model');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const crypto = require('crypto');


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const verifyGoogleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ error: 'Google credential token is required' });
        }

        
        let ticket;
        try {
            ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
        } catch (verifyError) {
            console.error('Google Token Verification Error:', verifyError.message);
            return res.status(400).json({ error: 'Invalid Google token signature or expired' });
        }

        const payload = ticket.getPayload();
        if (!payload) {
            return res.status(400).json({ error: 'Invalid Google token payload' });
        }

        const { email, name, email_verified } = payload;
        if (!email_verified) {
            return res.status(400).json({ error: 'Google email is not verified' });
        }

        
        let user = await User.findOne({ email });

        if (!user) {
            const tempPassword = crypto.randomBytes(16).toString('hex');
            const salt = await bcryptjs.genSalt();
            const hashedPassword = await bcryptjs.hash(tempPassword, salt);

            
            const username = name || email.split('@')[0];

            user = new User({
                username,
                email,
                password: hashedPassword,
                role: 'user', 
            });

            
            const userCount = await User.countDocuments();
            if (userCount === 0) {
                user.role = 'admin';
            }

            await user.save();
        }

        
        if (!process.env.JWT_SECRET) {
            console.error('CRITICAL ERROR: JWT_SECRET environment variable is not defined!');
            return res.status(500).json({ error: 'Server configuration error (JWT_SECRET missing)' });
        }

        const tokenData = { userId: user._id, role: user.role };
        const appToken = jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.json({
            token: appToken,
            username: user.username,
            role: user.role
        });

    } catch (err) {
        console.error('CRITICAL ERROR in Google Verify:', {
            message: err.message,
            stack: err.stack,
            body: req.body
        });
        res.status(500).json({ error: 'Something went wrong during Google sign in', details: err.message });
    }
};

module.exports = {
    verifyGoogleLogin
};
