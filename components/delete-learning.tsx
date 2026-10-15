"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { deleteLearningAction } from "@/app/actions/learning";
import { FormFeedback } from "@/components/form-feedback";
import type { ActionState } from "@/lib/validation";

export function DeleteLearning({ id }: { id: string }) {
  const [state, action, pending] = useActionState(deleteLearningAction, {} as ActionState);
  return <form action={action} onSubmit={(e) => { if (!window.confirm("이 학습 기록을 삭제할까요? 삭제한 기록은 되돌릴 수 없습니다.")) e.preventDefault(); }}>
    <input type="hidden" name="id" value={id} /><button className="text-button danger" type="submit" disabled={pending}><Trash2 size={14} />{pending ? "삭제 중..." : "삭제"}</button><FormFeedback state={state} />
  </form>;
}
