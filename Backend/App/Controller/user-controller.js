const User=require("../Model/user-model")
const bcryptjs=require('bcryptjs')
const jwt=require('jsonwebtoken')
const{UserRegistrationSchema,LoginValidationSchema}=require("../Validation/user-validators")
const Usercltr={};
Usercltr.Register=async(req,res)=>{
    const body=req.body;
    const{error,value}=UserRegistrationSchema.validate(body,{abortEarly:false})
    if(error){
        return res.status(400).json({error:error.details.map(err=>err.message)})
    }
    try{
        const UserPresentWithEmail=await User.findOne({email:value.email})
        if(UserPresentWithEmail){
            return res.status(400).json({error:'This Email already taken..! '})
        }else{
        const user=new User(value);
        const salt=await bcryptjs.genSalt();
        const HashPassword=await bcryptjs.hash(value.password,salt)
        user.password=HashPassword
        const userCount=await User.countDocuments()
        if(userCount==0){
            user.role='admin'
        } else {
            user.role = ['user','staff'].includes(value.role) ? value.role : 'user'
        }
        await user.save();
        res.status(201).json(user)
        }

    }catch(err){
        console.log(err)
        res.status(500).json({error:'something went wrong..!'})

    }
}
Usercltr.Login=async(req,res)=>{
    const body=req.body;
    const{error,value}=LoginValidationSchema.validate(body,{abortEarly:false})
    if(error){
        return res.status(400).json({error:error.details.map(err=>err.message)})
    }
    const UserPresent=await User.findOne({email:value.email})
    if(!UserPresent){
        return res.status(400).json({error:'invalid email'})
    }
    const isPasswordMatch=await bcryptjs.compare(value.password,UserPresent.password)
    if(!isPasswordMatch){
        return res.status(400).json({error:"Invalid Password...!"})
    }
    const TokenData={userId:UserPresent._id,role:UserPresent.role}
    const token=jwt.sign(TokenData,process.env.JWT_SECRET,{expiresIn:'30d'})
    res.json({token:token, username: UserPresent.username})
}
Usercltr.Account=async(req,res)=>{
    try{
    const user=await User.findOne({_id:req.userId})
    res.json(user)
    }catch(err){
        console.log(err)
        res.status(500).json({error:'something went wrong...'})
    }
}

Usercltr.listUsers=async(req,res)=>{
    try{
        const users=await User.find().select('-password')
        res.json(users)
    }catch(err){
        console.log(err)
        res.status(500).json({error:'something went wrong...'})
    }
}

Usercltr.updateRole=async(req,res)=>{
    try{
        const{id}=req.params
        const{role}=req.body
        if(!['user','staff'].includes(role)){
            return res.status(400).json({error:'Invalid role'})
        }
        const user=await User.findByIdAndUpdate(id,{role},{new:true}).select('-password')
        if(!user){
            return res.status(404).json({error:'User not found'})
        }
        res.json(user)
    }catch(err){
        console.log(err)
        res.status(500).json({error:'something went wrong...'})
    }
}

module.exports=Usercltr;
