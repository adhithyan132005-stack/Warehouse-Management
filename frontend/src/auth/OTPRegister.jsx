import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { GoogleLogin } from "@react-oauth/google"

export default function OTPRegister({ onLogin }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("")
    setLoading(true)
    try {
      const response = await axios.post("https://warehouse-management-backend-t3q2.onrender.com/api/auth/google", {
        token: credentialResponse.credential
      })
      const token = response.data?.token
      if (token) {
        localStorage.setItem('token', token)
        localStorage.setItem('userName', response.data.username || 'Warehouse')
        localStorage.setItem('role', response.data.role || 'user')

        if (onLogin) onLogin(response.data.role || 'user')
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.error || "Google sign in failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError("Google authentication failed. Please try again.")
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden py-10">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-600 opacity-20 blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#00A19B] opacity-20 blur-[100px]"></div>

      <button onClick={() => navigate('/')} className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 transition-colors z-20">
        <span>←</span> Home
      </button>

      <div className="w-full max-w-md z-10 transition-all duration-300">
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center mb-8">
          <img src="/logo.png" alt="Adhi Warehouse Logo" className="w-20 h-20 mb-4 object-contain drop-shadow-glass" />
          <h1 className="text-3xl font-bold text-white tracking-tight">Create Account</h1>
          <p className="text-slate-400 mt-2 text-center text-sm">Join Adhi Warehouse with your Google account.</p>
        </div>

        {/* Glass Card */}
        <div className="bg-slate-900/60 backdrop-blur-md shadow-glass border border-slate-700/50 rounded-2xl p-6 sm:p-10 flex flex-col items-center gap-6">

          <p className="text-slate-300 text-sm text-center">
            Sign up instantly using your Google account — no password needed.
          </p>

          {error && (
            <div className="w-full text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg p-3 text-center">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <svg className="animate-spin h-5 w-5 text-brand-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Setting up account...
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_blue"
              size="large"
              text="signup_with"
              shape="rectangular"
              width="300"
            />
          )}

          <div className="mt-4 text-center text-sm text-slate-400 border-t border-slate-800 pt-6 w-full">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-medium text-[#00A19B] hover:text-[#008f8a] transition-colors"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
