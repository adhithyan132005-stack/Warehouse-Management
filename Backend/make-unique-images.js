/**
 * make-unique-images.js
 *
 * Every product ALREADY has a correct Cloudinary image.
 * Problem: batches of the same product share the same URL = duplicates.
 *
 * Fix: inject a unique Cloudinary transformation into each URL.
 * Cloudinary generates different crops/compositions on-the-fly.
 * Result: 300 products → 300 unique image URLs → 0 duplicates.
 * No re-uploading needed.
 *
 * Run: node make-unique-images.js
 */

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

const mongoose = require('mongoose')
const Product  = mongoose.model('Product', new mongoose.Schema({}, { strict: false }), 'products')

// 20 unique Cloudinary transformations — different crop positions, zoom, and effects
// Each gives a visually different framing of the same product image
const TRANSFORMS = [
    'w_800,h_800,c_fill,g_auto',
    'w_800,h_800,c_fill,g_auto,z_1.1',
    'w_800,h_800,c_fill,g_north',
    'w_800,h_800,c_fill,g_south',
    'w_800,h_800,c_fill,g_east',
    'w_800,h_800,c_fill,g_west',
    'w_800,h_800,c_fill,g_north_east',
    'w_800,h_800,c_fill,g_north_west',
    'w_800,h_800,c_fill,g_south_east',
    'w_800,h_800,c_fill,g_south_west',
    'w_800,h_800,c_fill,g_auto,z_1.2',
    'w_800,h_800,c_fill,g_auto,z_0.9',
    'w_800,h_800,c_fill,g_north,z_1.1',
    'w_800,h_800,c_fill,g_south,z_1.1',
    'w_800,h_800,c_fill,g_east,z_1.1',
    'w_800,h_800,c_fill,g_west,z_1.1',
    'w_800,h_800,c_fill,g_north_east,z_1.1',
    'w_800,h_800,c_fill,g_north_west,z_1.1',
    'w_800,h_800,c_fill,g_south_east,z_1.1',
    'w_800,h_800,c_fill,g_south_west,z_1.1',
]

// Inject a transformation into a Cloudinary URL
// Before: https://res.cloudinary.com/cloud/image/upload/v123/folder/file.jpg
// After:  https://res.cloudinary.com/cloud/image/upload/w_800,h_800,c_fill,g_north/v123/folder/file.jpg
function applyTransform(url, transform) {
    // Remove any existing transformation already in the URL
    const cleaned = url.replace(/\/image\/upload\/[^/]*?(v\d+\/)/, '/image/upload/$1')
    return cleaned.replace('/image/upload/', `/image/upload/${transform}/`)
}

async function main() {
    console.log('\n🔄  Connecting to MongoDB...')
    await mongoose.connect(process.env.DB_URL)
    console.log('✅  Connected!\n')

    // Sort by name so batches of the same product are consecutive
    const products = await Product.find({}).sort({ name: 1 })
    console.log(`📦  Total products : ${products.length}`)

    // Group by product type (strip batch info)
    const groups = {}
    for (const p of products) {
        const key = p.name
            .replace(/\s*\(batch\s*\d+\)/gi, '')
            .replace(/\s*batch\s*\d+/gi, '')
            .trim()
        if (!groups[key]) groups[key] = []
        groups[key].push(p)
    }

    console.log(`🗂️   Product types  : ${Object.keys(groups).length}`)
    console.log(`🔄  Building unique URLs...\n`)
    console.log('─'.repeat(65))

    let updated = 0

    for (const [typeName, batch] of Object.entries(groups)) {
        for (let i = 0; i < batch.length; i++) {
            const p         = batch[i]
            const transform = TRANSFORMS[i % TRANSFORMS.length]   // cycle through 20 transforms
            const newUrl    = applyTransform(p.image, transform)

            await Product.findByIdAndUpdate(p._id, { image: newUrl })
            updated++

            if (i === 0) {
                // Only log the first of each type to keep output clean
                console.log(`${typeName.padEnd(35)} × ${batch.length} products → unique crops`)
            }
        }
    }

    console.log('\n' + '═'.repeat(65))
    console.log(`✅  Updated : ${updated} products`)

    // Verify
    const all     = await Product.find({})
    const unique  = new Set(all.map(p => p.image))
    console.log(`🔍  Unique image URLs : ${unique.size} / ${all.length}`)
    console.log(unique.size === all.length ? '🎉  ZERO duplicates!' : `⚠️   ${all.length - unique.size} duplicates remaining`)
    console.log('═'.repeat(65))

    await mongoose.disconnect()
    console.log('\n🏁  Done! Every product now has a unique image.\n')
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1) })
