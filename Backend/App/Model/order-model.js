const { required } = require('joi');
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const orderSchema = new Schema({
    orderNumber:{
        type:String,
        unique:true
    },
    customerName: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    contactNumber: {
        type: String
    },
    items: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            price:{
                type:Number,
                required:true
            }
        }
    ],
    totalAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Pending', 'Packed', 'Processing', 'Shipped', 'Delivered'],
        default: 'Pending'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending'
    }
}, { timestamps: true });

const Order = model('Order', orderSchema);
module.exports = Order;
