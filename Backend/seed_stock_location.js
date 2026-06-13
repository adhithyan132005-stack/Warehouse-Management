const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const configureDB = require('./config/db');
const Product = require('./App/Model/product-model');
const Location = require('./App/Model/location-model');
const Inventory = require('./App/Model/inventory-model');

async function seed() {
    try {
        await configureDB();
        
        console.log('Clearing old locations and inventory...');
        await Location.deleteMany({});
        await Inventory.deleteMany({});

        // Create locations (Zone A to Zone E, with rack numbers)
        const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E'];
        const locations = [];
        
        for (let i = 1; i <= 20; i++) {
            const zone = zones[(i - 1) % zones.length];
            locations.push({
                zone: zone,
                rackNumber: `Rack-${100 + i}`,
                capacity: 500
            });
        }
        
        console.log('Inserting new locations...');
        const createdLocations = await Location.insertMany(locations);
        
        // Find all products
        const products = await Product.find({});
        console.log(`Found ${products.length} products. Seeding stock of 50 for each...`);

        const inventoryItems = [];
        products.forEach((product, idx) => {
            const location = createdLocations[idx % createdLocations.length];
            inventoryItems.push({
                productId: product._id,
                locationId: location._id,
                quantity: 50,
                batchNumber: `BAT-INIT-${1000 + idx}`,
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year expiry
            });
        });

        console.log('Inserting inventory items...');
        await Inventory.insertMany(inventoryItems);
        
        console.log('Stock and locations successfully seeded!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding stock/locations:', err);
        process.exit(1);
    }
}

seed();
