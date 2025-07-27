import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  _id: string;
  email: string;
  username: string;
  password: string;
  role: 'user' | 'moderator' | 'finance' | 'super-admin';
  balance: number;
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
  lastLoginAt?: Date;
  lastLoginIP?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, unique: true, required: true },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'moderator', 'finance', 'super-admin'], default: 'user' },
  balance: { type: Number, default: 0 },
  twoFactorSecret: String,
  twoFactorEnabled: { type: Boolean, default: false },
  lastLoginAt: Date,
  lastLoginIP: String,
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

export default model<IUser>('User', UserSchema);