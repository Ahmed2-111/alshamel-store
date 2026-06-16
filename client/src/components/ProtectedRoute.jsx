import { Navigate, Outlet } from "react-router-dom";
import { useStore } from "../context/StoreContext";

export default function ProtectedRoute({ admin = false }) {
  const { user } = useStore();
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
}
