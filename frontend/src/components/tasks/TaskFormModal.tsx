import React, { useState, useEffect } from 'react';
import type { CreateTaskPayload, Task, TaskStatus } from '../../types';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateTaskPayload) => Promise<void>;
  initialTask?: Task | null;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialTask,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when initialTask changes (editing vs creating)
  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setStatus(initialTask.status);
    } else {
      setTitle('');
      setDescription('');
      setStatus('pending');
    }
    setError(null);
  }, [initialTask, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
      });
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to save task');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTask ? 'Edit Task' : 'Create New Task'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-medium" role="alert">
            {error}
          </div>
        )}

        <Input
          id="task-title-input"
          label="Task Title"
          required
          placeholder="e.g. Set up PostgreSQL database"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError(null);
          }}
          error={!title.trim() && error ? 'Title cannot be empty' : undefined}
          autoFocus
        />

        <div>
          <label
            htmlFor="task-description-input"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Description <span className="text-slate-400 font-normal lowercase">(optional)</span>
          </label>
          <textarea
            id="task-description-input"
            rows={3}
            className="w-full rounded-lg px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none placeholder:text-slate-400"
            placeholder="Add relevant notes, details, or acceptance criteria..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Initial Status
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setStatus('pending')}
              className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition cursor-pointer ${
                status === 'pending'
                  ? 'bg-amber-50 border-amber-400 text-amber-900 font-semibold ring-1 ring-amber-400'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Pending
            </button>
            <button
              type="button"
              onClick={() => setStatus('completed')}
              className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition cursor-pointer ${
                status === 'completed'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold ring-1 ring-emerald-500'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            id="save-task-btn"
            type="submit"
            isLoading={isSubmitting}
          >
            {initialTask ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
