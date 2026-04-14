import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "./App.css"

export default function Login({ onLogin }) {
    const [Email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const handlesubmit = (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)
        const data = { email: Email, password: password }

        axios.post("http://localhost:4444/api/login", data)
            .then((res) => {
                console.log(res.data)
                if (res.data && res.data.token) {
                    const token = res.data.token
                    localStorage.setItem('token', token)
                    localStorage.setItem('userName', res.data.username)

                    const parseJwt = (token) => {
                        try {
                            const payload = token.split('.')[1]
                            const decoded = JSON.parse(window.atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
                            return decoded
                        } catch {
                            return null
                        }
                    }

                    const tokenData = parseJwt(token)
                    const role = tokenData?.role || 'user'
                    localStorage.setItem('role', role)
                    onLogin(role)
                    navigate("/dashboard")
                }
            })
            .catch((err) => {
                console.log(err.message)
                setError("Invalid email or password. Please try again.")
            })
            .finally(() => setLoading(false))
    }

    return (
        <div className="auth-screen">
            <div className="auth-card premium-card">
                <div className="auth-logo">🏢</div>

                <h2 className="auth-title">Welcome Back</h2>
                <p className="auth-subtitle">Sign in to Warehouse Management account</p>


                <form onSubmit={handlesubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="login-email">Email</label>
                        <input
                            id="login-email"
                            type="email"
                            value={Email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="login-password">Password</label>
                        <input
                            id="login-password"
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
                        {loading ? "Signing in…" : "Sign In →"}
                    </button>
                </form>

                <div className="auth-switch">
                    Don't have an account?{" "}
                    <span className="auth-switch-link" onClick={() => navigate("/register")}>
                        Create one
                    </span>
                </div>
            </div>
        </div>
    )
}