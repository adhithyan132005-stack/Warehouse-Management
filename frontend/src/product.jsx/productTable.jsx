import { useEffect, useState } from 'react'
import axios from 'axios'

const BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:4444'
    : 'https://warehouse-management-backend-t3q2.onrender.com'

// Show a placeholder box when image is missing or broken
const NO_IMAGE = "data:image/svg+xml;utf8," + encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'>
        <rect width='200' height='200' fill='%23f1f5f9'/>
        <text x='50%' y='45%' dominant-baseline='middle' text-anchor='middle' font-size='40'>📦</text>
        <text x='50%' y='68%' dominant-baseline='middle' text-anchor='middle' font-size='13' fill='%2394a3b8'>No Image</text>
    </svg>
`)

export default function ProductTable({ refreshTrigger, onRefresh }) {

    const [products,   setProducts]   = useState([])
    const [search,     setSearch]     = useState('')
    const [bigImage,   setBigImage]   = useState(null)   // for image zoom modal
    const [editProduct,setEditProduct]= useState(null)   // for edit modal
    const [editLoading,setEditLoading]= useState(false)

    const userRole = localStorage.getItem('role') || 'user'
    const isAdmin  = userRole === 'admin'
    const isStaff  = userRole === 'staff'

    // Load products on mount and when refreshTrigger changes
    useEffect(() => {
        loadProducts()
    }, [refreshTrigger])

    const loadProducts = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await axios.get(`${BASE_URL}/api/product`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setProducts(res.data)
        } catch (err) {
            console.error('Could not load products:', err.message)
        }
    }

    // Delete a product
    const deleteProduct = async (id) => {
        if (!window.confirm('Delete this product?')) return
        try {
            const token = localStorage.getItem('token')
            await axios.delete(`${BASE_URL}/api/product/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            loadProducts()
        } catch (err) {
            alert(err.response?.data?.error || 'Delete failed')
        }
    }

    // Open edit modal with current product data
    const openEdit = (product) => {
        setEditProduct({
            _id:         product._id,
            name:        product.name        || '',
            sku:         product.sku         || '',
            category:    product.category    || '',
            price:       product.price       || '',
            description: product.description || '',
            barcode:     product.barcode     || '',
            image:       product.image       || null,  // current image URL
            newImageFile:null                          // new image the user picks
        })
    }

    // Save edited product
    const saveEdit = async () => {
        if (!editProduct.name || !editProduct.sku || !editProduct.category || !editProduct.price) {
            alert('Name, SKU, Category and Price are required')
            return
        }

        setEditLoading(true)
        try {
            const token = localStorage.getItem('token')

            // Use FormData so we can send both text and optional new image
            const formData = new FormData()
            formData.append('name',        editProduct.name)
            formData.append('sku',         editProduct.sku)
            formData.append('category',    editProduct.category)
            formData.append('price',       editProduct.price)
            formData.append('description', editProduct.description)
            if (editProduct.barcode)     formData.append('barcode', editProduct.barcode)
            if (editProduct.newImageFile) formData.append('image',  editProduct.newImageFile) // upload new image to cloudinary

            await axios.put(`${BASE_URL}/api/product/${editProduct._id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            })

            setEditProduct(null)
            loadProducts()
        } catch (err) {
            alert(err.response?.data?.error || 'Update failed')
        } finally {
            setEditLoading(false)
        }
    }

    // Filter products by search query
    const filtered = products.filter(p =>
        (p.name     || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.sku      || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div>

            {/* Search bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>All Products</h2>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>{filtered.length} items</p>
                </div>
                <input
                    type="text"
                    placeholder="🔍  Search by name, SKU or category..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        padding: '10px 16px', border: '1.5px solid #e2e8f0', borderRadius: '12px',
                        fontSize: '14px', outline: 'none', width: '280px', color: '#0f172a'
                    }}
                />
            </div>

            {/* Product Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                {filtered.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📦</div>
                        <p style={{ fontWeight: 700 }}>No products found</p>
                    </div>
                )}

                {filtered.map(p => (
                    <div key={p._id} style={{
                        background: 'white', borderRadius: '16px',
                        border: '1px solid #f1f5f9', overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        transition: 'box-shadow 0.2s',
                    }}>

                        {/* Product Image — click to zoom */}
                        <div
                            onClick={() => setBigImage(p.image)}
                            style={{ height: '180px', overflow: 'hidden', background: '#f8fafc', cursor: 'zoom-in' }}
                        >
                            <img
                                src={p.image || NO_IMAGE}
                                alt={p.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={e => { e.target.onerror = null; e.target.src = NO_IMAGE }}
                            />
                        </div>

                        {/* Product Info */}
                        <div style={{ padding: '14px' }}>
                            <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{p.name}</h3>
                            <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#94a3b8' }}>SKU: {p.sku}</p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <span style={{
                                    fontSize: '11px', fontWeight: 700, padding: '3px 8px',
                                    background: '#f0fdf4', color: '#16a34a', borderRadius: '20px'
                                }}>
                                    {p.category}
                                </span>
                                <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>₹{Number(p.price).toLocaleString()}</span>
                            </div>

                            {/* Edit / Delete — only for admin and staff */}
                            {(isAdmin || isStaff) && (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {isAdmin && (
                                        <button
                                            onClick={() => openEdit(p)}
                                            style={btnStyle('#e0f2fe', '#0369a1')}
                                        >
                                            ✏️ Edit
                                        </button>
                                    )}
                                    {isAdmin && (
                                        <button
                                            onClick={() => deleteProduct(p._id)}
                                            style={btnStyle('#fef2f2', '#dc2626')}
                                        >
                                            🗑️ Delete
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Image Zoom Modal ──────────────────────────────────────────── */}
            {bigImage && (
                <div
                    onClick={() => setBigImage(null)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 1000,
                        background: 'rgba(0,0,0,0.85)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '24px'
                    }}
                >
                    <img
                        src={bigImage}
                        alt="Full view"
                        style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: '16px', objectFit: 'contain' }}
                        onError={e => { e.target.onerror = null; e.target.src = NO_IMAGE }}
                        onClick={e => e.stopPropagation()}
                    />
                    <button
                        onClick={() => setBigImage(null)}
                        style={{
                            position: 'fixed', top: '16px', right: '16px',
                            background: 'white', border: 'none', borderRadius: '50%',
                            width: '40px', height: '40px', fontSize: '18px',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >✕</button>
                </div>
            )}

            {/* ── Edit Product Modal ────────────────────────────────────────── */}
            {editProduct && (
                <div
                    onClick={() => setEditProduct(null)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 1000,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '16px'
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'white', borderRadius: '20px',
                            width: '100%', maxWidth: '480px',
                            maxHeight: '90vh', overflowY: 'auto'
                        }}
                    >
                        {/* Modal Header */}
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '20px 24px', borderBottom: '1px solid #f1f5f9'
                        }}>
                            <h3 style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>Edit Product</h3>
                            <button onClick={() => setEditProduct(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '24px' }}>

                            {/* Current image + option to change */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={labelStyle}>Product Image</label>
                                <img
                                    src={editProduct.newImageFile ? URL.createObjectURL(editProduct.newImageFile) : (editProduct.image || NO_IMAGE)}
                                    alt="current"
                                    style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                    onError={e => { e.target.onerror = null; e.target.src = NO_IMAGE }}
                                />
                                <label style={{ display: 'block', marginTop: '8px', cursor: 'pointer' }}>
                                    <span style={{ fontSize: '13px', color: '#00A19B', fontWeight: 700 }}>📸 Change image</span>
                                    <input
                                        type="file" accept="image/*" style={{ display: 'none' }}
                                        onChange={e => {
                                            if (e.target.files[0]) setEditProduct(p => ({ ...p, newImageFile: e.target.files[0] }))
                                        }}
                                    />
                                </label>
                            </div>

                            {/* Text fields */}
                            {[
                                { label: 'Name *',      key: 'name' },
                                { label: 'SKU *',       key: 'sku' },
                                { label: 'Category *',  key: 'category' },
                                { label: 'Price (₹) *', key: 'price', type: 'number' },
                                { label: 'Barcode',     key: 'barcode' },
                                { label: 'Description', key: 'description', textarea: true }
                            ].map(field => (
                                <div key={field.key} style={{ marginBottom: '12px' }}>
                                    <label style={labelStyle}>{field.label}</label>
                                    {field.textarea
                                        ? <textarea
                                            rows={3}
                                            style={{ ...inputStyle, resize: 'none' }}
                                            value={editProduct[field.key]}
                                            onChange={e => setEditProduct(p => ({ ...p, [field.key]: e.target.value }))}
                                          />
                                        : <input
                                            type={field.type || 'text'}
                                            style={inputStyle}
                                            value={editProduct[field.key]}
                                            onChange={e => setEditProduct(p => ({ ...p, [field.key]: e.target.value }))}
                                          />
                                    }
                                </div>
                            ))}

                            {/* Buttons */}
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button
                                    onClick={() => setEditProduct(null)}
                                    style={{ flex: 1, padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveEdit}
                                    disabled={editLoading}
                                    style={{ flex: 1, padding: '12px', background: editLoading ? '#94a3b8' : '#00A19B', color: 'white', border: 'none', borderRadius: '10px', cursor: editLoading ? 'not-allowed' : 'pointer', fontWeight: 700 }}
                                >
                                    {editLoading ? '⏳ Saving...' : '✅ Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// Shared styles
const labelStyle = {
    display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b',
    marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px'
}

const inputStyle = {
    width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0',
    borderRadius: '10px', fontSize: '14px', color: '#0f172a',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit'
}

const btnStyle = (bg, color) => ({
    flex: 1, padding: '8px', background: bg, color,
    border: 'none', borderRadius: '8px', cursor: 'pointer',
    fontSize: '12px', fontWeight: 700
})
