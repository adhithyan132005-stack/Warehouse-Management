const Query = require("../Model/query-model")
const User = require("../Model/user-model")
const Order = require("../Model/order-model")

const queryController = {}

queryController.createQuery = async (req, res) => {
    try {
        const { orderId, subject, messageText } = req.body
        const userId = req.userId

        if (!orderId || !subject || !messageText) {
            return res.status(400).json({ error: "Missing required fields: orderId, subject, messageText" })
        }

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        const order = await Order.findById(orderId)
        if (!order) {
            return res.status(404).json({ error: "Order not found" })
        }

        const senderName = user.username || "Customer"

        const newQuery = await Query.create({
            orderId,
            userId,
            subject,
            status: "Open",
            messages: [
                {
                    senderId: userId,
                    senderName,
                    messageText,
                    createdAt: new Date()
                }
            ]
        })

        const populatedQuery = await Query.findById(newQuery._id).populate("orderId")
        res.status(201).json(populatedQuery)
    } catch (err) {
        console.error("Error creating query:", err)
        res.status(500).json({ error: "Something went wrong while creating the query support ticket" })
    }
}

queryController.addMessage = async (req, res) => {
    try {
        const { id } = req.params
        const { messageText } = req.body
        const userId = req.userId

        if (!messageText) {
            return res.status(400).json({ error: "Message text is required" })
        }

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        const queryThread = await Query.findById(id)
        if (!queryThread) {
            return res.status(404).json({ error: "Query thread not found" })
        }

        if (req.role === "user" && queryThread.userId.toString() !== userId.toString()) {
            return res.status(403).json({ error: "Access denied. This is not your support ticket." })
        }

        const senderName = user.username || (req.role === "user" ? "Customer" : "Support")

        queryThread.messages.push({
            senderId: userId,
            senderName,
            messageText,
            createdAt: new Date()
        })

        if (req.role === "user" && queryThread.status === "Resolved") {
            queryThread.status = "Open"
        }

        await queryThread.save()
        
        const updatedQuery = await Query.findById(id).populate("orderId")
        res.json(updatedQuery)
    } catch (err) {
        console.error("Error adding message to query:", err)
        res.status(500).json({ error: "Failed to send message" })
    }
}

queryController.getUserQueries = async (req, res) => {
    try {
        const userId = req.userId
        const queries = await Query.find({ userId })
            .populate("orderId")
            .sort({ updatedAt: -1 })
        res.json(queries)
    } catch (err) {
        console.error("Error fetching user queries:", err)
        res.status(500).json({ error: "Failed to fetch user queries" })
    }
}

queryController.getAllQueries = async (req, res) => {
    try {
        const queries = await Query.find()
            .populate("orderId")
            .populate("userId", "username email")
            .sort({ updatedAt: -1 })
        res.json(queries)
    } catch (err) {
        console.error("Error fetching all queries:", err)
        res.status(500).json({ error: "Failed to fetch all queries" })
    }
}

queryController.updateStatus = async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body

        if (!status || !["Open", "Resolved"].includes(status)) {
            return res.status(400).json({ error: "Valid status ('Open' or 'Resolved') is required" })
        }

        const queryThread = await Query.findById(id)
        if (!queryThread) {
            return res.status(404).json({ error: "Query thread not found" })
        }

        queryThread.status = status
        await queryThread.save()

        const updatedQuery = await Query.findById(id).populate("orderId").populate("userId", "username email")
        res.json(updatedQuery)
    } catch (err) {
        console.error("Error updating query status:", err)
        res.status(500).json({ error: "Failed to update query status" })
    }
}

module.exports = queryController
