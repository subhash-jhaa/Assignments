import { Router } from 'express';
import * as usersController from './users.controller';
import { userIdValidator } from './users.validator';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/role.middleware';

const router = Router();

// All user management routes: must be authenticated AND admin
router.use(authenticate, requireAdmin);

// GET  /api/users      - list all users
router.get('/', usersController.getAllUsers);

// GET    /api/users/:id  - get user by ID (with tasks)
// DELETE /api/users/:id  - delete user
router
  .route('/:id')
  .get(userIdValidator, usersController.getUserById)
  .delete(userIdValidator, usersController.deleteUser);

export default router;
