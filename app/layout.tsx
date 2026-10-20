import type { Metadata } from "next";
import { Header } from "@/components/header";
import { PageShell } from "@/components/page-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "배움이 쌓이는 나의 포트폴리오", template: "%s | 배움 포트폴리오" },
  description: "오늘 배운 것을 기록하고, 나의 성장 과정을 포트폴리오로 보여 주세요.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body><a href="#main" className="skip-link">본문으로 이동</a><PageShell header={<Header />}>{children}</PageShell></body></html>;
}
