import { connectToDatabase } from "./db"
import Question from "@/models/question"

const sampleQuestions = [
  {
    question: "Which data structure uses LIFO (Last In First Out)?",
    options: ["Queue", "Stack", "Linked List", "Tree"],
    correctAnswer: "Stack",
    category: "Computer Science",
    difficulty: "Easy",
  },
  {
    question: "What is the time complexity of binary search?",
    options: ["O(n)", "O(n²)", "O(log n)", "O(n log n)"],
    correctAnswer: "O(log n)",
    category: "Computer Science",
    difficulty: "Medium",
  },
  {
    question: "Which sorting algorithm has the best average time complexity?",
    options: ["Bubble Sort", "Insertion Sort", "Quick Sort", "Selection Sort"],
    correctAnswer: "Quick Sort",
    category: "Computer Science",
    difficulty: "Medium",
  },
  {
    question: "What does HTML stand for?",
    options: [
      "Hyper Text Markup Language",
      "High Tech Modern Language",
      "Hyper Transfer Markup Language",
      "Hyper Text Modern Links",
    ],
    correctAnswer: "Hyper Text Markup Language",
    category: "Web Development",
    difficulty: "Easy",
  },
  {
    question: "Which of these is not a JavaScript framework?",
    options: ["React", "Angular", "Vue", "Django"],
    correctAnswer: "Django",
    category: "Web Development",
    difficulty: "Easy",
  },
  {
    question: "What is the primary key in a relational database?",
    options: [
      "A key that can be null",
      "A key that uniquely identifies each record",
      "A key that references another table",
      "A key that can have duplicate values",
    ],
    correctAnswer: "A key that uniquely identifies each record",
    category: "Databases",
    difficulty: "Easy",
  },
  {
    question: "Which of the following is a NoSQL database?",
    options: ["MySQL", "PostgreSQL", "MongoDB", "Oracle"],
    correctAnswer: "MongoDB",
    category: "Databases",
    difficulty: "Easy",
  },
  {
    question: "What is the purpose of normalization in databases?",
    options: [
      "To increase data redundancy",
      "To reduce data redundancy",
      "To increase database size",
      "To make queries slower",
    ],
    correctAnswer: "To reduce data redundancy",
    category: "Databases",
    difficulty: "Medium",
  },
  {
    question: "What is a neural network?",
    options: [
      "A type of computer hardware",
      "A programming language",
      "A computational model inspired by the human brain",
      "A network protocol",
    ],
    correctAnswer: "A computational model inspired by the human brain",
    category: "Artificial Intelligence",
    difficulty: "Medium",
  },
  {
    question: "Which of these is a supervised learning algorithm?",
    options: ["K-means clustering", "Principal Component Analysis", "Linear Regression", "Apriori algorithm"],
    correctAnswer: "Linear Regression",
    category: "Artificial Intelligence",
    difficulty: "Medium",
  },
  {
    question: "What is the derivative of x²?",
    options: ["x", "2x", "x²", "2"],
    correctAnswer: "2x",
    category: "Mathematics",
    difficulty: "Easy",
  },
  {
    question: "What is the value of π (pi) to two decimal places?",
    options: ["3.14", "3.16", "3.12", "3.18"],
    correctAnswer: "3.14",
    category: "Mathematics",
    difficulty: "Easy",
  },
  {
    question: "What is Newton's First Law of Motion?",
    options: [
      "Force equals mass times acceleration",
      "An object at rest stays at rest unless acted upon by a force",
      "For every action, there is an equal and opposite reaction",
      "Energy cannot be created or destroyed",
    ],
    correctAnswer: "An object at rest stays at rest unless acted upon by a force",
    category: "Physics",
    difficulty: "Medium",
  },
  {
    question: "What is the unit of electric current?",
    options: ["Volt", "Watt", "Ampere", "Ohm"],
    correctAnswer: "Ampere",
    category: "Physics",
    difficulty: "Easy",
  },
  {
    question: "Which of these is not a fundamental force in physics?",
    options: ["Gravity", "Electromagnetic force", "Centrifugal force", "Strong nuclear force"],
    correctAnswer: "Centrifugal force",
    category: "Physics",
    difficulty: "Hard",
  },
]

export async function seedQuestions() {
  try {
    await connectToDatabase()

    // Check if questions already exist
    const count = await Question.countDocuments()

    if (count === 0) {
      // Insert sample questions
      await Question.insertMany(sampleQuestions)
      console.log("Sample questions seeded successfully!")
    } else {
      console.log("Questions already exist in the database")
    }
  } catch (error) {
    console.error("Error seeding questions:", error)
  }
}

