const joi=require('joi');
const UserRegistrationSchema=joi.object({
    username:joi.string().trim().min(3).required(),
    email:joi.string().trim().email().required(),
    password:joi.string().trim().min(8).max(128).required()
})
const LoginValidationSchema=joi.object({
    email:joi.string().trim().email().required(),
    password:joi.string().trim().min(8).max(128).required()

})
module.exports={UserRegistrationSchema,LoginValidationSchema}