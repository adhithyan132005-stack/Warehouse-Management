import { useEffect, useState } from "react"
import axios from "axios"

export default function InventoryTable() {
    const [data, setdata] = useState([])

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const response = await axios.get("http://localhost:4444/api/inventory", {
                headers: { authorization: localStorage.getItem('token') }
            })
            setdata(response.data)
            console.log(response.data)
        } catch (err) {
            console.log("Error fetching inventory:", err)
        }
    }

    return (
        <div className="styled-table-wrapper">
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Inventory Stock List</h3>
                <span className="badge badge-success">{data.length} Products</span>
            </div>
            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>location</th>
                        <th>Quantity </th>
                        <th>Batch</th>
                        <th>Expiry</th>
                        <th>status</th>
                    </tr>
                </thead>
               <tbody>
{data.map(item => {

    const isExpired =
        item.expiryDate &&
        new Date(item.expiryDate) < new Date()

    return (
        <tr key={item._id}>

            <td>{item.productId?.name}</td>

            <td>
                {item.locationId
                    ? `${item.locationId.zone}-${item.locationId.rackNumber}`
                    : "N/A"}
            </td>

            <td>{item.quantity}</td>

            <td>{item.batchNumber}</td>

            <td>
                {item.expiryDate
                    ? new Date(item.expiryDate).toLocaleDateString()
                    : "N/A"}
            </td>

            <td>
                <span className={`badge ${
                    isExpired
                        ? 'badge-danger'
                        : item.quantity < 10
                        ? 'badge-warning'
                        : 'badge-success'
                }`}>
                    {isExpired
                        ? "Expired ❌"
                        : item.quantity < 10
                        ? "Low Stock ⚠️"
                        : "Good ✅"}
                </span>
            </td>

        </tr>
    )
})}
</tbody>
</table>
</div>
    )
}