const Notification = require('../Model/notification-model')

const notificationController = {}

notificationController.createNotification = async (userId, title, message, type = 'system', orderId = null) => {
    try {
        const notification = await Notification.create({
            userId,
            title,
            message,
            type,
            orderId
        })
        return notification
    } catch (err) {
        console.error('Error creating notification:', err)
        throw err
    }
}

notificationController.getUserNotifications = async (req, res) => {
    try {
        const userId = req.userId
        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20)

        res.json(notifications)
    } catch (err) {
        console.error('Error fetching notifications:', err)
        res.status(500).json({ error: 'Error fetching notifications' })
    }
}

notificationController.markAsRead = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.userId

        const notification = await Notification.findOneAndUpdate(
            { _id: id, userId },
            { isRead: true },
            { new: true }
        )

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' })
        }

        res.json(notification)
    } catch (err) {
        console.error('Error marking notification as read:', err)
        res.status(500).json({ error: 'Error updating notification' })
    }
}

notificationController.markAllAsRead = async (req, res) => {
    try {
        const userId = req.userId

        await Notification.updateMany(
            { userId, isRead: false },
            { isRead: true }
        )

        res.json({ message: 'All notifications marked as read' })
    } catch (err) {
        console.error('Error marking all notifications as read:', err)
        res.status(500).json({ error: 'Error updating notifications' })
    }
}

module.exports = notificationController