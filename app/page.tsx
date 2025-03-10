"use client"

import type React from "react"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Trophy, Users, BookOpen, Play, LogOut } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function Home() {
  const { data: session, status } = useSession()

  const handleLogout = async () => {
    await signOut({ redirect: false })
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-400" />
            MCQ Battle
          </h1>
          <div className="flex gap-4 items-center">
            {status === "authenticated" ? (
              <>
                {/* Show user info and logout when logged in */}
                <div className="text-sm mr-2">
                  Hello, <span className="font-semibold">{session.user.name}</span>
                  {session.user.isAdmin && (
                    <Link href="/admin" className="ml-2 text-xs bg-purple-700 px-2 py-1 rounded">
                      Admin Panel
                    </Link>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="border-red-600 text-red-400 hover:bg-red-900/30 hover:text-red-300"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                {/* Show login/register when not logged in */}
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-blue-600 hover:bg-blue-700">Register</Button>
                </Link>
              </>
            )}
          </div>
        </header>

        <main className="flex flex-col items-center justify-center py-12">
          <div className="max-w-3xl w-full text-center mb-12">
            <h2 className="text-5xl font-bold mb-6">Test Your Knowledge in 1v1 Battles</h2>
            <p className="text-xl text-blue-200 mb-8">
              Challenge friends or random opponents to MCQ duels across various topics and see who comes out on top!
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <Link href="/play">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6 flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Play Now
                </Button>
              </Link>
              <Link href="/topics">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 text-lg px-8 py-6"
                >
                  Browse Topics
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mt-8">
            <FeatureCard
              icon={<BookOpen className="h-10 w-10 text-blue-400" />}
              title="Diverse Topics"
              description="From science to pop culture, test your knowledge across thousands of questions."
            />
            <FeatureCard
              icon={<Users className="h-10 w-10 text-blue-400" />}
              title="1v1 Battles"
              description="Challenge friends or get matched with random opponents for exciting duels."
            />
            <FeatureCard
              icon={<Trophy className="h-10 w-10 text-yellow-400" />}
              title="Leaderboards"
              description="Climb the ranks and show off your knowledge supremacy to the world."
            />
          </div>
        </main>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-blue-800/50 p-6 rounded-xl border border-blue-700">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-blue-200">{description}</p>
    </div>
  )
}

