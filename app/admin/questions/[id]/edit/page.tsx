import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import QuestionForm from "../../question-form"
import { connectToDatabase } from "@/lib/db"
import Question from "@/models/question"
import { notFound } from "next/navigation"

interface EditQuestionPageProps {
  params: {
    id: string
  }
}

async function getQuestion(id: string) {
  await connectToDatabase()

  const question = await Question.findById(id)

  if (!question) {
    return null
  }

  return {
    id: question._id.toString(),
    question: question.question,
    options: question.options,
    correctAnswer: question.correctAnswer,
    category: question.category,
    difficulty: question.difficulty,
  }
}

export default async function EditQuestionPage({ params }: EditQuestionPageProps) {
  const question = await getQuestion(params.id)

  if (!question) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Question</h1>

      <Card className="bg-blue-800/20 border-blue-700 text-white">
        <CardHeader>
          <CardTitle>Question Details</CardTitle>
        </CardHeader>
        <CardContent>
          <QuestionForm question={question} />
        </CardContent>
      </Card>
    </div>
  )
}

