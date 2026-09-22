import { TaskStatus } from '@prisma/client';

// Request body for creating a task
export interface CreateTaskBody {
  title: string;
  description?: string;
  status?: TaskStatus;
}

// Request body for updating a task (all fields optional)
export interface UpdateTaskBody {
  title?: string;
  description?: string;
  status?: TaskStatus;
}

// Query params for filtering tasks
export interface TaskQueryParams {
  status?: TaskStatus;
}

// Task with embedded user info (used in admin views)
export interface TaskWithUser {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    email: string;
    role: string;
  };
}
