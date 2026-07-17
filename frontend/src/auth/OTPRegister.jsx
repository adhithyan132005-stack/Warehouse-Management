import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { GoogleLogin } from "@react-oauth/google"

const API = "https://warehouse-management-backend-t3q2.onrender.com"

const EyeOpen = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
  </svg>
)
const EyeClosed = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
  </svg>
)

const getStrength = (pwd) => {
  if (!pwd) return null
  const isStrong = pwd.length >= 10 && /[A-Z]/.test(pwd) && /\d/.test(pwd)
  const isMedium = pwd.length >= 8
  if (isStrong) return { label: "Strong", color: "#10b981", pct: "100%" }
  if (isMedium) return { label: "Medium", color: "#f59e0b", pct: "66%" }
  return { label: "Weak", color: "#ef4444", pct: "33%" }
}

export default function OTPRegister({ onLogin }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" })
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [gLoading, setGLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})
  const [focused, setFocused] = useState("")

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }))
    setFieldErrors(p => ({ ...p, [field]: "" }))
    setError("")
  }

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
      setSuccess("Account created! Redirecting to sign in...")
      setTimeout(() => navigate("/login"), 1600)
    } catch (err) {
      const d = err.response?.data
      const msg = Array.isArray(d?.error) ? d.error.join(", ") : (d?.error || d?.message || "Registration failed. Please try again.")
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
        if (onLogin) onLogin(res.data.role || "user")
        navigate("/dashboard")
      }
    } catch (err) {
      setError(err.response?.data?.error || "Google sign up failed.")
    } finally {
      setGLoading(false)
    }
  }

  const strength = getStrength(form.password)
  const pwdMatch = form.confirmPassword && form.password === form.confirmPassword

  const inputStyle = (field, hasPadRight = false) => ({
    width: "100%", boxSizing: "border-box",
    padding: hasPadRight ? "13px 48px 13px 16px" : "13px 16px",
    background: focused === field ? "rgba(79,70,229,0.08)" : "rgba(255,255,255,0.05)",
    border: `1.5px solid ${fieldErrors[field] ? "#ef4444" : focused === field ? "#6366f1" : "rgba(255,255,255,0.12)"}`,
    borderRadius: "12px", color: "#ffffff", fontSize: "15px",
    outline: "none", transition: "all 0.2s",
    boxShadow: focused === field ? "0 0 0 3px rgba(99,102,241,0.15)" : "none",
  })

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0f1e 0%, #0d1b2a 40%, #0a1628 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px", position: "relative", overflow: "hidden",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      
      <div style={{ position:"absolute", top:"-15%", right:"-10%", width:"55%", height:"55%", borderRadius:"50%", background:"radial-gradient(circle, rgba(79,70,229,0.22) 0%, transparent 70%)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:"-15%", left:"-10%", width:"50%", height:"50%", borderRadius:"50%", background:"radial-gradient(circle, rgba(0,161,155,0.18) 0%, transparent 70%)", pointerEvents:"none" }}/>

      
      <button
        onClick={() => navigate("/")}
        style={{ position:"absolute", top:"24px", left:"24px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", color:"#94a3b8", borderRadius:"10px", padding:"8px 14px", fontSize:"14px", cursor:"pointer", display:"flex", alignItems:"center", gap:"6px", zIndex:10 }}
        onMouseEnter={e => e.currentTarget.style.color="#fff"}
        onMouseLeave={e => e.currentTarget.style.color="#94a3b8"}
      >
        ← Home
      </button>

      <div style={{ width:"100%", maxWidth:"420px", position:"relative", zIndex:1, paddingTop:"24px", paddingBottom:"24px" }}>
        
        <div style={{ textAlign:"center", marginBottom:"28px" }}>
          <img src="/logo.png" alt="Logo" style={{ width:"60px", height:"60px", borderRadius:"14px", objectFit:"contain", marginBottom:"14px", boxShadow:"0 8px 32px rgba(79,70,229,0.3)" }}/>
          <h1 style={{ margin:"0 0 6px", fontSize:"26px", fontWeight:800, color:"#ffffff", letterSpacing:"-0.5px", fontFamily:"'Outfit',sans-serif" }}>Create account</h1>
          <p style={{ margin:0, fontSize:"14px", color:"#94a3b8" }}>Join Adhi Warehouse — it's free</p>
        </div>

        
        <div style={{ background:"rgba(15,20,40,0.85)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"20px", padding:"32px", boxShadow:"0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)", backdropFilter:"blur(20px)" }}>

          
          {success && (
            <div style={{ display:"flex", alignItems:"center", gap:"10px", background:"rgba(16,185,129,0.12)", border:"1px solid rgba(16,185,129,0.3)", borderRadius:"12px", padding:"12px 14px", marginBottom:"20px", color:"#34d399", fontSize:"14px" }}>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{flexShrink:0}}>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              {success}
            </div>
          )}

          
          {error && (
            <div style={{ display:"flex", alignItems:"flex-start", gap:"10px", background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:"12px", padding:"12px 14px", marginBottom:"20px", color:"#f87171", fontSize:"14px" }}>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{marginTop:"1px",flexShrink:0}}>
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} noValidate>

            
            <div style={{ marginBottom:"15px" }}>
              <label style={{ display:"block", marginBottom:"7px", fontSize:"13px", fontWeight:600, color:"#cbd5e1" }}>Full Name</label>
              <input
                id="r-name" type="text" value={form.username} placeholder="John Doe"
                style={inputStyle("username")}
                onFocus={() => setFocused("username")} onBlur={() => setFocused("")}
                onChange={set("username")}
              />
              {fieldErrors.username && <p style={{ color:"#f87171", fontSize:"12px", marginTop:"5px" }}>{fieldErrors.username}</p>}
            </div>

            
            <div style={{ marginBottom:"15px" }}>
              <label style={{ display:"block", marginBottom:"7px", fontSize:"13px", fontWeight:600, color:"#cbd5e1" }}>Email address</label>
              <input
                id="r-email" type="email" value={form.email} placeholder="you@example.com"
                style={inputStyle("email")}
                onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                onChange={set("email")}
              />
              {fieldErrors.email && <p style={{ color:"#f87171", fontSize:"12px", marginTop:"5px" }}>{fieldErrors.email}</p>}
            </div>

            
            <div style={{ marginBottom:"15px" }}>
              <label style={{ display:"block", marginBottom:"7px", fontSize:"13px", fontWeight:600, color:"#cbd5e1" }}>Password</label>
              <div style={{ position:"relative" }}>
                <input
                  id="r-password" type={showPwd ? "text" : "password"} value={form.password} placeholder="Min. 8 characters"
                  style={inputStyle("password", true)}
                  onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
                  onChange={set("password")}
                />
                <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position:"absolute", right:"14px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#64748b", cursor:"pointer", display:"flex", alignItems:"center" }}>
                  {showPwd ? <EyeOpen /> : <EyeClosed />}
                </button>
              </div>
              
              {strength && (
                <div style={{ marginTop:"8px" }}>
                  <div style={{ height:"4px", background:"rgba(255,255,255,0.1)", borderRadius:"99px", overflow:"hidden" }}>
                    <div style={{ height:"100%", width:strength.pct, background:strength.color, borderRadius:"99px", transition:"all 0.3s" }}/>
                  </div>
                  <p style={{ fontSize:"12px", color:strength.color, marginTop:"4px", fontWeight:500 }}>Strength: {strength.label}</p>
                </div>
              )}
              {fieldErrors.password && <p style={{ color:"#f87171", fontSize:"12px", marginTop:"5px" }}>{fieldErrors.password}</p>}
            </div>

            
            <div style={{ marginBottom:"20px" }}>
              <label style={{ display:"block", marginBottom:"7px", fontSize:"13px", fontWeight:600, color:"#cbd5e1" }}>Confirm Password</label>
              <div style={{ position:"relative" }}>
                <input
                  id="r-confirm"
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  placeholder="Repeat your password"
                  style={{
                    ...inputStyle("confirmPassword", true),
                    border: `1.5px solid ${fieldErrors.confirmPassword ? "#ef4444" : pwdMatch ? "#10b981" : focused === "confirmPassword" ? "#6366f1" : "rgba(255,255,255,0.12)"}`,
                    boxShadow: pwdMatch ? "0 0 0 3px rgba(16,185,129,0.12)" : focused === "confirmPassword" ? "0 0 0 3px rgba(99,102,241,0.15)" : "none",
                  }}
                  onFocus={() => setFocused("confirmPassword")} onBlur={() => setFocused("")}
                  onChange={set("confirmPassword")}
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)} style={{ position:"absolute", right:"14px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#64748b", cursor:"pointer", display:"flex", alignItems:"center" }}>
                  {showConfirm ? <EyeOpen /> : <EyeClosed />}
                </button>
              </div>
              {pwdMatch && <p style={{ fontSize:"12px", color:"#10b981", marginTop:"5px", display:"flex", alignItems:"center", gap:"4px" }}>
                <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                Passwords match
              </p>}
              {fieldErrors.confirmPassword && <p style={{ color:"#f87171", fontSize:"12px", marginTop:"5px" }}>{fieldErrors.confirmPassword}</p>}
            </div>

            
            <button
              type="submit"
              disabled={loading || gLoading}
              style={{
                width:"100%", padding:"14px",
                background: (loading || gLoading) ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg, #6366f1, #4f46e5)",
                border:"none", borderRadius:"12px", color:"#ffffff",
                fontSize:"15px", fontWeight:700, cursor:(loading||gLoading)?"not-allowed":"pointer",
                display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
                boxShadow:(loading||gLoading)?"none":"0 4px 20px rgba(99,102,241,0.35)",
                transition:"all 0.2s",
              }}
            >
              {loading ? (
                <>
                  <svg style={{animation:"spin 1s linear infinite"}} width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="4"/>
                    <path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Creating account...
                </>
              ) : "Create Account"}
            </button>
          </form>

          
          <div style={{ display:"flex", alignItems:"center", gap:"12px", margin:"22px 0" }}>
            <div style={{ flex:1, height:"1px", background:"rgba(255,255,255,0.1)" }}/>
            <span style={{ fontSize:"11px", color:"#475569", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px", whiteSpace:"nowrap" }}>or sign up with</span>
            <div style={{ flex:1, height:"1px", background:"rgba(255,255,255,0.1)" }}/>
          </div>

          
          <div style={{ display:"flex", justifyContent:"center" }}>
            {gLoading ? (
              <div style={{ display:"flex", alignItems:"center", gap:"8px", color:"#94a3b8", fontSize:"14px", height:"44px" }}>
                <svg style={{animation:"spin 1s linear infinite"}} width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="4"/>
                  <path fill="#94a3b8" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Connecting Google...
              </div>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google authentication failed.")}
                theme="filled_black"
                size="large"
                text="signup_with"
                shape="rectangular"
                width="348"
              />
            )}
          </div>

          
          <div style={{ marginTop:"22px", paddingTop:"18px", borderTop:"1px solid rgba(255,255,255,0.07)", textAlign:"center", fontSize:"14px", color:"#64748b" }}>
            Already have an account?{" "}
            <button onClick={() => navigate("/login")} style={{ background:"none", border:"none", color:"#00c5be", fontWeight:600, cursor:"pointer", fontSize:"14px" }}>
              Sign in
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: #475569 !important; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 1000px #1e1f3d inset !important; -webkit-text-fill-color: #ffffff !important; }
      `}</style>
    </div>
  )
}
