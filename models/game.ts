import type mongoose from "mongoose"
import { Schema, models, model } from "mongoose"

export interface IGame extends mongoose.Document {
  players: mongoose.Types.ObjectId[]
  questions: mongoose.Types.ObjectId[]
  playerScores: Map<string, number>
  playerAnswers: Map<string, Map<string, string>>
  status: "waiting" | "in-progress" | "completed"
  winner: mongoose.Types.ObjectId | null
  isDraw: boolean
  createdAt: Date
  updatedAt: Date
}

const GameSchema = new Schema<IGame>({
  players: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  questions: [
    {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
  ],
  playerScores: {
    type: Map,
    of: Number,
    default: new Map(),
  },
  playerAnswers: {
    type: Map,
    of: {
      type: Map,
      of: String,
    },
    default: new Map(),
  },
  status: {
    type: String,
    enum: ["waiting", "in-progress", "completed"],
    default: "waiting",
  },
  winner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  isDraw: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

export default models.Game || model<IGame>("Game", GameSchema)

