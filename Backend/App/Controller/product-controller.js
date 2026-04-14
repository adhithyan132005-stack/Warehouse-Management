const Product=require("../Model/product-model")
const productController={}
productController.create=async(req,res)=>{
    const body=req.body
    try{
        const product=await Product.create(body)
        res.status(201).json({message:"product created successfully",product})

    }catch(err){
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
        const code = req.query.code
        if (!code) {
            return res.status(400).json({message:"barcode code query is required"})
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