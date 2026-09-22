import { Router } from 'express';
import * as authController from './auth.controller';
import { registerValidator, loginValidator } from './auth.validator';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// POST /api/auth/register
router.post('/register', registerValidator, authController.register);

// POST /api/auth/login
router.post('/login', loginValidator, authController.login);

// GET /api/auth/me  (protected)
router.get('/me', authenticate, authController.getMe);

export default router;
