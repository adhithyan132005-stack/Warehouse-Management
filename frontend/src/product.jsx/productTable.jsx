import { useEffect } from "react";
import { useState } from "react";
import axios from "axios"

export default function ProductTable(){
    const[products,setProducts]=useState([])
    useEffect(()=>{
        fetchProducts()

    },[])
    const fetchProducts=async()=>{
        try{
            const response=await axios.get("http://localhost:4444/api/product", {
                headers: { authorization: localStorage.getItem('token') }
            })
            setProducts(response.data)
        
    }catch(err){
           console.log("Error fetching product:", err)

    }
}
const deleteProduct=async(id)=>{
    try{
        if(window.confirm("Are you sure?")){
        const response=await axios.delete(`http://localhost:4444/api/product/${id}`, {
            headers: { authorization: localStorage.getItem('token') }
        })
        
        fetchProducts()
        }
        
    }catch(err){
        console.log("Error fetching while deleting a product:", err)

    }
}
const editProduct=async(product)=>{
    const newName=prompt("Edit name",product.name)
    try{
        const response=await axios.put(`http://localhost:4444/api/product/${product._id}`, { ...product, name: newName }, {
            headers: { authorization: localStorage.getItem('token') }
        })
        
        fetchProducts()
    }catch(err){
          console.log("Error fetching while updating a product:", err.response?.data)

    }
}
return(
    <div className="table-card">
        <table className="table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>price</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {products.map((p)=>(
                    <tr key={p._id}>
                        <td>{p.name}</td>
                        <td>{p.sku}</td>
                        <td>{p.category}</td>
                        <td>{p.price}</td>
                        <td className="actions">
                            <button className="edit-btn"
                            onClick={()=>editProduct(p)}> ✏️</button>
                            <button className="delete-btn"onClick={()=>deleteProduct(p._id)}>🗑️</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
)
}