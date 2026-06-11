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

const getStrength = (pwd) => {
  if (!pwd) return null
  const strong = pwd.length >= 10 && /[A-Z]/.test(pwd) && /\d/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)
  const medium = pwd.length >= 8
  if (strong) return { label: "Strong", color: "text-emerald-400", bar: "bg-emerald-400", width: "w-full" }
  if (medium) return { label: "Medium", color: "text-yellow-400", bar: "bg-yellow-400", width: "w-2/3" }
  return { label: "Weak", color: "text-red-400", bar: "bg-red-400", width: "w-1/3" }
}

export default function OTPRegister({ onLogin }) {
  const navigate = useNavigate()

  // Form state
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" })
  const [showPwd, setShowPwd]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // UI state
  const [loading, setLoading]         = useState(false)
  const [gLoading, setGLoading]       = useState(false)
  const [error, setError]             = useState("")
  const [success, setSuccess]         = useState("")
  const [fieldErrors, setFieldErrors] = useState({})

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }))
    setFieldErrors(p => ({ ...p, [field]: "" }))
    setError("")
  }

  // ─── Validation ───────────────────────────────────────
  const validate = () => {
    const errs = {}
    if (!form.username.trim()) errs.username = "Full name is required"
    else if (form.username.trim().length < 3) errs.username = "Name must be at least 3 characters"

    if (!form.email.trim()) errs.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email address"

    if (!form.password) errs.password = "Password is required"
    else if (form.password.length < 8) errs.password = "Password must be at least 8 characters"

    if (!form.confirmPassword) errs.confirmPassword = "Please confirm your password"
    else if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match"

    return errs
  }

  // ─── Manual Register ──────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault()
    setError("")
    const errs = validate()
    if (Object.keys(errs).length) { setFieldErrors(errs); return }
    setFieldErrors({})
    setLoading(true)
    try {
      await axios.post(`${API}/api/users`, {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password
      })
      setSuccess("Account created! Redirecting to login...")
      setTimeout(() => navigate("/login"), 1500)
    } catch (err) {
      const d = err.response?.data
      const msg = Array.isArray(d?.error) ? d.error.join(", ") : (d?.error || d?.message || "Registration failed. Please try again.")
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // ─── Google Register ──────────────────────────────────
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
        if (onLogin) onLogin(res.data.role || "user")
        navigate("/dashboard")
      }
    } catch (err) {
      setError(err.response?.data?.error || "Google sign up failed. Please try again.")
    } finally {
      setGLoading(false)
    }
  }

  const handleGoogleError = () => setError("Google authentication failed. Please try again.")

  const strength = getStrength(form.password)

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden py-10">
      {/* Ambient glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-brand-600 opacity-[0.15] blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-[#00A19B] opacity-[0.15] blur-[110px] pointer-events-none" />

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
          <h1 className="text-3xl font-bold text-white tracking-tight">Create account</h1>
          <p className="text-slate-400 mt-1.5 text-sm text-center">Join Adhi Warehouse to get started</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 sm:p-8 shadow-2xl">

          {/* Success */}
          {success && (
            <div className="mb-5 flex items-center gap-2.5 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {success}
            </div>
          )}

          {/* Global error */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3.5">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} noValidate className="space-y-4">

            {/* Full Name */}
            <div>
              <label htmlFor="reg-username" className="block text-sm font-medium text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                id="reg-username"
                type="text"
                value={form.username}
                onChange={set("username")}
                placeholder="John Doe"
                className={`w-full bg-slate-800/60 border text-white rounded-xl px-4 py-3 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all ${fieldErrors.username ? "border-red-500/60" : "border-slate-600/60"}`}
              />
              {fieldErrors.username && <p className="mt-1.5 text-xs text-red-400">{fieldErrors.username}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-slate-300 mb-1.5">
                Email address
              </label>
              <input
                id="reg-email"
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="you@example.com"
                className={`w-full bg-slate-800/60 border text-white rounded-xl px-4 py-3 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all ${fieldErrors.email ? "border-red-500/60" : "border-slate-600/60"}`}
              />
              {fieldErrors.email && <p className="mt-1.5 text-xs text-red-400">{fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Min. 8 characters"
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
              {/* Strength bar */}
              {strength && (
                <div className="mt-2 space-y-1">
                  <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.bar} ${strength.width}`} />
                  </div>
                  <p className={`text-xs font-medium ${strength.color}`}>Password strength: {strength.label}</p>
                </div>
              )}
              {fieldErrors.password && <p className="mt-1.5 text-xs text-red-400">{fieldErrors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="reg-confirm" className="block text-sm font-medium text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="reg-confirm"
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={set("confirmPassword")}
                  placeholder="Repeat your password"
                  className={`w-full bg-slate-800/60 border text-white rounded-xl px-4 py-3 pr-12 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all ${fieldErrors.confirmPassword ? "border-red-500/60" : form.confirmPassword && form.password === form.confirmPassword ? "border-emerald-500/50" : "border-slate-600/60"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
              {form.confirmPassword && form.password === form.confirmPassword && (
                <p className="mt-1.5 text-xs text-emerald-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Passwords match
                </p>
              )}
              {fieldErrors.confirmPassword && <p className="mt-1.5 text-xs text-red-400">{fieldErrors.confirmPassword}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || gLoading}
              className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:scale-[1.01] shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2 mt-1"
            >
              {loading ? <><Spinner /> Creating account...</> : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center my-6">
            <div className="flex-grow border-t border-slate-700/80" />
            <span className="mx-3 text-xs text-slate-500 uppercase tracking-widest font-medium bg-slate-900/70 px-1">
              or sign up with
            </span>
            <div className="flex-grow border-t border-slate-700/80" />
          </div>

          {/* Google */}
          <div className="flex justify-center">
            {gLoading ? (
              <div className="flex items-center gap-2 text-slate-400 text-sm h-10">
                <Spinner />
                <span>Connecting Google...</span>
              </div>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                size="large"
                text="signup_with"
                shape="rectangular"
                width="340"
              />
            )}
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-slate-500 border-t border-slate-800 pt-5">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-[#00A19B] hover:text-[#00c5be] font-medium transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
