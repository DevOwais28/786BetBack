import { Router } from 'express';
import { 
  createDeposit, 
  uploadDepositProof, 
  getPaymentDetails 
} from '../controllers/deposit.controller';
import { authenticate } from '../middleware/auth.middleware';
import upload, { handleUploadError } from '../middleware/upload';

const router = Router();

// Public route to get payment details
router.get('/payment-details', getPaymentDetails);

// Protected routes (require authentication)
router.use(authenticate);

// Create a new deposit request
router.post('/user/deposit', createDeposit);

// Upload payment proof
router.post(
  '/deposit/upload-proof',
  upload.single('proof'),
  handleUploadError,
  uploadDepositProof
);

export default router;