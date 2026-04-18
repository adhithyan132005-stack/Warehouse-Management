import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Register() {
  const navigate = useNavigate()
  const [Username, setUsername] = useState("")
  const [Email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const passwordStrength = () => {
    if (password.length > 10 && /[A-Z]/.test(password) && /\d/.test(password)) return 'Strong'
    if (password.length >= 7) return 'Medium'
    if (password.length > 0) return 'Weak'
    return ''
  }

  const handlesubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
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
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Register your team to manage warehouse operations.</p>
        </div>

        <form onSubmit={handlesubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">Full name</label>
            <input
              id="username"
              type="text"
              value={Username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              id="email"
              type="email"
              value={Email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Create a password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((state) => !state)}
                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm password</label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-input"
              placeholder="Repeat your password"
              required
            />
          </div>

          {password && (
            <p className="form-hint">Password strength: <strong>{passwordStrength()}</strong></p>
          )}

          {error && <p className="form-hint" style={{ color: '#fca5a5' }}>{error}</p>}

          <button type="submit" disabled={loading} className="btn btn--primary" style={{ width: '100%' }}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <button type="button" className="btn btn--secondary" onClick={() => navigate('/login')} style={{ width: '100%', marginTop: '14px' }}>
            Back to sign in
          </button>

          <div className="form-hint" style={{ marginTop: '18px', textAlign: 'center' }}>
            Already have an account?{' '}
            <button type="button" onClick={() => navigate('/login')} style={{ background: 'transparent', border: 'none', color: '#4f8cff', cursor: 'pointer' }}>
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
