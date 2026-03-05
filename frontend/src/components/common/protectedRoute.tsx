import { Navigate } from "react-router-dom";
import { getRole, isAuthenticated } from "../../app/auth.store";
import type { UserRole } from "../../types/auth";
import type { JSX } from "react";

type Props = {
  children: JSX.Element;
  allow: UserRole[];
};

export default function ProtectedRoute({ children, allow }: Props) {
  const authenticated = isAuthenticated();
  const role = getRole();

  // Not logged in → go to login page
  if (!authenticated || !role) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but role not allowed
  if (!allow.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}