const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const configureDB = require('./config/db');
const Product = require('./App/Model/product-model');

const categories = {
    Fruits: {
        names: ['Honeycrisp Apple', 'Cavendish Banana', 'Organic Blueberries', 'King Alfonso Mango', 'Red Seedless Grapes', 'Fresh Strawberries', 'Golden Pineapple', 'Seedless Watermelon', 'Zespri Kiwifruit', 'Juicy Peaches', 'Premium Red Plums', 'Sweet Rainier Cherries', 'Wild Raspberries', 'Organic Blackberries', 'Conference Pears', 'Sun-Ripened Apricots', 'Fresh Pomegranate', 'Mediterranean Figs', 'Medjool Dates', 'Pink Guava'],
        image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&q=80&w=800'
    },
    Vegetables: {
        names: ['Organic Carrots', 'Fresh Broccoli', 'Roma Tomatoes', 'Russet Potatoes', 'Red Onions', 'Fresh Garlic Bulbs', 'Baby Spinach', 'Curly Kale', 'Green Cabbage', 'White Cauliflower', 'Mix Bell Peppers', 'English Cucumbers', 'Iceberg Lettuce', 'Red Radishes', 'Purple Beetroots', 'Japanese Eggplant', 'Green Zucchini', 'Button Mushrooms', 'Green Asparagus', 'Celery Stalks'],
        image: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&q=80&w=800'
    },
    Cosmetics: {
        names: ['Matte Lipstick', 'Liquid Foundation', 'Volume Mascara', 'Waterproof Eyeliner', 'Rosy Blush', 'Sun-Kissed Bronzer', 'Nude Eyeshadow Palette', 'Poreless Primer', 'Full Coverage Concealer', 'Glowing Highlighter', 'Setting Spray', 'Eyebrow Definer', 'High Shine Lip Gloss', 'Hydrating Lip Balm', 'Translucent Face Powder', 'Gentle Cleanser', 'Soothing Toner', 'Daily Moisturizer', 'Vitamin C Serum', 'SPF 50 Sunscreen'],
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800'
    },
    Clothes: {
        names: ['Cotton Crewneck T-Shirt', 'Slim Fit Denim Jeans', 'Oxford Formal Shirt', 'Chino Trousers', 'Floral Summer Skirt', 'Little Black Dress', 'Vintage Leather Jacket', 'Heavy Winter Coat', 'Cable Knit Sweater', 'Fleece Hoodie', 'Essential Tracksuit', 'Classic Formal Suit', 'Casual Navy Blazer', 'Knitted V-Neck Cardigan', 'Performance Socks', 'Silk Fashion Scarf', 'Buckle Leather Belt', 'Wool Beanie Hat', 'Snapback Cap', 'Thermal Winter Gloves'],
        image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800'
    },
    Electronics: {
        names: ['SmartPhone Pro Max', 'Laptop Ultra Thin 14"', 'Tablet Pro 11"', 'High-Performance Desktop', '4K UltraWide Monitor', 'RGB Mechanical Keyboard', 'Precision Wireless Mouse', 'Active Noise Cancelling Headphones', 'True Wireless Earbuds', 'Smart Home Speaker', 'Digital Mirrorless Camera', 'Telephoto Lens 70-200mm', 'Premium Smartwatch', 'Advanced Fitness Tracker', 'Wireless Office Printer', 'Portable SSD 1TB', 'Next-Gen Gaming Console', 'Pro Wireless Controller', 'Immersive VR Headsets', 'Compact High-Speed Drone'],
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800'
    },
    Groceries: {
        names: ['Pasteurized Milk 1L', 'Multigrain Sliced Bread', 'Farm Fresh Eggs (Doz)', 'Pure Creamy Butter', 'Sharp Cheddar Cheese', 'Greek Style Yogurt', 'Basmati Rice 2kg', 'Fusilli Wheat Pasta', 'Unbleached All-Purpose Flour', 'Organic Brown Sugar', 'Iodized Fine Salt', 'Cracked Black Pepper', 'Pure Sunflower Oil', 'Aged Balsamic Vinegar', 'Honey Toasted Oats', 'Steel Cut Oatmeal', 'Premium Green Tea', 'Medium Roast Coffee', 'Pure Orange Juice', 'Sparkling Mineral Water'],
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800'
    }
};

async function seed() {
    try {
        await configureDB();
        console.log('Clearing old products...');
        await Product.deleteMany({}); 

        const products = [];
        for (const [catName, catData] of Object.entries(categories)) {
            for (let i = 0; i < 50; i++) {
                // Determine name carefully
                const baseName = catData.names[i % catData.names.length];
                const finalName = i < catData.names.length ? baseName : `${baseName} (V${Math.floor(i / catData.names.length) + 1})`;
                
                products.push({
                    name: finalName,
                    sku: `${catName.substring(0, 3).toUpperCase()}-${2000 + i}`,
                    category: catName,
                    price: Math.floor(Math.random() * 1500) + 200,
                    description: `This is a premium ${finalName} in the ${catName} category. High quality and durable.`,
                    image: catData.image,
                    barcode: `BAR-${catName.substring(0, 2).toUpperCase()}-${i + 1000}`
                });
            }
        }

        console.log(`Loading ${products.length} products...`);
        await Product.insertMany(products);
        console.log('Done!');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

seed();
