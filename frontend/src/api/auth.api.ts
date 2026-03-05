import { http } from "./http";
import type { AuthResponse, LoginRequest, SignupRequest } from "../types/auth";

export async function signup(req: SignupRequest) {
  const { data } = await http.post("/auth/signup", req);
  return data as { message: string };
}

export async function login(req: LoginRequest) {
  const { data } = await http.post("/auth/login", req);
  return data as AuthResponse;
}