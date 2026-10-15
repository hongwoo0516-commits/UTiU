import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { auth } from "@/auth";
import { logoutAction } from "@/app/actions/auth";

export async function Header() {
  const session = await auth();
  return <header className="site-header"><div className="container header-inner">
    <nav aria-label="페이지 메뉴"><Link href="/" className="nav-link">홈</Link><Link href="/posts" className="nav-link">게시판</Link></nav>
    <nav aria-label="메인 메뉴">{session?.user ? <><Link href="/dashboard" className="nav-link">내 학습 기록</Link><form action={logoutAction}><button type="submit" className="nav-link">로그아웃</button></form></> : <><Link href="/login" className="nav-link">로그인</Link><Link href="/register" className="button primary small">시작하기<ArrowUpRight size={15} /></Link></>}</nav>
  </div></header>;
}
