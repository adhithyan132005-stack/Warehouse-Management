import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

export default function OTPRegister() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ username: "", email: "", phone: "", password: "", confirmPassword: "" })
  const [method, setMethod] = useState("email") // "email" or "phone"
  const [step, setStep] = useState(1) // 1: Details, 2: OTP Verification
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [countdown, setCountdown] = useState(0)
  const inputRefs = useRef([])

  useEffect(() => {
    let timer
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleRequestOTP = async (e) => {
    e.preventDefault()
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (method === "phone" && !formData.phone) {
      setError("Please enter a phone number to verify via SMS.")
      return
    }
    
    setError("")
    setLoading(true)

    try {
      // Send OTP based on selected method
      const endpoint = method === "email" ? "/api/otp/send-email" : "/api/otp/send-phone"
      const payload = method === "email" ? { email: formData.email } : { phone: formData.phone }

      await axios.post(`https://warehouse-management-backend-t3q2.onrender.com${endpoint}`, payload)
      
      setStep(2)
      setCountdown(60)
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send verification code. Check backend logs.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault()
    const otpString = otp.join("")
    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit OTP")
      return
    }
    setError("")
    setLoading(true)

    try {
      // 1. Verify OTP
      const identifier = method === "email" ? formData.email : formData.phone;
      await axios.post("https://warehouse-management-backend-t3q2.onrender.com/api/otp/verify", {
        identifier: identifier,
        otp: otpString,
        type: method
      })

      // 2. Register User
      await axios.post("https://warehouse-management-backend-t3q2.onrender.com/api/users", {
        username: formData.username,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password
      })

      navigate("/login")
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // OTP Handlers
  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) inputRefs.current[index + 1].focus()
  }
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) inputRefs.current[index - 1].focus()
  }
  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, 6).replace(/\D/g, "")
    if (pastedData) {
      const newOtp = [...otp]
      for (let i = 0; i < pastedData.length; i++) if (i < 6) newOtp[i] = pastedData[i]
      setOtp(newOtp)
      inputRefs.current[Math.min(pastedData.length, 5)].focus()
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden py-10">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-600 opacity-20 blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#00A19B] opacity-20 blur-[100px]"></div>

      <button onClick={() => navigate('/')} className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 transition-colors z-20">
        <span>←</span> Home
      </button>

      <div className="w-full max-w-md z-10 transition-all duration-300">
        <div className="flex flex-col items-center justify-center mb-8">
          <img src="/logo.png" alt="Logo" className="w-20 h-20 mb-4 object-contain drop-shadow-glass" />
          <h1 className="text-3xl font-bold text-white tracking-tight">{step === 1 ? "Create Account" : "Verify Identity"}</h1>
          <p className="text-slate-400 mt-2 text-center text-sm">
            {step === 1 ? "Join Adhi Warehouse today." : `Code sent to ${method === 'email' ? formData.email : formData.phone}`}
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md shadow-glass border border-slate-700/50 rounded-2xl p-6 sm:p-8">
          {step === 1 && (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                <input required type="text" name="username" value={formData.username} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-600 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-600 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number (Required for SMS verification)</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-600 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm" placeholder="+1234567890" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-600 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Confirm Password</label>
                <input required type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-600 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm" placeholder="••••••••" />
              </div>

              {/* Method Selector at the bottom of the form */}
              <div className="pt-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">How would you like to receive your verification code?</label>
                <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
                  <button
                    type="button"
                    onClick={() => setMethod("email")}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                      method === "email" ? "bg-brand-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Send to Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod("phone")}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                      method === "phone" ? "bg-[#00A19B] text-white shadow" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Send to Phone
                  </button>
                </div>
              </div>

              {error && <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg p-3 text-center">{error}</div>}

              <button type="submit" disabled={loading} className="w-full bg-brand-600 hover:bg-brand-500 text-white font-medium py-3 px-4 rounded-lg transition-all mt-4">
                {loading ? "Processing..." : `Send OTP to ${method === 'email' ? 'Email' : 'Phone'}`}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyAndRegister} className="space-y-6">
              <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input key={index} ref={el => inputRefs.current[index] = el} type="text" maxLength={1} value={digit} onChange={(e) => handleOtpChange(index, e.target.value)} onKeyDown={(e) => handleKeyDown(index, e)} className="w-10 h-12 sm:w-12 sm:h-14 text-center bg-slate-800/80 border border-slate-600 text-white text-xl font-bold rounded-lg focus:ring-2 focus:ring-brand-500 transition-all" />
                ))}
              </div>

              {error && <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg p-3 text-center">{error}</div>}

              <button type="submit" disabled={loading || otp.join("").length !== 6} className="w-full bg-[#00A19B] hover:bg-[#008f8a] text-white font-medium py-3 px-4 rounded-lg transition-all">
                {loading ? "Verifying..." : "Verify & Complete Registration"}
              </button>

              <div className="text-center mt-4 text-sm text-slate-400">
                <button type="button" onClick={() => setStep(1)} className="text-slate-500 hover:text-slate-300 transition-colors">
                  Go Back
                </button>
              </div>
            </form>
          )}

          {step === 1 && (
            <div className="mt-6 text-center text-sm text-slate-400 border-t border-slate-800 pt-6">
              Already have an account?{' '}
              <button onClick={() => navigate('/login')} className="font-medium text-[#00A19B] hover:text-[#008f8a] transition-colors">
                Sign in
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
