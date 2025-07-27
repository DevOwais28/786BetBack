import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Transaction from '../models/transaction';
import User from '../models/User';
import axios from 'axios';
import crypto from 'crypto';

const USDT_TRC20_ADDR = process.env.USDT_TRC20_ADDR!;
const TRON_API      = 'https://api.trongrid.io';

/* 1.  Create deposit record & show static USDT-TRC20 QR */
export const createCryptoDeposit = async (req: AuthRequest, res: Response) => {
  const { amount } = req.body;
  const tx = await Transaction.create({
    user: req.user!.id,
    type: 'deposit',
    method: 'usdt_trc20',
    amount,
    status: 'pending',
    walletAddress: USDT_TRC20_ADDR,
  });

  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`tronlink://send?address=${USDT_TRC20_ADDR}&amount=${amount}`)}`;
  res.json({ txId: tx._id, qr, address: USDT_TRC20_ADDR });
};

/* 2.  Cron job helper */
export const checkDeposits = async () => {
  const pending = await Transaction.find({ method: 'usdt_trc20', status: 'pending' });
  for (const p of pending) {
    const { data } = await axios.get(`${TRON_API}/v1/accounts/${USDT_TRC20_ADDR}/transactions/trc20`, {
      params: { contract_address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t' },
    });
    const match = data.data.find(
      (t: any) =>
        t.to === USDT_TRC20_ADDR.toLowerCase() &&
        +t.value === p.amount * 1e6 &&
        t.confirmed
    );
    if (match) {
      p.status = 'approved';
      await p.save();
      await User.findByIdAndUpdate(p.user, { $inc: { balance: p.amount } });
    }
  }
};