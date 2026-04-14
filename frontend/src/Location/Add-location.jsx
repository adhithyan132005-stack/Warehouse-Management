import axios from "axios"
import { useState } from "react"
export default function AddLocation(){
    const[zone,setZone]=useState("")
    const[rackNumber,setRackNumber]=useState("")
    const[capacity,setCapacity]=useState(100)

    const handleSubmit=async(e)=>{
        e.preventDefault()
        if(!zone||!rackNumber||!capacity){
            return alert("All fields are required")
        }
        try{
            const token = localStorage.getItem('token');
            await axios.post("http://localhost:4444/api/locations",{zone,rackNumber,capacity:Number(capacity)}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            alert("✅ Location Added Successfully")
            setZone("")
             setRackNumber("")
             setCapacity("")
            
        }catch(err){
            console.log(err)
            alert("❌ Error adding location")
        }
    }
    return(
        <div className="loaction-container">
            <h2>Add location</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Zone(A,B,C)"value={zone}onChange={e=>setZone(e.target.value)}/>
                 <input type="text" placeholder="Rack Number(A1,B2,C3)"value={rackNumber}onChange={e=>setRackNumber(e.target.value)}/>
                 <input type="number" placeholder="Capacity"value={capacity}onChange={e=>setCapacity(e.target.value)}/>
                 <button type="submit">Add Location</button>
            </form>
        </div>
    )
}