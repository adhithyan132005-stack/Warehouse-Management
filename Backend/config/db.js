const mongoose = require('mongoose');
const configureDB = async function () {
    try {
        if (!process.env.DB_URL) {
            throw new Error('DB_URL environment variable is not defined!');
        }
        await mongoose.connect(process.env.DB_URL)
        console.log('server is connected to db')
    } catch (err) {
        console.error('CRITICAL ERROR connecting to db:', err.message)
        // Optionally rethrow if you want the server to fail immediately
        // throw err; 
    }
}
module.exports = configureDB;