import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { GoogleLogin } from "@react-oauth/google"
import axios from "axios"

export default function AuthGateway({ onLogin }) {
  const navigate = useNavigate()
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("")
    setGoogleLoading(true)
    try {
      const response = await axios.post("https://warehouse-management-backend-t3q2.onrender.com/api/auth/google", {
        token: credentialResponse.credential
      })
      const token = response.data?.token
      if (token) {
        localStorage.setItem('token', token)
        localStorage.setItem('userName', response.data.username || 'Warehouse')
        localStorage.setItem('role', response.data.role || 'user')
        
        onLogin(response.data.role || 'user')
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.error || "Google sign in failed. Please try again.")
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError("Google authentication failed. Please try again.")
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
          <p className="text-slate-400 mt-2 text-center text-sm">Secure warehouse management system</p>
        </div>

        {/* Glass Card */}
        <div className="bg-slate-900/60 backdrop-blur-md shadow-glass border border-slate-700/50 rounded-2xl p-6 sm:p-8">
          
          {/* Title */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-2">Get Started</h2>
            <p className="text-slate-400 text-sm">Choose your preferred authentication method</p>
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg p-3 mb-6 text-center">
              {error}
            </div>
          )}

          {/* Google OAuth Button */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wide">Sign in with Google</h3>
            <div className="flex justify-center">
              <div className="w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  text="signup_with"
                  width="100%"
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-700"></div>
            <span className="text-xs text-slate-500 font-medium">OR</span>
            <div className="flex-1 h-px bg-slate-700"></div>
          </div>

          {/* Phone Number Option */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wide">Sign in with Phone</h3>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => navigate('/phone-login')}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 border border-slate-600 hover:border-slate-500"
              >
                🔐 Sign In
              </button>
              <button
                type="button"
                onClick={() => navigate('/phone-signup')}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-brand-500/25"
              >
                ✨ Create Account
              </button>
            </div>
          </div>

        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>Secure authentication • OTP Verification • Google OAuth</p>
        </div>

      </div>
    </div>
  )
}
