import type { UserRole } from "../types/auth";

export function getToken() {
  return localStorage.getItem("token");
}

export function getRole(): UserRole | null {
  const v = localStorage.getItem("role");
  return (v === "Admin" || v === "Client") ? v : null;
}

export function setAuth(token: string, role: UserRole, email: string) {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
  localStorage.setItem("email", email);
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("email");
}