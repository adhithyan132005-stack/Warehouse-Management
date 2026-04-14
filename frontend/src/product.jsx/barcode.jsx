import BarcodeScannerComponent from "react-qr-barcode-scanner"
import axios from "axios"
import { useState } from "react"

export default function Barcode() {
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        price: "",
        barcode: "",
        quantity: ""
    })
    const [message, setMessage] = useState("")


    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post("http://localhost:4444/api/product", formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            alert("product saved ✅")
        } catch (err) {
            console.log(err)
        }
    }

    const handlescan = async (result) => {
        if (!result) return


        const code = result.getText ? result.getText() : result.text
        setFormData((prev) => ({ ...prev, barcode: code }))

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:4444/api/barcode?code=${encodeURIComponent(code)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            setFormData({
                name: response.data.name,
                category: response.data.category,
                price: response.data.price,
                barcode: response.data.barcode,
                quantity: response.data.quantity
            })
            setMessage("product found ✅")
        } catch (err) {
            setMessage("New product ➕ Enter Details")
            setFormData((prev) => ({
                ...prev,
                name: "",
                category: "",
                price: "",
                quantity: ""
            }))
        }
    }

    return (
        <div>
            <h2>Scan Barcode</h2>
            <BarcodeScannerComponent
                width={400}
                height={300}
                onUpdate={(err, result) => {
                    if (result) handlescan(result)
                }}
            />
            <h3>{message}</h3>

            <input
                placeholder="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <input
                placeholder="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />

            <input
                placeholder="Price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />

            <input
                placeholder="Quantity"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />


            <button onClick={handleSave}>Save Product</button>
        </div>
    )
}