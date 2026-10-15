import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "로그인" };
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ registered?: string }> }) {
  if (await auth()) redirect("/dashboard");
  const { registered } = await searchParams;
  return <div className="login-page"><section className="auth-card login-card"><h1>로그인</h1>{registered === "1" && <p className="form-message success" role="status">회원가입이 완료되었습니다. 로그인해 주세요.</p>}<AuthForm mode="login" /></section></div>;
}
