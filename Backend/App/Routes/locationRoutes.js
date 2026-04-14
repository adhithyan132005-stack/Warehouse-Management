const express = require("express")
const router = express.Router()
const AuthenticateUser = require("../Middleware/user-authenticate")
const AuthorizeUser = require("../Middleware/user-authorize")
const locationController = require("../Controller/location-controller")

router.get("/locations", AuthenticateUser, AuthorizeUser(["admin","staff"]), locationController.list)
router.post("/locations", AuthenticateUser, AuthorizeUser(["admin"]), locationController.create)

module.exports = router
