import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"; // Hook para verificar si el usuario está autenticado

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth(); // Verifica si el usuario está autenticado

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" replace />;
}
