import { NavLink, Routes, Route } from "react-router-dom"
import Register from "./Register"
import Login from "./login"
import Dashboard from "./pages/Dashboard"
import "./App.css"
import Layout from "./layout/layout"
import Inventory from "./Inventory/Inventory"
import Product from "./product.jsx/productparent"

import ProtectedRoute from "./assets/ProctedRoute"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import OrderPage from "./orders/orderPage"
import AddLocation from "./Location/Add-location"
import OrderTracking from "./pages/OrderTracking"
import CreateOrder from "./orders/createOrder"
import Users from "./pages/Users"



export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'))
  const [userRole, setUserRole] = useState(localStorage.getItem('role') || "")
  const navigate = useNavigate()

  const handleLogin = (role) => {
    setIsLoggedIn(true)
    setUserRole(role || "")
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    localStorage.removeItem('role')
    setIsLoggedIn(false)
    setUserRole("")
    navigate("/login")
  }

  const isAdmin = userRole === "admin"
  const isStaff = userRole === "staff"
  const canManageInventory = isAdmin || isStaff
  const canViewProducts = isAdmin || isStaff
  const canViewOrders = isAdmin || isStaff

  return (
    <div className="app-container">
      <nav className="navbar">

        <a className="app-brand" onClick={() => navigate(isLoggedIn ? "/dashboard" : "/login")} style={{ cursor: "pointer" }}>

          warehouse<span className="brand-dot">Mangement</span>
        </a>


        <ul className="nav-list">
          {!isLoggedIn && (
            <>
              <li>
                <NavLink to="/register" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                  📝 Register
                </NavLink>
              </li>
              <li>
                <NavLink to="/login" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                  🔐 Login
                </NavLink>
              </li>
            </>
          )}
          {isLoggedIn && (
            <>
              <li>
                <NavLink to="/dashboard" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                  📊 Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/create-order" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                  📝 Create Order
                </NavLink>
              </li>
              <li>
                <NavLink to="/track-order" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                  🔍 Track Order
                </NavLink>
              </li>

              {canManageInventory && (
                <li>
                  <NavLink to="/inventory" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}> 
                    📦 Inventory
                  </NavLink>
                </li>
              )}

              {canViewProducts && (
                <li>
                  <NavLink to="/product" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}> 
                    🛒 Products
                  </NavLink>
                </li>
              )}

              {canViewOrders && (
                <li>
                  <NavLink to="/orders" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}> 
                    📑 Orders
                  </NavLink>
                </li>
              )}

              {isAdmin && (
                <>
                  <li>
                    <NavLink to="/location" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                      📍 Location
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/users" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                      👥 Users
                    </NavLink>
                  </li>
                </>
              )}

              <li>
                <span className="nav-link logout-btn" onClick={handleLogout}>
                  🚪 Logout
                </span>
              </li>
            </>
          )}
        </ul>
      </nav>

      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/track-order" element={<ProtectedRoute isAllowed={isLoggedIn}><Layout role={userRole}><OrderTracking /></Layout></ProtectedRoute>} />
        <Route path="/create-order" element={<ProtectedRoute isAllowed={isLoggedIn}><Layout role={userRole}><CreateOrder /></Layout></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute isAllowed={isLoggedIn}><Layout role={userRole}><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/product" element={<ProtectedRoute isAllowed={isLoggedIn && canViewProducts}><Layout role={userRole}><Product /></Layout></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute isAllowed={isLoggedIn && canManageInventory}><Layout role={userRole}><Inventory /></Layout></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute isAllowed={isLoggedIn && canViewOrders}><Layout role={userRole}><OrderPage /></Layout></ProtectedRoute>} />
        <Route path="/location" element={<ProtectedRoute isAllowed={isLoggedIn && isAdmin}><Layout role={userRole}><AddLocation /></Layout></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute isAllowed={isLoggedIn && isAdmin}><Layout role={userRole}><Users /></Layout></ProtectedRoute>} />



      </Routes>
    </div>
  )
}
