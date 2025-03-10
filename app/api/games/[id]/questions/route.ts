import { connectToDatabase } from "@/lib/db"
import Game from "@/models/game"
import Question from "@/models/question"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const gameId = params.id

    await connectToDatabase()

    // Find the game
    const game = await Game.findById(gameId)

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    // Get the questions for this game
    const questions = await Question.find({
      _id: { $in: game.questions },
    })

    return NextResponse.json({ questions }, { status: 200 })
  } catch (error) {
    console.error("Error fetching game questions:", error)
    return NextResponse.json({ error: "Failed to fetch game questions" }, { status: 500 })
  }
}

