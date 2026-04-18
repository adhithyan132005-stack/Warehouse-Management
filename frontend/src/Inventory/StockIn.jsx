import { useState, useEffect } from "react"
import axios from "axios"

export default function StockIn() {
    const [productId, setproductId] = useState("")
    const [locationId, setlocationId] = useState("")
    const [quantity, setQuantity] = useState("")
    const [products, setProducts] = useState([])
    const [locations, setLocations] = useState([])
    const [batchNumber, setBatchNumber] = useState("")
    const [expiryDate, setExpiryDate] = useState("")

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get("https://warehouse-management-backend-t3q2.onrender.com/api/product", {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => setProducts(res.data))
            .catch(err => console.log(err))
        
        axios.get("https://warehouse-management-backend-t3q2.onrender.com/api/locations", {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(res => {
            console.log("locations:", res.data) 
            setLocations(res.data)
        })
          
            .catch(err => console.log(err))
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault()
        const token = localStorage.getItem('token');
        const data = {
    productId,
    locationId,
    quantity: Number(quantity),
    batchNumber,
    expiryDate
}
        if (locationId) {
            data.locationId = locationId
        }
        
        axios.post("https://warehouse-management-backend-t3q2.onrender.com/api/stock-in", data, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(() => {
                alert("Stock Added Successfully")
                setproductId("")
                setlocationId("")
                setQuantity("")
                 setBatchNumber("")
                setExpiryDate("")
            })
            .catch(err => alert("Error: " + (err.response?.data?.message || err.message)))
    }

    return (
        <div className="inventory-form-container">
            <div className="auth-logo" style={{ fontSize: '2rem' }}>📥</div>
            <h3 className="auth-title" style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Stock In</h3>
            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label className="form-label">Select Product</label>
                    <select
                        value={productId}
                        onChange={e => setproductId(e.target.value)}
                        required
                        className="form-input"
                    >
                        <option value="">-- Choose Product --</option>
                        {products.map(p => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Select Location</label>
                    <select
                        value={locationId}
                        onChange={e => setlocationId(e.target.value)}
                        required
                        className="form-input"
                    >
                        <option value="">-- Choose Location --</option>
                        {locations.map(l => (
                            <option key={l._id} value={l._id}>{l.zone} - {l.rackNumber}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Quantity</label>
                    <input
                        type="number"
                        placeholder="Enter Quantity"
                        value={quantity}
                        onChange={e => setQuantity(e.target.value)}
                        required
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Batch Number</label>
                    <input
                        type="text"
                        placeholder="Enter Batch Number"
                        value={batchNumber}
                        onChange={e => setBatchNumber(e.target.value)}
                        required
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input
                        type="date"
                        value={expiryDate}
                        onChange={e => setExpiryDate(e.target.value)}
                        required
                        className="form-input"
                    />
                </div>
                <button className="auth-btn btn btn--primary">Add to Stock →</button>
            </form>
        </div>
    )
}
