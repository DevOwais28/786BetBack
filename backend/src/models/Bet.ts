import { Schema, model, Types, Document } from 'mongoose';

export interface IBet extends Document {
  user: Types.ObjectId;
  round: number;
  amount: number;
  cashOutAt?: number;
  multiplier?: number;
  profit?: number;
}

const BetSchema = new Schema<IBet>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  round: Number,
  amount: Number,
  cashOutAt: Number,
  multiplier: Number,
  profit: Number,
}, { timestamps: true });

export default model<IBet>('Bet', BetSchema);