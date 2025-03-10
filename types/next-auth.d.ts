import type { DefaultSession } from "next-auth"

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      isAdmin: boolean
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    isAdmin: boolean
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    isAdmin: boolean
  }
}

