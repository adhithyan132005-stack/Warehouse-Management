import Sidebar from "./sidebar"
import Navbar from "./Navbar"

export default function Layout({ children, role }) {
  return (
    <div className="app-layout min-h-screen bg-[#E4DDD3] text-slate-900">
      <Sidebar role={role} />
      <div className="content-area relative flex-1 overflow-hidden">
        <Navbar />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,161,155,0.12),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(228,221,211,0.16),_transparent_22%)] opacity-90" />
        <main className="content-main relative z-10 animate-page-fade">{children}</main>
      </div>
    </div>
  )
}
