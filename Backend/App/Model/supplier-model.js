const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const supplierSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Supplier = model('Supplier', supplierSchema);
module.exports = Supplier;
