"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { loginAction, registerAction } from "@/app/actions/auth";
import { FieldError, FormFeedback } from "@/components/form-feedback";
import type { ActionState } from "@/lib/validation";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const register = mode === "register";
  const [state, action, pending] = useActionState(register ? registerAction : loginAction, {} as ActionState);
  const [visible, setVisible] = useState(false);
  const [values, setValues] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const fields = [
    ...(register ? [{ name: "name", label: "이름", type: "text", placeholder: "포트폴리오에 표시할 이름", autoComplete: "name", maxLength: 30 }] : []),
    { name: "email", label: "이메일", type: "email", placeholder: "you@example.com", autoComplete: "email", maxLength: 254 },
    { name: "password", label: "비밀번호", type: visible ? "text" : "password", placeholder: "8자 이상 입력해 주세요", autoComplete: register ? "new-password" : "current-password", maxLength: 72 },
    ...(register ? [{ name: "confirmPassword", label: "비밀번호 확인", type: visible ? "text" : "password", placeholder: "비밀번호를 다시 입력해 주세요", autoComplete: "new-password", maxLength: 72 }] : []),
  ];
  return <form action={action} className="form-stack">
    {fields.map((field) => <div className="field" key={field.name}>
      <label htmlFor={field.name}>{field.label}</label>
      <div className={field.name === "password" ? "password-input" : undefined}>
        <input {...field} id={field.name} required disabled={pending}
          value={values[field.name as keyof typeof values]}
          onChange={(event) => setValues({ ...values, [field.name]: event.target.value })}
          minLength={field.name.includes("assword") ? 8 : field.name === "name" ? 2 : undefined}
          aria-invalid={Boolean(state.errors?.[field.name])}
          aria-describedby={state.errors?.[field.name] ? `${field.name}-error` : undefined} />
        {field.name === "password" && <button type="button" className="password-toggle" onClick={() => setVisible(!visible)} aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"} aria-pressed={visible}>
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>}
      </div>
      <FieldError state={state} name={field.name} />
    </div>)}
    <FormFeedback state={state} />
    <button className="button primary full" disabled={pending} type="submit">
      {pending ? <><LoaderCircle size={18} className="spin" /> 처리 중...</> : <>{register ? "회원가입하고 시작하기" : "로그인"}<ArrowRight size={18} /></>}
    </button>
    <p className="form-bottom">{register && "이미 계정이 있나요? "}<Link href={register ? "/login" : "/register"}>{register ? "로그인" : "회원가입"}</Link></p>
  </form>;
}
