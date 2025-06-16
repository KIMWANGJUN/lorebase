// src/app/(main)/layout.tsx
import MainHeader from '@/components/layout/MainHeader'
import MainSidebar from '@/components/layout/MainSidebar'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <MainHeader />
      <div className="container flex">
        <MainSidebar />
        <main className="flex-1 py-6">
          {children}
        </main>
      </div>
    </div>
  )
}
