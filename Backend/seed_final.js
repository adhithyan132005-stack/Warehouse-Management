const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const configureDB = require('./config/db');
const Product = require('./App/Model/product-model');

const categoryData = {
    Fruits: {
        items: [
            { name: 'Honeycrisp Apple', img: 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?auto=format&fit=crop&q=80&w=800' },
            { name: 'Cavendish Banana', img: 'https://images.unsplash.com/photo-1571771894821-ad9902412746?auto=format&fit=crop&q=80&w=800' },
            { name: 'Organic Blueberries', img: 'https://images.unsplash.com/photo-1497534446932-c946e7316ba1?auto=format&fit=crop&q=80&w=800' },
            { name: 'King Alfonso Mango', img: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800' },
            { name: 'Red Seedless Grapes', img: 'https://images.unsplash.com/photo-1537640538966-79f369143f8c?auto=format&fit=crop&q=80&w=800' },
            { name: 'Fresh Strawberries', img: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=800' },
            { name: 'Golden Pineapple', img: 'https://images.unsplash.com/photo-1550258114-b830335e69bc?auto=format&fit=crop&q=80&w=800' },
            { name: 'Seedless Watermelon', img: 'https://images.unsplash.com/photo-1587049352847-81a56d773cae?auto=format&fit=crop&q=80&w=800' },
            { name: 'Zespri Kiwifruit', img: 'https://images.unsplash.com/photo-1585059895524-72359e061381?auto=format&fit=crop&q=80&w=800' },
            { name: 'Juicy Peaches', img: 'https://images.unsplash.com/photo-1595124253344-21b0bb11b614?auto=format&fit=crop&q=80&w=800' }
        ],
        fallback: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&q=80&w=800'
    },
    Vegetables: {
        items: [
            { name: 'Organic Carrots', img: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5ec37?auto=format&fit=crop&q=80&w=800' },
            { name: 'Fresh Broccoli', img: 'https://images.unsplash.com/photo-1452960962994-acf4fd70b632?auto=format&fit=crop&q=80&w=800' },
            { name: 'Roma Tomatoes', img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800' },
            { name: 'Russet Potatoes', img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=800' },
            { name: 'Red Onions', img: 'https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?auto=format&fit=crop&q=80&w=800' },
            { name: 'Fresh Garlic Bulbs', img: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&q=80&w=800' },
            { name: 'Baby Spinach', img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=800' },
            { name: 'Curly Kale', img: 'https://images.unsplash.com/photo-1524179524541-1ac42c8319ba?auto=format&fit=crop&q=80&w=800' },
            { name: 'English Cucumber', img: 'https://images.unsplash.com/photo-1449339854873-750e6913301b?auto=format&fit=crop&q=80&w=800' },
            { name: 'Bell Peppers', img: 'https://images.unsplash.com/photo-1566275529824-cca6d008f3da?auto=format&fit=crop&q=80&w=800' }
        ],
        fallback: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&q=80&w=800'
    },
    Electronics: {
        items: [
            { name: 'SmartPhone Pro', img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800' },
            { name: 'Ultra Laptop', img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800' },
            { name: 'Wireless Headphones', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800' },
            { name: 'Gaming Console', img: 'https://images.unsplash.com/photo-1486401899868-2830e0488391?auto=format&fit=crop&q=80&w=800' },
            { name: '4K Monitor', img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800' },
            { name: 'Digital Camera', img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800' },
            { name: 'Smart Watch', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800' },
            { name: 'Bluetooth Speaker', img: 'https://images.unsplash.com/photo-1608156639585-34a070a1be79?auto=format&fit=crop&q=80&w=800' }
        ],
        fallback: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800'
    },
    Cosmetics: {
        items: [
            { name: 'Lip Gloss', img: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?auto=format&fit=crop&q=80&w=800' },
            { name: 'Eyeshadow Palette', img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba4fb?auto=format&fit=crop&q=80&w=800' },
            { name: 'Perfume Bottle', img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800' },
            { name: 'Skin Serum', img: 'https://images.unsplash.com/photo-1601049541289-9b1b7abcfe19?auto=format&fit=crop&q=80&w=800' },
            { name: 'Night Cream', img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800' }
        ],
        fallback: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800'
    },
    Clothes: {
        items: [
            { name: 'Cotton T-Shirt', img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800' },
            { name: 'Denim Jacket', img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=800' },
            { name: 'Running Shoes', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800' },
            { name: 'Wool Sweater', img: 'https://images.unsplash.com/photo-1556905055-8f358a7a4bb4?auto=format&fit=crop&q=80&w=800' }
        ],
        fallback: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800'
    },
    Groceries: {
        items: [
            { name: 'Whole Milk', img: 'https://images.unsplash.com/photo-1550583724-125581fe2f8a?auto=format&fit=crop&q=80&w=800' },
            { name: 'Coffee Beans', img: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=800' },
            { name: 'Pasta Noodles', img: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=800' },
            { name: 'Olive Oil', img: 'https://images.unsplash.com/photo-1474979266404-7eaacabc88c5?auto=format&fit=crop&q=80&w=800' }
        ],
        fallback: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800'
    }
};

async function seed() {
    try {
        await configureDB();
        console.log('Clearing old products...');
        await Product.deleteMany({}); 

        const products = [];
        for (const [catName, catGroup] of Object.entries(categoryData)) {
            for (let i = 0; i < 50; i++) {
                const itemData = catGroup.items[i % catGroup.items.length];
                const baseName = itemData.name;
                const finalName = i < catGroup.items.length ? baseName : `${baseName} (Batch ${Math.floor(i / catGroup.items.length) + 1})`;
                const finalImage = i < catGroup.items.length ? itemData.img : `${itemData.img}&v=${i}`; // Add variant to cache bust
                
                products.push({
                    name: finalName,
                    sku: `${catName.substring(0, 3).toUpperCase()}-${3000 + i}`,
                    category: catName,
                    price: Math.floor(Math.random() * 800) + 150,
                    description: `This is a high-quality ${finalName}. Perfect for your daily needs.`,
                    image: finalImage,
                    barcode: `BAR-${catName.substring(0, 2).toUpperCase()}-${i + 2000}`
                });
            }
        }

        console.log(`Loading ${products.length} unique products...`);
        await Product.insertMany(products);
        console.log('Successfully seeded with diverse images!');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

seed();
