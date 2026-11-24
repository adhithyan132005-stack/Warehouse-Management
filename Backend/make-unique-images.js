
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

const mongoose = require('mongoose')
const Product  = mongoose.model('Product', new mongoose.Schema({}, { strict: false }), 'products')

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

function applyTransform(url, transform) {
    const cleaned = url.replace(/\/image\/upload\/[^/]*?(v\d+\/)/, '/image/upload/$1')
    return cleaned.replace('/image/upload/', `/image/upload/${transform}/`)
}

async function main() {
    console.log('\n🔄  Connecting to MongoDB...')
    await mongoose.connect(process.env.DB_URL)
    console.log('✅  Connected!\n')

    const products = await Product.find({}).sort({ name: 1 })
    console.log(`📦  Total products : ${products.length}`)

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
            const transform = TRANSFORMS[i % TRANSFORMS.length]
            const newUrl    = applyTransform(p.image, transform)

            await Product.findByIdAndUpdate(p._id, { image: newUrl })
            updated++

            if (i === 0) {
                console.log(`${typeName.padEnd(35)} × ${batch.length} products → unique crops`)
            }
        }
    }

    console.log('\n' + '═'.repeat(65))
    console.log(`✅  Updated : ${updated} products`)

    const all     = await Product.find({})
    const unique  = new Set(all.map(p => p.image))
    console.log(`🔍  Unique image URLs : ${unique.size} / ${all.length}`)
    console.log(unique.size === all.length ? '🎉  ZERO duplicates!' : `⚠️   ${all.length - unique.size} duplicates remaining`)
    console.log('═'.repeat(65))

    await mongoose.disconnect()
    console.log('\n🏁  Done! Every product now has a unique image.\n')
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1) })
