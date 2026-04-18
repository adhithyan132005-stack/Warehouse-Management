const Product=require("../Model/product-model")
const productController={}
productController.create=async(req,res)=>{
    const { name, sku, category, price } = req.body
    if (!name || !sku || !category || !price) {
        return res.status(400).json({ error: 'name, sku, category and price are required' })
    }

    try{
          const product = new Product({
            name: req.body.name,
            sku: req.body.sku,
            barcode: req.body.barcode,
            category: req.body.category,
            price: req.body.price,
            description: req.body.description,
            image: req.file ? req.file.filename : null
        })

        await product.save()
        res.status(201).json({message:"product created successfully",product})

    }catch(err){
        console.error('Product create error:', err)
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message })
        }
        if (err.code === 11000) {
            const field = Object.keys(err.keyValue)[0]
            return res.status(409).json({ error: `${field} already exists` })
        }
        res.status(500).json({error:err.message})
    }
}
productController.list=async(req,res)=>{
    try{
        const product=await Product.find()
        res.json(product)
    }catch(err){
        res.status(500).json({error:err.message})
    }
}
productController.show=async(req,res)=>{
    const id=req.params.id
    try{
        const product=await Product.findById(id)
        res.json(product)
    }catch(err){
        res.status(500).json({error:err.message})
    }
}
productController.update=async(req,res)=>{
    const body=req.body;
    const id=req.params.id
    try{
        const product=await Product.findByIdAndUpdate(id,body,{new:true})
        res.json(product)
    }catch(err){
        res.status(500).json({error:err.message})
    }
}
productController.delete=async(req,res)=>{
    const id=req.params.id
    try{
        const product = await Product.findByIdAndDelete(id)
        res.json({message:"product deleted",product})
    }catch(err){
        res.status(500).json({error:err.message})
    }
}
productController.barcode=async(req,res)=>{
    try{
        const code = req.params.code || req.query.code
        if (!code) {
            return res.status(400).json({message:"barcode code is required"})
        }

        const products = await Product.findOne({barcode: code})
        if(!products){
            return res.status(404).json({message:"product not found"})
        }
        res.json(products)
    }catch(err){
        res.status(500).json({error:err.message})
    }
}
module.exports=productController