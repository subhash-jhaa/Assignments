import { Router } from 'express';
import * as tasksController from './tasks.controller';
import { createTaskValidator, updateTaskValidator } from './tasks.validator';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// All task routes require authentication
router.use(authenticate);

// GET  /api/tasks          - list tasks (admin: all, user: own)
// POST /api/tasks          - create a task
router
  .route('/')
  .get(tasksController.getTasks)
  .post(createTaskValidator, tasksController.createTask);

// GET    /api/tasks/:id    - get single task
// PUT    /api/tasks/:id    - update task
// DELETE /api/tasks/:id    - delete task
router
  .route('/:id')
  .get(tasksController.getTaskById)
  .put(updateTaskValidator, tasksController.updateTask)
  .delete(tasksController.deleteTask);

export default router;
