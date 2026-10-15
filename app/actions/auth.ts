"use server";

import bcrypt from "bcryptjs";
import { AuthError, CredentialsSignin } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { allowAuthAttempt } from "@/lib/rate-limit";
import { loginSchema, registerSchema, validationState, type ActionState } from "@/lib/validation";
import { User } from "@/models/User";

export async function registerAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationState(parsed.error);
  const { name, email, password } = parsed.data;
  try {
    await connectDB();
    if (!(await allowAuthAttempt(email, "register"))) return { message: "가입 요청이 많습니다. 잠시 후 다시 시도해 주세요." };
    await User.init(); // Wait for the unique email index before allowing inserts.
    await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12) });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      return { message: "이미 가입된 이메일입니다. 로그인해 주세요.", errors: { email: ["이미 가입된 이메일입니다."] } };
    }
    return { message: "회원가입을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요." };
  }
  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) redirect("/login?registered=1");
    throw error; // Next.js redirects are control-flow exceptions.
  }
  return {};
}

export async function loginAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationState(parsed.error);
  try {
    await signIn("credentials", { ...parsed.data, redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof CredentialsSignin) {
      return { message: error.code === "too_many_attempts" ? "로그인 시도가 많습니다. 15분 후 다시 시도해 주세요." : "이메일 또는 비밀번호를 확인해 주세요." };
    }
    if (error instanceof AuthError) return { message: "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요." };
    throw error;
  }
  return {};
}

export async function logoutAction() { await signOut({ redirectTo: "/login" }); }
