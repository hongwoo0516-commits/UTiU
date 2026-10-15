import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, ArrowRight } from "lucide-react";
import { getPublicPortfolio } from "@/lib/data";
import { LearningCard } from "@/components/learning-card";

export const metadata: Metadata = { title: "배움 포트폴리오", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function PortfolioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const portfolio = await getPublicPortfolio(id);
  if (!portfolio) notFound();
  return <div className="container public-portfolio"><section className="public-profile"><div className="avatar large">{portfolio.user.name.slice(0, 1)}</div><p className="eyebrow">A JOURNEY OF LEARNING</p><h1>{portfolio.user.name}의 배움 포트폴리오</h1><p>{portfolio.user.bio || "배우고, 만들고, 조금씩 성장하는 중입니다."}</p><span className="public-count"><BookOpen size={16} />공개된 학습 기록 {portfolio.learnings.length}개</span></section><section><h2 className="public-records-title">배움의 발자취</h2>{portfolio.learnings.length ? <div className="learning-grid">{portfolio.learnings.map((record) => <LearningCard record={record} id={String(record._id)} key={String(record._id)} />)}</div> : <div className="empty-state"><BookOpen size={30} /><h3>아직 공개된 학습 기록이 없습니다</h3><p>새로운 배움의 이야기가 곧 이곳에 쌓일 거예요.</p></div>}</section><div className="portfolio-signature"><p>나의 배움도 포트폴리오로 남겨 보세요.</p><Link href="/register" className="text-link">포트폴리오 시작하기<ArrowRight size={16} /></Link></div></div>;
}
