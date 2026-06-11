import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { GoogleLogin } from "@react-oauth/google"

const API = "https://warehouse-management-backend-t3q2.onrender.com"

const EyeIcon = ({ open }) => open ? (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
) : (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
)

const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
)

export default function OTPLogin({ onLogin }) {
  const navigate = useNavigate()

  // Form state
  const [email, setEmail]           = useState("")
  const [password, setPassword]     = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPwd, setShowPwd]       = useState(false)

  // UI state
  const [loading, setLoading]       = useState(false)
  const [gLoading, setGLoading]     = useState(false)
  const [error, setError]           = useState("")
  const [fieldErrors, setFieldErrors] = useState({})

  // ─── Validation ───────────────────────────────────────
  const validate = () => {
    const errs = {}
    if (!email.trim()) errs.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email address"
    if (!password) errs.password = "Password is required"
    else if (password.length < 8) errs.password = "Password must be at least 8 characters"
    return errs
  }

  // ─── Manual Login ─────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    const errs = validate()
    if (Object.keys(errs).length) { setFieldErrors(errs); return }
    setFieldErrors({})
    setLoading(true)
    try {
      const res = await axios.post(`${API}/api/login`, { email: email.trim(), password })
      const token = res.data?.token
      if (!token) throw new Error("Invalid response from server")
      localStorage.setItem("token", token)
      localStorage.setItem("userName", res.data.username || "Warehouse")
      if (rememberMe) localStorage.setItem("rememberMe", "true")

      // Decode role from JWT
      const payload = token.split(".")[1]
      const decoded = JSON.parse(window.atob(payload.replace(/-/g, "+").replace(/_/g, "/")))
      const role = decoded?.role || "user"
      localStorage.setItem("role", role)
      onLogin(role)
      navigate("/dashboard")
    } catch (err) {
      const d = err.response?.data
      const msg = Array.isArray(d?.error) ? d.error.join(", ") : (d?.error || d?.message || "Invalid email or password.")
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // ─── Google Login ─────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse) => {
    setError("")
    setGLoading(true)
    try {
      const res = await axios.post(`${API}/api/auth/google`, { token: credentialResponse.credential })
      const token = res.data?.token
      if (token) {
        localStorage.setItem("token", token)
        localStorage.setItem("userName", res.data.username || "Warehouse")
        localStorage.setItem("role", res.data.role || "user")
        onLogin(res.data.role || "user")
        navigate("/dashboard")
      }
    } catch (err) {
      setError(err.response?.data?.error || "Google sign in failed. Please try again.")
    } finally {
      setGLoading(false)
    }
  }

  const handleGoogleError = () => setError("Google authentication failed. Please try again.")

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] rounded-full bg-brand-600 opacity-[0.15] blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-[#00A19B] opacity-[0.15] blur-[110px] pointer-events-none" />

      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors z-20 group"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Home
      </button>

      <div className="w-full max-w-md z-10">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 mb-4 rounded-2xl overflow-hidden ring-2 ring-white/10 shadow-xl">
            <img src="/logo.png" alt="Adhi Warehouse" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back</h1>
          <p className="text-slate-400 mt-1.5 text-sm text-center">Sign in to your Adhi Warehouse account</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 sm:p-8 shadow-2xl">

          {/* Global error */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3.5">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Manual Form */}
          <form onSubmit={handleLogin} noValidate className="space-y-4">

            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-slate-300 mb-1.5">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: "" })) }}
                placeholder="you@example.com"
                className={`w-full bg-slate-800/60 border text-white rounded-xl px-4 py-3 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all ${fieldErrors.email ? "border-red-500/60" : "border-slate-600/60"}`}
              />
              {fieldErrors.email && <p className="mt-1.5 text-xs text-red-400">{fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: "" })) }}
                  placeholder="Enter your password"
                  className={`w-full bg-slate-800/60 border text-white rounded-xl px-4 py-3 pr-12 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all ${fieldErrors.password ? "border-red-500/60" : "border-slate-600/60"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <EyeIcon open={showPwd} />
                </button>
              </div>
              {fieldErrors.password && <p className="mt-1.5 text-xs text-red-400">{fieldErrors.password}</p>}
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${rememberMe ? "bg-brand-600 border-brand-600" : "border-slate-500 bg-slate-800"}`}>
                    {rememberMe && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                </div>
                <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors select-none">Remember me</span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || gLoading}
              className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:scale-[1.01] shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <><Spinner /> Signing in...</> : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center my-6">
            <div className="flex-grow border-t border-slate-700/80" />
            <span className="mx-3 text-xs text-slate-500 uppercase tracking-widest font-medium bg-slate-900/70 px-1">
              or continue with
            </span>
            <div className="flex-grow border-t border-slate-700/80" />
          </div>

          {/* Google */}
          <div className="flex justify-center">
            {gLoading ? (
              <div className="flex items-center gap-2 text-slate-400 text-sm h-10">
                <Spinner />
                <span>Signing in with Google...</span>
              </div>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                size="large"
                text="signin_with"
                shape="rectangular"
                width="340"
              />
            )}
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-slate-500 border-t border-slate-800 pt-5">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
            >
              Create account
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
