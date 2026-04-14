const express=require("express")
const router=express.Router()
const AuthenticateUser=require("../Middleware/user-authenticate")
const AuthorizeUser=require("../Middleware/user-authorize")
const stockCltr=require("../Controller/StockController")

router.post("/stock-in",AuthenticateUser,AuthorizeUser(["admin","staff"]),stockCltr.stockIn)
router.post("/stock-out",AuthenticateUser,AuthorizeUser(["admin","staff"]),stockCltr.stockOut)
router.get("/expiry-alert",AuthenticateUser,AuthorizeUser(["admin","staff"]),stockCltr.getExpiryAlert)

module.exports=router