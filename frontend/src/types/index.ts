import type { UserRole } from '../constants/roles';

export { type UserRole } from '../constants/roles';

export type TaskStatus = 'pending' | 'completed';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: string;
  userId: string;
  userEmail?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterPayload {
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
}

export interface ApiError {
  error?: string;
  message?: string;
  status?: number;
}
