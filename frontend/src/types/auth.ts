export type UserRole = "Admin" | "Client";

export type AuthResponse = {
  token: string;
  email: string;
  role: UserRole;
};

export type SignupRequest = {
  email: string;
  password: string;
};

export type SignupResponse = {
  message: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};