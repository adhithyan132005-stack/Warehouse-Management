import { useEffect, useState } from "react";
import axios from "axios";

export default function ProductTable({ refreshTrigger }) {
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const userRole = localStorage.getItem("role") || "user";

    useEffect(() => {
        fetchProducts();
    }, [refreshTrigger]);

    const fetchProducts = async () => {
        try {
            const response = await axios.get("https://warehouse-management-backend-t3q2.onrender.com/api/product", {
                headers: { authorization: localStorage.getItem('token') }
            });
            setProducts(response.data);
        } catch (err) {
            console.log("Error fetching product:", err);
        }
    };

    const deleteProduct = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await axios.delete(`https://warehouse-management-backend-t3q2.onrender.com/api/product/${id}`, {
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
                await axios.put(`https://warehouse-management-backend-t3q2.onrender.com/api/product/${product._id}`, { ...product, name: newName }, {
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
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Products</h2>
                
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-surface-800/80 border border-glass-border text-white text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 p-2.5 transition-colors"
                    />
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-glass-border bg-white">
                <table className="w-full text-left border-collapse text-slate-950">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="p-4 text-xs font-bold text-slate-950 uppercase tracking-wider">Product Name</th>
                            <th className="p-4 text-xs font-bold text-slate-950 uppercase tracking-wider">SKU / Barcode</th>
                            <th className="p-4 text-xs font-bold text-slate-950 uppercase tracking-wider">Category</th>
                            <th className="p-4 text-xs font-bold text-slate-950 uppercase tracking-wider">Price (₹)</th>
                            {(userRole === 'admin' || userRole === 'staff') && (
                                <th className="p-4 text-xs font-bold text-slate-950 uppercase tracking-wider text-right">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((p) => (
                                <tr key={p._id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="p-4 text-sm font-medium text-slate-950">{p.name}</td>
                                    <td className="p-4 text-slate-950">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-slate-950">{p.sku}</span>
                                            {p.barcode && <span className="text-xs text-slate-500 font-mono mt-1">{p.barcode}</span>}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-slate-100 border border-slate-200 text-slate-950 px-2.5 py-1 rounded text-xs font-medium">
                                            {p.category}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm font-bold text-slate-950">₹{p.price}</td>
                                    {(userRole === 'admin' || userRole === 'staff') && (
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2 relative">
                                                <button 
                                                    onClick={() => editProduct(p)}
                                                    className="p-2 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 rounded-lg transition-colors border border-brand-500/20"
                                                    title="Edit Product"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </button>
                                                <button 
                                                    onClick={() => deleteProduct(p._id)}
                                                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-red-500/20"
                                                    title="Delete Product"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={(userRole === 'admin' || userRole === 'staff') ? "5" : "4"} className="p-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="text-4xl mb-3 text-gray-600">📦</div>
                                        <p>No products found</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className="mt-4 flex justify-between items-center text-sm text-gray-400">
                <span>Showing {filteredProducts.length} product(s)</span>
            </div>
        </div>
    );
}
