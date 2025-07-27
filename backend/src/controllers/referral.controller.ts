import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import User from '../models/User';
import Referral from '../models/Referral';

export const getMyTree = async (req: AuthRequest, res: Response) => {
  const referrals = await Referral.find({ referrer: req.user!.id }).populate('referee', 'username email');
  res.json(referrals);
};