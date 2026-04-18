// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios"
// export default function ListOrder(){
//     const[orders,setOrders]=useState([])
//     const[selectOrder,setSelectOrder]=useState(null)
//     const[pickList,setPickList]=useState([])
//     const navigate=useNavigate()
//     const fetchOrders=async()=>{
//         try{
//             const token = localStorage.getItem('token');
//             const response=await axios.get("http://localhost:4444/api/orders", {
//                 headers: {
//                     'Authorization': `Bearer ${token}`
//                 }
//             })
//             setOrders(response.data)
//         }catch(err){
//             console.error(err)
//         }
//     }
//     useEffect(()=>{
//         fetchOrders()

//     },[])

//     const updateStatus=async(id,status)=>{
//         try{
//             const token = localStorage.getItem('token');
//             await axios.put(`http://localhost:4444/api/orders/${id}`,{status}, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`
//                 }
//             })
//             fetchOrders()
//         }catch(err){
//             console.error(err)
//         }
//     }
    
//     const getStatusStep = (status) => {
//         if (!status) return 0
//         const lowerStatus = status.toLowerCase()
//         if (lowerStatus.includes("pending") || lowerStatus.includes("placed")) return 1
//         if (lowerStatus.includes("processing")) return 2
//         if (lowerStatus.includes("packed")) return 3
//         if (lowerStatus.includes("shipped")) return 4
//         if (lowerStatus.includes("delivered")) return 5
//         return 0
//     }
    
//     const renderProgressBar = (status) => {
//         const currentStep = getStatusStep(status)
        
//         return (
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", paddingTop: "10px", marginY: "10px" }}>
//                 {/* Progress Line Background */}
//                 <div style={{
//                     position: "absolute",
//                     top: "15px",
//                     left: "0",
//                     right: "0",
//                     height: "2px",
//                     backgroundColor: "#e9ecef",
//                     zIndex: 1
//                 }}></div>
                
//                 {/* Active Progress Line */}
//                 <div style={{
//                     position: "absolute",
//                     top: "15px",
//                     left: "0",
//                     height: "2px",
//                     backgroundColor: "#28a745",
//                     zIndex: 2,
//                     width: `${(currentStep / 5) * 100}%`,
//                     transition: "width 0.3s ease"
//                 }}></div>
                
//                 {[
//                     { step: 1, label: "Pending", icon: "📋" },
//                     { step: 2, label: "Processing", icon: "🔄" },
//                     { step: 3, label: "Packed", icon: "📦" },
//                     { step: 4, label: "Shipped", icon: "🚚" },
//                     { step: 5, label: "Delivered", icon: "✅" }
//                 ].map((item) => {
//                     const isCompleted = item.step < currentStep
//                     const isCurrent = item.step === currentStep
                    
//                     return (
//                         <div key={item.step} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative", zIndex: 3 }}>
//                             {isCurrent && (
//                                 <div style={{
//                                     fontSize: "9px",
//                                     fontWeight: "700",
//                                     color: "#28a745",
//                                     marginBottom: "3px",
//                                     textTransform: "uppercase",
//                                     letterSpacing: "0.5px",
//                                     backgroundColor: "#d4edda",
//                                     padding: "2px 6px",
//                                     borderRadius: "10px",
//                                     whiteSpace: "nowrap"
//                                 }}>
//                                     📍 Current
//                                 </div>
//                             )}
//                             <div style={{
//                                 width: "30px",
//                                 height: "30px",
//                                 borderRadius: "50%",
//                                 backgroundColor: isCompleted || isCurrent ? "#28a745" : "#e9ecef",
//                                 display: "flex",
//                                 alignItems: "center",
//                                 justifyContent: "center",
//                                 fontSize: "14px",
//                                 border: isCurrent ? "2px solid #fff" : "none",
//                                 boxShadow: isCurrent ? "0 0 0 2px #28a745" : "none",
//                                 transition: "all 0.3s ease"
//                             }}>
//                                 {isCompleted ? "✓" : item.icon}
//                             </div>
//                             <span style={{
//                                 marginTop: "5px",
//                                 fontSize: "10px",
//                                 fontWeight: isCurrent ? "600" : "500",
//                                 color: isCompleted || isCurrent ? "#28a745" : "#6c757d",
//                                 textAlign: "center"
//                             }}>
//                                 {item.label}
//                             </span>
//                         </div>
//                     )
//                 })}
//             </div>
//         )
//     }
    
