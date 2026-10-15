import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/data";
import { PostForm } from "@/components/post-form";

export const metadata: Metadata = { title: "글 작성", robots: { index: false, follow: false } };
export default async function NewPostPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const user = await requireUser();
  const { kind } = await searchParams;
  const notice = kind === "notice";
  return <div className="container post-editor"><Link href="/posts" className="back-link"><ArrowLeft size={16} />게시판으로</Link><div className="page-heading"><h1>{notice ? "공지쓰기" : "글쓰기"}</h1></div><section className="editor-card"><PostForm author={user.name} initial={{ title: "", content: "", kind: notice ? "notice" : "post" }} /></section></div>;
}
