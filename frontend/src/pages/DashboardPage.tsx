import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, formatApiError } from '../services/api';
import { ROLES } from '../constants/roles';
import type { Task, User, TaskStatus } from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import {
  Plus,
  Loader2,
  CheckCircle2,
  Circle,
  Edit2,
  Trash2,
  Shield,
  User as UserIcon,
  AlertCircle,
  Inbox,
  Check,
  X,
  RefreshCw,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, isAdmin } = useAuth();

  // Tasks & Users state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Modal Create state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Inline Editing state: taskId
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

  // User Deletion state
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Fetch tasks and users (if admin)
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const taskList = await api.getTasks();
      setTasks(taskList);

      if (user?.role === ROLES.ADMIN) {
        const userList = await api.getUsers();
        setUsers(userList);
      }
    } catch (err: unknown) {
      setApiError(formatApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setCreateError('Task title is required');
      return;
    }

    setIsCreating(true);
    setCreateError(null);
    try {
      const created = await api.createTask({
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
      });
      setTasks((prev) => [created, ...prev]);
      setNewTitle('');
      setNewDescription('');
      setIsCreateModalOpen(false);
    } catch (err: unknown) {
      setCreateError(formatApiError(err));
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Status Toggle (Pending <-> Completed)
  const handleToggleStatus = async (task: Task) => {
    const nextStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
    );

    try {
      await api.updateTask(task.id, { status: nextStatus });
    } catch (err: unknown) {
      setApiError(formatApiError(err));
      fetchData(); // Revert on failure
    }
  };

  // Handle Inline Edit Start
  const startInlineEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  };

  const cancelInlineEdit = () => {
    setEditingTaskId(null);
    setEditTitle('');
    setEditDescription('');
  };

  // Handle Inline Edit Save
  const saveInlineEdit = async (taskId: string) => {
    if (!editTitle.trim()) {
      setApiError('Title cannot be empty');
      return;
    }

    setIsSavingEdit(true);
    try {
      const updated = await api.updateTask(taskId, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      cancelInlineEdit();
    } catch (err: unknown) {
      setApiError(formatApiError(err));
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Handle Delete Task
  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await api.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err: unknown) {
      setApiError(formatApiError(err));
    }
  };

  // Handle Delete User (Admin only)
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? All their associated tasks will be removed.')) {
      return;
    }

    setDeletingUserId(userId);
    try {
      await api.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setTasks((prev) => prev.filter((t) => t.userId !== userId));
    } catch (err: unknown) {
      setApiError(formatApiError(err));
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Top Banner & User Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
            <span>Logged in as: <strong className="text-slate-800">{user?.email}</strong></span>
            <span
              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                isAdmin
                  ? 'bg-indigo-600 text-white'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {user?.role}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchData}
            disabled={isLoading}
            className="p-2 text-slate-500 hover:text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition cursor-pointer"
            title="Refresh tasks"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <Button
            id="open-create-task-btn"
            onClick={() => {
              setCreateError(null);
              setIsCreateModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
            size="md"
          >
            Create Task
          </Button>
        </div>
      </div>

      {/* Dismissible API Error Banner */}
      {apiError && (
        <div
          id="dashboard-error-banner"
          className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center justify-between gap-3 shadow-xs"
          role="alert"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
            <span>{apiError}</span>
          </div>
          <button
            type="button"
            onClick={() => setApiError(null)}
            className="text-xs font-bold uppercase text-rose-600 hover:text-rose-800 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* =========================================================================
          SECTION 1: TASK MANAGEMENT
         ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">
            {isAdmin ? 'All System Tasks' : 'My Tasks'}
          </h2>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-sm font-medium">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          /* Empty State Handling */
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center my-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
              <Inbox className="w-6 h-6" />
            </div>
            <p className="text-base font-medium text-slate-700" role="status">
              No tasks yet — create one!
            </p>
            <div className="mt-4">
              <Button
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Create Task
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {/* Desktop View (>= 640px): Structured HTML Table */}
            <div className="hidden sm:block overflow-hidden bg-white shadow-xs border border-slate-200 rounded-xl">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-3.5 w-12">Status</th>
                    <th scope="col" className="px-6 py-3.5">Title & Description</th>
                    {isAdmin && (
                      <th scope="col" className="px-6 py-3.5">User ID</th>
                    )}
                    <th scope="col" className="px-6 py-3.5 text-right w-36">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tasks.map((task) => {
                    const isEditing = editingTaskId === task.id;
                    const isCompleted = task.status === 'completed';

                    return (
                      <tr key={task.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Status Toggle Checkbox */}
                        <td className="px-6 py-4 align-top">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(task)}
                            className="text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                            title={isCompleted ? 'Mark as pending' : 'Mark as completed'}
                            aria-label={isCompleted ? 'Mark as pending' : 'Mark as completed'}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-300 hover:text-indigo-600" />
                            )}
                          </button>
                        </td>

                        {/* Title & Description */}
                        <td className="px-6 py-4 align-top">
                          {isEditing ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                className="w-full text-sm font-semibold text-slate-900 border border-indigo-400 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                autoFocus
                              />
                              <textarea
                                rows={2}
                                className="w-full text-xs text-slate-600 border border-slate-300 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                placeholder="Description (optional)"
                              />
                            </div>
                          ) : (
                            <div>
                              <div
                                className={`text-sm font-semibold ${
                                  isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                                }`}
                              >
                                {task.title}
                              </div>
                              {task.description && (
                                <div
                                  className={`text-xs mt-1 whitespace-pre-wrap ${
                                    isCompleted ? 'text-slate-400' : 'text-slate-600'
                                  }`}
                                >
                                  {task.description}
                                </div>
                              )}
                              <span
                                className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  isCompleted
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {task.status}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Admin User ID Column */}
                        {isAdmin && (
                          <td className="px-6 py-4 align-top text-xs text-slate-400 font-mono">
                            {task.userId}
                          </td>
                        )}

                        {/* Actions */}
                        <td className="px-6 py-4 align-top text-right whitespace-nowrap">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => saveInlineEdit(task.id)}
                                disabled={isSavingEdit}
                                className="inline-flex items-center gap-1 text-xs font-semibold bg-indigo-600 text-white px-2.5 py-1 rounded-md hover:bg-indigo-700 transition cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Save</span>
                              </button>
                              <button
                                type="button"
                                onClick={cancelInlineEdit}
                                disabled={isSavingEdit}
                                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md hover:bg-slate-200 transition cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => startInlineEdit(task)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                                title="Edit task"
                                aria-label="Edit task"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                title="Delete task"
                                aria-label="Delete task"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View (< 640px): Stacked Cards (per prompt requirement) */}
            <div className="sm:hidden space-y-3">
              {tasks.map((task) => {
                const isEditing = editingTaskId === task.id;
                const isCompleted = task.status === 'completed';

                return (
                  <div
                    key={task.id}
                    className={`bg-white rounded-xl p-4 border shadow-xs ${
                      isCompleted ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 flex-1">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(task)}
                          className="mt-0.5 text-slate-400 cursor-pointer"
                          aria-label={isCompleted ? 'Mark as pending' : 'Mark as completed'}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                className="w-full text-sm font-semibold text-slate-900 border border-indigo-400 rounded-md px-2 py-1"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                              />
                              <textarea
                                rows={2}
                                className="w-full text-xs text-slate-600 border border-slate-300 rounded-md px-2 py-1"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => saveInlineEdit(task.id)}>Save</Button>
                                <Button size="sm" variant="ghost" onClick={cancelInlineEdit}>Cancel</Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h3
                                className={`text-sm font-semibold break-words ${
                                  isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                                }`}
                              >
                                {task.title}
                              </h3>
                              {task.description && (
                                <p
                                  className={`text-xs mt-1 ${
                                    isCompleted ? 'text-slate-400' : 'text-slate-600'
                                  }`}
                                >
                                  {task.description}
                                </p>
                              )}
                              <span
                                className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  isCompleted
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {task.status}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {!isEditing && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => startInlineEdit(task)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600"
                            aria-label="Edit task"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600"
                            aria-label="Delete task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 2: ADMIN USER MANAGEMENT (Visible only when user.role === 'admin')
         ========================================================================= */}
      {isAdmin && (
        <div className="pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600" />
                <h2 className="text-xl font-bold text-slate-900">User Management</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Admin privilege: view all registered accounts and remove users.
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
              {users.length} registered
            </span>
          </div>

          {users.length === 0 ? (
            <p className="text-sm text-slate-500 py-4" role="status">No users found.</p>
          ) : (
            <div className="overflow-hidden bg-white shadow-xs border border-slate-200 rounded-xl">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 tracking-wider">
                    <tr>
                      <th scope="col" className="px-6 py-3.5">User</th>
                      <th scope="col" className="px-6 py-3.5">Role</th>
                      <th scope="col" className="px-6 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => {
                      const isCurrent = u.id === user?.id;

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                                {u.role === ROLES.ADMIN ? (
                                  <Shield className="w-4 h-4 text-indigo-600" />
                                ) : (
                                  <UserIcon className="w-4 h-4 text-slate-500" />
                                )}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                  <span>{u.email}</span>
                                  {isCurrent && (
                                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold">
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
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                u.role === ROLES.ADMIN
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                            {isCurrent ? (
                              <span className="text-slate-400 italic">Current Session</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u.id)}
                                disabled={deletingUserId === u.id}
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
          )}
        </div>
      )}

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Task"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          {createError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-medium" role="alert">
              {createError}
            </div>
          )}

          <Input
            id="modal-task-title"
            label="Title"
            required
            placeholder="e.g. Implement user authentication"
            value={newTitle}
            onChange={(e) => {
              setNewTitle(e.target.value);
              if (createError) setCreateError(null);
            }}
            error={!newTitle.trim() && createError ? 'Title is required' : undefined}
            disabled={isCreating}
            autoFocus
          />

          <div>
            <label
              htmlFor="modal-task-description"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Description <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              id="modal-task-description"
              rows={3}
              className="w-full rounded-lg px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none placeholder:text-slate-400"
              placeholder="Add extra context or details..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              disabled={isCreating}
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              id="modal-submit-task-btn"
              type="submit"
              isLoading={isCreating}
            >
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
