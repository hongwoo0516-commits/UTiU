import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LearningForm } from "@/components/learning-form";
import type { LearningInput } from "@/lib/validation";

export function RecordEditor({ id, initial }: { id?: string; initial?: LearningInput }) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return <div className="container editor-page"><Link className="back-link" href="/dashboard"><ArrowLeft size={16} />내 학습 기록으로</Link><div className="page-heading"><div><p className="eyebrow">ONE STEP AT A TIME</p><h1>{id ? "학습 기록 수정하기" : "새 학습 기록"}</h1><p>결과만큼 소중한 배움의 과정도 기록해 보세요.</p></div></div><section className="editor-card"><LearningForm id={id} initial={initial} today={today} /></section></div>;
}
