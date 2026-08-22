import { Navigate, Outlet } from "react-router-dom";
import { useStore } from "../context/StoreContext";

export default function ProtectedRoute({ admin = false }) {
  const { user } = useStore();
  const adminRoles = ["admin", "super_admin"];
  if (!user) return <Navigate to="/login" replace />;
  if (admin && !adminRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
