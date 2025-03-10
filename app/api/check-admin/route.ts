import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import type { Session } from "next-auth"

export async function GET() {
  try {
    // Type assertion to help TypeScript understand the session structure
    const session = (await getServerSession(authOptions)) as Session | null

    // If no session, return false
    if (!session) {
      return NextResponse.json({ isAdmin: false }, { status: 200 })
    }

    // Now TypeScript knows session is a Session object with a user property
    return NextResponse.json(
      {
        isAdmin: session.user?.isAdmin || false,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error checking admin status:", error)
    return NextResponse.json({ isAdmin: false }, { status: 500 })
  }
}

