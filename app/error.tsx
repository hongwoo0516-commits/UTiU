"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <div className="container error-page"><h1>잠시 연결이 원활하지 않아요</h1><p>조금 뒤 다시 시도해 주세요. 문제가 계속되면 서버의 연결 설정을 확인해 주세요.</p><button type="button" className="button primary" onClick={reset}>다시 시도하기</button></div>;
}
