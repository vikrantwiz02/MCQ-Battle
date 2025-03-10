import { connectToDatabase } from "@/lib/db"
import User from "@/models/user"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, adminSecretKey } = await req.json();
    
    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }
    
    // Check if the admin secret key is provided and valid
    const isAdmin = adminSecretKey === process.env.ADMIN_SECRET_KEY && adminSecretKey !== "";
    
    // Create new user
    const user = new User({
      name,
      email,
      password,
      isAdmin, // Set isAdmin based on the secret key check
    });
    
    await user.save();
    
    return NextResponse.json(
      { 
        success: true, 
        message: "User registered successfully",
        isAdmin // Include isAdmin status in the response
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}
