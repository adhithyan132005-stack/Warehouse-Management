const Activity = require('../Model/Activity-model')
const activityController = {}

activityController.getActivities = async (req, res) => {
    try {
        console.log('Fetching activities...')
        const { orderNumber } = req.query

        if (!orderNumber || !orderNumber.trim()) {
            const activities = await Activity.find({ type: 'order' })
                .sort({ createdAt: -1 })
                .populate('orderId')
            return res.json(activities)
        }

        const searchTerm = orderNumber.trim()
        console.log('Searching for orderNumber:', searchTerm)

        // Search with multiple strategies to handle both old and new data
        const query = {
            $or: [
                // Search in orderNumber field (new data structure)
                { orderNumber: { $regex: searchTerm, $options: 'i' } },
                // Search in message field (old data or fallback)
                { message: { $regex: searchTerm, $options: 'i' } }
            ],
            type: 'order'
        }

        const activities = await Activity.find(query)
            .sort({ createdAt: -1 })
            .populate('orderId')

        console.log('Activities found:', activities.length)
        console.log('Search term:', searchTerm)
        console.log('Activities:', activities)
        res.json(activities)
    } catch (err) {
        console.error('CRITICAL ERROR in getActivities:', {
            message: err.message,
            stack: err.stack,
            query: req.query,
            dbState: mongoose.connection.readyState
        })
        res.status(500).json({ 
            message: 'Internal Server Error in getActivities', 
            details: err.message,
            dbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
        })
    }
}


module.exports = activityController