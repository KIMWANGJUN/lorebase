// src/components/layout/Footer.tsx
export default function Footer() {
  return (
    <footer className="border-t border-border/50 mt-12 w-full">
      <div className="container mx-auto flex flex-col items-center justify-between py-8 text-sm text-muted-foreground sm:flex-row max-w-7xl px-4 sm:px-6 lg:px-8">
        <p>&copy; {new Date().getFullYear()} 인디 게임 개발자 커뮤니_티. 모든 권리 보유 </p>
        <p className="mt-1 sm:mt-0">문의: contact@indieguild.example</p>
      </div>
    </footer>
  );
}
