import { useState } from "react"
import Sidebar from "./sidebar"
import Navbar from "./Navbar"

export default function Layout({ children, role }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="app-layout min-h-screen bg-[#E4DDD3] text-slate-900 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar role={role} onClose={() => setIsSidebarOpen(false)} />
      </div>

      <div className="content-area relative flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,161,155,0.12),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(228,221,211,0.16),_transparent_22%)] opacity-90" />
        <main className="content-main relative z-10 flex-1 overflow-y-auto p-4 md:p-8 animate-page-fade">
          {children}
        </main>
      </div>
    </div>
  )
}
