const express = require('express')
const router = express.Router()

const AuthenticateUser = require('../Middleware/user-authenticate')
const AuthorizeUser    = require('../Middleware/user-authorize')
const productController = require('../Controller/product-controller')
const upload = require('../Middleware/upload')

// Create product  → only admin can do this
// upload.single('image') → reads the image file and sends it to Cloudinary
router.post('/product',    upload.single('image'), AuthenticateUser, AuthorizeUser(['admin']), productController.create)

// Get all products → any logged-in user
router.get('/product',                             AuthenticateUser,                           productController.list)

// Get one product  → admin or staff
router.get('/product/:id',                         AuthenticateUser, AuthorizeUser(['admin', 'staff']), productController.show)

// Update product   → only admin
router.put('/product/:id', upload.single('image'), AuthenticateUser, AuthorizeUser(['admin']), productController.update)

// Delete product   → only admin
router.delete('/product/:id',                      AuthenticateUser, AuthorizeUser(['admin']), productController.delete)

// Find product by barcode → any logged-in user
router.get('/barcode/:code',                       AuthenticateUser,                           productController.barcode)

module.exports = router