import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

export default function PhoneSignup({ onLogin }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Phone input, 2: OTP verification
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [countdown, setCountdown] = useState(0)
  const [username, setUsername] = useState("")
  const inputRefs = useRef([])

  // Format phone number for display
  const formatPhoneDisplay = (phoneNum) => {
    if (!phoneNum) return ""
    const cleaned = phoneNum.replace(/\D/g, '')
    if (cleaned.length >= 10) {
      return `+${cleaned.slice(0, 2) || 91} ${cleaned.slice(2, 5)}-${cleaned.slice(5, 8)}-${cleaned.slice(8, 12)}`
    }
    return phoneNum
  }

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  // Handle phone input change
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 12) value = value.slice(0, 12)
    setPhone(value)
    setError("")
  }

  // Send OTP to phone
  const handleSendOTP = async (e) => {
    e.preventDefault()
    setError("")

    if (!phone || phone.length < 10) {
      setError("Please enter a valid phone number (at least 10 digits)")
      return
    }

    if (!username.trim()) {
      setError("Please enter a username")
      return
    }

    setLoading(true)
    try {
      await axios.post("https://warehouse-management-backend-t3q2.onrender.com/api/otp/send-phone", {
        phone: phone
      })
      setStep(2)
      setCountdown(60)
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send OTP. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle OTP input
  const handleOTPChange = (index, value) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    setError("")
  }

  // Handle OTP backspace
  const handleOTPKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Verify OTP and create account
  const handleVerifyOTP = async () => {
    const otpCode = otp.join("")
    
    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits of the OTP")
      return
    }

    setError("")
    setLoading(true)

    try {
      // Step 1: Verify OTP
      await axios.post("https://warehouse-management-backend-t3q2.onrender.com/api/otp/verify", {
        identifier: phone,
        otp: otpCode,
        type: "phone"
      })

      // Step 2: Login/Create user with phone auth
      const response = await axios.post("https://warehouse-management-backend-t3q2.onrender.com/api/otp/phone-auth", {
        identifier: phone,
        type: "phone"
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
      setError(err.response?.data?.error || "Failed to verify OTP. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP
  const handleResendOTP = async () => {
    setError("")
    setLoading(true)
    
    try {
      await axios.post("https://warehouse-management-backend-t3q2.onrender.com/api/otp/send-phone", {
        phone: phone
      })
      setOtp(["", "", "", "", "", ""])
      setCountdown(60)
      setError("") // Clear any previous errors
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend OTP")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-600 opacity-20 blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#00A19B] opacity-20 blur-[100px]"></div>

      <div className="w-full max-w-md z-10 transition-all duration-300">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center mb-8">
          <img src="/logo.png" alt="Adhi Warehouse Logo" className="w-20 h-20 mb-4 object-contain drop-shadow-glass" />
          <h1 className="text-3xl font-bold text-white tracking-tight">Create Account</h1>
          <p className="text-slate-400 mt-2 text-center text-sm">
            {step === 1 ? "Sign up with your phone number" : "Enter the verification code"}
          </p>
        </div>

        {/* Glass Card Form */}
        <div className="bg-slate-900/60 backdrop-blur-md shadow-glass border border-slate-700/50 rounded-2xl p-6 sm:p-8">

          {/* Progress Indicator */}
          <div className="flex gap-2 mb-6">
            <div className={`flex-1 h-1 rounded-full transition-colors ${step >= 1 ? 'bg-brand-500' : 'bg-slate-700'}`}></div>
            <div className={`flex-1 h-1 rounded-full transition-colors ${step >= 2 ? 'bg-brand-500' : 'bg-slate-700'}`}></div>
          </div>

          {step === 1 ? (
            // Step 1: Phone and Username Input
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Full Name / Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors placeholder-slate-500 text-sm"
                  placeholder="John Warehouse Manager"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 font-medium">+</span>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="w-full bg-slate-800/50 border border-slate-600 text-white rounded-lg pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors placeholder-slate-500 text-sm"
                    placeholder="919876543210"
                    required
                  />
                </div>
                {phone && (
                  <p className="text-xs text-slate-400 mt-2">Format: {formatPhoneDisplay(phone)}</p>
                )}
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg p-3 text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-brand-500/25 flex justify-center items-center"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending OTP...
                  </span>
                ) : (
                  'Send OTP'
                )}
              </button>
            </form>
          ) : (
            // Step 2: OTP Verification
            <div className="space-y-6">
              <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                <p className="text-sm text-slate-300">
                  OTP sent to <span className="font-semibold text-white">{formatPhoneDisplay(phone)}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Enter 6-Digit OTP
                </label>
                <div className="flex gap-2 justify-between">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(index, e)}
                      className="w-12 h-12 bg-slate-800/50 border border-slate-600 text-white rounded-lg text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg p-3 text-center">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleVerifyOTP}
                disabled={loading || otp.join("").length !== 6}
                className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-brand-500/25 flex justify-center items-center"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  'Verify & Create Account'
                )}
              </button>

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-slate-400">
                    Resend OTP in <span className="font-semibold text-brand-400">{countdown}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors bg-transparent border-none cursor-pointer"
                  >
                    Didn't receive code? Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 text-center text-sm text-slate-400">
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="font-medium text-brand-400 hover:text-brand-300 transition-colors bg-transparent border-none cursor-pointer"
            >
              ← Back to authentication options
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
