import { Request, Response } from 'express';
import Transaction from '../models/transaction';
import fs from 'fs';
import path from 'path';

// Configure upload directory
const UPLOAD_DIR = path.join(__dirname, '../../uploads/payment-proofs');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Validate environment variables
function validateEnvVars() {
  const requiredVars = [
    'BINANCE_QR_CODE_URL',
    'BINANCE_WALLET_ADDRESS',
    'BINANCE_NETWORK',
    'EASYPAYSA_ACCOUNT_NUMBER',
    'EASYPAYSA_ACCOUNT_NAME',
    'JAZZCASH_ACCOUNT_NUMBER',
    'JAZZCASH_ACCOUNT_NAME',
    'USDT_TRC20_ADDR'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

// Initialize and validate on startup
validateEnvVars();

export const getPaymentDetails = async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        binance: {
          qrCode: process.env.BINANCE_QR_CODE_URL,
          address: process.env.BINANCE_WALLET_ADDRESS,
          network: process.env.BINANCE_NETWORK
        },
        easypaisa: {
          accountNumber: process.env.EASYPAYSA_ACCOUNT_NUMBER,
          accountName: process.env.EASYPAYSA_ACCOUNT_NAME
        },
        jazzcash: {
          accountNumber: process.env.JAZZCASH_ACCOUNT_NUMBER,
          accountName: process.env.JAZZCASH_ACCOUNT_NAME
        },
        usdt: {
          address: process.env.USDT_TRC20_ADDR,
          network: 'TRC20'
        }
      }
    });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to retrieve payment details'
    });
  }
};

export const createDeposit = async (req: Request, res: Response) => {
  try {
    const { amount, method, referenceNumber } = req.body;
    
    // Validate input
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ 
        success: false,
        message: 'Valid amount is required' 
      });
    }

    if (!['easypaisa', 'jazzcash', 'binance', 'usdt'].includes(method)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid payment method' 
      });
    }

    const tx = await Transaction.create({
      user: req.user.id, // Assuming you have user in request
      type: 'deposit',
      method,
      amount: Number(amount),
      referenceNumber,
      status: 'pending',
      createdAt: new Date()
    });

    res.json({ 
      success: true,
      message: 'Deposit request received. Please upload payment proof.',
      txId: tx._id 
    });
  } catch (error) {
    console.error('Error creating deposit:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create deposit request'
    });
  }
};

export const uploadDepositProof = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment proof screenshot is required' 
      });
    }

    const { txId, referenceNumber } = req.body;
    
    if (!txId) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        success: false, 
        message: 'Transaction ID is required' 
      });
    }

    // Validate transaction exists
    const transaction = await Transaction.findById(txId);
    if (!transaction) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }

    // Move file to permanent location
    const newPath = path.join(UPLOAD_DIR, `${txId}-${Date.now()}${path.extname(req.file.originalname)}`);
    fs.renameSync(req.file.path, newPath);

    await Transaction.findByIdAndUpdate(txId, {
      status: 'under_review',
      proofImage: path.basename(newPath),
      referenceNumber: referenceNumber || transaction.referenceNumber,
      updatedAt: new Date()
    });
    
    res.json({ 
      success: true, 
      message: 'Payment proof uploaded successfully',
      data: {
        proofImage: path.basename(newPath)
      }
    });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Error uploading deposit proof:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process payment proof' 
    });
  }
};