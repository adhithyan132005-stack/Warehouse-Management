import { useState } from "react";
import ProductTable from "./productTable";
import AddProduct from "./AddProduct";

export default function Product(){
    const[showform,setShowForm]=useState(false)
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return(
        <div className="space-y-6 max-w-7xl mx-auto animate-fade-in p-4 lg:p-8">
            <header className="glass-card rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight mb-1">
                        Product <span className="premium-gradient-text">Management</span>
                    </h1>
                    <p className="text-gray-400 text-sm">Manage SKUs, inventory, and pricing.</p>
                </div>
                <button 
                    className="btn-primary flex items-center gap-2"
                    onClick={()=>setShowForm(true)}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Add Product
                </button>
            </header>

            {showform && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-2xl m-4 animate-scale-up">
                        <AddProduct 
                            close={()=>setShowForm(false)} 
                            refresh={handleRefresh}
                        />
                    </div>
                </div>
            )}
            
            <div className="glass-card rounded-2xl p-6 relative z-10">
                <ProductTable refreshTrigger={refreshTrigger} />
            </div>
        </div>
    )
}
