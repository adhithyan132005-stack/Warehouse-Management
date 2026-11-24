const PaymentController=require("../Controller/Payment-controller")
const express=require("express")
const router=express.Router()
router.post("/payment/create-order",PaymentController.createOrder)

module.exports=router