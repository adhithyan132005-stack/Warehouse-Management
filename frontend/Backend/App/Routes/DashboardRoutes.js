const express=require("express")
const router=express.Router()
const AuthenticateUser=require("../Middleware/user-authenticate")
const AuthorizeUser=require("../Middleware/user-authorize")
const dashboardController=require("../Controller/Dashboard-controller")

router.get("/dashboard",AuthenticateUser,dashboardController.getdashbaordstats)

module.exports=router