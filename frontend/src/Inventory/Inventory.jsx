import StockIn from "./StockIn";
import StockOut from "./StockOut";
import InventoryTable from "./inventoryTable";

export default function Inventory() {
    return (
        <div className="dashboard-wrapper">
            <header className="dashboard-header" style={{ marginBottom: '40px' }}>
                <h1 className="dashboard-welcome" style={{ marginBottom: '8px' }}>Inventory <span>Management</span></h1>
                <p className="dashboard-subtitle">Monitor and control your warehouse stock levels efficiently.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', alignItems: 'start' }}>
                <div className="auth-card" style={{ maxWidth: 'none' }}>
                    <StockIn />
                </div>
                <div className="auth-card" style={{ maxWidth: 'none' }}>
                    <StockOut />
                </div>
            </div>

            <div style={{ marginTop: '48px' }}>
                <InventoryTable />
            </div>
        </div>
    )
}
