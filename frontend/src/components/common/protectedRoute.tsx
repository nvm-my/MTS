import { Navigate } from "react-router-dom";
import { getRole, getToken } from "../../app/auth.store";
import type { UserRole } from "../../types/auth";
import type { JSX } from "react";

export default function ProtectedRoute(props: { children: JSX.Element; allow: UserRole[] }) {
  const token = getToken();
  const role = getRole();

  if (!token || !role) return <Navigate to="/login" replace />;
  if (!props.allow.includes(role)) return <Navigate to="/" replace />;

  return props.children;
}