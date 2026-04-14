import { useEffect, useState } from "react";
import axios from "axios"
export default function Notification(){
    const[alerts,setAlerts]=useState([])
    const[open,setOpen]=useState(false)
    const[seen,setseen]=useState([])
    const userRole = localStorage.getItem('role')
    const unreadCount=alerts.length-seen.length
     const handleClick=()=>{
        const newOpen=!open
        setOpen(newOpen)
        if(newOpen){
            setseen(alerts.map(item=>item._id))
        }
     }
    useEffect(()=>{
        if (userRole === 'admin' || userRole === 'staff') {
            fetchAlerts()
            const interval=setInterval(fetchAlerts,10000)
            return()=>clearInterval(interval)
        }
    },[userRole])
    const fetchAlerts=async()=>{
        try{
            const token = localStorage.getItem('token');
            const response=await axios.get("http://localhost:4444/api/expiry-alert", {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log(response.data)
            const newItems=response.data.filter(item=>!seen.includes(item._id))
            setAlerts(response.data)
  if(newItems.length>0){
    setseen([])
  }
        }catch(err){
            console.log(err)
        }
    }
    return(
        <div className="notification-wrapper">
            {(userRole === 'admin' || userRole === 'staff') && (
                <>
                    <div className="bell" onClick={handleClick}> 🔔
            
                    {/* {alerts.length>0 && (
                        <span className="badge-count">{alerts.length}</span>

                    )} */}
                            {unreadCount > 0 && (
                <span className="badge-count">{unreadCount}</span>
            )}

                    </div>
                    {open && (
                        <div className="notification-dropdown">
                            <h4>Expiry Alerts</h4>
                    
                            {alerts.length===0?(
                                <p>No alerts</p>
                            ):(
                                alerts.map(item =>(
                                    <div key={item._id} className="notification-item">
                                        <strong>{item.productId?.name}</strong>
                                        <p>Expiry:{new Date(item.expiryDate).toLocaleDateString()}</p>
                                        <p>location:{item.locationId?.rackNumber}</p>
                                        </div>
                                ))
                            )}
                            </div>
                    )}
                </>
            )}
        </div>
      
    )
}