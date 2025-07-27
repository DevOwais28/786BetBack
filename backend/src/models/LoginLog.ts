import { Schema, model, Types } from 'mongoose';

export interface ILoginLog {
  user: Types.ObjectId;
  ip: string;
  userAgent: string;
  success: boolean;
  riskScore: number;
  createdAt: Date;
}

const LoginLogSchema = new Schema<ILoginLog>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  ip: String,
  userAgent: String,
  success: Boolean,
  riskScore: { type: Number, default: 0 },
}, { timestamps: true });

export default model<ILoginLog>('LoginLog', LoginLogSchema);