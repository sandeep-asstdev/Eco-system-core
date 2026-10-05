import { Router } from 'express';
import { login, signup, refreshToken, getMe, introspectToken } from './auth.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/introspect', introspectToken);
router.get('/me', authenticate, getMe);

export default router;
