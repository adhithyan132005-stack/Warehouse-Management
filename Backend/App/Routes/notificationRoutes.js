const express = require("express")
const router = express.Router()
const AuthenticateUser = require("../Middleware/user-authenticate")
const notificationController = require("../Controller/notification-controller")

router.get("/notifications", AuthenticateUser, notificationController.getUserNotifications)
router.put("/notifications/:id/read", AuthenticateUser, notificationController.markAsRead)
router.put("/notifications/mark-all-read", AuthenticateUser, notificationController.markAllAsRead)

module.exports = router