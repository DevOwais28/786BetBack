import { Schema, model, Types } from 'mongoose';

export interface IReferral {
  referrer: Types.ObjectId;
  referee: Types.ObjectId;
  bonus: number;
  claimed: boolean;
}

const ReferralSchema = new Schema<IReferral>({
  referrer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  referee:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
  bonus:    { type: Number, default: 0 },
  claimed:  { type: Boolean, default: false },
}, { timestamps: true });

export default model<IReferral>('Referral', ReferralSchema);