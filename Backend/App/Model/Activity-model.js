const mongoose=require("mongoose")
const activitySchema=new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },
    orderNumber: {
        type: String,
        required: true
    },
    message: String,
    type: String,
    createdAt:{
        type:Date,
        default:Date.now
    }
})
const Activity=mongoose.model("Activity",activitySchema)
module.exports=Activity