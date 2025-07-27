import { Router } from 'express';
import { createWithdrawal, uploadWithdrawalProof } from '../controllers/withdrawal.controller';
import upload from '../middleware/upload';

const router = Router();
router.post('/user/withdraw', createWithdrawal);
router.post('/upload-withdrawal-screenshot', upload.single('screenshot'), uploadWithdrawalProof);
export default router;