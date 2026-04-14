import { NavLink } from "react-router-dom";

export default function Sidebar({ role }) {
    const effectiveRole = role || localStorage.getItem('role') || ''
    const isAdmin = effectiveRole === "admin"
    const isStaff = effectiveRole === "staff"

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2>WMS</h2>
                {effectiveRole && <p className="sidebar-role">Role: {effectiveRole}</p>}
            </div>
            <nav className="sidebar-nav">
                <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    📊 Dashboard
                </NavLink>

                <NavLink to="/create-order" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    📝 Create Order
                </NavLink>

                <NavLink to="/track-order" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    🔍 Track Order
                </NavLink>

                {(isAdmin || isStaff) && (
                    <NavLink to="/inventory" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                        📦 Inventory
                    </NavLink>
                )}

                {(isAdmin || isStaff) && (
                    <NavLink to="/product" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                        🛒 Products
                    </NavLink>
                )}

                {(isAdmin || isStaff) && (
                    <NavLink to="/orders" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                        📑 Orders
                    </NavLink>
                )}

                {isAdmin && (
                    <>
                        <NavLink to="/location" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                            📍 Location
                        </NavLink>
                        <NavLink to="/users" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                            👥 Users
                        </NavLink>
                    </>
                )}
            </nav>
        </aside>
    )
}
