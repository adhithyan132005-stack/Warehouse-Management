import { useState } from "react";
import ProductTable from "./productTable";
import AddProduct from "./AddProduct";
//import "./App.css"

export default function Product(){
    const[showform,setShowForm]=useState(false)
    return(
        <div className="dashboard-wrapper">
            <div className="product-header">
                <h1>Product Management</h1>
                <button className="add-btn"onClick={()=>setShowForm(true)}>+ Add Product</button>

            </div>
            {showform && (
                <div className="modal">
                    <div className="modal-content">
                        <AddProduct close={()=>setShowForm(false)}/>
                        
                        </div>
                    </div>
            )}
            <ProductTable/>
        </div>
    )
    
}