import { connectToDatabase } from "@/lib/db"
import Question from "@/models/question"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const questions = await Question.find().sort({ createdAt: -1 })

    return NextResponse.json({ questions }, { status: 200 })
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { question, options, correctAnswer, category, difficulty } = await req.json()

    // Validate input
    if (!question || !options || !correctAnswer || !category || !difficulty) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (!options.includes(correctAnswer)) {
      return NextResponse.json({ error: "Correct answer must be one of the options" }, { status: 400 })
    }

    await connectToDatabase()

    // Create new question
    const newQuestion = new Question({
      question,
      options,
      correctAnswer,
      category,
      difficulty,
    })

    await newQuestion.save()

    return NextResponse.json({ success: true, question: newQuestion }, { status: 201 })
  } catch (error) {
    console.error("Error creating question:", error)
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 })
  }
}

