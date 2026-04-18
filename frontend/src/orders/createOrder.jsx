import axios from "axios"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
export default function CreateOrder(){
    const [customerName, setCustomerName] = useState("")
    const [products, setProducts] = useState([])
    const [quantities, setQuantities] = useState({})
    const [activeCategory, setActiveCategory] = useState('All')
    const [currentPage, setCurrentPage] = useState(1)
    const navigate = useNavigate()

    const categories = [
        'All',
        'Groceries',
        'Fruits',
        'Vegetables',
        'Clothes',
        'Electronics',
        'Cosmetics'
    ]

    const pageSize = 9

    useEffect(()=>{
        fetchProducts()
    },[])

    const fetchProducts=async()=>{
        try{
            const token = localStorage.getItem('token');
            const response = await axios.get("https://warehouse-management-backend-t3q2.onrender.com/api/product", {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            setProducts(response.data)
        }catch(err){
            console.error(err)
        }
    }

    const filteredProducts = useMemo(() => {
        if (activeCategory === 'All') return products
        return products.filter(product => String(product.category || '').toLowerCase() === activeCategory.toLowerCase())
    }, [products, activeCategory])

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
    const visibleProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize)

    const handleCategoryClick = (category) => {
        setActiveCategory(category)
        setCurrentPage(1)
    }

    const handleQuantityChange = (productId, value) => {
        setQuantities(prev => ({
            ...prev,
            [productId]: value
        }))
    }

    const handleOrder = async (product) => {
        if (!customerName.trim()) {
            alert('Please enter customer name before placing an order.')
            return
        }

        const quantity = parseInt(quantities[product._id] || '1', 10)
        if (!quantity || quantity < 1) {
            alert('Please enter a valid quantity.')
            return
        }

        try {
            const token = localStorage.getItem('token');
            const items = [{
                productId: product._id,
                quantity,
                price: product.price
            }]
            const response = await axios.post("https://warehouse-management-backend-t3q2.onrender.com/api/orders", { customerName, items }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            const orderId = response.data._id
            alert(`Order placed! Redirecting to payment...`)
            navigate(`/payment/${orderId}`)
        } catch (err) {
            console.error("Error creating order:", err)
            alert("Error creating order: " + (err.response?.data?.error || err.message))
        }
    }

    return(
        <div className="order-container">
            <h2>Create Order</h2>
            <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={e=>setCustomerName(e.target.value)}
                className="order-input"
            />

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

            <div className="product-grid">
                {visibleProducts.length === 0 ? (
                    <p>No products available for this category.</p>
                ) : visibleProducts.map((product) => (
                    <div key={product._id} className="product-card">
                        {product.image ? (
                            <img
                                src={`https://warehouse-management-backend-t3q2.onrender.com/uploads/${product.image}`}
                                alt={product.name}
                                className="product-image"
                            />
                        ) : (
                            <div className="product-image-fallback">No image</div>
                        )}
                        <div className="product-details">
                            <h3>{product.name}</h3>
                            <p className="product-category">{product.category || 'Uncategorized'}</p>
                            <p className="product-price">₹{product.price}</p>
                            <p className="product-description">{product.description || 'No description'}</p>
                        </div>
                        <div className="product-actions">
                            <div className="customer-label">Customer: {customerName || 'Enter name above'}</div>
                            <input
                                type="number"
                                min="1"
                                value={quantities[product._id] || 1}
                                onChange={e => handleQuantityChange(product._id, e.target.value)}
                                className="quantity-input"
                            />
                            <button type="button" className="order-btn" onClick={() => handleOrder(product)}>
                                Order
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pagination-controls">
                <button
                    type="button"
                    className="pagination-button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                    Previous
                </button>
                <span className="pagination-info">Page {currentPage} of {totalPages}</span>
                <button
                    type="button"
                    className="pagination-button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                >
                    Next
                </button>
            </div>
        </div>
    )
}
