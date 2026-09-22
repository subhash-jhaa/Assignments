import { Router } from 'express';
import * as tasksController from './tasks.controller';
import {
  createTaskValidator,
  updateTaskValidator,
  taskIdValidator,
  taskQueryValidator,
} from './tasks.validator';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// All task routes require authentication
router.use(authenticate);

// GET  /api/tasks          - list tasks (admin: all, user: own, optional ?status=)
// POST /api/tasks          - create a task
router
  .route('/')
  .get(taskQueryValidator, tasksController.getTasks)
  .post(createTaskValidator, tasksController.createTask);

// GET    /api/tasks/:id    - get single task
// PUT    /api/tasks/:id    - update task
// DELETE /api/tasks/:id    - delete task
router
  .route('/:id')
  .get(taskIdValidator, tasksController.getTaskById)
  .put(updateTaskValidator, tasksController.updateTask)
  .delete(taskIdValidator, tasksController.deleteTask);

export default router;
