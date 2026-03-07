import { http } from "./http";
import type {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  SignupResponse,
} from "../types/auth";

export async function signup(req: SignupRequest): Promise<SignupResponse> {
  const { data } = await http.post<SignupResponse>("/auth/signup", req);
  return data;
}

export async function login(req: LoginRequest): Promise<AuthResponse> {
  const { data } = await http.post<AuthResponse>("/auth/login", req);
  return data;
}