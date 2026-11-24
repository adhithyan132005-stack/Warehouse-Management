const express = require("express")
const router = express.Router()
const AuthenticateUser = require("../Middleware/user-authenticate")
const AuthorizeUser = require("../Middleware/user-authorize")
const queryController = require("../Controller/query-controller")

router.post("/queries", AuthenticateUser, queryController.createQuery)
router.post("/queries/:id/messages", AuthenticateUser, queryController.addMessage)
router.get("/user-queries", AuthenticateUser, queryController.getUserQueries)
router.get("/queries", AuthenticateUser, AuthorizeUser(["admin", "staff"]), queryController.getAllQueries)
router.put("/queries/:id/status", AuthenticateUser, AuthorizeUser(["admin", "staff"]), queryController.updateStatus)

module.exports = router
