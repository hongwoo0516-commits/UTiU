import "server-only";
import { connectDB } from "@/lib/mongodb";
import { isRecordId } from "@/lib/data";
import { Post } from "@/models/Post";

export async function getPosts(kind: "all" | "post" | "notice", page: number) {
  await connectDB();
  const filter = kind === "all" ? {} : { kind };
  const count = await Post.countDocuments(filter);
  const pages = Math.max(1, Math.ceil(count / 20));
  const currentPage = Math.min(Math.max(1, page), pages);
  const posts = await Post.find(filter).select("title author kind createdAt")
    .sort({ kind: 1, createdAt: -1, _id: -1 }).skip((currentPage - 1) * 20).limit(20).lean();
  return { posts, count, pages, currentPage };
}

export async function getPost(id: string) {
  if (!isRecordId(id)) return null;
  await connectDB();
  return Post.findById(id).lean();
}
