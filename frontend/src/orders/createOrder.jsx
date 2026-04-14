import axios from "axios"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
export default function CreateOrder(){
    const[customerName,setCustomerName]=useState("")
    const[products,setProducts]=useState([])
    const[items,setItems]=useState([{
        productId:"",quantity:"1"
    }])
    const navigate = useNavigate()
    useEffect(()=>{
        fetchProducts()

    },[])
    const fetchProducts=async()=>{
        try{
            const token = localStorage.getItem('token');
            const response=await axios.get("http://localhost:4444/api/product", {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            setProducts(response.data)
        }catch(err){
            console.error(err)
        }
    }

    const handleChange=(index,field,value)=>{
        const updatedItems=[...items]
        updatedItems[index][field]=value
        setItems(updatedItems)
    }

    const addItem=()=>{
        setItems([...items,{productId:"",quantity:"1"}])
    }
    const handleSubmit=async()=>{
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post("http://localhost:4444/api/orders",{customerName,items}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            
            // Store the order ID and number for tracking
            const orderId = response.data._id;
            const orderNumber = response.data.orderNumber;
            localStorage.setItem('lastOrderId', orderId);
            localStorage.setItem('lastCreatedOrder', orderNumber);
            
            alert(`Order created successfully! Order ID: ${orderNumber}`)
            
            // Reset form
            setCustomerName("")
            setItems([{
                productId:"",quantity:"1"
            }])
            
            // Navigate to dashboard to see the order
            navigate('/dashboard')
            
        } catch (err) {
            console.error("Error creating order:", err)
            alert("Error creating order: " + (err.response?.data?.error || err.message))
        }
    }


return(
    <div className="order-container">
        <h2>create Order</h2>
        <input type="text" placeholder="customer Name" value={customerName} onChange={e=>setCustomerName(e.target.value)}/>
        {items.map((item,index)=>(
            <div key={index}className="item-row">
                <select value={item.productId}
                 onChange={e=>handleChange(index,"productId",e.target.value)}>
                    <option value="">select product</option>
                    {products.map((product)=>(
                        <option key={product._id}value={product._id}>{product.name}-₹{product.price}</option>
                    ))}
                    </select>
                <input type="number" placeholder="quantity" value={item.quantity} onChange={e=>handleChange(index,"quantity",e.target.value)}/>
                </div>
        ))}
        <button type="button" onClick={addItem}>+ Add Item</button>
        <button type="button" className="submit-btn" onClick={handleSubmit}>create Order</button>

    </div>
    
)
}