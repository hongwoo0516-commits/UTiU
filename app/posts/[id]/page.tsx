import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { auth } from "@/auth";
import { getPost } from "@/lib/posts";
import { DeletePost } from "@/components/delete-post";

export const metadata: Metadata = { title: "게시글" };
export const dynamic = "force-dynamic";
export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();
  const session = await auth();
  const own = session?.user?.id === String(post.userId);
  return <div className="container post-detail"><Link href="/posts" className="back-link"><ArrowLeft size={16} />게시판으로</Link><article className="post-article"><div className="post-article-heading"><span className={post.kind === "notice" ? "post-kind notice" : "post-kind"}>{post.kind === "notice" ? "공지" : "일반 글"}</span><h1>{post.title}</h1><div className="post-meta"><span>{post.author}</span><time dateTime={post.createdAt.toISOString()}>{post.createdAt.toLocaleString("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}</time></div></div><p className="post-content">{post.content}</p></article><div className="post-detail-actions"><Link href="/posts" className="button secondary">목록으로</Link>{own && <div className="board-write-actions"><Link href={`/posts/${id}/edit`} className="button secondary"><Pencil size={15} />수정</Link><DeletePost id={id} /></div>}</div></div>;
}
