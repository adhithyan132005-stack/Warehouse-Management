const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const productSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    sku: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    barcode:{
        type:String,
        required:true,

    },
    description: {
        type: String
    }
}, { timestamps: true });

const Product = model('Product', productSchema);
module.exports = Product;
