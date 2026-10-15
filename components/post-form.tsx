"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Check, LoaderCircle } from "lucide-react";
import { savePostAction } from "@/app/actions/posts";
import { FieldError, FormFeedback } from "@/components/form-feedback";
import type { ActionState, PostInput } from "@/lib/validation";

export function PostForm({ id, author, initial }: { id?: string; author: string; initial?: PostInput }) {
  const [state, action, pending] = useActionState(savePostAction, {} as ActionState);
  const [values, setValues] = useState<PostInput>(initial || { title: "", content: "", kind: "post" });
  const fieldProps = (name: keyof PostInput) => ({ id: name, name, disabled: pending, "aria-invalid": Boolean(state.errors?.[name]), "aria-describedby": state.errors?.[name] ? `${name}-error` : undefined });
  return <form action={action} className="form-stack">
    {id && <input type="hidden" name="id" value={id} />}
    <div className="form-row"><div className="field"><label htmlFor="kind">글 종류</label><select {...fieldProps("kind")} value={values.kind} onChange={(e) => setValues({ ...values, kind: e.target.value as PostInput["kind"] })}><option value="post">일반 글</option><option value="notice">공지</option></select><FieldError state={state} name="kind" /></div><div className="field"><label htmlFor="author">작성자</label><input id="author" value={author} readOnly /></div></div>
    <div className="field"><label htmlFor="title">제목</label><input {...fieldProps("title")} required minLength={2} maxLength={100} placeholder="제목을 입력해 주세요" value={values.title} onChange={(e) => setValues({ ...values, title: e.target.value })} /><FieldError state={state} name="title" /></div>
    <div className="field"><label htmlFor="content">내용</label><textarea {...fieldProps("content")} rows={14} required maxLength={10000} placeholder="내용을 자유롭게 작성해 주세요" value={values.content} onChange={(e) => setValues({ ...values, content: e.target.value })} /><FieldError state={state} name="content" /><p className="field-hint">{values.content.length.toLocaleString()} / 10,000자</p></div>
    <p className="field-hint">등록한 글과 공지는 게시판에 공개됩니다.</p>
    <FormFeedback state={state} />
    <div className="form-actions"><Link href={id ? `/posts/${id}` : "/posts"} className="button secondary">취소</Link><button type="submit" className="button primary" disabled={pending}>{pending ? <LoaderCircle size={17} className="spin" /> : <Check size={17} />}{pending ? "저장 중..." : id ? "수정 완료" : "등록하기"}</button></div>
  </form>;
}
