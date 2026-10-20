import { z } from "zod";

export const categories = ["개발", "디자인", "협업", "기타"] as const;

const email = z.string().trim().toLowerCase().email("올바른 이메일 주소를 입력해 주세요.").max(254);
const password = z.string()
  .min(8, "비밀번호는 8자 이상 입력해 주세요.")
  .refine((value) => new TextEncoder().encode(value).length <= 72, "비밀번호는 UTF-8 기준 72바이트 이내로 입력해 주세요.");

export const loginSchema = z.object({ email, password });
export const registerSchema = loginSchema.extend({
  name: z.string().trim().min(2, "이름은 2자 이상 입력해 주세요.").max(30, "이름은 30자 이내로 입력해 주세요."),
  confirmPassword: z.string(),
}).refine((value) => value.password === value.confirmPassword, {
  path: ["confirmPassword"], message: "비밀번호가 일치하지 않습니다.",
});

export const learningSchema = z.object({
  title: z.string().trim().min(2, "제목은 2자 이상 입력해 주세요.").max(100, "제목은 100자 이내로 입력해 주세요."),
  category: z.enum(categories, { error: "분야를 선택해 주세요." }),
  description: z.string().trim().min(10, "배운 내용을 10자 이상 작성해 주세요.").max(3000, "내용은 3,000자 이내로 입력해 주세요."),
  learnedAt: z.string().refine((value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value && value >= "1900-01-01" && value <= "2100-12-31";
  }, "올바른 학습 날짜를 입력해 주세요."),
  isPublic: z.boolean(),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, "이름은 2자 이상 입력해 주세요.").max(30),
  bio: z.string().trim().max(200, "소개는 200자 이내로 작성해 주세요."),
});

export const postSchema = z.object({
  title: z.string().trim().min(2, "제목은 2자 이상 입력해 주세요.").max(100, "제목은 100자 이내로 입력해 주세요."),
  content: z.string().trim().min(1, "내용을 입력해 주세요.").max(10000, "내용은 10,000자 이내로 입력해 주세요."),
  kind: z.enum(["post", "notice"], { error: "글 종류를 선택해 주세요." }),
});
export type PostInput = z.infer<typeof postSchema>;

export type LearningInput = z.infer<typeof learningSchema>;
export type ActionState = {
  message?: string;
  success?: boolean;
  errors?: Record<string, string[]>;
};

export function validationState(error: z.ZodError): ActionState {
  return { message: "입력 내용을 확인해 주세요.", errors: z.flattenError(error).fieldErrors };
}
