import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute — Wraps routes that require authentication.
 * @param {string[]} allowedRoles  - List of roles that can access this route, e.g. ["doctor"]
 * @param {JSX.Element} children   - The page component to render if authorized
 */
function ProtectedRoute({ allowedRoles, children }) {
  const userRole = localStorage.getItem("user_role");

  if (!userRole) {
    // Not logged in at all → go to login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Logged in but wrong role → go to login
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
