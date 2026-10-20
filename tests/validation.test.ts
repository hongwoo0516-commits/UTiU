import assert from "node:assert/strict";
import test from "node:test";
import { learningSchema, loginSchema, registerSchema, postSchema } from "../lib/validation";

const account = { name: "배움이", email: "  STUDENT@example.com  ", password: "study12345", confirmPassword: "study12345" };
const learning = { title: "Next.js 서버 액션", category: "개발", description: "서버에서 폼을 검증하고 MongoDB에 데이터를 저장하는 흐름을 배웠다.", learnedAt: "2026-10-13", isPublic: false };

test("emails are normalized before lookup and duplicate checks", () => {
  assert.equal(registerSchema.parse(account).email, "student@example.com");
});
test("password confirmation must match", () => {
  const result = registerSchema.safeParse({ ...account, confirmPassword: "different" });
  assert.equal(result.success, false);
  if (!result.success) assert.equal(result.error.issues[0].path[0], "confirmPassword");
});
test("bcrypt byte limit is enforced for Korean passwords", () => {
  assert.equal(loginSchema.safeParse({ ...account, password: "가".repeat(25) }).success, false);
  assert.equal(loginSchema.safeParse({ ...account, password: "가".repeat(24) }).success, true);
});
test("invalid emails and short passwords are rejected", () => {
  assert.equal(loginSchema.safeParse({ email: "bad", password: "123" }).success, false);
});
test("learning dates must be real calendar dates", () => {
  for (const date of ["2026-02-30", "2026-13-01", "bad", "1899-12-31"]) {
    assert.equal(learningSchema.safeParse({ ...learning, learnedAt: date }).success, false);
  }
  assert.equal(learningSchema.safeParse({ ...learning, learnedAt: "2024-02-29" }).success, true);
});
test("private records stay private and unsupported categories are rejected", () => {
  assert.equal(learningSchema.parse(learning).isPublic, false);
  assert.equal(learningSchema.safeParse({ ...learning, category: "unknown" }).success, false);
});

test("posts and notices reject empty text, excess content, and unsupported kinds", () => {
  const input = { title: "첫 번째 글", content: "배운 내용을 자유롭게 기록합니다.", kind: "post" };
  assert.equal(postSchema.safeParse(input).success, true);
  assert.equal(postSchema.safeParse({ ...input, kind: "notice" }).success, true);
  assert.equal(postSchema.safeParse({ ...input, title: "  " }).success, false);
  assert.equal(postSchema.safeParse({ ...input, content: "  \n " }).success, false);
  assert.equal(postSchema.safeParse({ ...input, content: "a".repeat(10001) }).success, false);
  assert.equal(postSchema.safeParse({ ...input, kind: "admin" }).success, false);
});
