import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"

export default function ListOrder(){
    const [orders, setOrders] = useState([])
    const [selectOrder, setSelectOrder] = useState(null)
    const [pickList, setPickList] = useState([])
    const navigate = useNavigate()

    const fetchOrders = async () => {
        try{
            const token = localStorage.getItem('token');
            const response = await axios.get("https://warehouse-management-backend-t3q2.onrender.com/api/orders", {
                headers: { Authorization: `Bearer ${token}` }
            })
            setOrders(response.data)
        }catch(err){
            console.error(err)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    const updateStatus = async (id, status) => {
        try{
            const token = localStorage.getItem('token');
            await axios.put(`https://warehouse-management-backend-t3q2.onrender.com/api/orders/${id}`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            fetchOrders()
        }catch(err){
            console.error(err)
        }
    }

    const fetchPickList = async (id) => {
        try{
            const token = localStorage.getItem('token');
            const response = await axios.get(`https://warehouse-management-backend-t3q2.onrender.com/api/orders/${id}/picklist`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setPickList(response.data)
            setSelectOrder(id)
        }catch(err){
            console.error(err)
        }
    }

    const getImageUrl = (img) => {
        if (!img) return "https://via.placeholder.com/150?text=No+Img";
        if (img.startsWith("http")) return img;
        return `https://warehouse-management-backend-t3q2.onrender.com/uploads/${img}`;
    };

    return(
        <div className="orders-container">
            <h1 className="orders-title">📦 Order Management</h1>

            <table className="orders-table">
                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Pick</th>
                        <th>Pack</th>
                        <th>Ship</th>
                        <th>Deliver</th>
                        <th>Payment ✅</th>
                    </tr>
                </thead>

                <tbody>
                    {orders.map(order => (
                        <tr key={order._id}>

                            <td>{order.customerName}</td>

                            <td>
                                {order.items.map((item,i)=>(
                                    <div key={i} className="flex items-center gap-2 mb-1">
                                        <img 
                                            src={getImageUrl(item.productId?.image)} 
                                            alt={item.productId?.name} 
                                            className="w-8 h-8 rounded object-cover border border-slate-200"
                                            onError={(e) => { 
                                                e.target.onerror = null; 
                                                e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 50 50'><rect width='100%' height='100%' fill='%23f1f5f9'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%2364748b'>N/A</text></svg>"; 
                                            }}
                                        />
                                        <span className="text-xs">{item.productId?.name} (x{item.quantity})</span>
                                    </div>
                                ))}
                            </td>

                            <td>₹{order.totalAmount}</td>

                            <td>
                                <select
                                    value={order.status}
                                    onChange={e => updateStatus(order._id, e.target.value)}
                                >
                                    <option>Pending</option>
                                    <option>Processing</option>
                                    <option>Packed</option>
                                    <option>Shipped</option>
                                    <option>Delivered</option>
                                    <option>paid</option>
                                </select>
                            </td>

                            <td>
                                <button onClick={()=>fetchPickList(order._id)}>📋</button>
                            </td>

                            <td>
                                <button onClick={()=>updateStatus(order._id,"Packed")}>📦</button>
                            </td>

                            <td>
                                <button onClick={()=>updateStatus(order._id,"Shipped")}>🚚</button>
                            </td>

                            <td>
                                <button onClick={()=>updateStatus(order._id,"Delivered")}>✅</button>
                            </td>

                            <td>
                                {order.status === "paid" ? (
                                    <span style={{
                                        color: "green",
                                        fontWeight: "bold"
                                    }}>
                                        ✅ Paid
                                    </span>
                                ) : (
                                    <button
                                        className="pay-btn"
                                        onClick={() => navigate(`/payment/${order._id}`)}
                                    >
                                        💳 Pay
                                    </button>
                                )}
                            </td>

                        </tr>
                    ))}
                </tbody>
            </table>

            {selectOrder && (
                <div className="picklist-section">
                    <h2>📋 Pick List</h2>
                    {pickList.map((item,index)=>(
                        <div key={index} className="pick-card">
                            <h3>{item.productName}</h3>
                            <p>Qty: {item.quantity}</p>
                            <p>Location: {item.location}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
