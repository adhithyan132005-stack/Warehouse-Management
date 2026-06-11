import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { GoogleLogin } from "@react-oauth/google"

const API = "https://warehouse-management-backend-t3q2.onrender.com"

const EyeOpen = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)
const EyeClosed = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
)

export default function OTPLogin({ onLogin }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [gLoading, setGLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})
  const [focused, setFocused] = useState("")

  const validate = () => {
    const errs = {}
    if (!email.trim()) errs.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email address"
    if (!password) errs.password = "Password is required"
    else if (password.length < 8) errs.password = "Password must be at least 8 characters"
    return errs
  }

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
      if (!token) throw new Error("Invalid response")
      localStorage.setItem("token", token)
      localStorage.setItem("userName", res.data.username || "Warehouse")
      if (rememberMe) localStorage.setItem("rememberMe", "true")
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
      setError(err.response?.data?.error || "Google sign in failed.")
    } finally {
      setGLoading(false)
    }
  }

  const s = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0f1e 0%, #0d1b2a 40%, #0a1628 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Inter', system-ui, sans-serif",
    },
    glow1: {
      position: "absolute", top: "-15%", left: "-10%",
      width: "55%", height: "55%", borderRadius: "50%",
      background: "radial-gradient(circle, rgba(79,70,229,0.25) 0%, transparent 70%)",
      pointerEvents: "none",
    },
    glow2: {
      position: "absolute", bottom: "-15%", right: "-10%",
      width: "50%", height: "50%", borderRadius: "50%",
      background: "radial-gradient(circle, rgba(0,161,155,0.2) 0%, transparent 70%)",
      pointerEvents: "none",
    },
    backBtn: {
      position: "absolute", top: "24px", left: "24px",
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.12)",
      color: "#94a3b8", borderRadius: "10px",
      padding: "8px 14px", fontSize: "14px",
      cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
      transition: "all 0.2s", zIndex: 10,
    },
    wrap: { width: "100%", maxWidth: "420px", position: "relative", zIndex: 1 },
    brand: { textAlign: "center", marginBottom: "32px" },
    logo: { width: "64px", height: "64px", borderRadius: "16px", objectFit: "contain", marginBottom: "16px", boxShadow: "0 8px 32px rgba(79,70,229,0.3)" },
    h1: { margin: "0 0 8px", fontSize: "28px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.5px", fontFamily: "'Outfit', sans-serif" },
    subtitle: { margin: 0, fontSize: "14px", color: "#94a3b8" },
    card: {
      background: "rgba(15,20,40,0.85)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "20px",
      padding: "36px",
      boxShadow: "0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
      backdropFilter: "blur(20px)",
    },
    errorBox: {
      display: "flex", alignItems: "flex-start", gap: "10px",
      background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
      borderRadius: "12px", padding: "12px 14px", marginBottom: "20px",
      color: "#f87171", fontSize: "14px",
    },
    fieldWrap: { marginBottom: "16px" },
    label: { display: "block", marginBottom: "7px", fontSize: "13px", fontWeight: 600, color: "#cbd5e1", letterSpacing: "0.2px" },
    inputWrap: { position: "relative" },
    input: (hasErr, isFocused) => ({
      width: "100%", boxSizing: "border-box",
      padding: "13px 16px",
      background: isFocused ? "rgba(79,70,229,0.08)" : "rgba(255,255,255,0.05)",
      border: `1.5px solid ${hasErr ? "#ef4444" : isFocused ? "#6366f1" : "rgba(255,255,255,0.12)"}`,
      borderRadius: "12px", color: "#ffffff", fontSize: "15px",
      outline: "none", transition: "all 0.2s",
      boxShadow: isFocused ? "0 0 0 3px rgba(99,102,241,0.15)" : "none",
    }),
    pwdInput: (hasErr, isFocused) => ({
      ...{
        width: "100%", boxSizing: "border-box",
        padding: "13px 48px 13px 16px",
        background: isFocused ? "rgba(79,70,229,0.08)" : "rgba(255,255,255,0.05)",
        border: `1.5px solid ${hasErr ? "#ef4444" : isFocused ? "#6366f1" : "rgba(255,255,255,0.12)"}`,
        borderRadius: "12px", color: "#ffffff", fontSize: "15px",
        outline: "none", transition: "all 0.2s",
        boxShadow: isFocused ? "0 0 0 3px rgba(99,102,241,0.15)" : "none",
      }
    }),
    eyeBtn: {
      position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
      background: "none", border: "none", color: "#64748b", cursor: "pointer",
      display: "flex", alignItems: "center", padding: "2px", transition: "color 0.2s",
    },
    fieldErr: { color: "#f87171", fontSize: "12px", marginTop: "6px" },
    row: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", marginTop: "4px" },
    checkLabel: { display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" },
    checkbox: {
      width: "16px", height: "16px", borderRadius: "5px",
      border: "2px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.05)",
      cursor: "pointer", accentColor: "#6366f1",
    },
    checkText: { fontSize: "13px", color: "#94a3b8" },
    submitBtn: (disabled) => ({
      width: "100%", padding: "14px",
      background: disabled ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg, #6366f1, #4f46e5)",
      border: "none", borderRadius: "12px",
      color: "#ffffff", fontSize: "15px", fontWeight: 700,
      cursor: disabled ? "not-allowed" : "pointer",
      display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
      transition: "all 0.2s",
      boxShadow: disabled ? "none" : "0 4px 20px rgba(99,102,241,0.35)",
    }),
    divider: { display: "flex", alignItems: "center", gap: "12px", margin: "24px 0" },
    divLine: { flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" },
    divText: { fontSize: "11px", color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", whiteSpace: "nowrap" },
    googleWrap: { display: "flex", justifyContent: "center" },
    gLoadWrap: { display: "flex", alignItems: "center", gap: "8px", color: "#94a3b8", fontSize: "14px", height: "44px" },
    footer: { marginTop: "24px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.07)", textAlign: "center", fontSize: "14px", color: "#64748b" },
    footerLink: { background: "none", border: "none", color: "#818cf8", fontWeight: 600, cursor: "pointer", fontSize: "14px" },
  }

  return (
    <div style={s.page}>
      <div style={s.glow1} />
      <div style={s.glow2} />

      <button style={s.backBtn} onClick={() => navigate("/")} onMouseEnter={e => e.currentTarget.style.color="#fff"} onMouseLeave={e => e.currentTarget.style.color="#94a3b8"}>
        ← Home
      </button>

      <div style={s.wrap}>
        <div style={s.brand}>
          <img src="/logo.png" alt="Adhi Warehouse" style={s.logo} />
          <h1 style={s.h1}>Welcome back</h1>
          <p style={s.subtitle}>Sign in to your Adhi Warehouse account</p>
        </div>

        <div style={s.card}>
          {error && (
            <div style={s.errorBox}>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{marginTop:"1px",flexShrink:0}}>
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} noValidate>
            {/* Email */}
            <div style={s.fieldWrap}>
              <label style={s.label} htmlFor="l-email">Email address</label>
              <input
                id="l-email"
                type="email"
                value={email}
                placeholder="you@example.com"
                style={s.input(fieldErrors.email, focused === "email")}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused("")}
                onChange={e => { setEmail(e.target.value); setFieldErrors(p => ({...p, email:""})) }}
              />
              {fieldErrors.email && <p style={s.fieldErr}>{fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div style={s.fieldWrap}>
              <label style={s.label} htmlFor="l-password">Password</label>
              <div style={s.inputWrap}>
                <input
                  id="l-password"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  placeholder="Enter your password"
                  style={s.pwdInput(fieldErrors.password, focused === "password")}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused("")}
                  onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({...p, password:""})) }}
                />
                <button type="button" style={s.eyeBtn} onClick={() => setShowPwd(v => !v)}>
                  {showPwd ? <EyeOpen /> : <EyeClosed />}
                </button>
              </div>
              {fieldErrors.password && <p style={s.fieldErr}>{fieldErrors.password}</p>}
            </div>

            {/* Remember me */}
            <div style={s.row}>
              <label style={s.checkLabel}>
                <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} style={s.checkbox} />
                <span style={s.checkText}>Remember me</span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || gLoading}
              style={s.submitBtn(loading || gLoading)}
            >
              {loading ? (
                <>
                  <svg style={{animation:"spin 1s linear infinite"}} width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="4"/>
                    <path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Signing in...
                </>
              ) : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div style={s.divider}>
            <div style={s.divLine}/>
            <span style={s.divText}>or continue with</span>
            <div style={s.divLine}/>
          </div>

          {/* Google */}
          <div style={s.googleWrap}>
            {gLoading ? (
              <div style={s.gLoadWrap}>
                <svg style={{animation:"spin 1s linear infinite"}} width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="4"/>
                  <path fill="#94a3b8" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Signing in with Google...
              </div>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google authentication failed.")}
                theme="filled_black"
                size="large"
                text="signin_with"
                shape="rectangular"
                width="348"
              />
            )}
          </div>

          {/* Footer */}
          <div style={s.footer}>
            Don't have an account?{" "}
            <button style={s.footerLink} onClick={() => navigate("/register")}>
              Create account
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: #475569; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 1000px #1e1f3d inset !important; -webkit-text-fill-color: #ffffff !important; }
      `}</style>
    </div>
  )
}
