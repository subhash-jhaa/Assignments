import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from '../src/components/tasks/TaskCard';
import type { Task } from '../src/types';

const mockTask: Task = {
  id: 'task-test-1',
  title: 'Implement unit testing with Vitest',
  description: 'Write comprehensive tests for UI components and API integration.',
  status: 'pending',
  userId: 'user-1',
  userEmail: 'developer@example.com',
  createdAt: '2026-09-22T10:00:00.000Z',
};

describe('Component Test: TaskCard UI & Actions', () => {
  it('renders task details, status, and description', () => {
    render(
      <TaskCard
        task={mockTask}
        onToggleStatus={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Implement unit testing with Vitest')).toBeInTheDocument();
    expect(screen.getByText('Write comprehensive tests for UI components and API integration.')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('triggers onToggleStatus callback when checkbox button is clicked', () => {
    const handleToggle = vi.fn();
    render(
      <TaskCard
        task={mockTask}
        onToggleStatus={handleToggle}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const toggleButton = screen.getByLabelText(/mark as completed/i);
    fireEvent.click(toggleButton);

    expect(handleToggle).toHaveBeenCalledTimes(1);
    expect(handleToggle).toHaveBeenCalledWith(mockTask);
  });

  it('triggers onEdit callback when edit icon is clicked', () => {
    const handleEdit = vi.fn();
    render(
      <TaskCard
        task={mockTask}
        onToggleStatus={vi.fn()}
        onEdit={handleEdit}
        onDelete={vi.fn()}
      />
    );

    const editButton = screen.getByLabelText(/edit task/i);
    fireEvent.click(editButton);

    expect(handleEdit).toHaveBeenCalledTimes(1);
    expect(handleEdit).toHaveBeenCalledWith(mockTask);
  });

  it('triggers onDelete callback when delete icon is clicked', () => {
    const handleDelete = vi.fn();
    render(
      <TaskCard
        task={mockTask}
        onToggleStatus={vi.fn()}
        onEdit={vi.fn()}
        onDelete={handleDelete}
      />
    );

    const deleteButton = screen.getByLabelText(/delete task/i);
    fireEvent.click(deleteButton);

    expect(handleDelete).toHaveBeenCalledTimes(1);
    expect(handleDelete).toHaveBeenCalledWith('task-test-1');
  });

  it('displays owner email tag when showOwner prop is true', () => {
    render(
      <TaskCard
        task={mockTask}
        onToggleStatus={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        showOwner={true}
      />
    );

    expect(screen.getByText('developer@example.com')).toBeInTheDocument();
  });
});
