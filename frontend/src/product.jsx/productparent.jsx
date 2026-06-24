import { useState } from 'react'
import ProductTable from './productTable'
import AddProduct   from './AddProduct'

export default function ProductPage() {

    const [showAddForm,     setShowAddForm]     = useState(false)
    const [refreshTrigger,  setRefreshTrigger]  = useState(0)

    const userRole = localStorage.getItem('role') || 'user'
    const isAdmin  = userRole === 'admin'

    // Called after a product is added — refreshes the table
    const handleProductAdded = () => {
        setRefreshTrigger(prev => prev + 1)
        setShowAddForm(false)
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto animate-fade-in p-4 lg:p-8">

            {/* Page Header */}
            <header className="glass-card rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight mb-1">
                        Product <span className="premium-gradient-text">Management</span>
                    </h1>
                    <p className="text-gray-400 text-sm">Manage your products, SKUs and pricing.</p>
                </div>

                {/* Only admin sees the Add Product button */}
                {isAdmin && (
                    <button
                        className="btn-primary flex items-center gap-2"
                        onClick={() => setShowAddForm(true)}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Product
                    </button>
                )}
            </header>

            {/* Add Product Modal */}
            {showAddForm && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 50,
                    background: 'rgba(0,0,0,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '16px'
                }}>
                    <div style={{ width: '100%', maxWidth: '560px' }}>
                        <AddProduct
                            close={() => setShowAddForm(false)}
                            refresh={handleProductAdded}
                        />
                    </div>
                </div>
            )}

            {/* Product Table / Grid */}
            <div className="glass-card rounded-2xl p-6">
                <ProductTable
                    refreshTrigger={refreshTrigger}
                    onRefresh={() => setRefreshTrigger(prev => prev + 1)}
                />
            </div>

        </div>
    )
}
