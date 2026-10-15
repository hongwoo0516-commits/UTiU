"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";

export function CopyLink({ path }: { path: string }) {
  const [status, setStatus] = useState("");
  async function copy() {
    try { await navigator.clipboard.writeText(`${window.location.origin}${path}`); setStatus("링크를 복사했습니다."); }
    catch { setStatus("포트폴리오를 열고 주소창의 링크를 복사해 주세요."); }
  }
  return <div className="copy-control"><button type="button" className="button secondary" onClick={copy}>{status === "링크를 복사했습니다." ? <Check size={16} /> : <Link2 size={16} />}링크 복사</button>{status && <p role="status" className="field-hint">{status}</p>}</div>;
}
