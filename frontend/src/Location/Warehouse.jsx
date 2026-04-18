import axios from "axios"
import { useEffect, useState } from "react"
export default function Wrehouse(){
    const[locations,setLocations]=useState([])
    const[products,setProducts]=useState([])
    const[open,setOpen]=useState(false)

    useEffect(()=>{
        axios.get("https://warehouse-management-backend-t3q2.onrender.com/api/locations")
        .then(response=>{
            setLocations(response.data)
        })
    },[])
    const handleClick=async(id)=>{
        const response=await axios.get(`https://warehouse-management-backend-t3q2.onrender.com/api/inventory/${id}`)
        setProducts(response.data)
        setOpen(true)
    }
    return(
        <div >
            <h2>Warehouse view</h2>
            <div className="grid">
                {locations.map((loc)=>(
                    <div key={loc._id} 
                     className={`rack ${loc.totalQty > 50 ? "high" : "low"}`}
                   onClick={() => handleClick(loc._id)}><h4>{loc.rackName}</h4> 
  <p>{loc.totalQty || 0} items</p>
            </div>
                ))}
                </div>
            {open &&(
                <div className="modal">
                    <div className="modal-content">
                    <h3>Products in rock</h3>
                    {products.length===0?(
                        <p>No products available</p>
                    ):(
                        products.map((item)=>(

                            <div key={item._id}>
                                <p><b>Name :</b>{item.productId.name}</p>
                                <p><b>Quantity :</b>{item.quantity}</p>
                                <p><b>Batch:</b>{item.batchNumber}</p>
                                <hr/>
                            </div>
                        ))
                    )}
                    <button onClick={()=>setOpen(false)}></button>
                </div>
                </div>
            )}
        </div>
    )

}
