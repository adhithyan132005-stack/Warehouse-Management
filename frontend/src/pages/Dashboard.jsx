// import { useEffect } from "react"
// import { useState } from "react"
// import RiskTable from "./RiskTableDashboard"
// import axios from "axios"
// import CategoryChart from "./categorychartDasboard"

// export default function Dashboard(){
//     const[data,setData]=useState(null)
//     useEffect(()=>{
//         axios.get("http://localhost:4000/api/dashboard")
//         .then((response)=>{
//             console.log(response.data)
//             setData(response.data)
//         })
//         .catch((err)=>{
//             console.log(err)
//         })

//     },[])
//     if(!data){
//         return <div>loading...</div>
//     }
//     return(
//         <div>
//             <h1> Expiry Risk dashboard</h1>
//             <h2>Total near Expiry :{data.totalNearExpiry}</h2>
//             <RiskTable stats={data.categoryStatus}/>
//             <CategoryChart stats={data.categoryStatus ?? {}}/>            
//         </div>
//     )
// }

import { useEffect, useState } from "react"
import axios from "axios"
import Notification from "./Notification"
import Activity from "./Activity"
import UserNotifications from "./UserNotifications"
import { useNavigate } from "react-router-dom"

export default function Dashboard() {
  const userName = localStorage.getItem("userName")
  const userRole = localStorage.getItem("role")
  const [data, setdata] = useState(null)
  const [userOrders, setUserOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [trackingInfo, setTrackingInfo] = useState(null)
  const navigate = useNavigate()

  const fetchUserOrders = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get("http://localhost:4444/api/user-orders", {
        headers: { authorization: token }
      })
      setUserOrders(response.data)
    } catch (err) {
      console.log("Error fetching user orders:", err)
      setUserOrders([])
    }
  }

  const trackOrder = async (orderId, orderNumber) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`http://localhost:4444/api/activity?orderNumber=${orderNumber}`, {
        headers: { authorization: token }
      })
      setSelectedOrder(orderId)
      setTrackingInfo(response.data)
    } catch (err) {
      console.log("Error tracking order:", err)
      setSelectedOrder(orderId)
      setTrackingInfo([])
    }
  }

  const formatActivityMessage = (message, createdAt) => {
    const date = new Date(createdAt)
    const timeString = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
    const dateString = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    if (message.includes("was placed")) {
      return `Your order was placed at ${timeString} on ${dateString}`
    } else if (message.includes("being processed")) {
      return `Your order started processing at ${timeString} on ${dateString}`
    } else if (message.includes("packed")) {
      return `Your order was packed and is ready for shipping at ${timeString} on ${dateString}`
    } else if (message.includes("shipped")) {
      return `Your order was shipped and is on its way at ${timeString} on ${dateString}`
    } else if (message.includes("delivered")) {
      return `Your order was successfully delivered at ${timeString} on ${dateString}`
    }
    return message
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    axios.get("http://localhost:4444/api/dashboard", {
      headers: { authorization: token }
    })
      .then((response) => {
        setdata(response.data)
      }).catch((err) => {
        console.log("Dashboard data fetch error:", err)
        // Set empty data for users who can't access warehouse stats
        setdata({
          totalProducts: 0,
          inStock: 0,
          lowStock: 0,
          recentOperations: []
        })
      })

    fetchUserOrders()
    
    // Check if there's a last created order to track
    const lastOrderId = localStorage.getItem('lastOrderId')
    const lastOrderNumber = localStorage.getItem('lastCreatedOrder')
    if (lastOrderId && lastOrderNumber) {
      trackOrder(lastOrderId, lastOrderNumber)
      localStorage.removeItem('lastOrderId')
      localStorage.removeItem('lastCreatedOrder') // Clear it after showing
    }
  }, [])
  if (!data) {
    return (
      <div className="dashboard-wrapper">
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📊</div>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-dim)' }}>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <div className="welcome-section">
          <h1 className="dashboard-welcome">
            Welcome back, <span className="user-name">{userName ? userName : "User"}</span>
          </h1>
          <p className="user-role">Role: <span className="role-badge">{userRole}</span></p>
        </div>
        <div className="quick-actions">
          <button 
            className="action-btn primary" 
            onClick={() => navigate('/create-order')}
          >
            Create New Order
          </button>
          <button 
            className="action-btn secondary" 
            onClick={() => navigate('/track-order')}
          >
            🔍 Track Orders
          </button>
          {userRole !== 'user' && (
            <button 
              className="action-btn tertiary" 
              onClick={() => navigate('/inventory')}
            >
              📦 Manage Inventory
            </button>
          )}
        </div>
        <UserNotifications />
      </header>

      <div className="dashboard-content">
        <div className="dashboard-main">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h2>Dashboard Overview</h2>
            <Notification />
          </div>

      <div className="dashboard-tiles">
        {userRole === 'user' ? (
          // User-specific tiles
          <>
            <div className="tile tile-primary">
              <span className="tile-icon">📦</span>
              <span>My Orders</span>
              <strong>{userOrders.length}</strong>
              <div className="tile-trend">Total orders placed</div>
            </div>
          
            <div className="tile tile-safe">
              <span className="tile-icon">✅</span>
              <span>Completed</span>
              <strong>{userOrders.filter(order => order.status === 'Delivered' || order.status === 'delivered').length}</strong>
              <div className="tile-trend">Successfully delivered</div>
            </div>

            <div className="tile tile-warning">
              <span className="tile-icon">⏳</span>
              <span>Pending</span>
              <strong>{userOrders.filter(order => order.status !== 'Delivered' && order.status !== 'delivered').length}</strong>
              <div className="tile-trend">In progress or pending</div>
            </div>
          </>
        ) : (
          // Staff/Admin tiles
          <>
            <div className="tile tile-primary">
              <span className="tile-icon">📦</span>
              <span>Total Products</span>
              <strong>{data.totalProducts}</strong>
              <div className="tile-trend up">+12% this month</div>
            </div>
          
            <div className="tile tile-safe">
              <span className="tile-icon">✅</span>
              <span>In Stock</span>
              <strong>{data.inStock}</strong>
              <div className="tile-trend">Stable</div>
            </div>

            <div className="tile tile-danger">
              <span className="tile-icon">⚠️</span>
              <span>Low Stock</span>
              <strong>{data.lowStock}</strong>
              <div className="tile-trend down">Requires attention</div>
            </div>
          </>
        )}
      </div>

      <div className="dashboard-sections">
        <div className="section-half">
          <div className="styled-table-wrapper">
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1.25rem' }}>
                {userRole === 'user' ? 'My Recent Orders' : 'Recent Operations'}
              </h3>
            </div>
            {userRole === 'user' ? (
              <div className="user-orders-list">
                {userOrders && userOrders.length > 0 ? (
                  userOrders.map((order) => (
                    <div key={order._id} className="order-card">
                      <div className="order-header">
                        <div>
                          <h4>Order #{order.orderNumber}</h4>
                          <p>{order.customerName}</p>
                        </div>
                        <div className="order-status">
                          <span className={`badge ${order.status === 'Delivered' ? 'badge-success' : 'badge-warning'}`}>
                            {order.status || 'Processing'}
                          </span>
                        </div>
                      </div>
                      <div className="order-details">
                        <small>{new Date(order.createdAt).toLocaleDateString()}</small>
                        <button 
                          className="track-btn"
                          onClick={() => trackOrder(order._id, order.orderNumber)}
                        >
                          📍 Track Order
                        </button>
                      </div>
                      {selectedOrder === order._id && (
                        <div className="tracking-info">
                          <h5>Order Details & Tracking</h5>
                          
                          {/* Current Status Summary */}
                          {trackingInfo && trackingInfo.length > 0 && (
                            <div style={{ 
                              marginBottom: "16px", 
                              padding: "12px", 
                              backgroundColor: "#e8f5e8", 
                              borderRadius: "8px", 
                              border: "1px solid #4caf50",
                              display: "flex",
                              alignItems: "center",
                              gap: "10px"
                            }}>
                              <span style={{ fontSize: "20px" }}>
                                {trackingInfo[0].message.includes('delivered') && '✅'}
                                {trackingInfo[0].message.includes('shipped') && '🚚'}
                                {trackingInfo[0].message.includes('packed') && '📦'}
                                {trackingInfo[0].message.includes('being processed') && '🔄'}
                                {trackingInfo[0].message.includes('was placed') && '📝'}
                              </span>
                              <div>
                                <strong style={{ color: "#2e7d32" }}>
                                  Status: {trackingInfo[0].message.includes('delivered') ? 'Delivered' :
                                          trackingInfo[0].message.includes('shipped') ? 'Shipped' :
                                          trackingInfo[0].message.includes('packed') ? 'Packed' :
                                          trackingInfo[0].message.includes('being processed') ? 'Processing' :
                                          'Order Placed'}
                                </strong>
                              </div>
                            </div>
                          )}
                          
                          <div className="order-products">
                            <h6>Products in this order:</h6>
                            {order.items && order.items.map((item, index) => (
                              <div key={index} className="product-item">
                                <span>{item.productId?.name || 'Product'} - Quantity: {item.quantity}</span>
                                <span>₹{item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                          <h6>Tracking Timeline:</h6>
                          {trackingInfo && trackingInfo.length > 0 ? (
                            <div className="tracking-timeline">
                              {trackingInfo
                                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                                .map((activity, index) => (
                                <div key={index} className="tracking-step">
                                  <div className="step-icon">
                                    {activity.message.includes('created') && '📝'}
                                    {activity.message.includes('processing') && '🔄'}
                                    {activity.message.includes('packed') && '📦'}
                                    {activity.message.includes('shipped') && '🚚'}
                                    {activity.message.includes('delivered') && '✅'}
                                  </div>
                                  <div className="step-content">
                                    <p>{formatActivityMessage(activity.message, activity.createdAt || activity.timestamp)}</p>
                                    <small>{new Date(activity.createdAt || activity.timestamp).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true
                                    })}</small>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p>No tracking information available yet.</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="empty-orders">
                    <p>No orders found. <button className="action-link" onClick={() => navigate('/create-order')}>Create your first order</button></p>
                  </div>
                )}
              </div>
            ) : (
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>Operation</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOperations && data.recentOperations.length > 0 ? (
                    data.recentOperations.map((op) => (
                      <tr key={op._id}>
                        <td>{op.operation}</td>
                        <td>{op.product}</td>
                        <td>{op.quantity}</td>
                        <td>
                          <span className={`badge ${op.status === 'Delivered' ? 'badge-success' : 'badge-warning'}`}>
                            {op.status}
                          </span>
                        </td>
                        <td>{new Date(op.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-dim)' }}>
                        No recent operations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="section-half">
          {(userRole === 'admin' || userRole === 'staff') && <Activity />}
          {userRole === 'user' && (
            <div className="activity-placeholder">
              <h3>Order Updates</h3>
              <p>Your order status updates will appear here.</p>
              <div className="activity-item">
                <span className="activity-icon">📋</span>
                <div>
                  <p>Track your orders using the Track Order page</p>
                  <small>Real-time updates available</small>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
      </div>
    </div>
  )
}
