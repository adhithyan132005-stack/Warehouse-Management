const express=require("express")
const router=express.Router()
const AuthenticateUser=require("../Middleware/user-authenticate")
const AuthorizeUser=require("../Middleware/user-authorize")
const inventoryController=require("../Controller/Inventory-controller")

router.post("/inventory",AuthenticateUser,AuthorizeUser(["admin","staff"]),inventoryController.createInventory)
router.get("/inventory",AuthenticateUser,inventoryController.getallInventory)
router.get("/inventory/:id",AuthenticateUser,inventoryController.getInventoryById)
router.put("/inventory/:id",AuthenticateUser,AuthorizeUser(["admin","staff"]),inventoryController.updateInventory)
router.delete("/inventory/:id",AuthenticateUser,AuthorizeUser(["admin","staff"]),inventoryController.deleteInventory)
router.get("/inventory/:locationId",AuthenticateUser,AuthorizeUser(["admin","staff"]),inventoryController.getProductsByLocation)
module.exports=router