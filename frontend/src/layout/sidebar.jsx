import { NavLink, useNavigate } from "react-router-dom"

export default function Sidebar({ role, onClose }) {
  const effectiveRole = role || localStorage.getItem('role') || 'guest'
  const isAdmin = effectiveRole === "admin"
  const isStaff = effectiveRole === "staff"
  const canViewProducts = isAdmin || isStaff
  const canManageInventory = isAdmin || isStaff
  const canViewOrders = isAdmin || isStaff
  const canViewSuppliers = isAdmin || isStaff
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    localStorage.removeItem('role')
    navigate('/login')
  }

  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition duration-200 ease-out ${isActive ? 'bg-[#00A19B]/20 text-[#E4DDD3] shadow-[0_20px_50px_rgba(0,161,155,0.16)] border border-[#00A19B]/20' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`

  return (
    <aside className="min-h-screen w-72 max-w-[18rem] overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#00A19B] via-[#00a19b] to-[#04715e] p-6 text-[#000000] shadow-2xl shadow-[#00A19B]/20 backdrop-blur-xl">
      <div className="mb-8 space-y-3">
        <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Adhi Warehouse" className="h-12 w-12 object-contain" />
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.18)]">
              Adhi Warehouse
            </h2>
            <p className="text-sm text-white/70">Control Center</p>
          </div>
        </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-black/10 px-3 py-2 text-sm font-semibold text-black hover:bg-black/15 transition"
          >
            ✕
          </button>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-black shadow-sm shadow-[#00A19B]/20">
          <span className="h-2 w-2 rounded-full bg-[#00A19B] shadow-[0_0_10px_rgba(0,161,155,0.4)]"></span>
          {effectiveRole}
        </span>
      </div>

      <nav className="space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-black">Overview</p>
        <NavLink to="/dashboard" className={linkClass}>
          <span className="text-lg">📊</span>
          Dashboard
        </NavLink>

        {/* --- REGULAR USER SIDEBAR SECTION --- */}
        {effectiveRole === "user" && (
          <>
            <p className="pt-4 text-xs uppercase tracking-[0.3em] text-black">Customer Area</p>
            <NavLink to="/create-order" className={linkClass}>
              <span className="text-lg">🛍️</span>
              Shop & Order
            </NavLink>
            <NavLink to="/track-order" className={linkClass}>
              <span className="text-lg">🚚</span>
              Track Order
            </NavLink>
            <NavLink to="/settings" className={linkClass}>
              <span className="text-lg">⚙️</span>
              Settings
            </NavLink>
          </>
        )}

        {/* --- ADMIN / STAFF SIDEBAR SECTION --- */}
        {(isAdmin || isStaff) && (
          <>
            <p className="pt-4 text-xs uppercase tracking-[0.3em] text-black">Operations</p>
            {canViewProducts && (
              <NavLink to="/product" className={linkClass}>
                <span className="text-lg">📦</span>
                Products
              </NavLink>
            )}
            
            {canManageInventory && (
              <>
                <NavLink to="/inventory" className={linkClass}>
                  <span className="text-lg">📋</span>
                  Inventory
                </NavLink>
                <NavLink to="/warehouse" className={linkClass}>
                  <span className="text-lg">🏭</span>
                  3D Warehouse
                </NavLink>
              </>
            )}

            {canViewOrders && (
              <>
                <p className="pt-4 text-xs uppercase tracking-[0.3em] text-black">Fulfillment</p>
                <NavLink to="/orders" className={linkClass}>
                  <span className="text-lg">🧾</span>
                  Order Management
                </NavLink>
                <NavLink to="/track-order" className={linkClass}>
                  <span className="text-lg">🚚</span>
                  Tracking
                </NavLink>
              </>
            )}

            {canViewSuppliers && (
              <NavLink to="/suppliers" className={linkClass}>
                <span className="text-lg">🏢</span>
                Suppliers
              </NavLink>
            )}
          </>
        )}

        {isAdmin && (
          <>
            <p className="pt-4 text-xs uppercase tracking-[0.3em] text-black">System</p>
            <NavLink to="/location" className={linkClass}>
              <span className="text-lg">📍</span>
              Locations
            </NavLink>
            <NavLink to="/users" className={linkClass}>
              <span className="text-lg">👥</span>
              Users
            </NavLink>
            <NavLink to="/settings" className={linkClass}>
              <span className="text-lg">⚙️</span>
              Settings
            </NavLink>
          </>
        )}
      </nav>

      <div className="mt-auto pt-6">
        <button
          onClick={handleLogout}
          className="w-full rounded-2xl bg-[#00A19B] px-5 py-3 text-sm font-semibold text-slate-950 transition duration-200 hover:bg-[#00A19B]/90 focus:outline-none focus:ring-4 focus:ring-[#00A19B]/20"
        >
          ⏏️ Sign Out
        </button>
      </div>
    </aside>
  )
}
