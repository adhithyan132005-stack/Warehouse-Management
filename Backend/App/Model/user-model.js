const mongoose=require('mongoose');
const{Schema,model}=mongoose
const userSchema=new Schema({
    username:String,
    email:String,
    password:String,
    role:{
        type:String,
        default:'user',
        enum:['user','admin','staff']
    }

},{timestamps:true})
const User=model("user",userSchema)
module.exports=User;