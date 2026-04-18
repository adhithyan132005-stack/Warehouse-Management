import axios from "axios"
import { useState, useEffect } from "react"

export default function OrderTracking() {
    const [orderNumber, setOrderNumber] = useState("")
    const [activities, setActivities] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // Check for auto-filled order number from localStorage
    useEffect(() => {
        const lastCreatedOrder = localStorage.getItem('lastCreatedOrder');
        if (lastCreatedOrder) {
            setOrderNumber(lastCreatedOrder);
            localStorage.removeItem('lastCreatedOrder'); // Clear it after use
            // Auto-track the order
            setTimeout(() => {
                handleTrackOrder(lastCreatedOrder);
            }, 500); // Small delay to show the filled input
        }
    }, [])

    const handleTrackOrder = async (orderNum = orderNumber) => {
        const searchTerm = orderNum.trim()
        if (!searchTerm) {
            setError("Please enter an order number.")
            return
        }

        setLoading(true)
        setError("")
        try {
            console.log("🔍 Searching for order:", searchTerm)
            const response = await axios.get("https://warehouse-management-backend-t3q2.onrender.com/api/activity", {
                params: { orderNumber: searchTerm },
                headers: { authorization: localStorage.getItem('token') }
            })

            console.log("📦 API Response:", response.data)
            console.log("📊 Total activities found:", response.data.length)

            // Filter and sort activities
            const orderActivities = response.data
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

            console.log("✅ Final activities to display:", orderActivities)
            
            setActivities(orderActivities)
            
            if (orderActivities.length === 0) {
                console.warn("⚠️ No activities found for order:", searchTerm)
                setError(`No order found with number: "${searchTerm}"\n\nPlease verify:\n• The order number is correct\n• You're logged in with the right account\n• The order was placed from this account`)
            }
        } catch (err) {
            console.error("❌ Error fetching order activities:", err)
            setError("Error fetching order activities. " + (err.response?.data?.message || "Please try again."))
        } finally {
            setLoading(false)
        }
    }

    const getStatusIcon = (message) => {
        const lowerMessage = message.toLowerCase()
        if (lowerMessage.includes("delivered")) return "✅"
        if (lowerMessage.includes("shipped")) return "🚚"
        if (lowerMessage.includes("packed")) return "📦"
        if (lowerMessage.includes("being processed")) return "🔄"
        if (lowerMessage.includes("was placed")) return "🛒"
        return "📋"
    }

    const getStatusStep = (message) => {
        const lowerMessage = message.toLowerCase()
        if (lowerMessage.includes("was placed")) return 1
        if (lowerMessage.includes("being processed")) return 2
        if (lowerMessage.includes("packed")) return 3
        if (lowerMessage.includes("shipped")) return 4
        if (lowerMessage.includes("delivered")) return 5
        return 0
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

        // Convert to lowercase for case-insensitive matching
        const lowerMessage = message.toLowerCase()
        
        console.log("Activity message:", message) // Debug: check what messages are coming from backend

        if (lowerMessage.includes("was placed")) {
            return `Your order was placed at ${timeString} on ${dateString}`
        } else if (lowerMessage.includes("being processed")) {
            return `Your order started processing at ${timeString} on ${dateString}`
        } else if (lowerMessage.includes("packed")) {
            return `Your order was packed and is ready for shipping at ${timeString} on ${dateString}`
        } else if (lowerMessage.includes("shipped")) {
            return `Your order was shipped and is on its way at ${timeString} on ${dateString}`
        } else if (lowerMessage.includes("delivered")) {
            return `Your order was successfully delivered at ${timeString} on ${dateString}`
        }
        
        // If no conditions match, show the original message
        return message
    }

    const groupActivitiesByDate = (activities) => {
        const grouped = {}
        activities.forEach(activity => {
            const date = new Date(activity.createdAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
            if (!grouped[date]) {
                grouped[date] = []
            }
            grouped[date].push(activity)
        })
        return grouped
    }

    const getCurrentStatus = (message) => {
        const lowerMessage = message.toLowerCase()
        if (lowerMessage.includes("delivered")) return "Delivered"
        if (lowerMessage.includes("shipped")) return "Shipped"
        if (lowerMessage.includes("packed")) return "Packed"
        if (lowerMessage.includes("being processed")) return "Processing"
        if (lowerMessage.includes("was placed")) return "Order Placed"
        return "Unknown"
    }

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
            <h2>📦 Order Tracking</h2>
            <p>Enter your order number to track your order status</p>

            <div style={{ marginBottom: "20px" }}>
                <input
                    type="text"
                    placeholder="Enter Order Number (e.g., ORD-1234567890123)"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleTrackOrder()
                        }
                    }}
                    style={{
                        padding: "10px",
                        fontSize: "16px",
                        width: "100%",
                        maxWidth: "400px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        marginRight: "10px"
                    }}
                />
                <button
                    onClick={() => handleTrackOrder()}
                    disabled={loading}
                    style={{
                        padding: "10px 20px",
                        fontSize: "16px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: loading ? "not-allowed" : "pointer"
                    }}
                >
                    {loading ? "Tracking..." : "Track Order"}
                </button>
            </div>

            {error && (
                <div style={{
                    color: "red",
                    padding: "10px",
                    border: "1px solid red",
                    borderRadius: "4px",
                    marginBottom: "20px"
                }}>
                    {error}
                </div>
            )}

            {loading && (
                <div style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#666"
                }}>
                    <p>⏳ Loading order details...</p>
                </div>
            )}

            {!loading && activities.length > 0 && (
                <div>
                    <h3>📋 Complete Order Timeline</h3>
                    
                    {/* Current Status Summary */}
                    <div style={{ 
                        marginBottom: "20px", 
                        padding: "20px", 
                        backgroundColor: "#e8f5e8", 
                        borderRadius: "12px", 
                        border: "2px solid #4caf50",
                        display: "flex",
                        alignItems: "center",
                        gap: "15px"
                    }}>
                        <span style={{ fontSize: "32px" }}>
                            {getStatusIcon(activities[0]?.message || "")}
                        </span>
                        <div>
                            <h4 style={{ margin: "0 0 5px 0", color: "#2e7d32", fontSize: "18px" }}>
                                Current Status: {getCurrentStatus(activities[0]?.message || "")}
                            </h4>
                            <p style={{ margin: "0", color: "#388e3c", fontSize: "14px" }}>
                                Last updated: {new Date(activities[0]?.createdAt).toLocaleString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                })}
                            </p>
                        </div>
                    </div>
                    
                    <div style={{ marginBottom: "20px", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "8px", border: "1px solid #e9ecef" }}>
                        <h4 style={{ margin: "0 0 20px 0", color: "#495057", fontSize: "16px", fontWeight: "600" }}>📊 Order Progress</h4>
                        
                        {/* Progress Steps */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", paddingTop: "30px", paddingBottom: "10px" }}>
                            {/* Progress Line Background */}
                            <div style={{
                                position: "absolute",
                                top: "35px",
                                left: "0",
                                right: "0",
                                height: "3px",
                                backgroundColor: "#dee2e6",
                                zIndex: 1
                            }}></div>
                            
                            {/* Active Progress Line */}
                            <div style={{
                                position: "absolute",
                                top: "35px",
                                left: "0",
                                height: "3px",
                                backgroundColor: "#28a745",
                                zIndex: 2,
                                width: `${(getStatusStep(activities[0]?.message || "") / 5) * 100}%`,
                                transition: "width 0.3s ease"
                            }}></div>
                            
                            {[
                                { step: 1, label: "Order Placed", icon: "🛒" },
                                { step: 2, label: "Processing", icon: "🔄" },
                                { step: 3, label: "Packed", icon: "📦" },
                                { step: 4, label: "Shipped", icon: "🚚" },
                                { step: 5, label: "Delivered", icon: "✅" }
                            ].map((item) => {
                                const currentStep = getStatusStep(activities[0]?.message || "")
                                const isCompleted = item.step < currentStep
                                const isCurrent = item.step === currentStep
                                
                                return (
                                    <div key={item.step} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative", zIndex: 3 }}>
                                        {isCurrent && (
                                            <div style={{
                                                fontSize: "11px",
                                                fontWeight: "700",
                                                color: "#28a745",
                                                marginBottom: "5px",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.5px",
                                                backgroundColor: "#d4edda",
                                                padding: "3px 8px",
                                                borderRadius: "12px",
                                                whiteSpace: "nowrap"
                                            }}>
                                                📍 You are here
                                            </div>
                                        )}
                                        <div style={{
                                            width: "60px",
                                            height: "60px",
                                            borderRadius: "50%",
                                            backgroundColor: isCompleted || isCurrent ? "#28a745" : "#e9ecef",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "26px",
                                            border: isCurrent ? "4px solid #fff" : "2px solid #fff",
                                            boxShadow: isCurrent ? "0 0 0 4px #28a745" : "0 2px 8px rgba(0,0,0,0.1)",
                                            transition: "all 0.3s ease"
                                        }}>
                                            {isCompleted ? "✓" : item.icon}
                                        </div>
                                        <span style={{
                                            marginTop: "12px",
                                            fontSize: "13px",
                                            fontWeight: isCurrent ? "700" : "500",
                                            color: isCompleted || isCurrent ? "#28a745" : "#6c757d",
                                            textAlign: "center",
                                            minWidth: "75px"
                                        }}>
                                            {item.label}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    
                    {Object.entries(groupActivitiesByDate(activities)).map(([date, dayActivities]) => (
                        <div key={date} style={{ marginBottom: "30px" }}>
                            <h4 style={{ 
                                margin: "0 0 15px 0", 
                                padding: "10px 15px", 
                                backgroundColor: "#e9ecef", 
                                borderRadius: "6px",
                                color: "#495057",
                                fontSize: "16px",
                                fontWeight: "600"
                            }}>
                                📅 {date}
                            </h4>
                            
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px", position: "relative" }}>
                                {/* Timeline line */}
                                <div style={{
                                    position: "absolute",
                                    left: "32px",
                                    top: "0",
                                    bottom: "0",
                                    width: "2px",
                                    backgroundColor: "#dee2e6",
                                    zIndex: 1
                                }}></div>
                                
                                {dayActivities
                                    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                                    .map((act, index) => (
                                    <div
                                        key={act._id}
                                        style={{
                                            border: "1px solid #e0e0e0",
                                            borderRadius: "12px",
                                            padding: "20px",
                                            backgroundColor: "#ffffff",
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: "20px",
                                            position: "relative",
                                            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                                            marginLeft: "20px"
                                        }}
                                    >
                                        {/* Timeline dot */}
                                        <div style={{
                                            position: "absolute",
                                            left: "-25px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            width: "14px",
                                            height: "14px",
                                            borderRadius: "50%",
                                            backgroundColor: "#007bff",
                                            border: "3px solid #ffffff",
                                            zIndex: 2
                                        }}></div>
                                        
                                        <span style={{ 
                                            fontSize: "28px", 
                                            marginTop: "2px",
                                            flexShrink: 0
                                        }}>
                                            {getStatusIcon(act.message)}
                                        </span>
                                        
                                        <div style={{ flex: 1 }}>
                                            <p style={{
                                                margin: "0 0 8px 0",
                                                fontWeight: "600",
                                                color: "#212529",
                                                fontSize: "16px",
                                                lineHeight: "1.4"
                                            }}>
                                                {formatActivityMessage(act.message, act.createdAt)}
                                            </p>
                                            
                                            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                                <small style={{
                                                    color: "#6c757d",
                                                    fontSize: "14px",
                                                    fontWeight: "500"
                                                }}>
                                                    ⏰ {new Date(act.createdAt).toLocaleTimeString('en-US', {
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                        hour12: true
                                                    })}
                                                </small>
                                                
                                                <div style={{
                                                    fontSize: "11px",
                                                    color: "#6c757d",
                                                    backgroundColor: "#f8f9fa",
                                                    padding: "3px 8px",
                                                    borderRadius: "10px",
                                                    fontWeight: "600",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.5px"
                                                }}>
                                                    Step {getStatusStep(act.message)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && activities.length === 0 && orderNumber && (
                <div style={{
                    textAlign: "center",
                    color: "#666",
                    padding: "40px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    backgroundColor: "#f9f9f9"
                }}>
                    <p style={{ fontSize: "16px", fontWeight: "600" }}>📭 No order activities found</p>
                    <p>Order Number Searched: <strong>{orderNumber}</strong></p>
                    <p>Please check your order number and try again.</p>
                    <p style={{ fontSize: "12px", color: "#999", marginTop: "10px" }}>
                        💡 Tip: Make sure you're using the order number from your order confirmation email (e.g., ORD-1234567890123)
                    </p>
                </div>
            )}
        </div>
    )
}
