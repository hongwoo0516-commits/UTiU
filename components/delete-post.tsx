"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { deletePostAction } from "@/app/actions/posts";
import { FormFeedback } from "@/components/form-feedback";
import type { ActionState } from "@/lib/validation";

export function DeletePost({ id }: { id: string }) {
  const [state, action, pending] = useActionState(deletePostAction, {} as ActionState);
  return <form action={action} onSubmit={(e) => { if (!window.confirm("이 글을 삭제할까요? 삭제한 글은 되돌릴 수 없습니다.")) e.preventDefault(); }}><input type="hidden" name="id" value={id} /><button type="submit" className="button secondary" disabled={pending}><Trash2 size={15} />{pending ? "삭제 중..." : "삭제"}</button><FormFeedback state={state} /></form>;
}
