import { connectToDatabase } from "@/lib/db"
import Game from "@/models/game"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
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

    if (game.status !== "waiting") {
      return NextResponse.json({ error: "Game is no longer accepting players" }, { status: 400 })
    }

    if (game.players.length >= 2) {
      return NextResponse.json({ error: "Game is already full" }, { status: 400 })
    }

    if (game.players.some((p) => p.toString() === session.user.id)) {
      return NextResponse.json({ error: "You are already in this game" }, { status: 400 })
    }

    // Add the player to the game
    game.players.push(new mongoose.Types.ObjectId(session.user.id))
    game.status = "in-progress"
    await game.save()

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error joining game:", error)
    return NextResponse.json({ error: "Failed to join game" }, { status: 500 })
  }
}

