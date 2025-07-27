import { Schema, model, Types } from 'mongoose';

export interface ITransaction {
  user: Types.ObjectId;
  type: 'deposit' | 'withdrawal';
  method: 'jazzcash' | 'easypaisa' | 'crypto';
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  screenshot?: string;
  approvedBy?: Types.ObjectId; // admin id
  approvedAt?: Date;
  walletAddress?: string; // encrypted
}

const TxSchema = new Schema<ITransaction>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['deposit', 'withdrawal'], required: true },
  method: { type: String, enum: ['jazzcash', 'easypaisa', 'crypto'], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' },
  screenshot: String,
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  walletAddress: String,   // encrypted
}, { timestamps: true });

export default model<ITransaction>('Transaction', TxSchema);