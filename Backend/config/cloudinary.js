const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')

// Step 1: Connect Cloudinary with our account credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// Step 2: Tell multer to save uploaded files IN Cloudinary (not on our computer)
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'warehouse_products',        // folder name inside your Cloudinary account
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, height: 800, crop: 'limit' }]
    }
})

module.exports = { cloudinary, storage }
