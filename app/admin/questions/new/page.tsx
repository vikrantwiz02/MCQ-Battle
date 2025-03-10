import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import QuestionForm from "../question-form"

export default function NewQuestionPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Add New Question</h1>

      <Card className="bg-blue-800/20 border-blue-700 text-white">
        <CardHeader>
          <CardTitle>Question Details</CardTitle>
        </CardHeader>
        <CardContent>
          <QuestionForm />
        </CardContent>
      </Card>
    </div>
  )
}

