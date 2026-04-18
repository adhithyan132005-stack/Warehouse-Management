const Inventory=require("../Model/inventory-model")
const Activity=require("../Model/Activity-model")

const product=require("../Model/product-model")
const location=require("../Model/location-model")
const Product = require("../Model/product-model")
const stockCltr={}
stockCltr.stockIn=async(req,res)=>{
    const{productId,locationId,quantity,batchNumber,expiryDate}=req.body
    try{
    
        if (!locationId) {
            return res.status(400).json({message:"loactionId is required"})
            
        }
        const loc=await location.findById(locationId)
        if(!loc){
            return res.status(404).json({message:"location not found"})
        }
        let inventory=await Inventory.findOne({productId,locationId,batchNumber})
         let currentQty=inventory?inventory.quantity:0
         if(currentQty+Number(quantity)>loc.capacity){
            return res.status(400).json({message:"capacity exceeded for this location"})
         }
        if(inventory){
            inventory.quantity += Number(quantity)
            inventory.batchNumber=batchNumber||inventory.batchNumber
            inventory.expiryDate=expiryDate||inventory.expiryDate
        }else{
           
            inventory=new Inventory ({
                productId,locationId,quantity: Number(quantity),batchNumber,expiryDate
            })
        }
        await inventory.save()

        const activity=await product.findById(productId)
        await Activity.create({
            message:`stock added:${activity.name} (${quantity})`,type:"stock"
        })
        res.json({message:"stock added successfully",inventory})
    }catch(err){
        res.status(500).json({message:err.message})
    }
}
stockCltr.stockOut=async(req,res)=>{
    const{productId,locationId,quantity}=req.body
    try{
        
        if (!locationId) {
            return res.status(400).json({message:"locationId is required"})
        }
        
        const inventory=await Inventory.find({productId,locationId,quantity:{$gt:0}
        }).sort({expiryDate:1})

        if(!inventory || inventory.length===0){
            return res.status(404).json({message:"inventory not found"})
        }

        let remaining=Number(quantity)
        for(let inv of inventory){
            if(inv.expiryDate && new Date(inv.expiryDate)<new Date()){
                continue

            }
            if(inv.quantity>=remaining){
                inv.quantity-=remaining
                await inv.save()
            
        
      const activity=await Product.findById(productId)
      await Activity.create({ message:`stock removed:${activity.name} (${quantity})`,type:"stock"})
        res.json({
            message:"stock removed successfully",inventory:inv
        })
    }else{
            remaining-=inv.quantity
            inv.quantity=0
            await inv.save()
            if(inv.quantity>=remaining){
                inv.quantity-=remaining
                await inv.save()
            }

        }
    }
      return res.status(400).json({
            message: "Not enough valid (non-expired) stock"
        })

    
    }catch(err){
        res.status(500).json({message:err.message})
    }
}

stockCltr.getExpiryAlert=async(req,res)=>{
    try{
        const today=new Date()
        const nextFewDays=new Date()
        nextFewDays.setDate(today.getDate()+5)

        const items=await Inventory.find({
            expiryDate:{$gte:today,$lte:nextFewDays}
        }).populate("productId").populate("locationId")

        res.json(items)
    } catch (err) {
        console.error('CRITICAL ERROR in getExpiryAlert:', {
            message: err.message,
            stack: err.stack,
            dbState: mongoose.connection.readyState
        })
        res.status(500).json({ 
            message: 'Internal Server Error in getExpiryAlert', 
            details: err.message,
            dbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
        })
    }
}

module.exports=stockCltr