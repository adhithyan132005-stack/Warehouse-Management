import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

export default function LoginOTP({ onLogin }) {
  const [loginType, setLoginType] = useState("email")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState(1) // 1: send OTP, 2: verify OTP
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [timer, setTimer] = useState(0)
  const navigate = useNavigate()

  // Auto-decrement timer
  React.useEffect(() => {
    if (timer > 0) {
      const interval = setTimeout(() => setTimer(timer - 1), 1000)
      return () => clearTimeout(interval)
    }
  }, [timer])

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    setLoading(true)

    try {
      const payload = loginType === "email" 
        ? { email }
        : { phone: phone.startsWith('+') ? phone : `+91${phone}` }

      const endpoint = loginType === "email" 
        ? "https://warehouse-management-backend-t3q2.onrender.com/api/otp/send-email"
        : "https://warehouse-management-backend-t3q2.onrender.com/api/otp/send-phone"

      const response = await axios.post(endpoint, payload)
      
      setSuccessMessage(`OTP sent to your ${loginType}!`)
      setStep(2)
      setTimer(300) // 5 minutes
      setOtp("")
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.details || "Failed to send OTP. Please try again."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    setLoading(true)

    try {
      if (otp.length !== 6) {
        throw new Error("OTP must be 6 digits")
      }

      const identifier = loginType === "email" 
        ? email 
        : (phone.startsWith('+') ? phone : `+91${phone}`)

      // Step 1: Verify OTP
      const verifyResponse = await axios.post(
        "https://warehouse-management-backend-t3q2.onrender.com/api/otp/verify",
        {
          identifier,
          otp,
          type: loginType
        }
      )

      if (!verifyResponse.data.verified) {
        throw new Error("OTP verification failed")
      }

      // Step 2: Login with verified OTP
      const loginResponse = await axios.post(
        "https://warehouse-management-backend-t3q2.onrender.com/api/otp/login",
        {
          identifier,
          type: loginType
        }
      )

      const token = loginResponse.data?.token
      if (!token) {
        throw new Error('Invalid login response')
      }

      localStorage.setItem('token', token)
      localStorage.setItem('userName', loginResponse.data.username || 'Warehouse')
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
      const errorMessage = err.response?.data?.error || err.response?.data?.details || err.message || 'OTP verification failed. Please try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (timer > 0) return
    setStep(1)
    setOtp("")
    setTimer(0)
    setError("")
    setSuccessMessage("")
  }

  const formatPhoneForDisplay = (p) => {
    if (!p) return ""
    if (p.startsWith('+')) return p
    return `+91${p}`
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
          <p className="text-slate-400 mt-2 text-center text-sm">Sign in with Email or Phone OTP</p>
        </div>

        {/* Glass Card Form */}
        <div className="bg-slate-900/60 backdrop-blur-md shadow-glass border border-slate-700/50 rounded-2xl p-6 sm:p-8">
          
          {/* Login Type Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginType("email")
                setStep(1)
                setError("")
                setSuccessMessage("")
                setOtp("")
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                loginType === "email"
                  ? "bg-brand-600 text-white"
                  : "bg-slate-800/50 text-slate-400 hover:text-white"
              }`}
            >
              📧 Email
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginType("phone")
                setStep(1)
                setError("")
                setSuccessMessage("")
                setOtp("")
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                loginType === "phone"
                  ? "bg-brand-600 text-white"
                  : "bg-slate-800/50 text-slate-400 hover:text-white"
              }`}
            >
              📱 Phone
            </button>
          </div>

          {/* Step 1: Send OTP */}
          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="space-y-5">
              {loginType === "email" ? (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors placeholder-slate-500 text-sm"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-1.5">
                    Phone number
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value="+91"
                      disabled
                      className="w-16 bg-slate-700/50 border border-slate-600 text-white rounded-lg px-3 py-3 text-sm font-medium"
                    />
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="flex-1 bg-slate-800/50 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors placeholder-slate-500 text-sm"
                      placeholder="9876543210"
                      maxLength="10"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Indian phone number (10 digits)</p>
                </div>
              )}

              <div className="flex items-center">
                <label className="flex items-center text-sm text-slate-300 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-brand-500 focus:ring-brand-500 focus:ring-offset-slate-900 cursor-pointer"
                  />
                  <span className="ml-2 group-hover:text-white transition-colors">Remember me</span>
                </label>
              </div>

              {error && <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg p-3 text-center">{error}</div>}
              {successMessage && <div className="text-green-400 text-sm bg-green-400/10 border border-green-400/20 rounded-lg p-3 text-center">{successMessage}</div>}

              <button 
                type="submit" 
                disabled={loading || (loginType === "email" ? !email : !phone)}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-brand-500/25 flex justify-center items-center mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Sending OTP...
                  </span>
                ) : 'Send OTP'}
              </button>
            </form>
          ) : (
            /* Step 2: Verify OTP */
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Sent to: <span className="text-brand-400">{loginType === "email" ? email : formatPhoneForDisplay(phone)}</span>
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full bg-slate-800/50 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors placeholder-slate-500 text-sm text-center text-2xl letter-spacing-wide font-mono"
                  placeholder="000000"
                  maxLength="6"
                  required
                />
                <p className="text-xs text-slate-400 mt-2">Enter 6-digit OTP</p>
              </div>

              {timer > 0 ? (
                <div className="text-center text-sm">
                  <p className="text-slate-400">OTP expires in: <span className="text-brand-400 font-medium">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span></p>
                </div>
              ) : (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-sm text-brand-400 hover:text-brand-300 transition-colors cursor-pointer bg-transparent border-none"
                  >
                    Resend OTP
                  </button>
                </div>
              )}

              {error && <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg p-3 text-center">{error}</div>}

              <button 
                type="submit" 
                disabled={loading || otp.length !== 6}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-brand-500/25 flex justify-center items-center mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Verifying...
                  </span>
                ) : 'Verify & Login'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1)
                  setOtp("")
                  setError("")
                  setSuccessMessage("")
                }}
                className="w-full text-slate-400 hover:text-white font-medium py-2 px-4 rounded-lg transition-colors bg-transparent border-none cursor-pointer"
              >
                Back
              </button>
            </form>
          )}

          <div className="mt-8 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <button 
              type="button" 
              onClick={() => navigate('/register')} 
              className="font-medium text-brand-400 hover:text-brand-300 transition-colors bg-transparent border-none cursor-pointer"
            >
              Sign up
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700/50 text-center text-sm text-slate-400">
            Prefer password login?{' '}
            <button 
              type="button" 
              onClick={() => navigate('/login')} 
              className="font-medium text-brand-400 hover:text-brand-300 transition-colors bg-transparent border-none cursor-pointer"
            >
              Sign in with email & password
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
