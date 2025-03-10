import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { connectToDatabase } from "@/lib/db"
import Question from "@/models/question"
import { Plus, Edit } from "lucide-react"
import DeleteQuestionButton from "./delete-button"

async function getQuestions() {
  await connectToDatabase()

  const questions = await Question.find().sort({ createdAt: -1 })

  return questions
}

export default async function QuestionsPage() {
  const questions = await getQuestions()

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Questions</h1>
        <Link href="/admin/questions/new">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </Link>
      </div>

      <Card className="bg-blue-800/20 border-blue-700 text-white">
        <CardHeader>
          <CardTitle>All Questions ({questions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questions.map((question) => (
              <div
                key={question._id.toString()}
                className="p-4 border border-blue-700 rounded-lg bg-blue-900/30 hover:bg-blue-900/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-lg">{question.question}</h3>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/questions/${question._id}/edit`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 border-blue-600 text-blue-400 hover:bg-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <DeleteQuestionButton id={question._id.toString()} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  {question.options.map((option, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded text-sm ${
                        option === question.correctAnswer
                          ? "bg-green-800/30 border border-green-700"
                          : "bg-blue-800/30 border border-blue-700"
                      }`}
                    >
                      {option} {option === question.correctAnswer && "(Correct)"}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Badge className="bg-blue-700">{question.category}</Badge>
                  <Badge
                    className={
                      question.difficulty === "Easy"
                        ? "bg-green-700"
                        : question.difficulty === "Medium"
                          ? "bg-yellow-700"
                          : "bg-red-700"
                    }
                  >
                    {question.difficulty}
                  </Badge>
                </div>
              </div>
            ))}

            {questions.length === 0 && (
              <div className="text-center py-8 text-blue-300">
                No questions found. Add your first question to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

