const Order = require("../Model/order-model")
const Product=require("../Model/product-model")
const Inventory=require("../Model/inventory-model")
const Activity = require("../Model/Activity-model")
const Notification = require("../Model/notification-model")

const orderController={}
orderController.createOrder=async(req,res)=>{
    try{
    const { customerName,items}=req.body
    const userId = req.userId // Get user ID from authenticated user
    let totalAmount=0
    const orderNumber="ORD-"+Date.now()
    for(let item of items){
        const product=await Product.findById(item.productId)
        if(!product){
            return res.status(400).json({error:"product not found"})
        }
         const qty = Number(item.quantity)

    if (!qty || qty <= 0) {
        return res.status(400).json({ error: "Invalid quantity" })
    }
       const stock = await Inventory.findOne({ productId: item.productId })

            if (!stock || stock.quantity < qty) {
                return res.status(400).json({ error: "Insufficient stock" })
            }
             stock.quantity -= qty
            await stock.save()

        

        item.price=product.price

        totalAmount+=product.price*item.quantity
    }
    const orders=await Order.create({orderNumber,customerName,items,totalAmount, userId})
    await Activity.create({ 
        orderId: orders._id,
        orderNumber: orderNumber,
        message: `Your order ${orderNumber} was placed with ${items.length} item(s) totaling ₹${totalAmount}`, 
        type: "order" 
    })
    res.json(orders)
}catch(err){
    console.log(err)
    res.status(500).json({error:"something went wrong"})
}
}
orderController.getOrder=async(req,res)=>{
    try{
    const orders=await Order.find().populate("items.productId").sort({createdAt:-1})
    res.json(orders)
}catch(err){
    console.error(err)
    res.status(500).json({error:"Error fetching orders"})

}
}

orderController.updateStatus=async(req,res)=>{
    try{
    const{id}=req.params;
    const{status}=req.body
    const orders=await Order.findByIdAndUpdate(id,{status},{returnDocument:"after"})
    if(!orders){
        return res.status(404).json({error:"order not found"})

    }
    const orderNum = orders.orderNumber || `Order-${orders._id.toString().slice(-6)}`
    const normalizedStatus = status?.toLowerCase?.()

    if (normalizedStatus === "packed") {
        await Activity.create({ 
            orderId: orders._id,
            orderNumber: orderNum,
            message: `Your order ${orderNum} has been packed and is ready for shipment`, 
            type: "order" 
        })
        // Create notification for the user
        await Notification.create({
            userId: orders.userId,
            title: "Order Packed! 🎉",
            message: `Your order ${orderNum} has been packed and will reach you soon!`,
            type: "order",
            orderId: orders._id
        })
    } else if (normalizedStatus === "shipped") {
        await Activity.create({ 
            orderId: orders._id,
            orderNumber: orderNum,
            message: `Your order ${orderNum} has been shipped and is on its way to you`, 
            type: "order" 
        })
        // Create notification for the user
        await Notification.create({
            userId: orders.userId,
            title: "Order Shipped! 🚚",
            message: `Your order ${orderNum} has been shipped and is on its way!`,
            type: "order",
            orderId: orders._id
        })
    } else if (normalizedStatus === "delivered") {
        await Activity.create({ 
            orderId: orders._id,
            orderNumber: orderNum,
            message: `Your order ${orderNum} has been successfully delivered`, 
            type: "order" 
        })
        // Create notification for the user
        await Notification.create({
            userId: orders.userId,
            title: "Order Delivered! ✅",
            message: `Your order ${orderNum} has been successfully delivered!`,
            type: "order",
            orderId: orders._id
        })
    } else if (normalizedStatus === "processing" || normalizedStatus === "processed") {
        await Activity.create({ 
            orderId: orders._id,
            orderNumber: orderNum,
            message: `Your order ${orderNum} is now being processed and prepared for packing`, 
            type: "order" 
        })
    }

    res.json(orders)
    }catch(err){
        console.error(err)
        res.status(500).json({error:"Error updating status"})

    }
}

orderController.getPickList=async(req,res)=>{
    try{
        const{id}=req.params
        const orders=await Order.findById(id).populate("items.productId")
        if(!orders || !orders.items){
            return res.status(404).json({error:"order not found or empty"})
        }
        
        const pickList = await Promise.all(orders.items.map(async (item) => {
            const inventoryItems = await Inventory.find({ productId: item.productId._id }).populate("locationId")
            const locationStrings = inventoryItems.map(inv => `${inv.locationId.zone} - ${inv.locationId.rackNumber}`).join(", ")
            return {
                productName: item.productId.name,
                quantity: item.quantity,
                location: locationStrings || "Not in stock"
            }
        }))
        
        res.json(pickList)
    }catch(err){
        console.error(err)
        res.status(500).json({error:"Error generating pick list"})
    }
}

orderController.getUserOrders = async (req, res) => {
    try {
        const userId = req.userId // Get user ID from authenticated user
        const orders = await Order.find({ userId }).populate("items.productId").sort({ createdAt: -1 })
        res.json(orders)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Error fetching user orders" })
    }
}

module.exports=orderController