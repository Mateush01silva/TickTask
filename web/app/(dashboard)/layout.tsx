import { Sidebar } from "@/components/Sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-60 p-8 min-h-screen bg-slate-50 dark:bg-slate-950">
        {children}
      </main>
    </div>
  )
}
