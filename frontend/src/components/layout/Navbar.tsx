import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CheckSquare, LogOut, Shield, User as UserIcon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-2.5 text-indigo-600 font-bold text-lg tracking-tight">
            <div className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-xs">
              <CheckSquare className="w-5 h-5" />
            </div>
            <span className="text-slate-900">Task<span className="text-indigo-600">Flow</span></span>
          </div>

          {/* User Profile Info & Logout */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
              {isAdmin ? (
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
              ) : (
                <UserIcon className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span className="text-xs sm:text-sm font-medium text-slate-800 max-w-[150px] sm:max-w-[220px] truncate">
                {user.email}
              </span>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  isAdmin
                    ? 'bg-indigo-600 text-white'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {user.role}
              </span>
            </div>

            <button
              id="header-logout-btn"
              onClick={handleLogout}
              className="inline-flex items-center space-x-1 text-slate-600 hover:text-rose-600 px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-rose-50 transition border border-transparent hover:border-rose-100 cursor-pointer"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
