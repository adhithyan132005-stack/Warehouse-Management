const express=require("express")
const router=express.Router()
const AuthenticateUser=require("../Middleware/user-authenticate")
const activityController=require("../Controller/Activity-controller")
router.get("/activity",AuthenticateUser,activityController.getActivities)
module.exports=router