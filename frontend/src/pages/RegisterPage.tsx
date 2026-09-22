import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, formatApiError } from '../services/api';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { CheckSquare, AlertCircle, ArrowRight, Shield, User } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const validate = (): boolean => {
    const errs: { email?: string; password?: string; confirmPassword?: string } = {};

    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please provide a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await api.register({
        email: email.trim(),
        password,
        role,
      });
      // Redirect to login with confirmation message (per prompt requirement)
      navigate('/login', {
        state: { message: `Registration successful! Please sign in as ${role === 'ADMIN' ? 'Admin' : 'User'}.` },
      });
    } catch (err: unknown) {
      setApiError(formatApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex p-3 bg-indigo-600 text-white rounded-2xl shadow-md mb-3">
          <CheckSquare className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Create an account
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign up to begin tracking and managing tasks
        </p>
      </div>

      {/* Card widened to lg to fit 2-column password row */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm sm:rounded-2xl border border-slate-200 sm:px-10">
          {apiError && (
            <div
              id="register-error-banner"
              className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center justify-between gap-2"
              role="alert"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>{apiError}</span>
              </div>
              <button
                type="button"
                onClick={() => setApiError(null)}
                className="text-[11px] font-bold uppercase text-rose-600 hover:text-rose-800 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              id="register-email"
              label="Email Address"
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              error={errors.email}
              disabled={isSubmitting}
              autoComplete="email"
            />

            {/* Password + Confirm Password — two columns side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="register-password"
                label="Password"
                type="password"
                required
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                error={errors.password}
                disabled={isSubmitting}
                autoComplete="new-password"
              />

              <Input
                id="register-confirm-password"
                label="Confirm Password"
                type="password"
                required
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                error={errors.confirmPassword}
                disabled={isSubmitting}
                autoComplete="new-password"
              />
            </div>

            {/* Role Selection: USER or ADMIN */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Account Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  id="role-user-btn"
                  onClick={() => setRole('USER')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    role === 'USER'
                      ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 shadow-xs ring-2 ring-indigo-600/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <User className={`w-5 h-5 mb-1 ${role === 'USER' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">Normal User</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Manage own tasks</span>
                </button>

                <button
                  type="button"
                  id="role-admin-btn"
                  onClick={() => setRole('ADMIN')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    role === 'ADMIN'
                      ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 shadow-xs ring-2 ring-indigo-600/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Shield className={`w-5 h-5 mb-1 ${role === 'ADMIN' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">Admin</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Manage all tasks & users</span>
                </button>
              </div>
            </div>

            <Button
              id="register-submit-btn"
              type="submit"
              className="w-full mt-2"
              size="lg"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create {role === 'ADMIN' ? 'Admin' : 'User'} Account
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-500 underline underline-offset-2"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
