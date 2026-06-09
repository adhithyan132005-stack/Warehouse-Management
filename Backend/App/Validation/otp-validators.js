const joi = require('joi');

const SendEmailOTPSchema = joi.object({
    email: joi.string().trim().email().required()
});

const SendPhoneOTPSchema = joi.object({
    phone: joi.string().trim().pattern(/^\+?[1-9]\d{1,14}$/).required().messages({
        'string.pattern.base': 'Phone number must be in E.164 format (e.g., +919876543210) or valid international format'
    })
});

const VerifyOTPSchema = joi.object({
    identifier: joi.string().trim().required(),
    otp: joi.string().trim().length(6).required(),
    type: joi.string().valid('email', 'phone').required()
});

const OTPLoginSchema = joi.object({
    identifier: joi.string().trim().required(),
    type: joi.string().valid('email', 'phone').required()
});

module.exports = {
    SendEmailOTPSchema,
    SendPhoneOTPSchema,
    VerifyOTPSchema,
    OTPLoginSchema
};
