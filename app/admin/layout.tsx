import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Trophy, Database, Users, LogOut } from "lucide-react"

export const metadata: Metadata = {
  title: "Admin Dashboard | MCQ Battle",
  description: "Admin dashboard for MCQ Battle",
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user.isAdmin) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-blue-900 to-blue-950 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-blue-800/30 border-r border-blue-700 p-4">
        <div className="flex items-center gap-2 mb-8">
          <Trophy className="h-6 w-6 text-yellow-400" />
          <h1 className="text-xl font-bold">MCQ Battle Admin</h1>
        </div>

        <nav className="space-y-2">
          <Link href="/admin">
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-blue-700/50">
              <Database className="mr-2 h-5 w-5" />
              Dashboard
            </Button>
          </Link>
          <Link href="/admin/questions">
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-blue-700/50">
              <Database className="mr-2 h-5 w-5" />
              Questions
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-blue-700/50">
              <Users className="mr-2 h-5 w-5" />
              Users
            </Button>
          </Link>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-blue-700/50">
              <LogOut className="mr-2 h-5 w-5" />
              Back to Site
            </Button>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-blue-800/20 border-b border-blue-700 p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Admin Panel</h2>
            <div className="flex items-center gap-2">
              <span>{session.user.name}</span>
            </div>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

