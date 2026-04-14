const Inventory=require("../Model/inventory-model")
const product=require("../Model/product-model")
const location=require("../Model/location-model")
const inventoryController={}
inventoryController.createInventory=async(req,res)=>{
    const body=req.body
    try{
        const inventory=await Inventory.create(body)
        res.json(inventory)
    }catch(err){
        res.status(500).json({message:err.message})
    }
}
inventoryController.getallInventory=async(req,res)=>{
    try{
        const inventory=await Inventory.find().populate("productId").populate("locationId")
        res.json(inventory)
    }catch(err){
        res.status(500).json({message:err.message})
    }

}
inventoryController.getInventoryById=async(req,res)=>{
    const id=req.params.id
    try{
        const inventory=await Inventory.findById(id).populate("productId").populate("locationId")
        if(!inventory){
            return res.status(404).json({message:"Inventory not found"})
        }
        res.json(inventory)

    }catch(err){
        res.status(500).json({message:err.message})
    }
}
inventoryController.updateInventory=async(req,res)=>{
    const id=req.params.id
    const body=req.body
    try{
        const inventory=await Inventory.findByIdAndUpdate(id,body,{new:true})
        if(!inventory){
            return res.status(404).json({message:"Inventory not found"})
        }
        res.json(inventory)
    }catch(err){
        res.status(500).json({message:err.message})
    }
}
 
inventoryController.deleteInventory=async(req,res)=>{
    const id=req.params.id
    try{
        const inventory=await Inventory.findByIdAndDelete(id)
        if(!inventory){
            return res.status(404).json({message:"inventory not found"})
        }
        res.json({message:"Inventory deleted successfully"})
    }catch(err){
        res.status(500).json({message:err.message})
    }
}
inventoryController.getProductsByLocation=async(req,res)=>{
    try{
        const data=await Inventory.find({locationId:req.params.locationId}).populate("productId")
        res.json(data)
    }catch(err){
        res.status(500).json({error:err.message})
    }
}
module.exports=inventoryController