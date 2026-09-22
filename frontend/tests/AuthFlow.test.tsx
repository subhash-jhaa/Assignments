import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import { LoginPage } from '../src/pages/LoginPage';
import { ProtectedRoute } from '../src/components/layout/ProtectedRoute';
import { getToken, getUser } from '../src/utils/storage';
import { api } from '../src/services/api';

describe('Integration Test: Authentication Flow & Route Protection', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('redirects unauthenticated user away from protected dashboard to login', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<div>Login Screen Test Anchor</div>} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div>Protected Dashboard Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Login Screen Test Anchor')).toBeInTheDocument();
      expect(screen.queryByText('Protected Dashboard Content')).not.toBeInTheDocument();
    });
  });

  it('stores JWT token in storage and authenticates successfully on valid login', async () => {
    // Mock the API login response cleanly inside the test
    const mockAuthResponse = {
      token: 'fake-test-jwt-token-12345',
      user: {
        id: 'test-user-id',
        email: 'testuser@example.com',
        role: 'USER' as const,
      },
    };

    vi.spyOn(api, 'login').mockResolvedValue(mockAuthResponse);

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div>Welcome to TaskFlow Dashboard</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'testuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Verify token & user are stored in storage and user is redirected
    await waitFor(() => {
      const storedToken = getToken();
      const storedUser = getUser();

      expect(storedToken).toBe('fake-test-jwt-token-12345');
      expect(storedUser).toBeTruthy();
      expect(storedUser?.email).toBe('testuser@example.com');
      expect(screen.getByText('Welcome to TaskFlow Dashboard')).toBeInTheDocument();
    });
  });

  it('displays API error banner when login fails', async () => {
    vi.spyOn(api, 'login').mockRejectedValue(new Error('Invalid email or password'));

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
  });
});
