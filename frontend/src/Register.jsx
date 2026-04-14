
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./App.css"

export default function Register() {
  const navigate = useNavigate()
  const [Username, setUsername] = useState("")
  const [Email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handlesubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const data = { username: Username, email: Email, password: password }

    try {
      const response = await fetch("http://localhost:4444/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      console.log(result)
      if (response.ok) {
        navigate("/login")
      } else {
        setError(result.message || "Registration failed. Please try again.")
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card premium-card">
        <div className="auth-logo">📦</div>

        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join warehouse management today</p>


        <form onSubmit={handlesubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="reg-username">Username</label>
            <input
              id="reg-username"
              type="text"
              value={Username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              value={Email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-danger mt-1" style={{ textAlign: 'center', fontSize: '0.85rem' }}>
              ⚠ {error}
            </p>
          )}


          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Creating account…" : "Create Account →"}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account?{" "}
          <span className="auth-switch-link" onClick={() => navigate("/login")}>
            Sign in
          </span>
        </div>
      </div>
    </div>
  )
}