import { Schema, model, models, type Model, type Types } from "mongoose";
import { categories } from "@/lib/validation";

export interface LearningRecord {
  userId: Types.ObjectId;
  title: string;
  category: string;
  description: string;
  learnedAt: string;
  link: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const learningSchema = new Schema<LearningRecord>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  category: { type: String, enum: categories, required: true },
  description: { type: String, required: true, trim: true, maxlength: 3000 },
  learnedAt: { type: String, required: true },
  link: { type: String, default: "" },
  isPublic: { type: Boolean, default: false },
}, { timestamps: true });
learningSchema.index({ userId: 1, isPublic: 1, learnedAt: -1, createdAt: -1 });

export const Learning = (models.Learning as Model<LearningRecord> | undefined) || model<LearningRecord>("Learning", learningSchema);
