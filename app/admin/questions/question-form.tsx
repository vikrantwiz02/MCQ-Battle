"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/hooks/use-toast"

interface QuestionFormProps {
  question?: {
    id: string
    question: string
    options: string[]
    correctAnswer: string
    category: string
    difficulty: string
  }
}

const categories = [
  "Computer Science",
  "Databases",
  "Web Development",
  "Artificial Intelligence",
  "Mathematics",
  "Physics",
]

const difficulties = ["Easy", "Medium", "Hard"]

export default function QuestionForm({ question }: QuestionFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    question: question?.question || "",
    options: question?.options || ["", "", "", ""],
    correctAnswer: question?.correctAnswer || "",
    category: question?.category || "Computer Science",
    difficulty: question?.difficulty || "Medium",
  })

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({ ...formData, options: newOptions })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate form
    if (!formData.question.trim()) {
      toast({
        title: "Error",
        description: "Question is required",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    if (formData.options.some((option) => !option.trim())) {
      toast({
        title: "Error",
        description: "All options are required",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    if (!formData.correctAnswer) {
      toast({
        title: "Error",
        description: "Please select a correct answer",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      const url = question ? `/api/admin/questions/${question.id}` : "/api/admin/questions"

      const method = question ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save question")
      }

      toast({
        title: "Success",
        description: question ? "Question updated successfully" : "Question created successfully",
      })

      router.push("/admin/questions")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save question",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="question">Question</Label>
        <Textarea
          id="question"
          placeholder="Enter your question here"
          value={formData.question}
          onChange={(e) => setFormData({ ...formData, question: e.target.value })}
          className="bg-blue-950/50 border-blue-700 text-white resize-none min-h-[100px]"
        />
      </div>

      <div className="space-y-4">
        <Label>Options</Label>
        <RadioGroup
          value={formData.correctAnswer}
          onValueChange={(value) => setFormData({ ...formData, correctAnswer: value })}
        >
          {formData.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value={option} id={`option-${index}`} disabled={!option.trim()} />
              <div className="flex-1">
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="bg-blue-950/50 border-blue-700 text-white"
                />
              </div>
            </div>
          ))}
        </RadioGroup>
        <p className="text-sm text-blue-300">Select the radio button next to the correct answer</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger className="bg-blue-950/50 border-blue-700 text-white">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-blue-900 border-blue-700 text-white">
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select
            value={formData.difficulty}
            onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
          >
            <SelectTrigger className="bg-blue-950/50 border-blue-700 text-white">
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent className="bg-blue-900 border-blue-700 text-white">
              {difficulties.map((difficulty) => (
                <SelectItem key={difficulty} value={difficulty}>
                  {difficulty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          className="border-blue-700 text-white hover:bg-blue-800"
          onClick={() => router.push("/admin/questions")}
        >
          Cancel
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
          {isSubmitting ? (question ? "Updating..." : "Creating...") : question ? "Update Question" : "Create Question"}
        </Button>
      </div>
    </form>
  )
}

