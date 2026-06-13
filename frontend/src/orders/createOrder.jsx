import axios from "axios"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function CreateOrder() {
    const [products, setProducts] = useState([])
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('activeCart')
        return savedCart ? JSON.parse(savedCart) : []
    })
    const [activeCategory, setActiveCategory] = useState('All')
    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    // Save cart state to local storage when it changes
    useEffect(() => {
        localStorage.setItem('activeCart', JSON.stringify(cart))
    }, [cart])

    const categories = [
        'All',
        'Groceries',
        'Fruits',
        'Vegetables',
        'Clothes',
        'Electronics',
        'Cosmetics'
    ]

    const pageSize = 6 // Showing 6 products per page fits the split layout beautifully

    // Dynamic Backend URL detection
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const BASE_URL = isLocal 
        ? "http://localhost:4444" 
        : "https://warehouse-management-backend-t3q2.onrender.com";

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get(`${BASE_URL}/api/product`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            setProducts(response.data)
        } catch (err) {
            console.error("Error fetching products:", err)
        } finally {
            setLoading(false)
        }
    }

    const filteredProducts = useMemo(() => {
        let result = products
        if (activeCategory !== 'All') {
            result = result.filter(product => String(product.category || '').toLowerCase() === activeCategory.toLowerCase())
        }
        if (searchQuery.trim() !== "") {
            result = result.filter(product => 
                product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }
        return result
    }, [products, activeCategory, searchQuery])

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
    const visibleProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize)

    const handleCategoryClick = (category) => {
        setActiveCategory(category)
        setCurrentPage(1)
    }

    const addToCart = (product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.product._id === product._id)
            if (existingItem) {
                return prevCart.map(item => 
                    item.product._id === product._id 
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }
            return [...prevCart, { product, quantity: 1 }]
        })
    }

    const updateQuantity = (productId, amount) => {
        setCart(prevCart => {
            return prevCart.map(item => {
                if (item.product._id === productId) {
                    const newQty = item.quantity + amount
                    return newQty > 0 ? { ...item, quantity: newQty } : null
                }
                return item
            }).filter(Boolean)
        })
    }

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.product._id !== productId))
    }

    const clearCart = () => {
        setCart([])
    }

    const cartTotal = useMemo(() => {
        return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0)
    }, [cart])

    const cartItemCount = useMemo(() => {
        return cart.reduce((total, item) => total + item.quantity, 0)
    }, [cart])

    const handleCheckout = async () => {
        if (cart.length === 0) {
            alert('Your cart is empty.')
            return
        }

        const customerName = localStorage.getItem('userName') || "Customer"

        try {
            const token = localStorage.getItem('token')
            const items = cart.map(item => ({
                productId: item.product._id,
                quantity: item.quantity,
                price: item.product.price
            }))

            const response = await axios.post(`${BASE_URL}/api/orders`, { 
                customerName, 
                items 
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            const orderId = response.data._id
            clearCart()
            alert(`Order placed successfully! Redirecting to payment...`)
            navigate(`/payment/${orderId}`)
        } catch (err) {
            console.error("Error creating order:", err)
            alert("Error creating order: " + (err.response?.data?.error || err.message))
        }
    }

    const getImageUrl = (img) => {
        if (!img) return "";
        if (img.startsWith("http")) return img;
        return `${BASE_URL}/uploads/${img}`;
    }

    return (
        <div className="order-container" style={{ background: 'var(--surface-base)', border: '1px solid var(--border-glass)', borderRadius: '24px', padding: '32px' }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Shop & Create Order</h2>
                    <p className="text-slate-400 text-sm mt-1">Select items, add to cart, and checkout instantly</p>
                </div>
                
                <div className="relative w-full md:w-80">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setCurrentPage(1)
                        }}
                        style={{
                            width: "100%",
                            padding: "14px 16px 14px 48px",
                            borderRadius: "12px",
                            border: "1px solid var(--border-glass)",
                            background: "var(--surface-glass)",
                            color: "white",
                            outline: "none"
                        }}
                    />
                </div>
            </div>

            <div className="category-filters">
                {categories.map(category => (
                    <button
                        key={category}
                        type="button"
                        className={category === activeCategory ? 'category-button active' : 'category-button'}
                        onClick={() => handleCategoryClick(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Split Screen Layout */}
            <div className="flex flex-col xl:flex-row gap-8 items-start mt-6">
                
                {/* Left Side: Product Grid */}
                <div className="flex-1 w-full">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-12 h-12 border-4 border-slate-700 border-t-[#00A19B] rounded-full animate-spin"></div>
                            <p className="text-slate-400 mt-4 font-semibold">Loading products...</p>
                        </div>
                    ) : visibleProducts.length === 0 ? (
                        <div className="bg-white/5 rounded-2xl p-16 text-center border border-white/10">
                            <p className="text-slate-400 font-bold text-lg">📦 No products found matching criteria</p>
                        </div>
                    ) : (
                        <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                            {visibleProducts.map((product) => {
                                const cartItem = cart.find(item => item.product._id === product._id);
                                return (
                                    <div key={product._id} className="product-card">
                                        <div className="product-image-container" style={{ position: 'relative' }}>
                                            <img
                                                src={getImageUrl(product.image)}
                                                alt={product.name}
                                                className="product-image"
                                                onError={(e) => { 
                                                    e.target.onerror = null; 
                                                    e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'><rect width='100%' height='100%' fill='%231e293b'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%2364748b'>No Image</text></svg>"; 
                                                }}
                                            />
                                            {cartItem && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '12px',
                                                    left: '12px',
                                                    background: '#00A19B',
                                                    color: 'white',
                                                    padding: '4px 10px',
                                                    borderRadius: '8px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold',
                                                    boxShadow: '0 4px 12px rgba(0, 161, 155, 0.4)'
                                                }}>
                                                    ✓ {cartItem.quantity} in Cart
                                                </div>
                                            )}
                                        </div>
                                        <div className="product-details" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#00A19B', background: 'rgba(0,161,155,0.1)', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                                                        {product.category || 'Uncategorized'}
                                                    </span>
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                                        SKU: {product.sku}
                                                    </span>
                                                </div>
                                                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white', margin: '0 0 6px' }}>{product.name}</h3>
                                                <p className="product-price" style={{ color: 'white', fontWeight: 800, fontSize: '1.2rem', margin: '0 0 8px' }}>₹{product.price}</p>
                                                <p className="product-description" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 16px', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {product.description || 'No description available'}
                                                </p>
                                            </div>
                                            
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-glass)', paddingTop: '12px', marginTop: 'auto' }}>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stock: {product.quantity || 0}</span>
                                                {cartItem ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '3px', border: '1px solid var(--border-glass)' }}>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => updateQuantity(product._id, -1)}
                                                            style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                        >-</button>
                                                        <span style={{ width: '32px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 'bold', color: 'white' }}>{cartItem.quantity}</span>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => updateQuantity(product._id, 1)}
                                                            style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                        >+</button>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        type="button" 
                                                        onClick={() => addToCart(product)}
                                                        style={{ padding: '8px 16px', background: '#00A19B', color: 'white', borderRadius: '10px', fontWeight: 'bold', border: 'none', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                    >
                                                        <span>🛒</span> Add to Cart
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-glass)', border: '1px solid var(--border-glass)', padding: '16px', borderRadius: '16px', marginTop: '24px' }}>
                            <button
                                type="button"
                                style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-glass)', color: 'white', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            >
                                ← Previous
                            </button>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '0.85rem' }}>Page {currentPage} of {totalPages}</span>
                            <button
                                type="button"
                                style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-glass)', color: 'white', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Side: Interactive Shopping Cart */}
                <div style={{
                    width: '100%',
                    maxWidth: '400px',
                    alignSelf: 'stretch',
                    background: 'var(--surface-glass)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '24px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '650px',
                    position: 'sticky',
                    top: '24px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-glass)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.2rem' }}>🛒</span>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', margin: 0 }}>Shopping Cart</h3>
                        </div>
                        {cart.length > 0 && (
                            <button 
                                onClick={clearCart} 
                                style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', cursor: 'pointer' }}
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    {/* Cart Items List */}
                    <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {cart.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '220px', textAlign: 'center' }}>
                                <span style={{ fontSize: '2.5rem', opacity: 0.3, marginBottom: '12px' }}>🛒</span>
                                <h4 style={{ color: 'white', margin: '0 0 4px', fontWeight: 'bold' }}>Your cart is empty</h4>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, maxWidth: '200px' }}>Add products from the catalog to place an order.</p>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div key={item.product._id} style={{ display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.02)' }}>
                                    <img 
                                        src={getImageUrl(item.product.image)} 
                                        alt={item.product.name} 
                                        style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border-glass)' }}
                                        onError={(e) => { 
                                            e.target.onerror = null; 
                                            e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100%' height='100%' fill='%231e293b'/></svg>"; 
                                        }}
                                    />
                                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                                            <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'white', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                                {item.product.name}
                                            </h4>
                                            <button 
                                                onClick={() => removeFromCart(item.product._id)}
                                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer', padding: 0 }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '2px', border: '1px solid var(--border-glass)' }}>
                                                <button 
                                                    onClick={() => updateQuantity(item.product._id, -1)}
                                                    style={{ width: '20px', height: '20px', background: 'none', border: 'none', color: 'white', fontSize: '0.75rem', cursor: 'pointer' }}
                                                >-</button>
                                                <span style={{ width: '24px', textAlign: 'center', fontSize: '0.75rem', color: 'white', fontWeight: 'bold' }}>{item.quantity}</span>
                                                <button 
                                                    onClick={() => updateQuantity(item.product._id, 1)}
                                                    style={{ width: '20px', height: '20px', background: 'none', border: 'none', color: 'white', fontSize: '0.75rem', cursor: 'pointer' }}
                                                >+</button>
                                            </div>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'white' }}>₹{item.product.price * item.quantity}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Summary Footer */}
                    {cart.length > 0 && (
                        <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    <span>Items Count</span>
                                    <span>{cartItemCount}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 'bold', color: 'white' }}>
                                    <span>Total Price</span>
                                    <span style={{ color: '#00A19B', fontSize: '1.2rem', fontWeight: 800 }}>₹{cartTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleCheckout}
                                style={{
                                    width: '100%',
                                    padding: '14px 20px',
                                    background: 'linear-gradient(135deg, #00A19B 0%, #04715e 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '16px',
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxShadow: '0 8px 20px rgba(0, 161, 155, 0.25)',
                                    transition: 'transform 0.2s'
                                }}
                            >
                                💳 Place Order & Pay (₹{cartTotal.toLocaleString()})
                            </button>
                            
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', margin: '12px 0 0' }}>
                                🔐 Secured Checkout Protocol
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
