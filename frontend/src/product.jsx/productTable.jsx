import { useEffect, useState } from "react";
import axios from "axios";

export default function ProductTable({ refreshTrigger }) {
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const userRole = localStorage.getItem("role") || "user";

    // Dynamic Backend URL detection (Fixes Point #2 in your guide)
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const BASE_URL = isLocal 
        ? "http://localhost:4444" 
        : "https://warehouse-management-backend-t3q2.onrender.com";

    useEffect(() => {
        fetchProducts();
    }, [refreshTrigger]);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/product`, {
                headers: { authorization: localStorage.getItem('token') }
            });
            setProducts(response.data);
        } catch (err) {
            console.log("Error fetching product:", err);
        }
    };

    const getImageUrl = (img) => {
        if (!img) return "https://via.placeholder.com/300?text=No+Image";
        // If it's already a full URL (like Unsplash), return as is
        if (img.startsWith("http")) return img;
        // Otherwise, serve it from the backend uploads folder (Points #1 and #2)
        return `${BASE_URL}/uploads/${img}`;
    };

    const deleteProduct = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await axios.delete(`${BASE_URL}/api/product/${id}`, {
                    headers: { authorization: localStorage.getItem('token') }
                });
                fetchProducts();
            } catch (err) {
                console.log("Error fetching while deleting a product:", err);
            }
        }
    };

    const editProduct = async (product) => {
        const newName = prompt("Edit name", product.name);
        if (newName && newName !== product.name) {
            try {
                await axios.put(`${BASE_URL}/api/product/${product._id}`, { ...product, name: newName }, {
                    headers: { authorization: localStorage.getItem('token') }
                });
                fetchProducts();
            } catch (err) {
                console.log("Error fetching while updating a product:", err.response?.data);
            }
        }
    };

    const filteredProducts = products.filter(p => 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-white/40 backdrop-blur-md rounded-3xl p-4 md:p-8 border border-white/20 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Inventory Products</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage and track your warehouse stock level</p>
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
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-white border border-slate-200 text-slate-900 text-sm rounded-2xl focus:ring-2 focus:ring-[#00A19B] focus:border-[#00A19B] block w-full pl-12 p-3.5 shadow-sm transition-all outline-none"
                    />
                </div>
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Product</th>
                            <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Category</th>
                            <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Price</th>
                            {(userRole === 'admin' || userRole === 'staff') && (
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((p) => (
                                <tr key={p._id} className="hover:bg-slate-50 transition-all duration-200 group">
                                    <td className="p-5">
                                        <div className="flex items-center gap-5">
                                            <div 
                                                className="h-20 w-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 shadow-sm cursor-zoom-in group-hover:shadow-md transition-all"
                                                onClick={() => setSelectedImage(p.image)}
                                            >
                                                <img 
                                                    src={getImageUrl(p.image)} 
                                                    alt={p.name} 
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => { e.target.src = "https://via.placeholder.com/300?text=Error"; }}
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-lg font-bold text-slate-900 leading-tight">{p.name}</span>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-[#00A19B] bg-[#00A19B]/5 px-2 py-0.5 rounded">SKU: {p.sku}</span>
                                                    {p.barcode && <span className="text-[10px] text-slate-400 font-mono">Barcode: {p.barcode}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                            {p.category}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <span className="text-xl font-black text-slate-900">₹{p.price.toLocaleString()}</span>
                                    </td>
                                    {(userRole === 'admin' || userRole === 'staff') && (
                                        <td className="p-5 text-right">
                                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                                <button 
                                                    onClick={() => editProduct(p)}
                                                    className="p-3 bg-white hover:bg-slate-50 text-slate-600 rounded-xl transition-all border border-slate-200 shadow-sm hover:shadow-md"
                                                    title="Edit Product"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </button>
                                                <button 
                                                    onClick={() => deleteProduct(p._id)}
                                                    className="p-3 bg-white hover:bg-red-50 text-red-500 rounded-xl transition-all border border-slate-200 shadow-sm hover:shadow-md"
                                                    title="Delete Product"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="p-20 text-center text-slate-400">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="text-5xl opacity-20">📦</div>
                                        <p className="font-bold text-lg">No products found matching your search</p>
                                        <button onClick={() => setSearchQuery("")} className="text-[#00A19B] font-black hover:underline uppercase tracking-widest text-xs">Clear Filter</button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((p) => (
                        <div key={p._id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-md flex flex-col group">
                            <div className="relative h-64 bg-slate-100 overflow-hidden cursor-zoom-in" onClick={() => setSelectedImage(p.image)}>
                                <img 
                                    src={getImageUrl(p.image)} 
                                    alt={p.name} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-xl border border-white/50">
                                    <span className="text-lg font-black text-slate-900">₹{p.price}</span>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-1">{p.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] bg-slate-50 text-slate-400 border border-slate-100 px-2 py-0.5 rounded font-mono">SKU: {p.sku}</span>
                                        <span className="text-[10px] bg-[#00A19B]/5 text-[#00A19B] border border-[#00A19B]/10 px-2 py-0.5 rounded font-black uppercase tracking-widest">{p.category}</span>
                                    </div>
                                </div>
                                {(userRole === 'admin' || userRole === 'staff') && (
                                    <div className="flex gap-2 pt-4 border-t border-slate-100">
                                        <button onClick={() => editProduct(p)} className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-xl font-black transition-all border border-slate-200 text-xs flex items-center justify-center gap-2">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            Edit
                                        </button>
                                        <button onClick={() => deleteProduct(p._id)} className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-black transition-all border border-red-100 text-xs flex items-center justify-center gap-2">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-200">
                        <p className="text-slate-400 font-bold">No results found</p>
                    </div>
                )}
            </div>

            {/* Modal for full image viewing */}
            {selectedImage && (
                <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 animate-page-fade" onClick={() => setSelectedImage(null)}>
                    <div className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center">
                        <button className="absolute top-0 right-0 m-4 p-4 text-white hover:text-[#00A19B] transition-colors" onClick={() => setSelectedImage(null)}>
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <img 
                            src={getImageUrl(selectedImage)} 
                            alt="Full preview" 
                            className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl border border-white/20"
                            onClick={(e) => e.stopPropagation()}
                            onError={(e) => { e.target.src = "https://via.placeholder.com/800?text=Image+Load+Error"; }}
                        />
                    </div>
                </div>
            )}
            
            <div className="mt-8 flex justify-between items-center text-sm font-black text-slate-400 uppercase tracking-widest bg-slate-50 p-4 rounded-2xl border border-slate-200 px-6">
                <span>Displaying <span className="text-slate-900">{filteredProducts.length}</span> items</span>
                <span className="hidden sm:inline">Warehouse Management Suite v1.0</span>
            </div>
        </div>
    );
}
