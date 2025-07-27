import { Schema, model, Types } from 'mongoose';

export interface IBackupCode {
  user: Types.ObjectId;          // <-- correct type
  code: string;                  // hashed
  used: boolean;
}

const BackupCodeSchema = new Schema<IBackupCode>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  code: { type: String, required: true },
  used: { type: Boolean, default: false },
});

export default model<IBackupCode>('BackupCode', BackupCodeSchema);