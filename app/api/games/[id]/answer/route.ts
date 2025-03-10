import { connectToDatabase } from "@/lib/db"
import Game from "@/models/game"
import Question from "@/models/question"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const gameId = params.id
    const { questionId, answer } = await req.json()

    await connectToDatabase()

    // Find the game
    const game = await Game.findById(gameId)

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    if (game.status !== "in-progress") {
      return NextResponse.json({ error: "Game is not in progress" }, { status: 400 })
    }

    if (!game.players.some((p) => p.toString() === session.user.id)) {
      return NextResponse.json({ error: "You are not a player in this game" }, { status: 403 })
    }

    // Find the question
    const question = await Question.findById(questionId)

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    // Record the player's answer
    const userId = session.user.id

    // Initialize player answers map if it doesn't exist
    if (!game.playerAnswers.has(userId)) {
      game.playerAnswers.set(userId, new Map())
    }

    // Set the answer for this question
    game.playerAnswers.get(userId).set(questionId, answer)

    // Check if the answer is correct and update score
    if (answer === question.correctAnswer) {
      const currentScore = game.playerScores.get(userId) || 0
      game.playerScores.set(userId, currentScore + 1)
    }

    await game.save()

    // Check if all players have answered all questions
    let allQuestionsAnswered = true
    for (const playerId of game.players) {
      const playerAnswers = game.playerAnswers.get(playerId.toString()) || new Map()
      if (game.questions.length !== playerAnswers.size) {
        allQuestionsAnswered = false
        break
      }
    }

    // If all questions are answered, complete the game
    if (allQuestionsAnswered) {
      game.status = "completed"

      // Determine the winner
      let highestScore = -1
      let winnerId = null
      let isDraw = false

      for (const [playerId, score] of game.playerScores.entries()) {
        if (score > highestScore) {
          highestScore = score
          winnerId = playerId
          isDraw = false
        } else if (score === highestScore) {
          isDraw = true
        }
      }

      if (!isDraw && winnerId) {
        game.winner = winnerId
      } else {
        game.isDraw = true
      }

      await game.save()
    }

    return NextResponse.json(
      {
        correct: answer === question.correctAnswer,
        allQuestionsAnswered,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error submitting answer:", error)
    return NextResponse.json({ error: "Failed to submit answer" }, { status: 500 })
  }
}

