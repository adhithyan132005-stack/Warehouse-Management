import { useNavigate } from "react-router-dom"

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-brand-600 opacity-20 blur-[150px] animate-pulse-slow pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#00A19B] opacity-20 blur-[120px] pointer-events-none"></div>

      {/* Navbar */}
      <nav className="w-full border-b border-white/10 bg-slate-900/50 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Adhi Warehouse" className="h-10 w-10 object-contain drop-shadow-glass" />
            <div>
              <h1 className="text-xl font-bold text-white leading-tight">Adhi Warehouse</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="text-slate-300 hover:text-white font-medium transition-colors px-4 py-2">
              Sign In
            </button>
            <button onClick={() => navigate('/register')} className="bg-[#00A19B] hover:bg-[#008f8a] text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-[#00A19B]/25 hidden sm:block">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 z-10 text-center mt-12 md:mt-0">
        <div className="max-w-4xl space-y-8 animate-fade-in-up">
          <span className="inline-block py-1 px-3 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-semibold mb-2">
            ✨ The Next Generation of Inventory
          </span>
          <h2 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight">
            Manage your warehouse with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00A19B] to-brand-400">precision</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Intelligent inventory tracking, real-time analytics, and seamless order fulfillment designed for modern teams.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <button onClick={() => navigate('/register')} className="w-full sm:w-auto bg-brand-600 hover:bg-brand-500 text-white font-medium py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-xl shadow-brand-500/25 text-lg">
              Start Free Trial
            </button>
            <button onClick={() => navigate('/login')} className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-medium py-4 px-8 rounded-xl transition-all duration-200 border border-slate-700 text-lg">
              Login to Dashboard
            </button>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-24 mb-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          
          <div className="bg-slate-900/60 backdrop-blur-md shadow-glass border border-slate-700/50 rounded-2xl p-8 text-left transition-transform hover:-translate-y-2 group">
            <div className="h-12 w-12 rounded-xl bg-brand-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Smart Inventory</h3>
            <p className="text-slate-400 leading-relaxed">Track stock levels in real-time with automated low-stock alerts and predictive analytics.</p>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md shadow-glass border border-slate-700/50 rounded-2xl p-8 text-left transition-transform hover:-translate-y-2 group">
            <div className="h-12 w-12 rounded-xl bg-[#00A19B]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🚚</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Order Tracking</h3>
            <p className="text-slate-400 leading-relaxed">End-to-end visibility from purchase order to final delivery with seamless tracking pages.</p>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md shadow-glass border border-slate-700/50 rounded-2xl p-8 text-left transition-transform hover:-translate-y-2 group">
            <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🏭</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">3D Visualization</h3>
            <p className="text-slate-400 leading-relaxed">Interactive 3D warehouse mapping to optimize your storage layout and picking routes.</p>
          </div>

        </div>
      </main>

      <footer className="border-t border-slate-800 bg-slate-950 py-8 z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-6 w-6 opacity-50" />
            <span className="text-slate-500 text-sm">© 2026 Adhi Warehouse. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
