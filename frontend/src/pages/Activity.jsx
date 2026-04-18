import axios from "axios"
import { useEffect } from "react"
import { useState } from "react"
export default function Activity(){
    const[activities,setActivities]=useState([])
    useEffect(()=>{
        fetchActivities()
        const intervel=setInterval(fetchActivities,5000)
        return()=>clearInterval(intervel)
    },[])
    const fetchActivities=async()=>{
        try{
            const token = localStorage.getItem('token');
            const response=await axios.get("https://warehouse-management-backend-t3q2.onrender.com/api/activity", {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            // Filter to show only order-related activities
            const orderActivities = response.data.filter(act => act.type === "order")
            setActivities(orderActivities)
        } catch(err){
            console.error("Error fetching activities:", err)
        }
    }

    const getStatusIcon = (message) => {
        if (message.includes("created")) return "🛒"
        if (message.includes("processing")) return "🔄"
        if (message.includes("packed")) return "📦"
        if (message.includes("shipped")) return "🚚"
        if (message.includes("delivered")) return "✅"
        return "📋"
    }

    return(
        <div className="activity-card">
            <h3>📊 Admin Activity Feed</h3>
            <p style={{fontSize: "14px", color: "#666", marginBottom: "15px"}}>
                Real-time updates on all warehouse operations. For customer order tracking, visit the <a href="/track-order" style={{color: "#007bff"}}>Order Tracking</a> page.
            </p>
            {activities.length === 0 ? (
                <p style={{textAlign: "center", color: "#999", fontStyle: "italic"}}>
                    No order activities yet. Order updates will appear here.
                </p>
            ) : (
                activities.slice(0, 20).map((act)=>(
                    <div key={act._id} className="activity-item" style={{
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        padding: "12px",
                        marginBottom: "10px",
                        backgroundColor: "#f9f9f9",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px"
                    }}>
                        <span style={{fontSize: "20px"}}>{getStatusIcon(act.message)}</span>
                        <div style={{flex: 1}}>
                            <p style={{margin: "0", fontWeight: "500", color: "#333"}}>
                                {act.message}
                            </p>
                            <small style={{color: "#666", fontSize: "12px"}}>
                                {new Date(act.createdAt).toLocaleString()}
                            </small>
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}
