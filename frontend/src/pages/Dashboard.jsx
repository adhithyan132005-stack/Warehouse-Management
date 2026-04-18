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
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center animate-fade-in space-y-4">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in bg-white text-slate-900 p-6 rounded-3xl shadow-lg shadow-slate-200/40">
      {/* Header */}
      <header className="glass-card rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/90 border border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1 text-sky-500">
            Welcome back, <span className="premium-gradient-text text-sky-500">{userName || "User"}</span>
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Role:</span>
            <span className="bg-brand-500/10 text-brand-400 border border-brand-500/20 px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-widest">{userRole}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button 
            className="btn-primary flex items-center gap-2"
            onClick={() => navigate('/create-order')}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Create Order
          </button>
          <button 
            className="bg-surface-800 hover:bg-surface-800/80 border border-glass-border text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center gap-2"
            onClick={() => navigate('/track-order')}
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Track
          </button>
          {userRole !== 'user' && (
            <button 
              className="bg-surface-800 hover:bg-surface-800/80 border border-glass-border text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center gap-2"
              onClick={() => navigate('/inventory')}
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              Inventory
            </button>
          )}
        </div>
      </header>

      {/* Overview Top Bar */}
      <div className="flex justify-between items-center px-2">
        <h2 className="text-xl font-bold text-sky-500">Dashboard Overview</h2>
        <div className="hidden lg:block relative z-30">
          <Notification />
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {userRole === 'user' ? (
          <>
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:border-brand-500/50 transition-colors">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-brand-500/10 rounded-full blur-2xl group-hover:bg-brand-500/20 transition-all"></div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center text-2xl border border-brand-500/30">📦</div>
                <h3 className="text-gray-400 font-medium">My Orders</h3>
              </div>
              <div className="text-4xl font-extrabold mb-1">{userOrders.length}</div>
              <div className="text-xs text-brand-400">Total orders placed</div>
            </div>

            <div className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:border-green-500/50 transition-colors">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-2xl border border-green-500/30">✅</div>
                <h3 className="text-gray-400 font-medium">Completed</h3>
              </div>
              <div className="text-4xl font-extrabold mb-1">{userOrders.filter(order => order.status === 'Delivered' || order.status === 'delivered').length}</div>
              <div className="text-xs text-green-400">Successfully delivered</div>
            </div>

            <div className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:border-orange-500/50 transition-colors">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all"></div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-2xl border border-orange-500/30">⏳</div>
                <h3 className="text-gray-400 font-medium">Pending</h3>
              </div>
              <div className="text-4xl font-extrabold mb-1">{userOrders.filter(order => order.status !== 'Delivered' && order.status !== 'delivered').length}</div>
              <div className="text-xs text-orange-400">In progress</div>
            </div>
          </>
        ) : (
          <>
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:border-brand-500/50 transition-colors">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-brand-500/10 rounded-full blur-2xl group-hover:bg-brand-500/20 transition-all"></div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center text-2xl border border-brand-500/30">📦</div>
                <h3 className="text-gray-400 font-medium">Total Products</h3>
              </div>
              <div className="text-4xl font-extrabold mb-1">{data.totalProducts}</div>
              <div className="text-xs text-green-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                +12% tracking stable
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:border-green-500/50 transition-colors">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-2xl border border-green-500/30">✅</div>
                <h3 className="text-gray-400 font-medium">In Stock</h3>
              </div>
              <div className="text-4xl font-extrabold mb-1">{data.inStock}</div>
              <div className="text-xs text-green-400">Stable inventory levels</div>
            </div>

            <div className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:border-red-500/50 transition-colors">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all"></div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-2xl border border-red-500/30">⚠️</div>
                <h3 className="text-gray-400 font-medium">Low Stock</h3>
              </div>
              <div className="text-4xl font-extrabold mb-1">{data.lowStock}</div>
              <div className="text-xs text-red-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                Requires attention
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Tables/Lists) */}
        <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-glass-border">
            <h3 className="text-lg font-bold text-sky-500">
              {userRole === 'user' ? 'Recent Orders' : 'Recent Operations'}
            </h3>
          </div>
          
          <div className="overflow-x-auto flex-1 p-2">
            {userRole === 'user' ? (
              <div className="space-y-4 p-4">
                {userOrders && userOrders.length > 0 ? (
                  userOrders.map((order) => (
                    <div key={order._id} className="bg-surface-800/40 border border-glass-border rounded-xl p-5 hover:bg-surface-800/80 transition-colors relative overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-white mb-1">Order #{order.orderNumber}</h4>
                          <p className="text-sm text-gray-400">{order.customerName}</p>
                        </div>
                        <div className="flex flex-col sm:items-end gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status?.toLowerCase() === 'delivered' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                            {order.status || 'Processing'}
                          </span>
                          <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                         <button 
                            className="bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                            onClick={() => trackOrder(order._id, order.orderNumber)}
                          >
                            Track Order Status
                          </button>
                      </div>

                      {selectedOrder === order._id && (
                        <div className="mt-6 pt-6 border-t border-glass-border animate-fade-in space-y-6">
                            
                          <div className={`p-4 rounded-xl border flex items-center gap-4 ${trackingInfo && trackingInfo[0]?.message.includes('delivered') ? 'bg-green-500/10 border-green-500/30' : 'bg-surface-900 border-glass-border'}`}>
                            <div className="text-3xl">
                              {trackingInfo?.[0]?.message.includes('delivered') ? '✅' :
                               trackingInfo?.[0]?.message.includes('shipped') ? '🚚' :
                               trackingInfo?.[0]?.message.includes('packed') ? '📦' :
                               trackingInfo?.[0]?.message.includes('processing') ? '🔄' : '📝'}
                            </div>
                            <div>
                               <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Current Status</p>
                               <p className={`font-bold text-lg ${trackingInfo && trackingInfo[0]?.message.includes('delivered') ? 'text-green-400' : 'text-white'}`}>
                                  {trackingInfo && trackingInfo[0] ? (
                                    trackingInfo[0].message.includes('delivered') ? 'Delivered' :
                                    trackingInfo[0].message.includes('shipped') ? 'Shipped' :
                                    trackingInfo[0].message.includes('packed') ? 'Packed' :
                                    trackingInfo[0].message.includes('processing') ? 'Processing' : 'Order Placed'
                                  ) : 'Pending'}
                               </p>
                            </div>
                          </div>

                          {/* Timeline */}
                          {trackingInfo && trackingInfo.length > 0 && (
                             <div className="relative pl-6 border-l-2 border-surface-800 space-y-6 py-2">
                               {trackingInfo
                                  .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                                  .map((activity, index) => (
                                    <div key={index} className="relative">
                                      <div className="absolute -left-[35px] top-1 w-4 h-4 rounded-full bg-brand-500 ring-4 ring-surface-900"></div>
                                      <p className="text-sm font-medium text-gray-200">{formatActivityMessage(activity.message, activity.createdAt || activity.timestamp)}</p>
                                      <p className="text-xs text-gray-500 mt-1">{new Date(activity.createdAt || activity.timestamp).toLocaleTimeString()}</p>
                                    </div>
                               ))}
                             </div>
                          )}

                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 px-4">
                    <div className="text-4xl mb-4">📭</div>
                    <p className="text-gray-400 mb-4">No orders placed yet.</p>
                    <button className="text-brand-400 hover:text-brand-300 font-medium pb-1 border-b border-brand-400/50 transition-colors" onClick={() => navigate('/create-order')}>Create your first order</button>
                  </div>
                )}
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-slate-900">
                <thead>
                  <tr className="border-b border-glass-border">
                    <th className="p-4 text-xs font-semibold text-slate-900 uppercase tracking-wider">Operation</th>
                    <th className="p-4 text-xs font-semibold text-slate-900 uppercase tracking-wider">Product</th>
                    <th className="p-4 text-xs font-semibold text-slate-900 uppercase tracking-wider">Qty</th>
                    <th className="p-4 text-xs font-semibold text-slate-900 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-semibold text-slate-900 uppercase tracking-wider text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border text-slate-900">
                  {data.recentOperations && data.recentOperations.length > 0 ? (
                    data.recentOperations.map((op) => (
                      <tr key={op._id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="p-4 text-sm font-medium text-slate-900">{op.operation}</td>
                        <td className="p-4 text-sm text-slate-900">{op.product}</td>
                        <td className="p-4 text-sm font-medium text-slate-900">{op.quantity}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${op.status === 'Delivered' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                            {op.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-slate-900 text-right">{new Date(op.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-12 text-center text-gray-500">
                        No recent operations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column (Activity/Widgets) */}
        <div className="glass-card rounded-2xl p-6 flex flex-col relative z-20">
          {(userRole === 'admin' || userRole === 'staff') && (
            <div className="w-full">
              <Activity />
            </div>
          )}
          {userRole === 'user' && (
            <div className="flex flex-col items-center justify-center text-center h-full space-y-4 py-12">
              <div className="w-16 h-16 rounded-full bg-surface-800 flex items-center justify-center text-3xl mb-2 border border-glass-border">📋</div>
              <h3 className="text-lg font-bold">Order Tracking</h3>
              <p className="text-sm text-gray-400 max-w-[200px]">Keep an eye on your deliveries in real-time using the Track Order page.</p>
              <button className="btn-primary mt-4 text-sm" onClick={() => navigate('/track-order')}>Track Now</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
