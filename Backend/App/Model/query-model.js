const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const querySchema = new Schema({
    orderId: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Open', 'Resolved'],
        default: 'Open'
    },
    messages: [
        {
            senderId: {
                type: Schema.Types.ObjectId,
                ref: 'user',
                required: true
            },
            senderName: {
                type: String,
                required: true
            },
            messageText: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, { timestamps: true });

const Query = model('Query', querySchema);
module.exports = Query;
