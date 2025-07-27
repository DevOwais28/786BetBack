import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getMe, updateMe } from '../controllers/profile.controller';

const router = Router();
router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, updateMe);

export default router;