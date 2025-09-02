import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function Protected({
  roles,
  children,
}: {
  roles?: ("ADMIN"|"OWNER"|"TENANT")[];
  children: JSX.Element;
}) {
  const { user, hasRole } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !hasRole(...roles)) return <Navigate to="/" replace />;
  return children;
}
