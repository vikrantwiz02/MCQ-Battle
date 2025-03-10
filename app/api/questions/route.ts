import { connectToDatabase } from "@/lib/db"
import Question from "@/models/question"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const category = url.searchParams.get("category")
    const difficulty = url.searchParams.get("difficulty")
    const limit = Number.parseInt(url.searchParams.get("limit") || "5")

    await connectToDatabase()

    const query: any = {}
    if (category) query.category = category
    if (difficulty) query.difficulty = difficulty

    // Get random questions
    const questions = await Question.aggregate([{ $match: query }, { $sample: { size: limit } }])

    return NextResponse.json({ questions }, { status: 200 })
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}

