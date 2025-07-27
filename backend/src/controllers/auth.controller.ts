import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import User from '../models/User';
import LoginLog from '../models/LoginLog';
import BackupCode from '../models/BackupCode';
import Referral from '../models/Referral';
import { encrypt } from '../middleware/encrypt';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password, referralCode } = req.body;
    
    // Check if user exists
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({ email, username, password });
    
    // Handle referral if provided
    if (referralCode) {
      const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
      if (referrer) {
        await Referral.create({ 
          referrer: referrer._id, 
          referee: user._id 
        });
      }
    }
    
    res.status(201).json({ id: user._id });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error during registration' });
  }
};
export const login = async (req: Request, res: Response) => {
  const { email, password, ip, userAgent } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: 'Invalid credentials' });

  // Fraud detection stub
  const riskScore = 0; // TODO: integrate fraud.service.ts
  await LoginLog.create({ user: user._id, ip, userAgent, success: true, riskScore });

  // Admin 2FA check
  if (user.role !== 'user' && user.twoFactorEnabled) {
    return res.json({ requiresTwoFactor: true, tempToken: encrypt(user._id) });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role, twoFactorVerified: true },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
  res.json({ token });
};

export const verify2FA = async (req: Request, res: Response) => {
  const { tempToken, code } = req.body;
  const userId = encrypt(tempToken); // decrypt
  const user = await User.findById(userId);
  if (!user) return res.status(401).json({ message: 'Invalid token' });

  const valid = speakeasy.totp.verify({
    secret: user.twoFactorSecret!,
    encoding: 'base32',
    token: code,
    window: 2,
  });

  if (!valid) return res.status(401).json({ message: 'Invalid 2FA code' });

  const token = jwt.sign(
    { id: user._id, role: user.role, twoFactorVerified: true },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
  res.json({ token });
};

export const setup2FA = async (req: Request, res: Response) => {
  const { id } = (req as any).user;
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const secret = speakeasy.generateSecret({ length: 32 });
  user.twoFactorSecret = secret.base32;
  user.twoFactorEnabled = true;
  await user.save();

  const url = speakeasy.otpauthURL({
    secret: secret.base32,
    label: `786Bet (${user.email})`,
    issuer: '786Bet',
  });
  const qrDataURL = await QRCode.toDataURL(url);
  res.json({ qr: qrDataURL, secret: secret.base32 });
};