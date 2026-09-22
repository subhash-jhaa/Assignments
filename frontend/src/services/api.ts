import axios, { AxiosError } from 'axios';
import type {
  AuthResponse,
  CreateTaskPayload,
  LoginPayload,
  RegisterPayload,
  Task,
  UpdateTaskPayload,
  User,
} from '../types';
import { getToken, clearAuth } from '../utils/storage';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error('VITE_API_URL is not configured. Please set VITE_API_URL in your environment.');
}

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Centralized Bearer JWT injection
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Centralized 401 unauthorized session clearance
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    if (error.response?.status === 401) {
      clearAuth();
      // Only redirect if not already on an auth page
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register')
      ) {
        window.location.href = '/login?session_expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// Centralized API error parsing
export const formatApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'Unable to connect to the server. Please check your connection.';
    }

    const status = error.response.status;
    const data = error.response.data as { error?: string; message?: string } | undefined;
    const serverMsg = data?.error || data?.message;

    if (serverMsg) return serverMsg;

    switch (status) {
      case 400:
        return 'Invalid request data. Please check your input.';
      case 401:
        return 'Your session has expired. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'A conflict occurred. This record may already exist.';
      case 422:
        return 'Validation error. Please verify your submitted information.';
      case 500:
      case 502:
      case 503:
        return 'Something went wrong on the server. Please try again.';
      default:
        return `Request failed with status ${status}`;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
};

/* =========================================================================
   PRODUCTION API CLIENT (Single Source of Truth)
   ========================================================================= */

export const api = {
  // Authentication
  async register(payload: RegisterPayload): Promise<{ message: string; user: User }> {
    const res = await apiClient.post<{ message: string; user: User }>('/auth/register', payload);
    return res.data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/login', payload);
    return res.data;
  },

  // Tasks
  async getTasks(): Promise<Task[]> {
    const res = await apiClient.get<{ tasks: Task[] }>('/tasks');
    return res.data.tasks;
  },

  async createTask(payload: CreateTaskPayload): Promise<Task> {
    const res = await apiClient.post<{ task: Task }>('/tasks', payload);
    return res.data.task;
  },

  async updateTask(id: string, payload: UpdateTaskPayload): Promise<Task> {
    const res = await apiClient.put<{ task: Task }>(`/tasks/${id}`, payload);
    return res.data.task;
  },

  async deleteTask(id: string): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  },

  // Users (Admin only)
  async getUsers(): Promise<User[]> {
    const res = await apiClient.get<{ users: User[] }>('/users');
    return res.data.users;
  },

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },
};

// Named exports for convenient direct imports
export const register = api.register;
export const login = api.login;
export const getTasks = api.getTasks;
export const createTask = api.createTask;
export const updateTask = api.updateTask;
export const deleteTask = api.deleteTask;
export const getUsers = api.getUsers;
export const deleteUser = api.deleteUser;
