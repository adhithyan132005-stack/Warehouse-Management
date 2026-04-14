import { useState } from "react"
import "./addproduct.css"
import axios from "axios"
import Barcode from "./barcode"

export default function AddProduct({close,refresh}){
    const[form,setForm]=useState({
        name:"",
        sku:"",
        barcode:"",
        category:"",
        price:"",
        description:""
    })
    const[error,seterror]=useState("")
    const [showScanner, setShowScanner] = useState(false);
    const handleChange=async(e)=>{
        setForm({...form,[e.target.name]:e.target.value})
        
    }
    const handleBarcodeScan = async (code) => {
  setShowScanner(false);

  
  setForm((prev) => ({
    ...prev,
    barcode: code
  }));

  try {
    const token = localStorage.getItem('token');
    const res = await axios.get(
      `http://localhost:4444/api/barcode/${code}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    
    setForm({
      name: res.data.name,
      sku: res.data.sku,
      barcode: res.data.barcode,
      category: res.data.category,
      price: res.data.price,
      description: res.data.description
    });

  } catch (err) {
    console.log("New product");
  }
};
    const handlesubmit=async(e)=>{
        e.preventDefault()
        if(!form.name || !form.sku|| !form.category|| !form.price || !form.barcode){
            seterror("All fields including barcode are required")
            return;
        }
        try{
            const token = localStorage.getItem('token');
            const response=await axios.post("http://localhost:4444/api/product",form, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            alert("product Added successfully")
            if(refresh){
                refresh()
            }
            if(close){
                close()
            }
        }catch(err){
            console.log("something went wrong while adding a product",err)
            seterror("something went wrong while adding a product")

        }
    }
    return(
        <div className="add-product-container">
            <div className="form-header">
                <h2>Add product</h2>
                <button className="close-btn"onClick={close}>✖</button>

            </div>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handlesubmit}>
                <input type="text"
                name="name"
                placeholder="product name"
                value={form.name}
                onChange={handleChange}/>

                  <input type="text"
                name="sku"
                placeholder="SKU"
                value={form.sku}
                onChange={handleChange}/>

                <button type="button" onClick={() => setShowScanner(true)}>
  📷 Scan Barcode
</button>
              {showScanner && (
                  <div className="modal">
                     <div className="modal-content">
                       <Barcode
                  onScan={handleBarcodeScan}
                   close={() => setShowScanner(false)}
                     />
                  </div>
             </div>
         )}
                  <input type="text"
                name="category"
                placeholder="category"
                value={form.category}
                onChange={handleChange}/>

                  <input type="number"
                name="price"
                placeholder="price"
                value={form.price}
                onChange={handleChange}/>

                  <textarea
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}/>

                <button type="submit" className="submit-btn">Add product</button>
            </form>
        </div>
    )
    }
