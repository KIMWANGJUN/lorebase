// src/components/layout/Footer.tsx
export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} 인디 게임 개발자 커뮤니티. 모든 권리 보유.</p>
        <p className="mt-1">문의: contact@indiecom.example</p>
      </div>
    </footer>
  );
}
