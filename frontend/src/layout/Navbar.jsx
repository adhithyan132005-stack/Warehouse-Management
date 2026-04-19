import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Notification from "../pages/Notification"

export default function Navbar({ onMenuClick }) {
  const userName = localStorage.getItem("userName") || "Admin"
  const userRole = localStorage.getItem("role") || "Staff"
  const [searchText, setSearchText] = useState("")
  const navigate = useNavigate()

  return (
    <header className="navbar backdrop-blur-md bg-white/70 border-b border-slate-200 sticky top-0 z-30 px-4 py-2">
      <div className="flex items-center justify-between gap-4 max-w-[1600px] mx-auto">
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl lg:hidden"
            title="Open Menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Adhi Warehouse" className="h-10 w-10 object-contain hidden sm:block" />
            <div className="hidden sm:block">
              <h1 className="text-lg font-black text-slate-900 leading-tight">Adhi Warehouse</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Fast access • Stock Control</p>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-lg hidden md:block px-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if(e.key === 'Enter' && searchText.trim()){
                  navigate(`/search?q=${encodeURIComponent(searchText.trim())}`)
                }
              }}
              placeholder="Search products, orders..."
              className="w-full bg-slate-100 border-none focus:ring-2 focus:ring-[#00A19B] rounded-xl py-2 pl-10 pr-4 text-xs outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Notification />
          <button 
            className="flex items-center gap-2 p-1 pl-1 pr-3 rounded-full hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200"
            onClick={() => navigate('/users')}
          >
            <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest">
              {userName?.charAt(0) || 'A'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-[10px] font-black text-slate-900 leading-none mb-0.5">{userName}</div>
              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{userRole}</div>
            </div>
          </button>
        </div>
      </div>
    </header>
  )
}
