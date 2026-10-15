import { Schema, model, models, type Model } from "mongoose";

export interface UserRecord {
  name: string;
  email: string;
  bio: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserRecord>({
  name: { type: String, required: true, trim: true, maxlength: 30 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  bio: { type: String, default: "", maxlength: 200 },
  passwordHash: { type: String, required: true, select: false },
}, { timestamps: true });

export const User = (models.User as Model<UserRecord> | undefined) || model<UserRecord>("User", userSchema);
