import { Request, Response } from 'express';
import Transaction from '../models/transaction';
import User from '../models/User';
import Round from '../models/Round';
import Bet from '../models/Bet';

export const listUsers = async (_: Request, res: Response) => {
  const users = await User.find().select('-password');
  res.json(users);
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await User.findByIdAndUpdate(id, req.body, { new: true }).select('-password');
  res.json(user);
};

export const banUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  await User.findByIdAndUpdate(id, { banned: true });
  res.json({ message: 'Banned' });
};

export const adjustBalance = async (req: Request, res: Response) => {
  const { userId, amount, reason } = req.body;
  await User.findByIdAndUpdate(userId, { $inc: { balance: amount } });
  await Transaction.create({ user: userId, type: 'manual', amount, status: 'approved', reason });
  res.json({ message: 'Balance adjusted' });
};

export const gameSettings = async (req: Request, res: Response) => {
  const { rtp, enabled } = req.body;
  process.env.GAME_RTP = rtp;
  process.env.GAME_ENABLED = enabled;
  res.json({ message: 'Settings updated' });
};

export const analyticsSummary = async (_: Request, res: Response) => {
  const totalDeposit = await Transaction.aggregate([
    { $match: { type: 'deposit', status: 'approved' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const totalWithdraw = await Transaction.aggregate([
    { $match: { type: 'withdrawal', status: 'approved' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const newUsers = await User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } });
  res.json({
    totalDeposit: totalDeposit[0]?.total || 0,
    totalWithdraw: totalWithdraw[0]?.total || 0,
    newUsers,
  });
};
export const approveTx = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { approve } = req.body;

  const tx = await Transaction.findById(id).populate('user');
  if (!tx) return res.status(404).json({ message: 'Tx not found' });

  tx.status = approve ? 'approved' : 'rejected';
  tx.approvedBy = (req as any).user.id;
  tx.approvedAt = new Date();
  await tx.save();

  // update balance
  if (approve && tx.type === 'deposit') {
    await User.findByIdAndUpdate(tx.user, { $inc: { balance: tx.amount } });
  }
  if (approve && tx.type === 'withdrawal') {
    await User.findByIdAndUpdate(tx.user, { $inc: { balance: -tx.amount } });
  }

  res.json({ message: `Transaction ${approve ? 'approved' : 'rejected'}` });
};