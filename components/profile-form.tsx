"use client";

import { useActionState, useState } from "react";
import { saveProfileAction } from "@/app/actions/learning";
import { FieldError, FormFeedback } from "@/components/form-feedback";
import type { ActionState } from "@/lib/validation";

export function ProfileForm({ name, bio }: { name: string; bio: string }) {
  const [state, action, pending] = useActionState(saveProfileAction, {} as ActionState);
  const [values, setValues] = useState({ name, bio });
  return <details className="profile-details"><summary>이름과 소개 수정하기</summary><form action={action} className="form-stack profile-form">
    <p className="field-hint">이름과 소개는 공개 포트폴리오에 표시됩니다. 이메일은 공개되지 않습니다.</p>
    <div className="field"><label htmlFor="name">이름</label><input id="name" name="name" required minLength={2} maxLength={30} value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} aria-invalid={Boolean(state.errors?.name)} aria-describedby={state.errors?.name ? "name-error" : undefined} /><FieldError state={state} name="name" /></div>
    <div className="field"><label htmlFor="bio">한 줄 소개</label><textarea id="bio" name="bio" rows={3} maxLength={200} placeholder="나의 관심사와 배우고 싶은 것을 소개해 주세요." value={values.bio} onChange={(e) => setValues({ ...values, bio: e.target.value })} aria-invalid={Boolean(state.errors?.bio)} aria-describedby={state.errors?.bio ? "bio-error" : undefined} /><FieldError state={state} name="bio" /></div>
    <FormFeedback state={state} /><button type="submit" disabled={pending} className="button secondary">{pending ? "저장 중..." : "프로필 저장"}</button>
  </form></details>;
}
