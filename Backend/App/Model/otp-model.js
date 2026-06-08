const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const otpSchema = new Schema({
    identifier: { // Email or Phone number
        type: String,
        required: true,
        trim: true
    },
    otp: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['email', 'phone'],
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        expires: 0 // TTL index: automatically delete document when expiresAt is reached
    },
    verified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Prevent sending multiple OTPs to the same identifier within a short window if needed, 
// but for now, TTL handles cleanup.

const OTP = model("otp", otpSchema);
module.exports = OTP;
