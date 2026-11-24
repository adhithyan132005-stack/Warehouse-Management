const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const configureDB = require('./config/db');
const Product = require('./App/Model/product-model');

async function addProducts() {
  try {
    await configureDB();
    console.log('Connected to DB. Adding 100 products...');

    const products = [];
    for (let i = 0; i < 100; i++) {
      const name = `Sample Product ${i + 1}`;
      const sku = `SAMPLE-${i + 1}`;
      const category = 'Sample';
      const price = Math.floor(Math.random() * 900) + 100; // 100 - 999
      const description = `This is a high-quality sample product ${i + 1}.`;
      const image = `https://picsum.photos/seed/${i + 1}/800/800`;
      const barcode = `BAR-SAMPLE-${i + 1}`;

      products.push({ name, sku, category, price, description, image, barcode });
    }

    await Product.insertMany(products);
    console.log('Successfully added 100 products.');
    process.exit(0);
  } catch (err) {
    console.error('Error adding products:', err);
    process.exit(1);
  }
}

addProducts();
