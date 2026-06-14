import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

export default function Queries() {
    const userRole = localStorage.getItem("role") || "user";
    const userName = localStorage.getItem("userName") || "User";
    const [threads, setThreads] = useState([]);
    const [selectedThread, setSelectedThread] = useState(null);
    const [userOrders, setUserOrders] = useState([]);
    
    // Form states
    const [newQueryOrderId, setNewQueryOrderId] = useState("");
    const [newQuerySubject, setNewQuerySubject] = useState("");
    const [newQueryMessage, setNewQueryMessage] = useState("");
    const [replyText, setReplyText] = useState("");
    const [statusFilter, setStatusFilter] = useState("All"); // All, Open, Resolved
    
    // Status states
    const [loading, setLoading] = useState(false);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [showNewQueryForm, setShowNewQueryForm] = useState(false);
    const [error, setError] = useState("");

    const chatEndRef = useRef(null);
    const navigate = useNavigate();
    const routerLocation = useLocation();

    // Dynamic Backend URL
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const BASE_URL = isLocal 
        ? "http://localhost:4444" 
        : "https://warehouse-management-backend-t3q2.onrender.com";

    useEffect(() => {
        fetchThreads();
        if (userRole === "user") {
            fetchUserOrders();
        }
    }, []);

    // Check if redirecting from dashboard with a pre-selected order
    useEffect(() => {
        if (routerLocation.state?.orderId && userOrders.length > 0) {
            const ordId = routerLocation.state.orderId;
            const ordNum = routerLocation.state.orderNumber;
            
            // Check if there is already a thread for this order
            const existing = threads.find(t => t.orderId?._id === ordId || t.orderId === ordId);
            if (existing) {
                setSelectedThread(existing);
                setShowNewQueryForm(false);
            } else {
                setNewQueryOrderId(ordId);
                setNewQuerySubject(`Inquiry regarding Order #${ordNum}`);
                setShowNewQueryForm(true);
            }
            // Clear location state after processing
            window.history.replaceState({}, document.title);
        }
    }, [routerLocation.state, userOrders, threads]);

    // Scroll to bottom of chat when messages change
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [selectedThread?.messages]);

    const fetchThreads = async () => {
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("token");
            const endpoint = userRole === "user" ? `${BASE_URL}/api/user-queries` : `${BASE_URL}/api/queries`;
            const response = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setThreads(response.data);
            
            // If a thread was previously selected, update it with fresh data
            if (selectedThread) {
                const updated = response.data.find(t => t._id === selectedThread._id);
                if (updated) setSelectedThread(updated);
            }
        } catch (err) {
            console.error("Error fetching query threads:", err);
            setError("Failed to load support query threads.");
        } finally {
            setLoading(false);
        }
    };

    const fetchUserOrders = async () => {
        setOrdersLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${BASE_URL}/api/user-orders`, {
                headers: { Authorization: token }
            });
            setUserOrders(response.data);
        } catch (err) {
            console.error("Error fetching user orders:", err);
        } finally {
            setOrdersLoading(false);
        }
    };

    const handleCreateQuery = async (e) => {
        e.preventDefault();
        if (!newQueryOrderId || !newQuerySubject.trim() || !newQueryMessage.trim()) {
            alert("Please fill in all fields to submit a query.");
            return;
        }

        setSending(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(`${BASE_URL}/api/queries`, {
                orderId: newQueryOrderId,
                subject: newQuerySubject,
                messageText: newQueryMessage
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Reset form
            setNewQueryOrderId("");
            setNewQuerySubject("");
            setNewQueryMessage("");
            setShowNewQueryForm(false);
            
            // Refresh list and select the new thread
            await fetchThreads();
            setSelectedThread(response.data);
            alert("Support query submitted successfully!");
        } catch (err) {
            console.error("Error submitting query:", err);
            alert("Failed to submit query: " + (err.response?.data?.error || err.message));
        } finally {
            setSending(false);
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedThread) return;

        setSending(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(`${BASE_URL}/api/queries/${selectedThread._id}/messages`, {
                messageText: replyText
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setReplyText("");
            setSelectedThread(response.data);
            
            // Update thread list with new message
            setThreads(prev => prev.map(t => t._id === response.data._id ? response.data : t));
        } catch (err) {
            console.error("Error sending reply:", err);
            alert("Failed to send message: " + (err.response?.data?.error || err.message));
        } finally {
            setSending(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!selectedThread) return;
        const newStatus = selectedThread.status === "Open" ? "Resolved" : "Open";
        
        try {
            const token = localStorage.getItem("token");
            const response = await axios.put(`${BASE_URL}/api/queries/${selectedThread._id}/status`, {
                status: newStatus
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSelectedThread(response.data);
            setThreads(prev => prev.map(t => t._id === response.data._id ? response.data : t));
        } catch (err) {
            console.error("Error updating ticket status:", err);
            alert("Failed to update status: " + (err.response?.data?.error || err.message));
        }
    };

    const filteredThreads = threads.filter(t => {
        if (statusFilter === "All") return true;
        return t.status === statusFilter;
    });

    return (
        <div className="order-container" style={{ background: 'var(--surface-base)', border: '1px solid var(--border-glass)', borderRadius: '24px', padding: '32px', minHeight: '80vh', color: 'white' }}>
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">💬 Order Support & Queries</h2>
                    <p className="text-slate-400 text-sm mt-1">
                        {userRole === "user" 
                            ? "Communicate directly with Admin and Staff regarding your orders" 
                            : "Resolve queries and answer customer support questions"}
                    </p>
                </div>

                {userRole === "user" && !showNewQueryForm && (
                    <button
                        onClick={() => setShowNewQueryForm(true)}
                        style={{
                            padding: '12px 20px',
                            background: 'linear-gradient(135deg, #00A19B 0%, #04715e 100%)',
                            color: 'white',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0, 161, 155, 0.3)'
                        }}
                    >
                        + New Query
                    </button>
                )}
            </header>

            {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontSize: '0.9rem' }}>
                    {error}
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8 items-stretch" style={{ height: '620px' }}>
                {/* Left Panel: Query Threads List */}
                <div style={{
                    width: '100%',
                    maxWidth: '350px',
                    background: 'var(--surface-glass)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '20px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                }}>
                    <div className="mb-4">
                        <h3 className="text-base font-bold mb-2">Inquiries</h3>
                        {/* Filters for Admin/Staff */}
                        {userRole !== "user" && (
                            <div className="flex gap-2 bg-white/5 p-1 rounded-lg border border-white/5">
                                {["All", "Open", "Resolved"].map(filter => (
                                    <button
                                        key={filter}
                                        onClick={() => setStatusFilter(filter)}
                                        style={{
                                            flex: 1,
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            background: statusFilter === filter ? '#00A19B' : 'transparent',
                                            color: 'white',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }} className="scrollbar-thin">
                        {loading && threads.length === 0 ? (
                            <p className="text-center text-slate-400 text-xs py-8">Loading threads...</p>
                        ) : filteredThreads.length === 0 ? (
                            <div className="text-center py-12">
                                <span style={{ fontSize: '2rem', opacity: 0.3 }}>💬</span>
                                <p className="text-slate-400 text-xs mt-2">No query threads found</p>
                            </div>
                        ) : (
                            filteredThreads.map(thread => (
                                <div
                                    key={thread._id}
                                    onClick={() => {
                                        setSelectedThread(thread);
                                        setShowNewQueryForm(false);
                                    }}
                                    style={{
                                        padding: '14px',
                                        borderRadius: '12px',
                                        background: selectedThread?._id === thread._id ? 'rgba(0, 161, 155, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                        border: `1.5px solid ${selectedThread?._id === thread._id ? '#00A19B' : 'transparent'}`,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    className="hover:bg-white/5"
                                >
                                    <div className="flex justify-between items-start mb-1.5">
                                        <span style={{
                                            fontSize: '0.65rem',
                                            background: thread.status === "Open" ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                            color: thread.status === "Open" ? '#fbbf24' : '#34d399',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase'
                                        }}>
                                            {thread.status}
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                            {new Date(thread.updatedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-bold text-white truncate">{thread.subject}</h4>
                                    {userRole !== "user" && thread.userId && (
                                        <p className="text-[10px] text-[#00A19B] font-semibold mt-1">
                                            👤 {thread.userId.username || "Customer"}
                                        </p>
                                    )}
                                    <p className="text-xs text-slate-400 truncate mt-1">
                                        {thread.messages?.[thread.messages.length - 1]?.messageText}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Panel: Chat Thread or New Query Form */}
                <div style={{
                    flex: 1,
                    background: 'var(--surface-glass)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    overflow: 'hidden'
                }}>
                    {showNewQueryForm ? (
                        /* NEW QUERY FORM */
                        <form onSubmit={handleCreateQuery} style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflowY: 'auto' }}>
                            <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                <h3 className="text-lg font-bold text-white">Create New Inquiry</h3>
                                <button type="button" onClick={() => setShowNewQueryForm(false)} className="text-xs text-slate-400 hover:text-white">Cancel</button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label className="text-xs font-semibold text-slate-300">Select Order</label>
                                {ordersLoading ? (
                                    <p className="text-xs text-slate-400">Loading orders...</p>
                                ) : userOrders.length === 0 ? (
                                    <p className="text-xs text-red-400">You don't have any placed orders yet.</p>
                                ) : (
                                    <select
                                        value={newQueryOrderId}
                                        onChange={e => {
                                            setNewQueryOrderId(e.target.value);
                                            const selected = userOrders.find(o => o._id === e.target.value);
                                            if (selected) {
                                                setNewQuerySubject(`Inquiry regarding Order #${selected.orderNumber}`);
                                            }
                                        }}
                                        required
                                        style={{
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border-glass)',
                                            background: 'rgba(0,0,0,0.2)',
                                            color: 'white',
                                            outline: 'none'
                                        }}
                                    >
                                        <option value="" style={{ background: '#0a0b1a' }}>-- Choose Order --</option>
                                        {userOrders.map(o => (
                                            <option key={o._id} value={o._id} style={{ background: '#0a0b1a' }}>
                                                Order #{o.orderNumber} - ₹{o.totalAmount} ({o.status})
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label className="text-xs font-semibold text-slate-300">Subject</label>
                                <input
                                    type="text"
                                    placeholder="Enter query subject..."
                                    value={newQuerySubject}
                                    onChange={e => setNewQuerySubject(e.target.value)}
                                    required
                                    style={{
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-glass)',
                                        background: 'rgba(0,0,0,0.2)',
                                        color: 'white',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                                <label className="text-xs font-semibold text-slate-300">Your Query / Message</label>
                                <textarea
                                    placeholder="Explain your query in detail..."
                                    value={newQueryMessage}
                                    onChange={e => setNewQueryMessage(e.target.value)}
                                    required
                                    style={{
                                        flex: 1,
                                        minHeight: '120px',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-glass)',
                                        background: 'rgba(0,0,0,0.2)',
                                        color: 'white',
                                        outline: 'none',
                                        resize: 'none'
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={sending || !newQueryOrderId}
                                style={{
                                    padding: '14px',
                                    background: 'linear-gradient(135deg, #00A19B 0%, #04715e 100%)',
                                    color: 'white',
                                    borderRadius: '12px',
                                    fontWeight: 'bold',
                                    border: 'none',
                                    cursor: (sending || !newQueryOrderId) ? 'not-allowed' : 'pointer',
                                    opacity: (sending || !newQueryOrderId) ? 0.6 : 1
                                }}
                            >
                                {sending ? "Submitting Inquiry..." : "Submit Inquiry"}
                            </button>
                        </form>
                    ) : selectedThread ? (
                        /* CHAT CONVERSATION VIEW */
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            {/* Thread Header */}
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ minWidth: 0 }}>
                                    <h3 className="text-base font-bold truncate">{selectedThread.subject}</h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {selectedThread.orderId ? `Order #${selectedThread.orderId.orderNumber || "Ref"}` : "General Support"}
                                        {userRole !== "user" && selectedThread.userId && ` | Customer: ${selectedThread.userId.username || "Unknown"}`}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span style={{
                                        fontSize: '0.7rem',
                                        background: selectedThread.status === "Open" ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                        color: selectedThread.status === "Open" ? '#fbbf24' : '#34d399',
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        fontWeight: 'bold'
                                    }}>
                                        {selectedThread.status}
                                    </span>
                                    {userRole !== "user" && (
                                        <button
                                            onClick={handleToggleStatus}
                                            style={{
                                                padding: '6px 12px',
                                                background: selectedThread.status === "Open" ? '#10b981' : '#f59e0b',
                                                color: 'white',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                border: 'none'
                                            }}
                                        >
                                            {selectedThread.status === "Open" ? "Resolve" : "Reopen"}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }} className="scrollbar-thin">
                                {selectedThread.messages && selectedThread.messages.map((msg, index) => {
                                    const isMe = msg.senderName === userName || 
                                                 (userRole !== "user" && msg.senderName !== selectedThread.userId?.username && msg.senderName !== "Customer");
                                    return (
                                        <div
                                            key={index}
                                            style={{
                                                alignSelf: isMe ? 'flex-end' : 'flex-start',
                                                maxWidth: '75%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: isMe ? 'flex-end' : 'flex-start'
                                            }}
                                        >
                                            <span style={{ fontSize: '0.7rem', color: isMe ? '#00A19B' : '#a3a6c1', fontWeight: 'bold', marginBottom: '4px' }}>
                                                {msg.senderName}
                                            </span>
                                            <div style={{
                                                padding: '12px 16px',
                                                borderRadius: '16px',
                                                borderTopRightRadius: isMe ? '2px' : '16px',
                                                borderTopLeftRadius: isMe ? '16px' : '2px',
                                                background: isMe ? 'linear-gradient(135deg, #00A19B 0%, #04715e 100%)' : 'rgba(255, 255, 255, 0.06)',
                                                border: `1px solid ${isMe ? 'transparent' : 'var(--border-glass)'}`,
                                                color: 'white',
                                                fontSize: '0.85rem',
                                                lineHeight: '1.4',
                                                wordBreak: 'break-word',
                                                boxShadow: isMe ? '0 4px 12px rgba(0, 161, 155, 0.15)' : 'none'
                                            }}>
                                                {msg.messageText}
                                            </div>
                                            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    );
                                })}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Reply Input Box */}
                            <form onSubmit={handleSendReply} style={{ padding: '16px 20px', borderTop: '1px solid var(--border-glass)', display: 'flex', gap: '12px', background: 'rgba(0,0,0,0.15)' }}>
                                <input
                                    type="text"
                                    placeholder={selectedThread.status === "Resolved" ? "This ticket is resolved. Type to reopen..." : "Type your message..."}
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    disabled={sending}
                                    style={{
                                        flex: 1,
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        border: '1px solid var(--border-glass)',
                                        background: 'rgba(0,0,0,0.2)',
                                        color: 'white',
                                        outline: 'none',
                                        fontSize: '0.85rem'
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={sending || !replyText.trim()}
                                    style={{
                                        padding: '12px 24px',
                                        background: '#00A19B',
                                        color: 'white',
                                        borderRadius: '10px',
                                        fontWeight: 'bold',
                                        border: 'none',
                                        cursor: (sending || !replyText.trim()) ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    {sending ? "Sending..." : "Send"}
                                </button>
                            </form>
                        </div>
                    ) : (
                        /* NO THREAD SELECTED STATE */
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: '40px' }}>
                            <span style={{ fontSize: '3.5rem', opacity: 0.2, marginBottom: '16px' }}>💬</span>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white', margin: 0 }}>Select an Inquiry</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px', maxWidth: '300px' }}>
                                Choose a support ticket from the list, or create a new inquiry regarding your orders.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
