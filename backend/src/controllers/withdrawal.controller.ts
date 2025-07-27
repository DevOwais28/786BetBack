import { Request, Response } from 'express';
import User from '../models/User';
import Transaction from '../models/transaction';

export const createWithdrawal = async (req: Request, res: Response) => {
  const { amount, method, accountDetails } = req.body;

  const user = await User.findById((req as any).user.id);
  if (!user || user.balance < +amount)
    return res.status(400).json({ message: 'Insufficient balance' });

  const tx = await Transaction.create({
    user: user._id,
    type: 'withdrawal',
    method,
    amount: +amount,
    accountDetails,
    status: 'pending'
  });

  // optionally lock balance (add a pendingWithdrawal field)
  res.json({ txId: tx._id });
};

export const uploadWithdrawalProof = async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ message: 'Screenshot required' });

  const { txId } = req.body;
  await Transaction.findByIdAndUpdate(txId, { screenshot: req.file.path });
  res.json({ message: 'Proof uploaded. Admin will process shortly.' });
};

export const adminSendUSDT = async (req: AuthRequest, res: Response) => {
    const { txId, txHash } = req.body;   // txHash from admin manual payout
    const tx = await Transaction.findById(txId);
    if (!tx || tx.type !== 'withdrawal' || tx.status !== 'pending')
      return res.status(400).json({ message: 'Bad tx' });
  
    tx.status = 'approved';
    tx.txHash = txHash;
    await tx.save();
    res.json({ message: 'USDT sent and marked complete' });
  };