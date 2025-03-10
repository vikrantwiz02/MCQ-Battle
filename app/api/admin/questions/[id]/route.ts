import { connectToDatabase } from "@/lib/db"
import Question from "@/models/question"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id

    await connectToDatabase()

    const question = await Question.findById(id)

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    return NextResponse.json({ question }, { status: 200 })
  } catch (error) {
    console.error("Error fetching question:", error)
    return NextResponse.json({ error: "Failed to fetch question" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id
    const { question, options, correctAnswer, category, difficulty } = await req.json()

    // Validate input
    if (!question || !options || !correctAnswer || !category || !difficulty) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (!options.includes(correctAnswer)) {
      return NextResponse.json({ error: "Correct answer must be one of the options" }, { status: 400 })
    }

    await connectToDatabase()

    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      {
        question,
        options,
        correctAnswer,
        category,
        difficulty,
      },
      { new: true },
    )

    if (!updatedQuestion) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, question: updatedQuestion }, { status: 200 })
  } catch (error) {
    console.error("Error updating question:", error)
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id

    await connectToDatabase()

    const deletedQuestion = await Question.findByIdAndDelete(id)

    if (!deletedQuestion) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error deleting question:", error)
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 })
  }
}