//     const fetchPickList=async(id)=>{
//         try{
//             const token = localStorage.getItem('token');
//             const response=await axios.get(`http://localhost:4444/api/orders/${id}/picklist`, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`
//                 }
//             })
//             setPickList(response.data)
//             setSelectOrder(id)

//         }catch(err){
//             console.error(err)

//         }
//     }
//     return(
//         <div className="orders-container">
//             <h1 className="orders-title"> 📦order mangement</h1>
//             <table className="orders-table">
//                 <thead>
//                     <tr>
//                         <th>customer</th>
//                         <th>Items</th>
//                         <th>Total</th>
//                         <th>status</th>
//                         <th>progress</th>
//                         <th>pick</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {orders.map((order)=>(
//                         <tr key={order._id}>
//                         <td>{order.customerName}</td>
//                         <td>{order.items.map((item,i)=>(
//                             <div key={i}>{item.productId?.name} (x{item.quantity})</div>

//                         ))}</td>
//                         <td>₹{order.totalAmount}</td>
//                         <td><select value={order.status} onChange={e=>updateStatus(order._id,e.target.value)}
//                         className="status-dropdown"><option value="Pending">Pending</option>
//                         <option value="Processing">Processing</option>
//                         <option value="Packed">Packed</option>
//                         <option value="Shipped">Shipped</option>
//                         <option value="Delivered">Delivered</option>
//                         <option value="paid">Paid</option></select>
                        
//                         </td>
//                         <td style={{ minWidth: "250px" }}>
//                             {renderProgressBar(order.status)}
//                         </td>
//                         <td><button className="pick-btn" onClick={()=>fetchPickList(order._id)}>view</button></td>
//                         <td><button className="pack-btn" onClick={()=>updateStatus(order._id,"Packed")}>📦 pack</button></td>
//                         <td><button className="ship-btn" onClick={()=>updateStatus(order._id,"Shipped")}>🚚 Ship</button></td>
//                          <td><button className="deliver-btn" onClick={()=>updateStatus(order._id,"Delivered")}>  ✅ Deliver</button></td>
//                          <td>
//                           {order.status !== "paid" && (
//                         <button
//                           className="pay-btn"
//                             onClick={() => navigate(`/payment/${order._id}`)}>  💳 Pay
//                                 </button>
//                                )}
//                         </td>
//                         </tr>
//                     ))}
//                 </tbody>

//             </table>
//             {selectOrder && (
//                 <div className="picklist-section">
//                     <h2>📋 Pick List</h2>
//                     {pickList.map((item,index)=>(
//                         <div key={index}className="pick-card">
//                             <h3>{item.productName}</h3>
//                             <p>Qty:{item.quantity}</p>
//                             <p>Location :{item.location}</p>
//                         </div>
//                     ))}
//                     </div>
//             )}

//         </div>
//     )
// }

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
            const response = await axios.get("http://localhost:4444/api/orders", {
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
            await axios.put(`http://localhost:4444/api/orders/${id}`, { status }, {
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
            const response = await axios.get(`http://localhost:4444/api/orders/${id}/picklist`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setPickList(response.data)
            setSelectOrder(id)
        }catch(err){
            console.error(err)
        }
    }

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
                                    <div key={i}>
                                        {item.productId?.name} (x{item.quantity})
                                    </div>
                                ))}
                            </td>

                            <td>₹{order.totalAmount}</td>

                            {/* STATUS */}
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

                            {/* ACTIONS */}
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

                            {/* 💳 PAYMENT */}
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

            {/* PICK LIST */}
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