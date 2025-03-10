declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      image?: string
      isAdmin: boolean
    }
  }

  interface User {
    id: string
    name: string
    email: string
    image?: string
    isAdmin: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    isAdmin: boolean
  }
}

