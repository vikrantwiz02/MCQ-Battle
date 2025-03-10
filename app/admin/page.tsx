import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { connectToDatabase } from "@/lib/db"
import Question from "@/models/question"
import User from "@/models/user"
import Game from "@/models/game"
import { Database, Users, GamepadIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

async function getStats() {
  await connectToDatabase()

  const questionCount = await Question.countDocuments()
  const userCount = await User.countDocuments()
  const gameCount = await Game.countDocuments()

  const categoryStats = await Question.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ])

  const difficultyStats = await Question.aggregate([
    { $group: { _id: "$difficulty", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ])

  return {
    questionCount,
    userCount,
    gameCount,
    categoryStats,
    difficultyStats,
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/admin/questions">
            <Button className="bg-blue-600 hover:bg-blue-700">Manage Questions</Button>
          </Link>
          <Link href="/admin/users">
            <Button variant="outline" className="border-blue-600 text-white hover:bg-blue-700/50">
              Manage Users
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-blue-800/20 border-blue-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl">Total Questions</CardTitle>
            <Database className="h-5 w-5 text-blue-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.questionCount}</p>
            <p className="text-sm text-blue-300 mt-2">Across all categories</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-800/20 border-blue-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl">Total Users</CardTitle>
            <Users className="h-5 w-5 text-green-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.userCount}</p>
            <p className="text-sm text-blue-300 mt-2">Registered players</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-800/20 border-blue-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl">Total Games</CardTitle>
            <GamepadIcon className="h-5 w-5 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.gameCount}</p>
            <p className="text-sm text-blue-300 mt-2">Played so far</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-blue-800/20 border-blue-700 text-white">
          <CardHeader>
            <CardTitle>Questions by Category</CardTitle>
            <CardDescription className="text-blue-300">Distribution of questions across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.categoryStats.map((category) => (
                <div key={category._id} className="space-y-2">
                  <div className="flex justify-between">
                    <span>{category._id}</span>
                    <span className="font-medium">{category.count}</span>
                  </div>
                  <div className="w-full bg-blue-950 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(category.count / stats.questionCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}

              {stats.categoryStats.length === 0 && (
                <p className="text-center py-4 text-blue-300">No questions available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-800/20 border-blue-700 text-white">
          <CardHeader>
            <CardTitle>Questions by Difficulty</CardTitle>
            <CardDescription className="text-blue-300">Distribution of questions by difficulty level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.difficultyStats.map((difficulty) => (
                <div key={difficulty._id} className="space-y-2">
                  <div className="flex justify-between">
                    <span>{difficulty._id}</span>
                    <span className="font-medium">{difficulty.count}</span>
                  </div>
                  <div className="w-full bg-blue-950 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        difficulty._id === "Easy"
                          ? "bg-green-500"
                          : difficulty._id === "Medium"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${(difficulty.count / stats.questionCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}

              {stats.difficultyStats.length === 0 && (
                <p className="text-center py-4 text-blue-300">No questions available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Link href="/admin/questions/new">
          <Button size="lg" className="bg-green-600 hover:bg-green-700">
            Add New Question
          </Button>
        </Link>
      </div>
    </div>
  )
}

