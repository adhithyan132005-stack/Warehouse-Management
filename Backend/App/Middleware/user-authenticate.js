const jwt=require('jsonwebtoken')
const AuthenticateUser=(req,res,next)=>{
    let token=req.headers['authorization'];
    if(!token){
        return res.status(401).json({error:'token not provided..'})
    }

    if(token.startsWith('Bearer ')){
        token = token.slice(7)
    }

    try{
        const tokendata=jwt.verify(token,process.env.JWT_SECRET)
        req.userId=tokendata.userId
        req.role=tokendata.role
        next()
    }catch(err){
        console.log(err)
        return res.status(401).json({error:err.message})
    }
}
module.exports=AuthenticateUser
