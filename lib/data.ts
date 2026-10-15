import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Learning } from "@/models/Learning";

export function isRecordId(value: string) { return /^[a-f\d]{24}$/i.test(value); }

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id || !isRecordId(session.user.id)) redirect("/login");
  await connectDB();
  const user = await User.findById(session.user.id).select("name email bio createdAt").lean();
  if (!user) redirect("/login");
  return { id: String(user._id), name: user.name, email: user.email, bio: user.bio, createdAt: user.createdAt };
}

export async function getOwnLearnings(userId: string) {
  await connectDB();
  return Learning.find({ userId }).sort({ learnedAt: -1, createdAt: -1 }).lean();
}

export async function getPublicPortfolio(userId: string) {
  if (!isRecordId(userId)) return null;
  await connectDB();
  const user = await User.findById(userId).select("name bio").lean();
  if (!user) return null;
  const learnings = await Learning.find({ userId, isPublic: true })
    .select("title category description learnedAt link")
    .sort({ learnedAt: -1, createdAt: -1 }).lean();
  return { user, learnings };
}
