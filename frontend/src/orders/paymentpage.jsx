import axios from "axios"
import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

export default function PaymentPage(){
    const { id } = useParams()
    const navigate = useNavigate()
    const [order, setOrder] = useState(null)
    const [paymentMethod, setPaymentMethod] = useState("card")
    const [processing, setProcessing] = useState(false)
    const [success, setSuccess] = useState(false)

    // Card form fields (for UI only — test mode)
    const [cardNumber, setCardNumber] = useState("")
    const [cardExpiry, setCardExpiry] = useState("")
    const [cardCvv, setCardCvv] = useState("")
    const [cardName, setCardName] = useState("")
    const [upiId, setUpiId] = useState("")

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`https://warehouse-management-backend-t3q2.onrender.com/api/user-orders`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                const foundOrder = response.data.find(o => o._id === id)
                setOrder(foundOrder)
            } catch (err) {
                console.error(err)
            }
        }
        fetchOrder()
    }, [id])

    const formatCardNumber = (value) => {
        const digits = value.replace(/\D/g, "").slice(0, 16)
        return digits.replace(/(.{4})/g, "$1 ").trim()
    }

    const formatExpiry = (value) => {
        const digits = value.replace(/\D/g, "").slice(0, 4)
        if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2)
        return digits
    }

    const handlePayment = async () => {
        setProcessing(true)

        // Simulate a 2-second processing delay
        await new Promise(resolve => setTimeout(resolve, 2000))

        try {
            const token = localStorage.getItem('token');
            await axios.put(`https://warehouse-management-backend-t3q2.onrender.com/api/orders/${id}`, {
                status: "paid"
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            setProcessing(false)
            setSuccess(true)

            // Redirect after showing success
            setTimeout(() => {
                navigate("/dashboard")
            }, 2500)
        } catch (err) {
            console.error(err)
            setProcessing(false)
            alert("Error processing payment. Please try again.")
        }
    }

    if (!order) return (
        <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={{ color: "#64748b", marginTop: 16 }}>Loading order details...</p>
        </div>
    )

    // Success screen
    if (success) return (
        <div style={styles.pageContainer}>
            <div style={{ ...styles.card, textAlign: "center", padding: "60px 40px" }}>
                <div style={styles.successIcon}>✓</div>
                <h2 style={{ margin: "20px 0 8px", color: "#0f172a", fontSize: "1.8rem" }}>Payment Successful!</h2>
                <p style={{ color: "#64748b", margin: "0 0 8px" }}>Order <strong>{order.orderNumber}</strong> has been paid</p>
                <p style={{ color: "#10b981", fontWeight: 700, fontSize: "1.5rem" }}>₹{order.totalAmount}</p>
                <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: 16 }}>Redirecting to dashboard...</p>
            </div>
        </div>
    )

    return (
        <div style={styles.pageContainer}>
            <div style={styles.mainGrid}>

                {/* Left — Payment Form */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <div style={styles.secureBadge}>🔒 Secure Payment</div>
                        <h2 style={styles.cardTitle}>Choose Payment Method</h2>
                    </div>

                    {/* Payment method tabs */}
                    <div style={styles.tabs}>
                        {[
                            { key: "card", icon: "💳", label: "Card" },
                            { key: "upi", icon: "📱", label: "UPI" },
                            { key: "netbanking", icon: "🏦", label: "Net Banking" },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                style={{
                                    ...styles.tab,
                                    ...(paymentMethod === tab.key ? styles.tabActive : {})
                                }}
                                onClick={() => setPaymentMethod(tab.key)}
                            >
                                <span style={{ fontSize: "1.2rem" }}>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Card Form */}
                    {paymentMethod === "card" && (
                        <div style={styles.formSection}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Card Number</label>
                                <input
                                    style={styles.input}
                                    placeholder="1234 5678 9012 3456"
                                    value={cardNumber}
                                    onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                                    maxLength={19}
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Cardholder Name</label>
                                <input
                                    style={styles.input}
                                    placeholder="Enter name on card"
                                    value={cardName}
                                    onChange={e => setCardName(e.target.value)}
                                />
                            </div>
                            <div style={styles.row}>
                                <div style={{ ...styles.inputGroup, flex: 1 }}>
                                    <label style={styles.label}>Expiry</label>
                                    <input
                                        style={styles.input}
                                        placeholder="MM/YY"
                                        value={cardExpiry}
                                        onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                                        maxLength={5}
                                    />
                                </div>
                                <div style={{ ...styles.inputGroup, flex: 1 }}>
                                    <label style={styles.label}>CVV</label>
                                    <input
                                        style={styles.input}
                                        placeholder="•••"
                                        type="password"
                                        value={cardCvv}
                                        onChange={e => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                                        maxLength={3}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* UPI Form */}
                    {paymentMethod === "upi" && (
                        <div style={styles.formSection}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>UPI ID</label>
                                <input
                                    style={styles.input}
                                    placeholder="yourname@upi"
                                    value={upiId}
                                    onChange={e => setUpiId(e.target.value)}
                                />
                            </div>
                            <div style={styles.upiApps}>
                                {["Google Pay", "PhonePe", "Paytm", "BHIM"].map(app => (
                                    <div key={app} style={styles.upiChip}>{app}</div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Net Banking */}
                    {paymentMethod === "netbanking" && (
                        <div style={styles.formSection}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Select Bank</label>
                                <select style={styles.input}>
                                    <option value="">-- Choose your bank --</option>
                                    <option>State Bank of India</option>
                                    <option>HDFC Bank</option>
                                    <option>ICICI Bank</option>
                                    <option>Axis Bank</option>
                                    <option>Kotak Mahindra Bank</option>
                                    <option>Punjab National Bank</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Pay Button */}
                    <button
                        style={{
                            ...styles.payButton,
                            opacity: processing ? 0.7 : 1,
                            cursor: processing ? "not-allowed" : "pointer"
                        }}
                        onClick={handlePayment}
                        disabled={processing}
                    >
                        {processing ? (
                            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={styles.btnSpinner}></span> Processing...
                            </span>
                        ) : (
                            `Pay ₹${order.totalAmount}`
                        )}
                    </button>

                    <p style={styles.testNotice}>
                        ⚠️ Test Mode — No real money will be charged
                    </p>
                </div>

                {/* Right — Order Summary */}
                <div style={styles.summaryCard}>
                    <h3 style={styles.summaryTitle}>Order Summary</h3>

                    <div style={styles.orderIdRow}>
                        <span style={{ color: "#64748b" }}>Order ID</span>
                        <span style={{ fontWeight: 600, color: "#0f172a" }}>{order.orderNumber}</span>
                    </div>

                    <div style={styles.divider}></div>

                    <div style={styles.itemsList}>
                        {order.items && order.items.map((item, i) => (
                            <div key={i} style={styles.itemRow}>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 600, color: "#0f172a" }}>
                                        {item.productId?.name || "Product"}
                                    </p>
                                    <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "#94a3b8" }}>
                                        Qty: {item.quantity}
                                    </p>
                                </div>
                                <span style={{ fontWeight: 600, color: "#0f172a" }}>
                                    ₹{item.price * item.quantity}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div style={styles.divider}></div>

                    <div style={styles.totalRow}>
                        <span>Total</span>
                        <span style={{ fontSize: "1.5rem", color: "#00A19B" }}>₹{order.totalAmount}</span>
                    </div>

                    <div style={styles.securityRow}>
                        <span>🔐</span>
                        <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                            256-bit SSL Encrypted Payment
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

const styles = {
    pageContainer: {
        minHeight: "80vh",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "40px 20px",
    },
    loadingContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
    },
    spinner: {
        width: 40,
        height: 40,
        border: "4px solid #e2e8f0",
        borderTopColor: "#00A19B",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
    },
    mainGrid: {
        display: "grid",
        gridTemplateColumns: "1.2fr 0.8fr",
        gap: 32,
        maxWidth: 900,
        width: "100%",
    },
    card: {
        background: "#ffffff",
        borderRadius: 20,
        border: "1px solid #e2e8f0",
        padding: 32,
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    },
    cardHeader: {
        marginBottom: 24,
    },
    secureBadge: {
        display: "inline-block",
        background: "#f0fdf4",
        color: "#16a34a",
        padding: "4px 12px",
        borderRadius: 20,
        fontSize: "0.8rem",
        fontWeight: 600,
        marginBottom: 12,
    },
    cardTitle: {
        margin: 0,
        fontSize: "1.4rem",
        color: "#0f172a",
        fontWeight: 700,
    },
    tabs: {
        display: "flex",
        gap: 10,
        marginBottom: 28,
    },
    tab: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "12px 16px",
        borderRadius: 12,
        border: "2px solid #e2e8f0",
        background: "#f8fafc",
        color: "#64748b",
        fontWeight: 600,
        fontSize: "0.9rem",
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    tabActive: {
        borderColor: "#00A19B",
        background: "#f0fdfa",
        color: "#00A19B",
    },
    formSection: {
        display: "flex",
        flexDirection: "column",
        gap: 16,
    },
    inputGroup: {
        display: "flex",
        flexDirection: "column",
        gap: 6,
    },
    label: {
        fontSize: "0.85rem",
        fontWeight: 600,
        color: "#475569",
    },
    input: {
        padding: "12px 16px",
        borderRadius: 12,
        border: "1.5px solid #e2e8f0",
        fontSize: "1rem",
        color: "#0f172a",
        background: "#f8fafc",
        outline: "none",
        transition: "border-color 0.2s ease",
        width: "100%",
        boxSizing: "border-box",
    },
    row: {
        display: "flex",
        gap: 16,
    },
    upiApps: {
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
    },
    upiChip: {
        padding: "8px 16px",
        background: "#f1f5f9",
        border: "1px solid #e2e8f0",
        borderRadius: 20,
        fontSize: "0.85rem",
        color: "#475569",
        cursor: "pointer",
        fontWeight: 500,
    },
    payButton: {
        width: "100%",
        padding: "16px 24px",
        marginTop: 28,
        borderRadius: 14,
        border: "none",
        background: "linear-gradient(135deg, #00A19B 0%, #04715e 100%)",
        color: "#ffffff",
        fontSize: "1.1rem",
        fontWeight: 700,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        boxShadow: "0 4px 16px rgba(0, 161, 155, 0.3)",
    },
    btnSpinner: {
        display: "inline-block",
        width: 18,
        height: 18,
        border: "3px solid rgba(255,255,255,0.3)",
        borderTopColor: "#fff",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
    },
    testNotice: {
        textAlign: "center",
        color: "#f59e0b",
        fontSize: "0.8rem",
        marginTop: 16,
        fontWeight: 600,
    },
    summaryCard: {
        background: "#ffffff",
        borderRadius: 20,
        border: "1px solid #e2e8f0",
        padding: 28,
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        alignSelf: "flex-start",
        position: "sticky",
        top: 100,
    },
    summaryTitle: {
        margin: "0 0 20px",
        fontSize: "1.2rem",
        fontWeight: 700,
        color: "#0f172a",
    },
    orderIdRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 0",
    },
    divider: {
        height: 1,
        background: "#e2e8f0",
        margin: "16px 0",
    },
    itemsList: {
        display: "flex",
        flexDirection: "column",
        gap: 14,
    },
    itemRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    totalRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontWeight: 700,
        fontSize: "1.1rem",
        color: "#0f172a",
        padding: "8px 0",
    },
    securityRow: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginTop: 20,
        padding: "10px 14px",
        background: "#f8fafc",
        borderRadius: 10,
        justifyContent: "center",
    },
    successIcon: {
        width: 80,
        height: 80,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #10b981, #059669)",
        color: "#fff",
        fontSize: "2.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto",
        boxShadow: "0 8px 24px rgba(16, 185, 129, 0.35)",
    },
}
