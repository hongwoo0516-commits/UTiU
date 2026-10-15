import { Schema, model, models, type Model } from "mongoose";

interface AuthAttemptRecord { _id: string; count: number; expiresAt: Date }
const schema = new Schema<AuthAttemptRecord>({
  _id: { type: String, required: true },
  count: { type: Number, required: true },
  expiresAt: { type: Date, required: true },
});
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const AuthAttempt = (models.AuthAttempt as Model<AuthAttemptRecord> | undefined) || model<AuthAttemptRecord>("AuthAttempt", schema);
