const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const inventorySchema = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    locationId: {
        type: Schema.Types.ObjectId,
        ref: 'Location',
        required: true
    },
    quantity: {
        type: Number,
        default: 0,
        min: 0
    },
    batchNumber: {
        type: String
    },
    expiryDate: {
        type: Date
    },
    // supplierId: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Supplier'
    // }
}, { timestamps: true });

const Inventory = model('Inventory', inventorySchema);
module.exports = Inventory;
