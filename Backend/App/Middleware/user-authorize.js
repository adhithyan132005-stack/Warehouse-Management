const AuthorizeUser=(permittedRoles)=>{
    return(req,res,next)=>{
        if(permittedRoles.includes(req.role)){
            next()
        }else{
            res.status(403).json({error:"Access denied..."})
        }
    }
}
module.exports=AuthorizeUser;