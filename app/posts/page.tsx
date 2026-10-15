import type { Metadata } from "next";
import Link from "next/link";
import { PenLine, Megaphone } from "lucide-react";
import { getPosts } from "@/lib/posts";

export const metadata: Metadata = { title: "게시판" };
export const dynamic = "force-dynamic";
export default async function PostsPage({ searchParams }: { searchParams: Promise<{ kind?: string; page?: string }> }) {
  const params = await searchParams;
  const kind = params.kind === "post" || params.kind === "notice" ? params.kind : "all";
  const page = /^\d{1,6}$/.test(params.page || "") ? Math.max(1, Number(params.page)) : 1;
  const result = await getPosts(kind, page);
  const pageHref = (value: number) => `/posts?kind=${kind}&page=${value}`;
  return <div className="container board-page"><div className="page-heading"><div><h1>게시판</h1></div><div className="board-write-actions"><Link href="/posts/new?kind=notice" className="button secondary"><Megaphone size={16} />공지쓰기</Link><Link href="/posts/new" className="button primary"><PenLine size={16} />글쓰기</Link></div></div>
    <nav aria-label="게시글 종류" className="board-tabs">{[{ value: "all", label: "전체" }, { value: "post", label: "일반 글" }, { value: "notice", label: "공지" }].map((tab) => <Link href={`/posts?kind=${tab.value}`} key={tab.value} className={kind === tab.value ? "board-tab active" : "board-tab"} aria-current={kind === tab.value ? "page" : undefined}>{tab.label}</Link>)}<span className="board-count">총 {result.count}개</span></nav>
    {result.posts.length ? <div className="post-list">{result.posts.map((post) => <Link className={`post-row ${post.kind === "notice" ? "notice-row" : ""}`} href={`/posts/${post._id}`} key={String(post._id)}><span className={post.kind === "notice" ? "post-kind notice" : "post-kind"}>{post.kind === "notice" ? "공지" : "글"}</span><h2>{post.title}</h2><span className="post-author">{post.author}</span><time dateTime={post.createdAt.toISOString()}>{post.createdAt.toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" })}</time></Link>)}</div> : <div className="empty-state"><PenLine size={28} /><h2>아직 등록된 글이 없습니다</h2></div>}
    {result.pages > 1 && <nav className="pagination" aria-label="게시판 페이지">{result.currentPage > 1 && <Link href={pageHref(result.currentPage - 1)} className="button secondary">이전</Link>}<span>{result.currentPage} / {result.pages}</span>{result.currentPage < result.pages && <Link href={pageHref(result.currentPage + 1)} className="button secondary">다음</Link>}</nav>}
  </div>;
}
