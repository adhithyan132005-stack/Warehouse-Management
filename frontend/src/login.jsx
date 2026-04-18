import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

export default function Login({ onLogin }) {
  const [Email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handlesubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await axios.post("https://warehouse-management-backend-t3q2.onrender.com/api/login", { email: Email, password })
      const token = response.data?.token
      if (!token) {
        throw new Error('Invalid login response')
      }
      localStorage.setItem('token', token)
      localStorage.setItem('userName', response.data.username || 'Warehouse')
      if (rememberMe) localStorage.setItem('rememberMe', 'true')

      const parseJwt = (tokenValue) => {
        try {
          const payload = tokenValue.split('.')[1]
          return JSON.parse(window.atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
        } catch {
          return null
        }
      }
      const tokenData = parseJwt(token)
      const role = tokenData?.role || 'user'
      localStorage.setItem('role', role)
      onLogin(role)
      navigate('/dashboard')
    } catch (err) {
      const errorData = err.response?.data
      const errorMessage = errorData?.error || errorData?.details || errorData?.message || 'Invalid email or password. Please try again.'
      const dbStatus = errorData?.dbStatus ? ` (DB State: ${errorData.dbStatus})` : ''
      setError(`${errorMessage}${dbStatus}`)
    } finally {
      setLoading(false)
    }

  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-600 opacity-20 blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#00A19B] opacity-20 blur-[100px]"></div>

      <div className="w-full max-w-md z-10 transition-all duration-300">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center mb-8">
          <img src="/logo.png" alt="Adhi Warehouse Logo" className="w-20 h-20 mb-4 object-contain drop-shadow-glass" />
          <h1 className="text-3xl font-bold text-white tracking-tight">Adhi Warehouse</h1>
          <p className="text-slate-400 mt-2 text-center text-sm">Sign in to manage inventory, orders, and locations.</p>
        </div>

        {/* Glass Card Form */}
        <div className="bg-slate-900/60 backdrop-blur-md shadow-glass border border-slate-700/50 rounded-2xl p-6 sm:p-8">
          <form onSubmit={handlesubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
              <input
                id="email"
                type="email"
                value={Email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors placeholder-slate-500 text-sm"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors placeholder-slate-500 text-sm"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((state) => !state)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center text-sm text-slate-300 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-brand-500 focus:ring-brand-500 focus:ring-offset-slate-900 cursor-pointer"
                />
                <span className="ml-2 group-hover:text-white transition-colors">Remember me</span>
              </label>
            </div>

            {error && <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg p-3 text-center">{error}</div>}

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-brand-500/25 flex justify-center items-center mt-6"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-400">
            Don’t have an account?{' '}
            <button 
              type="button" 
              onClick={() => navigate('/register')} 
              className="font-medium text-brand-400 hover:text-brand-300 transition-colors bg-transparent border-none cursor-pointer"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
