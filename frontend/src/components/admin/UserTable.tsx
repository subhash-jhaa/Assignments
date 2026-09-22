import React from 'react';
import type { User } from '../../types';
import { Shield, Trash2, User as UserIcon } from 'lucide-react';

interface UserTableProps {
  users: User[];
  currentUserId: string;
  onDeleteUser: (userId: string) => void;
  isDeletingId?: string | null;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  currentUserId,
  onDeleteUser,
  isDeletingId,
}) => {
  return (
    <div className="overflow-hidden bg-white shadow-xs border border-slate-200 rounded-xl">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 tracking-wider">
            <tr>
              <th scope="col" className="px-6 py-3.5">User</th>
              <th scope="col" className="px-6 py-3.5">Role</th>
              <th scope="col" className="px-6 py-3.5">Joined Date</th>
              <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => {
              const isCurrentUser = u.id === currentUserId;
              const formattedDate = u.createdAt
                ? new Date(u.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'N/A';

              return (
                <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                        {u.role === 'admin' ? (
                          <Shield className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <UserIcon className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 flex items-center gap-1.5">
                          <span>{u.email}</span>
                          {isCurrentUser && (
                            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-semibold">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">ID: {u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide ${
                        u.role === 'admin'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs">
                    {formattedDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                    {isCurrentUser ? (
                      <span className="text-slate-400 italic">Active</span>
                    ) : (
                      <button
                        onClick={() => onDeleteUser(u.id)}
                        disabled={isDeletingId === u.id}
                        className="inline-flex items-center text-rose-600 hover:text-rose-800 font-medium hover:bg-rose-50 px-2.5 py-1.5 rounded-md transition disabled:opacity-50 cursor-pointer"
                        title="Delete user"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        <span>Delete</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
