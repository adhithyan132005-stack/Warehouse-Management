const express=require("express")
const router=express.Router()
const AuthenticateUser=require("../Middleware/user-authenticate")
const AuthorizeUser=require("../Middleware/user-authorize")
const orderController=require("../Controller/order-controller")

router.post("/orders",AuthenticateUser,orderController.createOrder)
router.get("/orders",AuthenticateUser,AuthorizeUser(["admin","staff"]),orderController.getOrder)
router.get("/user-orders",AuthenticateUser,orderController.getUserOrders)
router.put("/orders/:id",AuthenticateUser,AuthorizeUser(["admin","staff"]),orderController.updateStatus)
router.get("/orders/:id/picklist",AuthenticateUser,AuthorizeUser(["admin","staff"]),orderController.getPickList)
module.exports=router