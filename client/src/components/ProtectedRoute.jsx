import { Navigate, Outlet } from "react-router-dom";
import { useStore } from "../context/StoreContext";

export default function ProtectedRoute({ admin = false }) {
  const { user } = useStore();
  const adminRoles = ["admin", "super_admin"];
  const redirect = `${window.location.pathname}${window.location.search}`;
  if (!user) return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />;
  if (admin && !adminRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
