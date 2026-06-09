
import { createRoot } from 'react-dom/client'
import './index.css'

import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()
const hasValidGoogleClientId = Boolean(googleClientId && !googleClientId.includes('your-google-client-id'))

if (!hasValidGoogleClientId) {
  console.error('Google OAuth is not configured. Set VITE_GOOGLE_CLIENT_ID in frontend/.env to a valid Google OAuth Web client ID and restart the dev server.')
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    {hasValidGoogleClientId ? (
      <GoogleOAuthProvider clientId={googleClientId}>
        <App />
      </GoogleOAuthProvider>
    ) : (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold mb-2">Google Sign-In is not configured</h1>
          <p className="text-slate-400">
            Set a valid VITE_GOOGLE_CLIENT_ID in frontend/.env and restart the frontend server.
          </p>
        </div>
      </div>
    )}
  </BrowserRouter>
)
