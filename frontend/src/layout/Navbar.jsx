import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Notification from "../pages/Notification"

export default function Navbar() {
  const userName = localStorage.getItem("userName") || "Admin"
  const userRole = localStorage.getItem("role") || "Staff"
  const [searchText, setSearchText] = useState("")
  const navigate = useNavigate()

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <div>
          <h1 className="navbar__title">Warehouse Management</h1>
          <p className="navbar__subtitle">Fast access to orders, stock, and locations</p>
        </div>

        <div className="navbar__search">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if(e.key === 'Enter' && searchText.trim()){
                navigate(`/search?q=${encodeURIComponent(searchText.trim())}`)
              }
            }}
            placeholder="Search orders, products, suppliers..."
            className="navbar__input"
          />
        </div>

        <div className="navbar__actions">
          <Notification />
          <button className="navbar__profile-button" onClick={() => navigate('/users')}>
            <span>{userName?.charAt(0) || 'A'}</span>
            <div className="text-left">
              <div>{userName}</div>
              <div className="navbar__subtitle">{userRole}</div>
            </div>
          </button>
        </div>
      </div>
    </header>
  )
}
