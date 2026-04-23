import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, isAuthenticated, authReady } = useAuth();

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#f6f1ea] flex items-center justify-center">
        <div className="rounded-2xl border border-[#eadccf] bg-white/90 px-6 py-4 text-[#6b5b52] shadow-sm">
          Loading session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
