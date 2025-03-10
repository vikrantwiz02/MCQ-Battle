import type mongoose from "mongoose"
import { Schema, models, model } from "mongoose"

export interface IQuestion extends mongoose.Document {
  question: string
  options: string[]
  correctAnswer: string
  category: string
  difficulty: "Easy" | "Medium" | "Hard"
  createdAt: Date
}

const QuestionSchema = new Schema<IQuestion>({
  question: {
    type: String,
    required: [true, "Please provide a question"],
    trim: true,
  },
  options: {
    type: [String],
    required: [true, "Please provide options"],
    validate: [(val: string[]) => val.length === 4, "Must have exactly 4 options"],
  },
  correctAnswer: {
    type: String,
    required: [true, "Please provide the correct answer"],
    validate: [
      function (this: IQuestion, val: string) {
        return this.options.includes(val)
      },
      "Correct answer must be one of the options",
    ],
  },
  category: {
    type: String,
    required: [true, "Please provide a category"],
    enum: ["Computer Science", "Databases", "Web Development", "Artificial Intelligence", "Mathematics", "Physics"],
  },
  difficulty: {
    type: String,
    required: [true, "Please provide a difficulty level"],
    enum: ["Easy", "Medium", "Hard"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default models.Question || model<IQuestion>("Question", QuestionSchema)

