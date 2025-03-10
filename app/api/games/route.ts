import { connectToDatabase } from "@/lib/db"
import Game from "@/models/game"
import Question from "@/models/question"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { category, difficulty } = await req.json()

    await connectToDatabase()

    // Get 5 random questions for the game
    const query: any = {}
    if (category) query.category = category
    if (difficulty) query.difficulty = difficulty

    const questions = await Question.aggregate([{ $match: query }, { $sample: { size: 5 } }])

    if (questions.length < 5) {
      return NextResponse.json(
        { error: "Not enough questions available for this category/difficulty" },
        { status: 400 },
      )
    }

    // Create a new game
    const game = new Game({
      players: [new mongoose.Types.ObjectId(session.user.id)],
      questions: questions.map((q) => q._id),
      status: "waiting",
    })

    await game.save()

    return NextResponse.json({ gameId: game._id }, { status: 201 })
  } catch (error) {
    console.error("Error creating game:", error)
    return NextResponse.json({ error: "Failed to create game" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Find games where the user is waiting for an opponent
    const waitingGames = await Game.find({
      status: "waiting",
      players: { $ne: new mongoose.Types.ObjectId(session.user.id) },
    }).limit(5)

    return NextResponse.json({ games: waitingGames }, { status: 200 })
  } catch (error) {
    console.error("Error fetching games:", error)
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 })
  }
}

