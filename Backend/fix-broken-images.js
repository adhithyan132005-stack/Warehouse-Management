
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

const mongoose   = require('mongoose')
const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure:     true
})

const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }), 'products')

const PHOTO_IDS = [10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,170,180,190,200,
                   210,220,230,240,250,260,270,280,290,300,310,320,330,340,350,360,370,380]

async function fixBroken() {
    console.log('\n🔄  Connecting...')
    await mongoose.connect(process.env.DB_URL)
    console.log('✅  Connected!\n')

    const all = await Product.find({})
    const broken = all.filter(p => !p.image || !p.image.startsWith('https://res.cloudinary.com'))

    console.log(`Found ${broken.length} products with non-Cloudinary images\n`)

    let ok = 0, fail = 0

    for (let i = 0; i < broken.length; i++) {
        const p = broken[i]
        const photoId = PHOTO_IDS[i % PHOTO_IDS.length]
        const picsumUrl = `https://picsum.photos/id/${photoId}/800/800`

        process.stdout.write(`[${i+1}/${broken.length}] ${p.name}: `)

        try {
            const result = await cloudinary.uploader.upload(picsumUrl, {
                folder: 'warehouse_products',
                public_id: `product_${p._id}`,
                overwrite: true,
                transformation: [{ width: 800, height: 800, crop: 'fill', quality: 'auto' }]
            })
            await Product.findByIdAndUpdate(p._id, { image: result.secure_url })
            console.log(`✅ done`)
            ok++
        } catch (err) {
            console.log(`❌ ${err.message.slice(0,60)}`)
            fail++
        }

        await new Promise(r => setTimeout(r, 300))
    }

    console.log(`\n✅ Fixed: ${ok}   ❌ Failed: ${fail}`)
    await mongoose.disconnect()
    console.log('\n🏁 Done!\n')
}

fixBroken().catch(err => { console.error(err.message); process.exit(1) })
