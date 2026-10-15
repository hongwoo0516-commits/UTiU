import { test, expect, type Page } from "@playwright/test";
import mongoose from "mongoose";
import { mkdirSync } from "node:fs";

const dbName = process.env.UTIU_E2E_DB!;
const email = `${dbName}@example.com`;
const password = "Learn-together-2026!";

async function register(page: Page, accountEmail: string, name = "포트폴리오 테스트") {
  await page.goto("/register");
  await page.getByLabel("이름", { exact: true }).fill(name);
  await page.getByLabel("이메일", { exact: true }).fill(accountEmail);
  await page.getByLabel("비밀번호", { exact: true }).fill(password);
  await page.getByLabel("비밀번호 확인", { exact: true }).fill(password);
  await page.getByRole("button", { name: "회원가입하고 시작하기" }).click();
}

test.afterAll(async () => {
  // Only this run's randomly named database can be removed.
  if (!/^utiu_e2e_[a-f0-9]{16}$/.test(dbName)) throw new Error("Unsafe test database name");
  await mongoose.connect(process.env.MONGODB_URI!, { dbName, serverSelectionTimeoutMS: 10000 });
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

test("signup, ownership, privacy, edits, login and logout work with MongoDB", async ({ page, browser }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);

  await register(page, email);
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "포트폴리오 테스트님의 배움 기록" })).toBeVisible();
  await page.goto("/");
  await expect(page).toHaveURL(/\/dashboard$/);
  const portfolioPath = await page.getByRole("link", { name: "포트폴리오 보기" }).getAttribute("href");

  await page.getByRole("link", { name: "새 기록 작성", exact: true }).click();
  await page.getByLabel("무엇을 배웠나요?").fill("비공개 Next.js 학습 기록");
  await page.getByLabel("배운 내용과 느낀 점").fill("서버 액션에서 입력을 검증하고 MongoDB에 저장하는 흐름을 배웠다.");
  await expect(page.getByLabel("포트폴리오에 공개하기", { exact: false })).not.toBeChecked();
  await page.getByRole("button", { name: "기록 저장하기" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  const editLink = await page.getByRole("link", { name: "수정", exact: true }).getAttribute("href");
  const recordId = editLink!.split("/")[2];

  const visitor = await browser.newContext();
  const publicPage = await visitor.newPage();
  await publicPage.goto(portfolioPath!);
  await expect(publicPage.getByRole("heading", { name: "아직 공개된 학습 기록이 없습니다" })).toBeVisible();
  await expect(publicPage.getByText("비공개 Next.js 학습 기록", { exact: true })).toHaveCount(0);
  await expect(publicPage.getByText(email, { exact: true })).toHaveCount(0);

  await page.getByRole("link", { name: "수정", exact: true }).click();
  await page.getByLabel("무엇을 배웠나요?").fill("공개한 Next.js 학습 기록");
  await page.getByLabel("포트폴리오에 공개하기", { exact: false }).check();
  await page.getByRole("button", { name: "기록 저장하기" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await publicPage.reload();
  await expect(publicPage.getByRole("heading", { name: "공개한 Next.js 학습 기록" })).toBeVisible();

  await page.getByRole("link", { name: "수정", exact: true }).click();
  await page.getByLabel("포트폴리오에 공개하기", { exact: false }).uncheck();
  await page.getByRole("button", { name: "기록 저장하기" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await publicPage.reload();
  await expect(publicPage.getByText("공개한 Next.js 학습 기록", { exact: true })).toHaveCount(0);

  await page.getByText("이름과 소개 수정하기", { exact: true }).click();
  await page.getByLabel("한 줄 소개").fill("만들면서 배우는 개발자입니다.");
  await page.getByRole("button", { name: "프로필 저장", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "프로필을 저장했습니다." })).toBeVisible();
  await publicPage.reload();
  await expect(publicPage.getByText("만들면서 배우는 개발자입니다.", { exact: true })).toBeVisible();

  await register(publicPage, email);
  await expect(publicPage.getByText("이미 가입된 이메일입니다. 로그인해 주세요.", { exact: true })).toBeVisible();

  await register(publicPage, `other-${email}`, "다른 사용자");
  await expect(publicPage).toHaveURL(/\/dashboard$/);
  await publicPage.goto(editLink!);
  await expect(publicPage.getByRole("heading", { name: "페이지를 찾을 수 없어요" })).toBeVisible();
  await publicPage.goto("/dashboard/new");
  await publicPage.getByLabel("무엇을 배웠나요?").fill("다른 사용자 기록 수정 시도");
  await publicPage.getByLabel("배운 내용과 느낀 점").fill("이 변경은 서버에서 소유권 검사에 의해 거부되어야 합니다.");
  await publicPage.locator(".form-stack").evaluate((form, id) => {
    const input = document.createElement("input");
    input.type = "hidden"; input.name = "id"; input.value = id;
    form.appendChild(input);
  }, recordId);
  await publicPage.getByRole("button", { name: "기록 저장하기" }).click();
  await expect(publicPage.getByText("기록을 찾을 수 없습니다.", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "공개한 Next.js 학습 기록" })).toBeVisible();

  // Check stored records without selecting or printing any reference credentials.
  await mongoose.connect(process.env.MONGODB_URI!, { dbName, serverSelectionTimeoutMS: 10000 });
  const storedUser = await mongoose.connection.db!.collection("users").findOne({ email });
  expect(storedUser?.passwordHash).not.toBe(password);
  expect(storedUser?.passwordHash).toMatch(/^\$2[aby]\$12\$/);
  expect(await mongoose.connection.db!.collection("users").countDocuments({ email })).toBe(1);
  const storedLearning = await mongoose.connection.db!.collection("learnings").findOne({ _id: new mongoose.Types.ObjectId(recordId) });
  expect(storedLearning?.isPublic).toBe(false);

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "삭제", exact: true }).click();
  await expect(page.getByRole("heading", { name: "첫 배움을 남겨 보세요" })).toBeVisible();

  await page.getByRole("button", { name: "로그아웃", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel("이메일", { exact: true }).fill(email);
  await page.getByLabel("비밀번호", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await expect(page.getByText("이메일 또는 비밀번호를 확인해 주세요.", { exact: true })).toBeVisible();
  await page.getByLabel("비밀번호", { exact: true }).fill(password);
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await visitor.close();
});

test("posts and notices persist, render safely, and enforce author ownership", async ({ page, browser }) => {
  await page.goto("/posts/new");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.locator("header")).toHaveCount(0);
  await expect(page.locator("footer")).toHaveCount(0);
  await register(page, `board-${email}`, "글 작성자");
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.getByRole("link", { name: "게시판", exact: true }).click();
  await page.getByRole("link", { name: "글쓰기", exact: true }).click();
  await expect(page.getByLabel("작성자")).toHaveValue("글 작성자");
  await page.getByLabel("제목", { exact: true }).fill("처음 작성한 게시글");
  const content = "오늘 배운 내용을 게시판에 남깁니다.\n<script>window.__postExecuted = true</script>";
  await page.getByLabel("내용", { exact: true }).fill(content);
  await page.getByRole("button", { name: "등록하기" }).click();
  await expect(page.getByRole("heading", { name: "처음 작성한 게시글", exact: true })).toBeVisible();
  const postPath = new URL(page.url()).pathname;
  const postId = postPath.split("/")[2];
  await expect(page.locator(".post-content")).toHaveText(content);
  expect(await page.evaluate(() => "__postExecuted" in window)).toBe(false);

  const visitor = await browser.newContext();
  const other = await visitor.newPage();
  await other.goto(postPath);
  await expect(other.getByRole("heading", { name: "처음 작성한 게시글", exact: true })).toBeVisible();
  await expect(other.getByRole("button", { name: "삭제", exact: true })).toHaveCount(0);
  await expect(other.getByRole("link", { name: "수정", exact: true })).toHaveCount(0);
  await register(other, `other-board-${email}`, "다른 글 작성자");
  await expect(other).toHaveURL(/\/dashboard$/);
  await other.goto(`${postPath}/edit`);
  await expect(other.getByRole("heading", { name: "페이지를 찾을 수 없어요" })).toBeVisible();
  await other.goto("/posts/new");
  await other.getByLabel("제목", { exact: true }).fill("타인 글 수정 시도");
  await other.getByLabel("내용", { exact: true }).fill("이 변경은 서버에서 거부되어야 합니다.");
  await other.locator(".form-stack").evaluate((form, id) => {
    const input = document.createElement("input");
    input.type = "hidden"; input.name = "id"; input.value = id; form.appendChild(input);
  }, postId);
  await other.getByRole("button", { name: "등록하기" }).click();
  await expect(other.getByText("글을 찾을 수 없습니다.", { exact: true })).toBeVisible();

  await other.goto("/posts/new");
  await other.getByLabel("제목", { exact: true }).fill("다른 사용자가 작성한 글");
  await other.getByLabel("내용", { exact: true }).fill("내가 작성한 글만 삭제할 수 있습니다.");
  await other.getByRole("button", { name: "등록하기" }).click();
  await expect(other.getByRole("heading", { name: "다른 사용자가 작성한 글", exact: true })).toBeVisible();
  await other.locator('input[name="id"]').evaluate((input, id) => { (input as HTMLInputElement).value = id; }, postId);
  other.once("dialog", (dialog) => dialog.accept());
  await other.getByRole("button", { name: "삭제", exact: true }).click();
  await expect(other.getByText("글을 찾을 수 없습니다.", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "처음 작성한 게시글", exact: true })).toBeVisible();

  await page.getByRole("link", { name: "수정", exact: true }).click();
  await page.getByLabel("제목", { exact: true }).fill("수정된 공지글");
  await page.getByLabel("글 종류", { exact: true }).selectOption("notice");
  await page.getByRole("button", { name: "수정 완료" }).click();
  await expect(page.getByRole("heading", { name: "수정된 공지글", exact: true })).toBeVisible();
  await page.goto("/posts?kind=notice");
  await expect(page.getByRole("link", { name: /수정된 공지글/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /다른 사용자가 작성한 글/ })).toHaveCount(0);
  await page.getByRole("link", { name: "공지쓰기", exact: true }).click();
  await expect(page.getByLabel("글 종류", { exact: true })).toHaveValue("notice");
  await page.getByLabel("제목", { exact: true }).fill("새로 작성한 공지");
  await page.getByLabel("내용", { exact: true }).fill("다음 시간에는 게시판 기능을 함께 살펴봅니다.");
  await page.getByRole("button", { name: "등록하기" }).click();
  await expect(page.getByRole("heading", { name: "새로 작성한 공지", exact: true })).toBeVisible();
  const noticePath = new URL(page.url()).pathname;
  await other.goto(noticePath);
  await expect(other.getByRole("heading", { name: "새로 작성한 공지", exact: true })).toBeVisible();
  await expect(other.getByText(`board-${email}`, { exact: true })).toHaveCount(0);
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "삭제", exact: true }).click();
  await expect(page).toHaveURL(/\/posts$/);
  await other.goto(noticePath);
  await expect(other.getByRole("heading", { name: "페이지를 찾을 수 없어요" })).toBeVisible();
  await visitor.close();
});

test("entry opens login, links to signup, and forms fit desktop and mobile screens", async ({ page }) => {
  mkdirSync("artifacts/screenshots", { recursive: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "로그인", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "회원가입", exact: true }).click();
  await expect(page).toHaveURL(/\/register$/);
  await expect(page.getByRole("button", { name: "회원가입하고 시작하기" })).toBeVisible();
  await page.locator(".auth-card").getByRole("link", { name: "로그인", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.locator(".brand")).toHaveCount(0);
  await page.goto("/login");
  await expect(page.locator("header, footer, .auth-intro, .auth-subtitle")).toHaveCount(0);
  await page.screenshot({ path: "artifacts/screenshots/login-desktop.png", fullPage: true });
  await page.goto("/posts");
  await page.screenshot({ path: "artifacts/screenshots/board-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 375, height: 812 });
  for (const route of ["/", "/register", "/login", "/posts"]) {
    await page.goto(route);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await page.goto("/login");
  await page.screenshot({ path: "artifacts/screenshots/login-mobile.png", fullPage: true });
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
});
