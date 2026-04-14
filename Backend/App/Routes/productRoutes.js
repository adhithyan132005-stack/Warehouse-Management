const express=require("express")
const router=express.Router()
const AuthenticateUser=require("../Middleware/user-authenticate")
const AuthorizeUser=require("../Middleware/user-authorize")
const productController=require("../Controller/product-controller")

router.post("/product",AuthenticateUser,AuthorizeUser(["admin"]),productController.create)
router.get("/product",AuthenticateUser,productController.list)
router.get("/product/:id",AuthenticateUser,AuthorizeUser(["admin","staff"]),productController.show)
router.put("/product/:id",AuthenticateUser,AuthorizeUser(["admin"]),productController.update)
router.delete("/product/:id",AuthenticateUser,AuthorizeUser(["admin"]),productController.delete)
router.get("/barcode",AuthenticateUser,productController.barcode)
module.exports=router;