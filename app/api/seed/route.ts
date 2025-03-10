import { type NextRequest, NextResponse } from "next/server"
import { seedQuestions } from "@/lib/seed-data"

export async function GET(req: NextRequest) {
  try {
    await seedQuestions()
    return NextResponse.json({ message: "Database seeded successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 })
  }
}

