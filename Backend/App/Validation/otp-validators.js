const joi = require('joi');

const SendEmailOTPSchema = joi.object({
    email: joi.string().trim().email().required()
});

const SendPhoneOTPSchema = joi.object({
    phone: joi.string().trim().required() // Basic validation, can add regex for phone numbers
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
