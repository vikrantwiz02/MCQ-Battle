import { connectToDatabase } from "@/lib/db"
import User from "@/models/user"
import { type NextRequest, NextResponse } from "next/server"

// This is a utility endpoint to make a user an admin
export async function POST(req: NextRequest) {
  try {
    const { email, secretKey } = await req.json()

    // Validate the secret key
    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: "Unauthorized - Invalid secret key" }, { status: 401 })
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    console.log(`Attempting to make user admin: ${email}`)

    await connectToDatabase()

    // Check if MongoDB connection is successful
    console.log("MongoDB connection established")

    // List all users for debugging
    const allUsers = await User.find({}, "email")
    console.log(
      "All users in database:",
      allUsers.map((u) => u.email),
    )

    const user = await User.findOne({ email })

    if (!user) {
      console.log(`User with email ${email} not found`)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log(`User found: ${user.email}`)

    // Make the user an admin
    user.isAdmin = true
    await user.save()

    console.log(`User ${email} is now an admin`)

    return NextResponse.json({ success: true, message: "User is now an admin" }, { status: 200 })
  } catch (error) {
    console.error("Error making user admin:", error)
    return NextResponse.json(
      { error: "Failed to make user admin", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

