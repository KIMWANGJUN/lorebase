// src/components/layout/Footer.tsx
export default function Footer() {
  return (
    <footer className="border-t border-border/50 mt-12">
      <div className="container py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} 인디 게임 개발자 커뮤니티. 모든 권리 보유.</p>
        <p className="mt-1">문의: contact@indieguild.example</p>
      </div>
    </footer>
  );
}
