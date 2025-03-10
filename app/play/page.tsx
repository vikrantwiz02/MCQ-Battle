"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Clock, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import { getSocket } from "@/lib/socket"

interface Question {
  _id: string
  question: string
  options: string[]
  correctAnswer: string
  category: string
}

export default function PlayGame() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [gameId, setGameId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(15)
  const [gameOver, setGameOver] = useState(false)
  const [result, setResult] = useState<"win" | "lose" | "draw" | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)
  const [opponentName, setOpponentName] = useState("Opponent")

  // Check authentication
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // Initialize socket connection
  useEffect(() => {
    if (status !== "authenticated") return

    const socket = getSocket()

    // Listen for opponent joining
    socket.on("player-joined", (data) => {
      setIsWaiting(false)
      setOpponentName(data.playerName || "Opponent")
      toast({
        title: "Opponent joined!",
        description: "The game will start now.",
      })
    })

    // Listen for opponent answers
    socket.on("player-answered", (data) => {
      if (data.userId !== session?.user.id) {
        // Update opponent score if they got it right
        if (data.correct) {
          setOpponentScore((prev) => prev + 1)
        }
      }
    })

    // Listen for game end
    socket.on("end-game", () => {
      setGameOver(true)
    })

    return () => {
      socket.off("player-joined")
      socket.off("player-answered")
      socket.off("end-game")
    }
  }, [status, session])

  // Find or create a game
  useEffect(() => {
    if (status !== "authenticated") return

    const findOrCreateGame = async () => {
      try {
        // First check for available games
        const gamesResponse = await fetch("/api/games")
        const gamesData = await gamesResponse.json()

        if (gamesData.games && gamesData.games.length > 0) {
          // Join an existing game
          setIsJoining(true)
          const gameToJoin = gamesData.games[0]

          const joinResponse = await fetch(`/api/games/${gameToJoin._id}/join`, {
            method: "POST",
          })

          if (!joinResponse.ok) {
            throw new Error("Failed to join game")
          }

          setGameId(gameToJoin._id)

          // Get questions for this game
          const questionsResponse = await fetch(`/api/games/${gameToJoin._id}/questions`)
          const questionsData = await questionsResponse.json()

          setQuestions(questionsData.questions)
          setIsLoading(false)
          setIsJoining(false)

          // Join the socket room
          const socket = getSocket()
          socket.emit("join-game", gameToJoin._id)
        } else {
          // Create a new game
          setIsWaiting(true)

          const createResponse = await fetch("/api/games", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              category: "Computer Science", // Default category
              difficulty: "Medium", // Default difficulty
            }),
          })

          if (!createResponse.ok) {
            throw new Error("Failed to create game")
          }

          const createData = await createResponse.json()
          setGameId(createData.gameId)

          // Get questions for this game
          const questionsResponse = await fetch(`/api/games/${createData.gameId}/questions`)
          const questionsData = await questionsResponse.json()

          setQuestions(questionsData.questions)
          setIsLoading(false)

          // Join the socket room
          const socket = getSocket()
          socket.emit("join-game", createData.gameId)

          toast({
            title: "Waiting for opponent",
            description: "Please wait while we find an opponent for you.",
          })
        }
      } catch (error) {
        console.error("Error setting up game:", error)
        toast({
          title: "Error",
          description: "Failed to set up game. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    findOrCreateGame()
  }, [status, session])

  // Timer effect
  useEffect(() => {
    if (gameOver || isLoading || isWaiting) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [currentQuestionIndex, gameOver, isLoading, isWaiting])

  // Handle when time is up
  const handleTimeUp = () => {
    if (!selectedOption && gameId) {
      // Submit a blank answer
      submitAnswer(null)
    }
  }

  // Submit answer to the server
  const submitAnswer = async (option: string | null) => {
    if (!gameId || !questions[currentQuestionIndex]) return

    try {
      const response = await fetch(`/api/games/${gameId}/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId: questions[currentQuestionIndex]._id,
          answer: option,
        }),
      })

      const data = await response.json()

      // Update score if correct
      if (data.correct) {
        setScore((prev) => prev + 1)
      }

      // Emit answer event to socket
      const socket = getSocket()
      socket.emit("submit-answer", {
        gameId,
        userId: session?.user.id,
        questionId: questions[currentQuestionIndex]._id,
        correct: data.correct,
      })

      // Check if game is over
      if (data.allQuestionsAnswered) {
        socket.emit("game-completed", gameId)
      } else {
        // Go to next question
        goToNextQuestion()
      }
    } catch (error) {
      console.error("Error submitting answer:", error)
      toast({
        title: "Error",
        description: "Failed to submit answer",
        variant: "destructive",
      })
    }
  }

  // Handle option selection
  const handleOptionSelect = (option: string) => {
    if (selectedOption) return // Prevent multiple selections

    setSelectedOption(option)

    // Wait a bit before submitting
    setTimeout(() => {
      submitAnswer(option)
    }, 1000)
  }

  // Go to next question
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedOption(null)
      setTimeLeft(15)
    } else {
      // Game over
      setGameOver(true)

      // Determine result
      if (score > opponentScore) {
        setResult("win")
      } else if (score < opponentScore) {
        setResult("lose")
      } else {
        setResult("draw")
      }
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-400" />
          <h2 className="text-2xl font-bold mb-2">{isJoining ? "Joining game..." : "Setting up game..."}</h2>
          <p className="text-blue-300">Please wait a moment</p>
        </div>
      </div>
    )
  }

  // Waiting for opponent
  if (isWaiting) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 text-white flex items-center justify-center p-4">
        <Card className="bg-blue-800/20 border-blue-700 text-white max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Waiting for Opponent</CardTitle>
            <CardDescription className="text-center text-blue-300">
              Please wait while we find an opponent for you
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              onClick={() => router.push("/")}
            >
              Cancel
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 text-white p-4">
      <div className="container mx-auto max-w-4xl">
        {!gameOver ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={session?.user.image || "/placeholder.svg?height=40&width=40"} alt="Your avatar" />
                  <AvatarFallback>{session?.user.name?.charAt(0) || "Y"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold">{session?.user.name || "You"}</div>
                  <Badge variant="outline" className="bg-green-800/30 text-green-400 border-green-500">
                    Score: {score}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-blue-800/50 px-4 py-2 rounded-full">
                <Clock className="h-4 w-4 text-yellow-400" />
                <span className="font-mono font-bold">{timeLeft}s</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-bold">{opponentName}</div>
                  <Badge variant="outline" className="bg-red-800/30 text-red-400 border-red-500">
                    Score: {opponentScore}
                  </Badge>
                </div>
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Opponent avatar" />
                  <AvatarFallback>O</AvatarFallback>
                </Avatar>
              </div>
            </div>

            <Progress value={(currentQuestionIndex / questions.length) * 100} className="mb-6 h-2 bg-blue-800" />

            <Card className="bg-blue-800/20 border-blue-700 text-white mb-6">
              <CardHeader>
                <CardDescription className="text-blue-300">
                  Question {currentQuestionIndex + 1} of {questions.length} • {currentQuestion?.category}
                </CardDescription>
                <CardTitle className="text-xl">{currentQuestion?.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {currentQuestion?.options.map((option, index) => (
                    <Button
                      key={index}
                      variant={
                        selectedOption === option
                          ? option === currentQuestion.correctAnswer
                            ? "default"
                            : "destructive"
                          : selectedOption && option === currentQuestion.correctAnswer
                            ? "default"
                            : "outline"
                      }
                      className={`justify-start text-left h-auto py-4 px-4 ${
                        selectedOption === option
                          ? option === currentQuestion.correctAnswer
                            ? "bg-green-600 hover:bg-green-600 border-green-500"
                            : "bg-red-600 hover:bg-red-600 border-red-500"
                          : selectedOption && option === currentQuestion.correctAnswer
                            ? "bg-green-600 hover:bg-green-600 border-green-500"
                            : "border-blue-600 hover:bg-blue-700/50"
                      }`}
                      onClick={() => handleOptionSelect(option)}
                      disabled={!!selectedOption}
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-700/50 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span>{option}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="bg-blue-800/20 border-blue-700 text-white mt-12">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Game Over!</CardTitle>
              <CardDescription className="text-center text-blue-300 text-lg">
                {result === "win"
                  ? "Congratulations! You won the battle!"
                  : result === "lose"
                    ? "Better luck next time! You lost the battle."
                    : "It's a draw! Great minds think alike."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center gap-12 my-6">
                <div className="text-center">
                  <Avatar className="h-20 w-20 mb-3 mx-auto">
                    <AvatarImage src={session?.user.image || "/placeholder.svg?height=80&width=80"} alt="Your avatar" />
                    <AvatarFallback className="text-2xl">{session?.user.name?.charAt(0) || "Y"}</AvatarFallback>
                  </Avatar>
                  <div className="font-bold text-xl">{session?.user.name || "You"}</div>
                  <div className="text-3xl font-bold text-green-400">{score}</div>
                </div>

                <div className="text-4xl font-bold text-blue-300">vs</div>

                <div className="text-center">
                  <Avatar className="h-20 w-20 mb-3 mx-auto">
                    <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Opponent avatar" />
                    <AvatarFallback className="text-2xl">O</AvatarFallback>
                  </Avatar>
                  <div className="font-bold text-xl">{opponentName}</div>
                  <div className="text-3xl font-bold text-red-400">{opponentScore}</div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center gap-4">
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  router.refresh()
                  window.location.reload()
                }}
              >
                Play Again
              </Button>
              <Link href="/">
                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                  Back to Home
                </Button>
              </Link>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}

