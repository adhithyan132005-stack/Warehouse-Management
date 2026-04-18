import { Routes, Route, Navigate } from "react-router-dom"
import Register from "./Register"
import Login from "./login"
import Dashboard from "./pages/Dashboard"
import Layout from "./layout/layout"
import Inventory from "./Inventory/Inventory"
import Product from "./product.jsx/productparent"
import Suppliers from "./pages/Suppliers"
import ProtectedRoute from "./assets/ProctedRoute"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import OrderPage from "./orders/orderPage"
import AddLocation from "./Location/Add-location"
import OrderTracking from "./pages/OrderTracking"
import CreateOrder from "./orders/createOrder"
import Users from "./pages/Users"
import WarehouseVisualizer from "./pages/WarehouseVisualizer"
import PaymentPage from "./orders/paymentpage"
import Settings from "./pages/Settings"
import Search from "./pages/Search"

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
  const canViewSuppliers = isAdmin || isStaff

  return (
    <div className="app-root">
      <Routes>
        <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/dashboard" element={<ProtectedRoute isAllowed={isLoggedIn}><Layout role={userRole}><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/product" element={<ProtectedRoute isAllowed={isLoggedIn && canViewProducts}><Layout role={userRole}><Product /></Layout></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute isAllowed={isLoggedIn && canManageInventory}><Layout role={userRole}><Inventory /></Layout></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute isAllowed={isLoggedIn && canViewOrders}><Layout role={userRole}><OrderPage /></Layout></ProtectedRoute>} />
        <Route path="/create-order" element={<ProtectedRoute isAllowed={isLoggedIn}><Layout role={userRole}><CreateOrder /></Layout></ProtectedRoute>} />
        <Route path="/track-order" element={<ProtectedRoute isAllowed={isLoggedIn}><Layout role={userRole}><OrderTracking /></Layout></ProtectedRoute>} />
        <Route path="/warehouse" element={<ProtectedRoute isAllowed={isLoggedIn && (isAdmin || isStaff)}><Layout role={userRole}><WarehouseVisualizer /></Layout></ProtectedRoute>} />
        <Route path="/warehouse-3d" element={<ProtectedRoute isAllowed={isLoggedIn && (isAdmin || isStaff)}><Layout role={userRole}><WarehouseVisualizer /></Layout></ProtectedRoute>} />
        <Route path="/location" element={<ProtectedRoute isAllowed={isLoggedIn && isAdmin}><Layout role={userRole}><AddLocation /></Layout></ProtectedRoute>} />
        <Route path="/suppliers" element={<ProtectedRoute isAllowed={isLoggedIn && canViewSuppliers}><Layout role={userRole}><Suppliers /></Layout></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute isAllowed={isLoggedIn && isAdmin}><Layout role={userRole}><Users /></Layout></ProtectedRoute>} />
        <Route path="/payment/:id" element={<ProtectedRoute isAllowed={isLoggedIn}><Layout role={userRole}><PaymentPage /></Layout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute isAllowed={isLoggedIn}><Layout role={userRole}><Settings /></Layout></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute isAllowed={isLoggedIn}><Layout role={userRole}><Search /></Layout></ProtectedRoute>} />
      </Routes>
    </div>
  )
}
