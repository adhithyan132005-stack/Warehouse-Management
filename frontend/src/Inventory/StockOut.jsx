import { useState, useEffect } from "react"
import axios from "axios"

export default function StockOut() {
    const [productId, setproductId] = useState("")
    const [locationId, setlocationId] = useState("")
    const [quantity, setQuantity] = useState("")
    const [products, setProducts] = useState([])
    const [locations, setLocations] = useState([])

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
            .then(res => setLocations(res.data))
            .catch(err => console.log(err))
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault()
        const token = localStorage.getItem('token');
        const data = { productId, quantity: Number(quantity) }
        if (locationId) {
            data.locationId = locationId
        }
        
        axios.post("https://warehouse-management-backend-t3q2.onrender.com/api/stock-out", data, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(() => {
                alert("Stock Removed Successfully")
                setproductId("")
                setlocationId("")
                setQuantity("")
            })
            .catch(err => alert("Error: " + (err.response?.data?.message || err.message)))
    }

    return (
        <div className="inventory-form-container">
            <div className="auth-logo" style={{ fontSize: '2rem' }}>📤</div>
            <h3 className="auth-title" style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Stock Out</h3>
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
                <button className="auth-btn btn btn--primary">Remove from Stock →</button>
            </form>
        </div>
    )
}
