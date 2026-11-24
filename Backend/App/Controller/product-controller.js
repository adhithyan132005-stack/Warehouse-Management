const Product = require('../Model/product-model')

const productController = {}

productController.create = async (req, res) => {
    const { name, sku, category, price, barcode, description } = req.body

    if (!name || !sku || !category || !price) {
        return res.status(400).json({ error: 'name, sku, category and price are required' })
    }

    try {
        const imageUrl = req.file ? req.file.path : null

        const product = new Product({
            name,
            sku,
            category,
            price,
            barcode:     barcode || null,
            description: description || null,
            image:       imageUrl
        })

        await product.save()

        res.status(201).json({ message: 'Product created successfully', product })

    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: 'SKU already exists' })
        }
        res.status(500).json({ error: err.message })
    }
}

productController.list = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 })
        res.json(products)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

productController.show = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        if (!product) return res.status(404).json({ error: 'Product not found' })
        res.json(product)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

productController.update = async (req, res) => {
    try {
        const updateData = { ...req.body }

        if (req.file) {
            updateData.image = req.file.path
        }

        const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true })
        if (!product) return res.status(404).json({ error: 'Product not found' })

        res.json(product)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

productController.delete = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id)
        if (!product) return res.status(404).json({ error: 'Product not found' })
        res.json({ message: 'Product deleted successfully' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

productController.barcode = async (req, res) => {
    try {
        const product = await Product.findOne({ barcode: req.params.code })
        if (!product) return res.status(404).json({ message: 'Product not found' })
        res.json(product)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

module.exports = productController