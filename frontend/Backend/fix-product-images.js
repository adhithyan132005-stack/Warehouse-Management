

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

const axios      = require('axios')
const { Readable } = require('stream')
const mongoose   = require('mongoose')
const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure:     true
})

const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }), 'products')

const PRODUCT_IMAGES = {
    'cavendish banana':     'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=800&q=80&auto=format',
    'honeycrisp apple':     'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=800&q=80&auto=format',
    'organic blueberries':  'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=800&q=80&auto=format',
    'red seedless grapes':  'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=800&q=80&auto=format',
    'golden pineapple':     'https://images.unsplash.com/photo-1490885578174-acda8905c2c6?w=800&q=80&auto=format',
    'seedless watermelon':  'https://images.unsplash.com/photo-1587049352847-81a56d773ca2?w=800&q=80&auto=format',
    'zespri kiwifruit':     'https://images.unsplash.com/photo-1585059895524-72359e06138a?w=800&q=80&auto=format',
    'juicy peaches':        'https://images.unsplash.com/photo-1595124253344-21b0bb11b611?w=800&q=80&auto=format',
    'king alfonso mango':   'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&q=80&auto=format',
    'fresh strawberries':   'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&q=80&auto=format',

    'organic carrots':      'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&q=80&auto=format',
    'fresh broccoli':       'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=800&q=80&auto=format',
    'roma tomatoes':        'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80&auto=format',
    'russet potatoes':      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80&auto=format',
    'red onions':           'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=800&q=80&auto=format',
    'fresh garlic bulbs':   'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=800&q=80&auto=format',
    'baby spinach':         'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&q=80&auto=format',
    'curly kale':           'https://images.unsplash.com/photo-1524179524541-1a4ef8c6b578?w=800&q=80&auto=format',
    'bell peppers':         'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&q=80&auto=format',
    'english cucumber':     'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=800&q=80&auto=format',

    'smartphone pro':       'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80&auto=format',
    'ultra laptop':         'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80&auto=format',
    'wireless headphones':  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80&auto=format',
    'gaming console':       'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80&auto=format',
    '4k monitor':           'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80&auto=format',
    'digital camera':       'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80&auto=format',
    'smart watch':          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80&auto=format',
    'bluetooth speaker':    'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80&auto=format',

    'cotton t-shirt':       'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80&auto=format',
    'denim jacket':         'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80&auto=format',
    'running shoes':        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80&auto=format',
    'wool sweater':         'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800&q=80&auto=format',

    'eyeshadow palette':    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80&auto=format',
    'lip gloss':            'https://images.unsplash.com/photo-1586495777744-4e6232bf4e47?w=800&q=80&auto=format',
    'night cream':          'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80&auto=format',
    'perfume bottle':       'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80&auto=format',
    'skin serum':           'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80&auto=format',

    'coffee beans':         'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80&auto=format',
    'pasta noodles':        'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800&q=80&auto=format',
    'whole milk':           'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&q=80&auto=format',
    'olive oil':            'https://images.unsplash.com/photo-1474979266404-7eaacabc88c7?w=800&q=80&auto=format',
}

function getBaseKey(name) {
    return name
        .replace(/\s*\(batch\s*\d+\)/gi, '')
        .replace(/\s*batch\s*\d+/gi, '')
        .trim()
        .toLowerCase()
}

async function uploadFromUrl(url, publicId) {
    const res = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 20000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept':     'image/webp,image*;q=0.8',
            'Referer':    'https://unsplash.com'
        }
    })

    const buffer = Buffer.from(res.data)

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder:    'warehouse_products',
                public_id:  publicId,
                overwrite:  true,
                transformation: [{ width: 800, height: 800, crop: 'fill', quality: 'auto', fetch_format: 'auto' }]
            },
            (err, result) => { if (err) reject(err); else resolve(result.secure_url) }
        )
        Readable.from(buffer).pipe(stream)
    })
}

async function main() {
    console.log('\n🔄  Connecting to MongoDB...')
    await mongoose.connect(process.env.DB_URL)
    console.log('✅  Connected!\n')

    const products = await Product.find({}).sort({ name: 1 })
    console.log(`📦  Products: ${products.length}   |   🗺️  Mappings: ${Object.keys(PRODUCT_IMAGES).length}\n`)
    console.log('─'.repeat(72))

    let ok = 0, fail = 0
    const cache = {}

    for (let i = 0; i < products.length; i++) {
        const p       = products[i]
        const baseKey = getBaseKey(p.name)
        const srcUrl  = PRODUCT_IMAGES[baseKey]

        process.stdout.write(`[${String(i+1).padStart(3)}/${products.length}] ${p.name.padEnd(40)}: `)

        if (!srcUrl) {
            console.log(`⚠️  no mapping — skipped`)
            fail++
            continue
        }

        if (cache[baseKey]) {
            await Product.findByIdAndUpdate(p._id, { image: cache[baseKey] })
            console.log(`♻️  reused`)
            ok++
            continue
        }

        const pid = `prod_${baseKey.replace(/[^a-z0-9]/g, '_')}`

        try {
            const cloudUrl = await uploadFromUrl(srcUrl, pid)
            cache[baseKey] = cloudUrl
            await Product.findByIdAndUpdate(p._id, { image: cloudUrl })
            console.log(`✅  done`)
            ok++
            await new Promise(r => setTimeout(r, 400))
        } catch (err) {
            console.log(`❌  ${err.message.slice(0, 65)}`)
            fail++
        }
    }

    console.log('\n' + '═'.repeat(72))
    console.log(`✅  Updated : ${ok}`)
    console.log(`❌  Failed  : ${fail}`)
    console.log('═'.repeat(72))

    if (fail > 0) {
        console.log('\n⚠️  Run the script again for any failed products.\n')
    }

    await mongoose.disconnect()
    console.log('\n🏁  All products now show their correct images!\n')
}

main().catch(err => { console.error('\nFatal:', err.message); process.exit(1) })
