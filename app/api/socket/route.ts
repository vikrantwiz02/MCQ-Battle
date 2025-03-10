import { Server } from "socket.io"
import type { NextApiResponseServerIO } from "@/types/socket"
import type { NextRequest } from "next/server"

export async function GET(req: NextRequest, res: NextApiResponseServerIO) {
  if (res.socket.server.io) {
    console.log("Socket is already running")
  } else {
    console.log("Socket is initializing")
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    io.on("connection", (socket) => {
      console.log(`User connected: ${socket.id}`)

      // Join a game room
      socket.on("join-game", (gameId) => {
        socket.join(gameId)
        console.log(`User ${socket.id} joined game: ${gameId}`)
      })

      // Submit an answer
      socket.on("submit-answer", ({ gameId, userId, questionId, answer }) => {
        socket.to(gameId).emit("player-answered", { userId, questionId })
        console.log(`User ${userId} answered question ${questionId} in game ${gameId}`)
      })

      // Game completed
      socket.on("game-completed", (gameId) => {
        io.to(gameId).emit("end-game")
        console.log(`Game ${gameId} completed`)
      })

      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`)
      })
    })
  }

  return new Response("Socket initialized", { status: 200 })
}

