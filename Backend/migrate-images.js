
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const mongoose   = require('mongoose');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure:     true
});

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema, 'products');

const isCloudinary = (url) => url && url.startsWith('https://res.cloudinary.com');
const isRemoteUrl  = (url) => url && (url.startsWith('https://') || url.startsWith('http://'));

const CATEGORY_SEEDS = {
    'fruits':      10,
    'vegetables':  20,
    'electronics': 30,
    'clothing':    40,
    'food':        50,
    'beverages':   60,
    'dairy':       70,
    'bakery':      80,
    'meat':        90,
    'seafood':     100,
    'default':     1
};

const getPicsumUrl = (category = '', index = 0) => {
    const cat    = category.toLowerCase().trim();
    const seed   = CATEGORY_SEEDS[cat] || CATEGORY_SEEDS.default;
    const imgId  = (seed + index) % 1000 + 1;
    return `https://picsum.photos/id/${imgId}/800/800`;
};

const uploadRemoteUrl = async (remoteUrl, folder, publicId) => {
    const result = await cloudinary.uploader.upload(remoteUrl, {
        folder,
        public_id: publicId,
        overwrite: true,
        transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' }]
    });
    return result.secure_url;
};

const sanitize = (name) =>
    (name || 'product').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().slice(0, 40);

async function migrate() {
    console.log('\n🔄  Connecting to MongoDB...');
    await mongoose.connect(process.env.DB_URL);
    console.log('✅  Connected to MongoDB!\n');
    console.log(`☁️   Cloudinary cloud: ${process.env.CLOUDINARY_CLOUD_NAME}\n`);

    const products = await Product.find({});
    console.log(`📦  Total products: ${products.length}`);

    const alreadyDone  = products.filter(p => isCloudinary(p.image));
    const hasRemoteUrl = products.filter(p => !isCloudinary(p.image) && isRemoteUrl(p.image));
    const broken       = products.filter(p => !isCloudinary(p.image) && !isRemoteUrl(p.image));

    console.log(`✅  Already in Cloudinary : ${alreadyDone.length} (skipped)`);
    console.log(`🔗  Valid external URLs   : ${hasRemoteUrl.length} (will upload to Cloudinary)`);
    console.log(`❌  Broken / null         : ${broken.length} (will replace with picsum)\n`);

    if (hasRemoteUrl.length === 0 && broken.length === 0) {
        console.log('🎉  Nothing to migrate! All products already use Cloudinary.\n');
        await mongoose.disconnect();
        return;
    }

    let success = 0, failed = 0;

    if (hasRemoteUrl.length > 0) {
        console.log('─'.repeat(60));
        console.log('📤  Pass 1 — Uploading existing URLs to Cloudinary...\n');
        for (let i = 0; i < hasRemoteUrl.length; i++) {
            const p   = hasRemoteUrl[i];
            const pid = `warehouse_products/${sanitize(p.name)}_${i}`;
            process.stdout.write(`  [${i + 1}/${hasRemoteUrl.length}] ${p.name}: `);
            try {
                const url = await uploadRemoteUrl(p.image, 'warehouse_products', pid);
                await Product.findByIdAndUpdate(p._id, { image: url });
                console.log(`✅ ${url.slice(0, 70)}…`);
                success++;
                await new Promise(r => setTimeout(r, 400));
            } catch (err) {
                console.log(`❌ ${err.message.slice(0, 80)}`);
                failed++;
            }
        }
    }

    if (broken.length > 0) {
        console.log('\n' + '─'.repeat(60));
        console.log('🖼️   Pass 2 — Replacing broken images via picsum.photos → Cloudinary...\n');
        for (let i = 0; i < broken.length; i++) {
            const p       = broken[i];
            const picsUrl = getPicsumUrl(p.category, i);
            const pid     = `warehouse_products/${sanitize(p.name)}_broken_${i}`;
            process.stdout.write(`  [${i + 1}/${broken.length}] ${p.name}: `);
            try {
                const url = await uploadRemoteUrl(picsUrl, 'warehouse_products', pid);
                await Product.findByIdAndUpdate(p._id, { image: url });
                console.log(`✅ ${url.slice(0, 70)}…`);
                success++;
                await new Promise(r => setTimeout(r, 400));
            } catch (err) {
                console.log(`❌ ${err.message.slice(0, 80)}`);
                failed++;
            }
        }
    }

    console.log('\n' + '═'.repeat(60));
    console.log(`✅  Migrated successfully : ${success}`);
    console.log(`❌  Failed               : ${failed}`);
    console.log('═'.repeat(60));

    await mongoose.disconnect();
    console.log('\n🏁  Migration complete. All images now live in Cloudinary.\n');
}

migrate().catch(err => {
    console.error('\n💥  Fatal error:', err.message);
    process.exit(1);
});
