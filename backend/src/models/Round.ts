import { Schema, model, Types } from 'mongoose';

export interface IRound {
  roundId: number;
  startTime: Date;
  crashPoint: number;
  status: 'waiting' | 'running' | 'ended';
}

const RoundSchema = new Schema<IRound>({
  roundId: { type: Number, unique: true },
  startTime: { type: Date, default: Date.now },
  crashPoint: Number,
  status: { type: String, default: 'waiting' },
});

export default model<IRound>('Round', RoundSchema);