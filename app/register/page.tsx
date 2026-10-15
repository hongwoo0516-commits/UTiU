import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "회원가입" };
export default async function RegisterPage() {
  if (await auth()) redirect("/dashboard");
  return <div className="login-page"><section className="auth-card login-card"><h1>회원가입</h1><AuthForm mode="register" /></section></div>;
}
