import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser, isRecordId } from "@/lib/data";
import { Post } from "@/models/Post";
import { PostForm } from "@/components/post-form";

export const metadata: Metadata = { title: "글 수정", robots: { index: false, follow: false } };
export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  if (!isRecordId(id)) notFound();
  const post = await Post.findOne({ _id: id, userId: user.id }).lean();
  if (!post) notFound();
  return <div className="container post-editor"><Link href={`/posts/${id}`} className="back-link"><ArrowLeft size={16} />글로 돌아가기</Link><div className="page-heading"><h1>글 수정</h1></div><section className="editor-card"><PostForm id={id} author={post.author} initial={{ title: post.title, content: post.content, kind: post.kind }} /></section></div>;
}
