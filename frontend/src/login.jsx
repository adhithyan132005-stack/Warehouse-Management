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
      const response = await axios.post("http://localhost:4444/api/login", { email: Email, password })
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
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to manage inventory, orders, and locations.</p>
        </div>

        <form onSubmit={handlesubmit}>
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
                placeholder="Enter your password"
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

          <div className="form-group form-toggle">
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
          </div>

          {error && <p className="form-hint" style={{ color: '#fca5a5' }}>{error}</p>}

          <button type="submit" disabled={loading} className="btn btn--primary" style={{ width: '100%' }}>
            {loading ? 'Signing in...' : 'Continue'}
          </button>

          <button type="button" className="btn btn--secondary" onClick={() => navigate('/register')} style={{ width: '100%', marginTop: '14px' }}>
            Create account
          </button>

          <div className="form-hint" style={{ marginTop: '18px', textAlign: 'center' }}>
            Don’t have an account?{' '}
            <button type="button" onClick={() => navigate('/register')} style={{ background: 'transparent', border: 'none', color: '#4f8cff', cursor: 'pointer' }}>
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
