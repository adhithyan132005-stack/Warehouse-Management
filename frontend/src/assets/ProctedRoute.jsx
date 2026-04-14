import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ isAllowed, children }) {
  if (isAllowed) {
    return children
  }

  const token = localStorage.getItem('token')
  return <Navigate to={token ? "/dashboard" : "/login"} />
}
