// src/app/(main)/layout.tsx
import MainHeader from '@/components/layout/MainHeader'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <MainHeader />
      <main className="container flex-1 py-6">
        {children}
      </main>
    </div>
  )
}
