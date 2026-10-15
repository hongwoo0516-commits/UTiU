"use client";

import { usePathname } from "next/navigation";

export function PageShell({ children, header, footer }: { children: React.ReactNode; header: React.ReactNode; footer: React.ReactNode }) {
  const pathname = usePathname();
  const authPage = pathname === "/login" || pathname === "/register";
  return <>{!authPage && header}<main id="main" className={authPage ? "page-main login-main" : "page-main"}>{children}</main>{!authPage && footer}</>;
}
