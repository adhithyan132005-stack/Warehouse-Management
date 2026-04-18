const Razorpay=require("razorpay")
let razorpay;
try {
    razorpay=new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_dummy",
        key_secret: process.env.RAZORPAY_KEY_SECRET || "dummysecret"
    })
} catch (e) {
    console.log("Razorpay not initialized due to missing keys");
}

exports.createOrder=async(req,res)=>{
    try{
        const{amount}=req.body
        
        if (!razorpay || process.env.RAZORPAY_KEY_ID === undefined) {
             // Mock response for testing purpose
             return res.json({
                 id: "order_mock_" + Date.now(),
                 amount: amount * 100,
                 currency: "INR",
                 receipt: "order_" + Date.now()
             })
        }

        const options={
            amount:amount*100,
            currency:"INR",
            receipt:"order_"+Date.now()
        }
        const order=await razorpay.orders.create(options)
        res.json(order)
    }catch(err){
        res.status(500).json({error:err.message})
    }
}