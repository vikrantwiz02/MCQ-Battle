import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Code, Database, Globe, Brain, Calculator, Atom } from "lucide-react"

export default function Topics() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12">
          <h1 className="text-3xl font-bold mb-2">Topics</h1>
          <p className="text-blue-200">Choose a topic category to battle in</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TopicCard
            icon={<Code className="h-8 w-8 text-blue-400" />}
            title="Computer Science"
            description="Data structures, algorithms, and programming concepts"
            questionCount={250}
            difficulty="Medium"
            color="blue"
          />

          <TopicCard
            icon={<Database className="h-8 w-8 text-green-400" />}
            title="Databases"
            description="SQL, NoSQL, database design and optimization"
            questionCount={120}
            difficulty="Hard"
            color="green"
          />

          <TopicCard
            icon={<Globe className="h-8 w-8 text-purple-400" />}
            title="Web Development"
            description="HTML, CSS, JavaScript, frameworks and libraries"
            questionCount={300}
            difficulty="Easy"
            color="purple"
          />

          <TopicCard
            icon={<Brain className="h-8 w-8 text-pink-400" />}
            title="Artificial Intelligence"
            description="Machine learning, neural networks, and AI concepts"
            questionCount={180}
            difficulty="Hard"
            color="pink"
          />

          <TopicCard
            icon={<Calculator className="h-8 w-8 text-yellow-400" />}
            title="Mathematics"
            description="Algebra, calculus, statistics, and discrete math"
            questionCount={200}
            difficulty="Medium"
            color="yellow"
          />

          <TopicCard
            icon={<Atom className="h-8 w-8 text-red-400" />}
            title="Physics"
            description="Mechanics, thermodynamics, quantum physics"
            questionCount={150}
            difficulty="Hard"
            color="red"
          />
        </div>
      </div>
    </div>
  )
}

function TopicCard({
  icon,
  title,
  description,
  questionCount,
  difficulty,
  color,
}: {
  icon: React.ReactNode
  title: string
  description: string
  questionCount: number
  difficulty: string
  color: string
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-800/50 border-blue-700 hover:bg-blue-800/70",
    green: "bg-green-800/50 border-green-700 hover:bg-green-800/70",
    purple: "bg-purple-800/50 border-purple-700 hover:bg-purple-800/70",
    pink: "bg-pink-800/50 border-pink-700 hover:bg-pink-800/70",
    yellow: "bg-yellow-800/50 border-yellow-700 hover:bg-yellow-800/70",
    red: "bg-red-800/50 border-red-700 hover:bg-red-800/70",
  }

  const badgeColorMap: Record<string, string> = {
    Easy: "bg-green-800/30 text-green-400 border-green-500",
    Medium: "bg-yellow-800/30 text-yellow-400 border-yellow-500",
    Hard: "bg-red-800/30 text-red-400 border-red-500",
  }

  return (
    <Card className={`${colorMap[color]} border transition-all duration-200`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>{icon}</div>
          <Badge variant="outline" className={badgeColorMap[difficulty]}>
            {difficulty}
          </Badge>
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-white/70">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-white/70">{questionCount} questions available</div>
      </CardContent>
      <CardFooter>
        <Link href="/play" className="w-full">
          <Button className="w-full bg-white/10 hover:bg-white/20 flex items-center justify-between">
            <span>Start Battle</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

