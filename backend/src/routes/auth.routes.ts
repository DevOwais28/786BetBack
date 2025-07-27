import { Router } from 'express';
import { register, login, verify2FA, setup2FA } from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/2fa', verify2FA);
router.post('/2fa/setup', authenticate, authorize('super-admin', 'finance', 'moderator'), setup2FA);

export default router;