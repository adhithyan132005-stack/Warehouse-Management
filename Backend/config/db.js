const mongoose = require('mongoose');

const configureDB = async function () {
    try {
        const dbUrl = process.env.DB_URL;
        if (!dbUrl) {
            throw new Error('DB_URL environment variable is not defined!');
        }
        
        // Log connection attempt (hiding password for safety)
        const safeUrl = dbUrl.replace(/:([^@]+)@/, ':****@');
        console.log(`Attempting to connect to database: ${safeUrl}`);

        await mongoose.connect(dbUrl);
        console.log('Successfully connected to MongoDB Atlas');
        
        mongoose.connection.on('error', err => {
            console.error('Mongoose connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('Mongoose disconnected from DB');
        });

    } catch (err) {
        console.error('CRITICAL ERROR connecting to database:', err.message);
        if (err.message.includes('password')) {
            console.error('PROBABLE CAUSE: Incorrect database password');
        } else if (err.message.includes('whitelist') || err.message.includes('IP')) {
            console.error('PROBABLE CAUSE: IP address not whitelisted in MongoDB Atlas');
        }
        // Rethrowing allows the caller (server.js) to catch it during startup
        throw err; 
    }
}

module.exports = configureDB;