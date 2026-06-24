const multer = require('multer')
const { storage } = require('../../config/cloudinary')

// This middleware handles image uploads
// When a file is uploaded, it goes DIRECTLY to Cloudinary (not saved on our computer)
// After upload, req.file.path = the Cloudinary image URL

const upload = multer({ storage })

module.exports = upload