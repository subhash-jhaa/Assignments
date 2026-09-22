import React from 'react';
import type { Task } from '../../types';
import { CheckCircle2, Circle, Clock, Edit2, Trash2, User as UserIcon } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggleStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  showOwner?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  showOwner = false,
}) => {
  const isCompleted = task.status === 'COMPLETED';

  const formattedDate = new Date(task.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      data-testid={`task-card-${task.id}`}
      className={`group bg-white rounded-xl p-5 border transition-all duration-200 shadow-xs hover:shadow-md ${
        isCompleted
          ? 'border-emerald-200/80 bg-emerald-50/20'
          : 'border-slate-200 hover:border-indigo-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Checkbox and Title */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            onClick={() => onToggleStatus(task)}
            className="mt-0.5 text-slate-400 hover:text-indigo-600 transition flex-shrink-0 focus:outline-none"
            title={isCompleted ? 'Mark as pending' : 'Mark as completed'}
            aria-label={isCompleted ? 'Mark as pending' : 'Mark as completed'}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <Circle className="w-5 h-5 hover:text-indigo-600 text-slate-300" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <h4
              className={`text-base font-semibold leading-snug break-words ${
                isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
              }`}
            >
              {task.title}
            </h4>

            {task.description && (
              <p
                className={`mt-1.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                  isCompleted ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {task.description}
              </p>
            )}

            {/* Metadata tags: Status pill, Date, and Owner (if admin) */}
            <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs">
              <span
                className={`px-2.5 py-0.5 rounded-full font-medium tracking-wide ${
                  isCompleted
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isCompleted ? 'Completed' : 'Pending'}
              </span>

              <span className="flex items-center text-slate-600 gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{formattedDate}</span>
              </span>

              {showOwner && task.userEmail && (
                <span className="flex items-center text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-medium gap-1">
                  <UserIcon className="w-3 h-3" />
                  <span>{task.userEmail}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons: Edit & Delete */}
        <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
            title="Edit task"
            aria-label="Edit task"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="Delete task"
            aria-label="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
