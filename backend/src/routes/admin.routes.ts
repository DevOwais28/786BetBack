import { Router } from 'express';
import { approveTx } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  listUsers, updateUser, banUser, adjustBalance,
  gameSettings, analyticsSummary
} from '../controllers/admin.controller';

const router = Router();

router.patch(
  '/transactions/:id/approve',
  authenticate,
  authorize('super-admin', 'finance'),
  approveTx
);

router.get('/admin/users',            authenticate, authorize('super-admin'), listUsers);
router.patch('/admin/users/:id',      authenticate, authorize('super-admin'), updateUser);
router.patch('/admin/users/:id/ban',  authenticate, authorize('super-admin'), banUser);
router.post('/admin/users/balance',   authenticate, authorize('finance'), adjustBalance);
router.patch('/admin/game/settings',  authenticate, authorize('super-admin'), gameSettings);
// router.post('/admin/send-usdt',       authenticate, authorize('finance'), adminSendUSDT);
router.get('/admin/analytics',        authenticate, authorize('super-admin'), analyticsSummary);

export default router;