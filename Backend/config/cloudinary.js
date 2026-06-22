const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer storage engine for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'warehouse_products', // Folder name inside Cloudinary Media Library
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 600, height: 600, crop: 'limit' }] // Optimize image sizes
    }
});

module.exports = { cloudinary, storage };
