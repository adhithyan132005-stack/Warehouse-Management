const mongoose=require("mongoose")
const activitySchema=new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: function() {
            return this.type === 'order'
        }
    },
    orderNumber: {
        type: String,
        required: function() {
            return this.type === 'order'
        }
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