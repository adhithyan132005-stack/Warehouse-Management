import { useState } from "react"
import axios from "axios"
import Barcode from "./barcode"

export default function AddProduct({close,refresh}){
    // Dynamic Backend URL detection
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const BASE_URL = isLocal 
        ? "http://localhost:4444" 
        : "https://warehouse-management-backend-t3q2.onrender.com";

    const[form,setForm]=useState({
        name:"",
        sku:"",
        barcode:"",
        category:"",
        price:"",
        description:"",
        image:null
    })
    const[error,seterror]=useState("")
    const [showScanner, setShowScanner] = useState(false);
    const [preview, setPreview] = useState(null)
    const handleImageChange=(e)=>{
      const file=e.target.files[0]
      if (file) {
          setForm({...form,image:file})
          setPreview(URL.createObjectURL(file))
      }
    }
    const handleChange=async(e)=>{
        setForm({...form,[e.target.name]:e.target.value})
    }
    const handleBarcodeScan = async (code) => {
        setShowScanner(false);
        setForm((prev) => ({ ...prev, barcode: code }));
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${BASE_URL}/api/barcode/${code}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
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

    const handlesubmit = async (e) => {
        e.preventDefault()
        if (!form.name || !form.sku || !form.category || !form.price) {
            seterror("All required fields must be filled")
            return
        }

        try {
            seterror("")
            const token = localStorage.getItem('token')
            const formData = new FormData()
            formData.append("name", form.name)
            formData.append("sku", form.sku)
            if (form.barcode) formData.append("barcode", form.barcode)
            formData.append("category", form.category)
            formData.append("price", form.price)
            formData.append("description", form.description)
            if (form.image) formData.append("image", form.image)

            await axios.post(`${BASE_URL}/api/product`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            })

            alert("Product Added Successfully")
            if (refresh) refresh()
            if (close) close()
        } catch (err) {
            console.error(err)
            const message = err.response?.data?.error || err.response?.data?.message || err.message || "Something went wrong"
            seterror(message)
        }
    }
    return(
        <div className="add-product-container">
            <div className="form-header">
                <h2>Add product</h2>
                <button className="close-btn"onClick={close}>✖</button>

            </div>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handlesubmit} className="auth-form">
                <div className="form-group">
                    <label className="form-label">Product Image</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="form-input file-input" />
                    {preview && (
                        <img src={preview} alt="preview" className="preview-image" />
                    )}
                </div>

                <div className="form-grid-two">
                    <div className="form-group">
                        <label className="form-label">Product Name</label>
                        <input type="text"
                            name="name"
                            placeholder="Product name"
                            value={form.name}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">SKU</label>
                        <input type="text"
                            name="sku"
                            placeholder="SKU"
                            value={form.sku}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>
                </div>

                <div className="form-group barcode-group">
                    <label className="form-label">Barcode</label>
                    <div className="barcode-row">
                        <input type="text"
                            name="barcode"
                            placeholder="Barcode (optional)"
                            value={form.barcode}
                            onChange={handleChange}
                            className="form-input"
                        />
                        <button type="button" className="btn btn--primary barcode-scan-btn" onClick={() => setShowScanner(true)}>
                            📷 Scan Barcode
                        </button>
                    </div>
                </div>

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

                <div className="form-grid-two">
                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <input type="text"
                            name="category"
                            placeholder="Category"
                            value={form.category}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Price</label>
                        <input type="number"
                            name="price"
                            placeholder="Price"
                            value={form.price}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={form.description}
                        onChange={handleChange}
                        className="form-input"
                        rows="4"
                    />
                </div>

                <button type="submit" className="submit-btn btn btn--primary">Add product</button>
            </form>
        </div>
    )
}
