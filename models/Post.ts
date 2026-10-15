import { Schema, model, models, type Model, type Types } from "mongoose";

export interface PostRecord {
  userId: Types.ObjectId;
  author: string;
  title: string;
  content: string;
  kind: "post" | "notice";
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<PostRecord>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  author: { type: String, required: true, maxlength: 30 },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  content: { type: String, required: true, trim: true, maxlength: 10000 },
  kind: { type: String, required: true, enum: ["post", "notice"], default: "post" },
}, { timestamps: true });
postSchema.index({ kind: 1, createdAt: -1 });
postSchema.index({ userId: 1 });

export const Post = (models.Post as Model<PostRecord> | undefined) || model<PostRecord>("Post", postSchema);
