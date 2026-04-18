import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import axios from "axios"

export default function Search() {
    const [searchParams] = useSearchParams()
    const query = searchParams.get("q") || ""
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true)
    const [products, setProducts] = useState([])
    const [orders, setOrders] = useState([])
    const [suppliers, setSuppliers] = useState([])

    useEffect(() => {
        if (query) {
            performSearch()
        } else {
            setLoading(false)
        }
    }, [query])

    const performSearch = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem("token")
            const headers = { Authorization: `Bearer ${token}` }
            const qLower = query.toLowerCase()

            // Fetch all and filter client side for simplicity, ideally backend gives search APIs
            const [prodRes, orderRes, supRes] = await Promise.all([
                axios.get("https://warehouse-management-backend-t3q2.onrender.com/api/product", { headers }).catch(() => ({ data: [] })),
                axios.get("https://warehouse-management-backend-t3q2.onrender.com/api/orders", { headers }).catch(() => ({ data: [] })),
                axios.get("https://warehouse-management-backend-t3q2.onrender.com/api/suppliers", { headers }).catch(() => ({ data: [] })),
            ])

            setProducts(prodRes.data.filter(p => 
                p.name?.toLowerCase().includes(qLower) || 
                p.sku?.toLowerCase().includes(qLower) || 
                p.category?.toLowerCase().includes(qLower)
            ))

            setOrders(orderRes.data.filter(o => 
                o._id?.toLowerCase().includes(qLower) || 
                o.customerName?.toLowerCase().includes(qLower) || 
                o.status?.toLowerCase().includes(qLower)
            ))

            setSuppliers(supRes.data.filter(s => 
                s.name?.toLowerCase().includes(qLower) || 
                s.email?.toLowerCase().includes(qLower) || 
                s.company?.toLowerCase().includes(qLower)
            ))

        } catch (err) {
            console.error("Search error:", err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 text-slate-500">
                <p>Searching for "{query}"...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 lg:p-8">
            <header className="glass-card rounded-[28px] p-6">
                <h1 className="text-3xl font-extrabold text-white">Search Results</h1>
                <p className="mt-2 text-slate-400">
                    {query ? `Showing results for "${query}"` : "Please enter a search query."}
                </p>
            </header>

            {!query && <div className="text-center text-slate-500 py-10">Enter a query in the top bar to search.</div>}

            {query && products.length === 0 && orders.length === 0 && suppliers.length === 0 && (
                <div className="glass-card rounded-[28px] p-10 text-center">
                    <div className="text-4xl mb-4">🔍</div>
                    <h2 className="text-xl font-bold text-white mb-2">No results found</h2>
                    <p className="text-slate-400">Try adjusting your search or typo.</p>
                </div>
            )}

            {/* Products */}
            {products.length > 0 && (
                <div className="glass-card rounded-[28px] p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">📦 Products ({products.length})</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {products.map(p => (
                            <div key={p._id} className="p-4 bg-slate-900/50 rounded-xl border border-white/5 hover:bg-slate-800 transition cursor-pointer" onClick={() => navigate('/product')}>
                                <h3 className="font-bold text-white">{p.name}</h3>
                                <p className="text-sm text-slate-400">SKU: {p.sku} | ₹{p.price}</p>
                                <span className="inline-block mt-2 text-xs bg-brand-500/20 text-brand-300 px-2 py-1 rounded">{p.category}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Orders */}
            {orders.length > 0 && (
                <div className="glass-card rounded-[28px] p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">🧾 Orders ({orders.length})</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {orders.map(o => (
                            <div key={o._id} className="p-4 bg-slate-900/50 rounded-xl border border-white/5 hover:bg-slate-800 transition cursor-pointer" onClick={() => navigate('/orders')}>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-white truncate max-w-[150px]">{o.customerName}</h3>
                                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">{o.status}</span>
                                </div>
                                <p className="text-sm text-slate-400 font-mono">ID: {o._id}</p>
                                <p className="text-sm text-slate-400 mt-1">₹{o.totalAmount} • {o.items?.length || 0} items</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Suppliers */}
            {suppliers.length > 0 && (
                <div className="glass-card rounded-[28px] p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">🏢 Suppliers ({suppliers.length})</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {suppliers.map(s => (
                            <div key={s._id} className="p-4 bg-slate-900/50 rounded-xl border border-white/5 hover:bg-slate-800 transition cursor-pointer" onClick={() => navigate('/suppliers')}>
                                <h3 className="font-bold text-white">{s.name}</h3>
                                <p className="text-sm text-slate-400">{s.company}</p>
                                <p className="text-sm text-slate-500 mt-2">📧 {s.email || 'N/A'} | 📞 {s.phone || 'N/A'}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
