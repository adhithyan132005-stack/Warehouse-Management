const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const locationSchema = new Schema({
    zone: {
        type: String,
        required: true
    },
    rackNumber: {
        type: String, 
        required: true,
        unique: true
    },
    capacity: {
        type: Number, 
        default: 100
    }
}, { timestamps: true });

const Location = model('Location', locationSchema);
module.exports = Location;
