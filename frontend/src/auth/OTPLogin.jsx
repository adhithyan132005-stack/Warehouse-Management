import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { GoogleLogin } from "@react-oauth/google"

export default function OTPLogin({ onLogin }) {
  const [method, setMethod] = useState("email") // "email" or "phone"
  const [identifier, setIdentifier] = useState("")
  const [step, setStep] = useState(1) // 1: Enter ID, 2: Enter OTP
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [countdown, setCountdown] = useState(0)
  const inputRefs = useRef([])
  const navigate = useNavigate()

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
        
        onLogin(response.data.role || 'user')
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

  useEffect(() => {
    let timer
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const handleSendOTP = async (e) => {
    if (e) e.preventDefault()
    if (!identifier) {
      setError(`Please enter your ${method === 'email' ? 'email address' : 'phone number'}`)
      return
    }
    setError("")
    setLoading(true)

    try {
      const endpoint = method === 'email' ? '/api/otp/send-email' : '/api/otp/send-phone'
      const payload = method === 'email' ? { email: identifier } : { phone: identifier }
      
      await axios.post(`https://warehouse-management-backend-t3q2.onrender.com${endpoint}`, payload)
      
      setStep(2)
      setCountdown(60)
      setOtp(["", "", "", "", "", ""])
      // Focus first input automatically on next tick
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send OTP. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    const otpString = otp.join("")
    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit OTP")
      return
    }

    setError("")
    setLoading(true)

    try {
      // Step 1: Verify OTP
      await axios.post("https://warehouse-management-backend-t3q2.onrender.com/api/otp/verify", {
        identifier,
        otp: otpString,
        type: method
      })

      // Step 2: Login
      const loginResponse = await axios.post("https://warehouse-management-backend-t3q2.onrender.com/api/otp/login", {
        identifier,
        type: method
      })

      const token = loginResponse.data?.token
      if (token) {
        localStorage.setItem('token', token)
        localStorage.setItem('userName', loginResponse.data.username || 'Warehouse')
        localStorage.setItem('role', loginResponse.data.role || 'user')
        
        onLogin(loginResponse.data.role || 'user')
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP or login failed.")
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value

    setOtp(newOtp)

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, 6).replace(/\D/g, "")
    if (pastedData) {
      const newOtp = [...otp]
      for (let i = 0; i < pastedData.length; i++) {
        if (i < 6) newOtp[i] = pastedData[i]
      }
      setOtp(newOtp)
      // Focus the next empty input or the last one
      const focusIndex = Math.min(pastedData.length, 5)
      inputRefs.current[focusIndex].focus()
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-600 opacity-20 blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#00A19B] opacity-20 blur-[100px]"></div>

      {/* Back to Home */}
      <button 
        onClick={() => navigate('/')} 
        className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 transition-colors z-20"
      >
        <span>←</span> Home
      </button>

      <div className="w-full max-w-md z-10 transition-all duration-300">
        <div className="flex flex-col items-center justify-center mb-8">
          <img src="/logo.png" alt="Logo" className="w-20 h-20 mb-4 object-contain drop-shadow-glass" />
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {step === 1 ? "Welcome Back" : "Verify Your Identity"}
          </h1>
          <p className="text-slate-400 mt-2 text-center text-sm">
            {step === 1 
              ? "Sign in securely with a one-time password" 
              : `Enter the code sent to ${identifier}`}
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md shadow-glass border border-slate-700/50 rounded-2xl p-6 sm:p-8 animate-fade-in-up">
          
          {step === 1 && (
            <div className="space-y-6">
              {/* Method Selector */}
              <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
                <button
                  onClick={() => { setMethod("email"); setIdentifier(""); setError(""); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                    method === "email" ? "bg-brand-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Email
                </button>
                <button
                  onClick={() => { setMethod("phone"); setIdentifier(""); setError(""); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                    method === "phone" ? "bg-[#00A19B] text-white shadow" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Phone SMS
                </button>
              </div>

              <form onSubmit={handleSendOTP} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    {method === "email" ? "Email Address" : "Phone Number (with country code)"}
                  </label>
                  <input
                    type={method === "email" ? "email" : "tel"}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={method === "email" ? "you@example.com" : "+1234567890"}
                    className="w-full bg-slate-800/50 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors placeholder-slate-500"
                  />
                </div>

                {error && <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg p-3 text-center">{error}</div>}

                <button 
                  type="submit" 
                  disabled={loading || !identifier} 
                  className="w-full bg-brand-600 hover:bg-brand-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-lg shadow-brand-500/25 flex justify-center items-center"
                >
                  {loading ? "Sending..." : "Send Verification Code"}
                </button>
              </form>

              <div className="relative my-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700/80"></div>
                </div>
                <span className="relative px-3 bg-[#0f172a] text-xs text-slate-400 uppercase tracking-wider">
                  Or continue with
                </span>
              </div>

              <div className="flex justify-center w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_blue"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-10 h-12 sm:w-12 sm:h-14 text-center bg-slate-800/80 border border-slate-600 text-white text-xl font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                ))}
              </div>

              {error && <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg p-3 text-center">{error}</div>}

              <button 
                type="submit" 
                disabled={loading || otp.join("").length !== 6} 
                className="w-full bg-[#00A19B] hover:bg-[#008f8a] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-lg shadow-[#00A19B]/25 flex justify-center items-center"
              >
                {loading ? "Verifying..." : "Verify & Sign In"}
              </button>

              <div className="text-center mt-4 text-sm text-slate-400">
                Didn't receive the code?{" "}
                {countdown > 0 ? (
                  <span className="text-slate-500">Resend in {countdown}s</span>
                ) : (
                  <button type="button" onClick={() => handleSendOTP()} className="text-brand-400 hover:text-brand-300 font-medium">
                    Resend OTP
                  </button>
                )}
              </div>
              <div className="text-center mt-2">
                <button type="button" onClick={() => { setStep(1); setError(""); }} className="text-slate-500 hover:text-slate-300 text-xs transition-colors">
                  Change {method === 'email' ? 'email' : 'phone number'}
                </button>
              </div>
            </form>
          )}

          {step === 1 && (
            <div className="mt-8 text-center text-sm text-slate-400 border-t border-slate-800 pt-6">
              New to Adhi Warehouse?{' '}
              <button onClick={() => navigate('/register')} className="font-medium text-brand-400 hover:text-brand-300 transition-colors">
                Create an account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
