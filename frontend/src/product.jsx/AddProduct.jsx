import { useState } from 'react'
import axios from 'axios'
import Barcode from './barcode'

const BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:4444'
    : 'https://warehouse-management-backend-t3q2.onrender.com'

export default function AddProduct({ close, refresh }) {

    const [name,        setName]        = useState('')
    const [sku,         setSku]         = useState('')
    const [barcode,     setBarcode]     = useState('')
    const [category,    setCategory]    = useState('')
    const [price,       setPrice]       = useState('')
    const [description, setDescription] = useState('')
    const [imageFile,   setImageFile]   = useState(null)
    const [preview,     setPreview]     = useState(null)
    const [loading,     setLoading]     = useState(false)
    const [error,       setError]       = useState('')
    const [showScanner, setShowScanner] = useState(false)

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImageFile(file)
            setPreview(URL.createObjectURL(file))
        }
    }

    const handleBarcodeScan = async (code) => {
        setShowScanner(false)
        setBarcode(code)
        try {
            const token = localStorage.getItem('token')
            const res = await axios.get(`${BASE_URL}/api/barcode/${code}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setName(res.data.name || '')
            setSku(res.data.sku || '')
            setCategory(res.data.category || '')
            setPrice(res.data.price || '')
            setDescription(res.data.description || '')
        } catch {
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!name || !sku || !category || !price) {
            setError('Please fill in Name, SKU, Category and Price')
            return
        }

        setError('')
        setLoading(true)

        try {
            const token = localStorage.getItem('token')

            const formData = new FormData()
            formData.append('name',        name)
            formData.append('sku',         sku)
            formData.append('category',    category)
            formData.append('price',       price)
            formData.append('description', description)
            if (barcode)   formData.append('barcode', barcode)
            if (imageFile) formData.append('image',   imageFile)

            await axios.post(`${BASE_URL}/api/product`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (refresh) refresh()
            if (close)   close()

        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            background: 'white',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0,0,0,0.15)'
        }}>

            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '20px 24px', borderBottom: '1px solid #f1f5f9'
            }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Add New Product</h2>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>Image is uploaded directly to Cloudinary</p>
                </div>
                <button onClick={close} style={{
                    background: '#f8fafc', border: '1px solid #e2e8f0',
                    borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '16px'
                }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>

                {error && (
                    <div style={{
                        background: '#fef2f2', border: '1px solid #fecaca',
                        color: '#dc2626', padding: '12px 16px', borderRadius: '10px',
                        marginBottom: '16px', fontSize: '14px'
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>
                        Product Image (optional)
                    </label>

                    <label style={{
                        display: 'block', border: '2px dashed #e2e8f0',
                        borderRadius: '12px', cursor: 'pointer', overflow: 'hidden',
                        borderColor: preview ? '#00A19B' : '#e2e8f0'
                    }}>
                        {preview
                            ? <img src={preview} alt="preview" style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                            : (
                                <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🖼️</div>
                                    <div style={{ fontSize: '14px', fontWeight: 600 }}>Click to upload image</div>
                                    <div style={{ fontSize: '12px', marginTop: '4px' }}>JPG, PNG, WebP — max 5MB</div>
                                </div>
                            )
                        }
                        <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                    </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                        <label style={labelStyle}>Product Name *</label>
                        <input
                            style={inputStyle}
                            placeholder="e.g. Wireless Mouse"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>SKU *</label>
                        <input
                            style={inputStyle}
                            placeholder="e.g. WM-001"
                            value={sku}
                            onChange={e => setSku(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                    <label style={labelStyle}>Barcode</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            style={{ ...inputStyle, flex: 1 }}
                            placeholder="Optional"
                            value={barcode}
                            onChange={e => setBarcode(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowScanner(true)}
                            style={{
                                padding: '10px 16px', background: '#0f172a', color: 'white',
                                border: 'none', borderRadius: '10px', cursor: 'pointer',
                                fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap'
                            }}
                        >
                            📷 Scan
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                        <label style={labelStyle}>Category *</label>
                        <input
                            style={inputStyle}
                            placeholder="e.g. Electronics"
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Price (₹) *</label>
                        <input
                            style={inputStyle}
                            type="number"
                            placeholder="0"
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={labelStyle}>Description</label>
                    <textarea
                        style={{ ...inputStyle, resize: 'none' }}
                        rows={3}
                        placeholder="Optional description..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%', padding: '14px',
                        background: loading ? '#94a3b8' : '#00A19B',
                        color: 'white', border: 'none', borderRadius: '12px',
                        fontSize: '15px', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'background 0.2s'
                    }}
                >
                    {loading ? '⏳ Uploading to Cloudinary...' : '✅ Add Product'}
                </button>
            </form>

            {showScanner && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 999,
                    background: 'rgba(0,0,0,0.7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '16px', width: '100%', maxWidth: '360px' }}>
                        <Barcode onScan={handleBarcodeScan} close={() => setShowScanner(false)} />
                    </div>
                </div>
            )}
        </div>
    )
}

const labelStyle = {
    display: 'block', fontSize: '12px', fontWeight: 700,
    color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px'
}

const inputStyle = {
    width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0',
    borderRadius: '10px', fontSize: '14px', color: '#0f172a',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
    transition: 'border-color 0.2s'
}
