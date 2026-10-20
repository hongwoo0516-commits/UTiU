"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { LoaderCircle, Check } from "lucide-react";
import { saveLearningAction } from "@/app/actions/learning";
import { type ActionState, type LearningInput } from "@/lib/validation";
import { FieldError, FormFeedback } from "@/components/form-feedback";

export function LearningForm({ id, initial, today }: { id?: string; initial?: LearningInput; today: string }) {
  const [state, action, pending] = useActionState(saveLearningAction, {} as ActionState);
  const [values, setValues] = useState<LearningInput>(initial || { title: "", category: "개발", description: "", learnedAt: today, isPublic: false });
  const fieldProps = (name: keyof LearningInput) => ({
    id: name, name, disabled: pending,
    "aria-invalid": Boolean(state.errors?.[name]),
    "aria-describedby": state.errors?.[name] ? `${name}-error` : undefined,
  });
  return <form action={action} className="form-stack">
    {id && <input type="hidden" name="id" value={id} />}
    <input type="hidden" name="category" value={values.category} />
    <input type="hidden" name="learnedAt" value={values.learnedAt} />
    <div className="field"><label htmlFor="title">무엇을 배웠나요?</label>
      <input {...fieldProps("title")} placeholder="예: Next.js로 첫 회원가입 기능 만들기" required minLength={2} maxLength={100} value={values.title} onChange={(e) => setValues({ ...values, title: e.target.value })} /><FieldError state={state} name="title" />
    </div>
    <div className="field"><label htmlFor="description">내용</label>
      <textarea {...fieldProps("description")} rows={8} required minLength={10} maxLength={3000} placeholder="어떤 내용을 배웠는지, 직접 해보면서 무엇을 알게 됐는지 적어 주세요." value={values.description} onChange={(e) => setValues({ ...values, description: e.target.value })} /><FieldError state={state} name="description" /><p className="field-hint">{values.description.length.toLocaleString()} / 3,000자</p>
    </div>
    <label className="checkbox-card" htmlFor="isPublic"><input {...fieldProps("isPublic")} type="checkbox" checked={values.isPublic} onChange={(e) => setValues({ ...values, isPublic: e.target.checked })} /><span><strong>포트폴리오에 공개하기</strong><small>선택하면 포트폴리오 링크를 방문한 누구나 이 기록을 볼 수 있어요.</small></span></label>
    <FormFeedback state={state} />
    <div className="form-actions"><Link href="/dashboard" className="button secondary">취소</Link><button className="button primary" type="submit" disabled={pending}>{pending ? <LoaderCircle size={18} className="spin" /> : <Check size={18} />}{pending ? "저장 중..." : "기록 저장하기"}</button></div>
  </form>;
}
