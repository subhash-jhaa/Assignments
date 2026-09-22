import { Role } from '@prisma/client';

// Request body shapes for auth endpoints
export interface RegisterBody {
  email: string;
  password: string;
  role?: Role;
}

export interface LoginBody {
  email: string;
  password: string;
}

// Safe user object (no password) returned in responses
export interface SafeUser {
  id: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

// Auth response payload from login
export interface AuthResponse {
  token: string;
  user: SafeUser;
}
