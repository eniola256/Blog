import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check role access
  if (role) {
    // Admin can access everything
    if (user.role === "admin") {
      return children;
    }
    
    // Author can only access author routes
    if (role === "author" && (user.role === "author" || user.role === "admin")) {
      return children;
    }
    
    // If specific admin role required and user is not admin
    if (role === "admin" && user.role !== "admin") {
      return <Navigate to="/" />;
    }
    
    // If user doesn't have the required role
    if (user.role !== role) {
      return <Navigate to="/" />;
    }
  }

  return children;
}
