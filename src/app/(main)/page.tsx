// src/app/(main)/page.tsx
"use client";

export default function HomePage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>테스트 홈 페이지</h1>
      <p>이 메시지가 보인다면 (main)/page.tsx 라우트가 정상적으로 작동하고 있는 것입니다.</p>
      <p>기존 페이지 내용은 복잡한 기능을 포함하고 있었으므로, 이 기본 페이지가 나타난다면 기존 내용 중 일부가 오류의 원인일 수 있습니다.</p>
    </div>
  );
}
