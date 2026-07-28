/**
 * Exam Attempt domain — Zod input/output schemas.
 *
 * Single source of truth for student exam-taking procedure types.
 */
import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export const listAvailableExamsSchema = paginationSchema.extend({
  academicClassId: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  query: z.string().optional(),
  activeOnly: z.boolean().optional(),
  page: z.number().int().min(1).optional(),
})

export type ListAvailableExamsInput = z.infer<typeof listAvailableExamsSchema>

export const getExamForAttemptSchema = z.object({
  examId: z.string().min(1),
})

export type GetExamForAttemptInput = z.infer<typeof getExamForAttemptSchema>

export const getAttemptResultSchema = z.object({
  attemptId: z.string().min(1),
})

export type GetAttemptResultInput = z.infer<typeof getAttemptResultSchema>

export const listMyAttemptsSchema = paginationSchema.extend({
  status: z.string().optional(),
  page: z.number().int().min(1).optional(),
})

export type ListMyAttemptsInput = z.infer<typeof listMyAttemptsSchema>

export const getExamLeaderboardSchema = z.object({
  examId: z.string().min(1),
})

export type GetExamLeaderboardInput = z.infer<typeof getExamLeaderboardSchema>

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export const createAttemptSchema = z.object({
  examId: z.string().min(1),
})

export type CreateAttemptInput = z.infer<typeof createAttemptSchema>

export const submitAnswerSchema = z.object({
  attemptId: z.string().min(1),
  mcqId: z.string().min(1),
  selectedOption: z.string().min(1),
  questionNumber: z.number().int().min(1),
})

export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>

export const submitExamSchema = z.object({
  attemptId: z.string().min(1),
  submissionType: z.string().default("Manual"),
})

export type SubmitExamInput = z.infer<typeof submitExamSchema>

export const trackTabSwitchSchema = z.object({
  attemptId: z.string().min(1),
})

export type TrackTabSwitchInput = z.infer<typeof trackTabSwitchSchema>

export const updateActivitySchema = z.object({
  attemptId: z.string().min(1),
})

export type UpdateActivityInput = z.infer<typeof updateActivitySchema>

// ---------------------------------------------------------------------------
// Select Shapes
// ---------------------------------------------------------------------------

export const safeAttemptSelect = {
  id: true,
  type: true,
  score: true,
  correctAnswers: true,
  wrongAnswers: true,
  skippedQuestions: true,
  currentStreak: true,
  bestStreak: true,
  startTime: true,
  endTime: true,
  duration: true,
  totalQuestions: true,
  answeredCount: true,
  flaggedQuestions: true,
  status: true,
  submissionType: true,
  tabSwitches: true,
  feedbackStatus: true,
  createdAt: true,
  updatedAt: true,
  exam: {
    select: {
      id: true,
      title: true,
      total: true,
      duration: true,
      totalMcq: true,
      hasNegativeMark: true,
      negativeMark: true,
      type: true,
    },
  },
} as const

export const safeAnswerHistorySelect = {
  id: true,
  questionNumber: true,
  selectedOption: true,
  correctAnswer: true,
  isCorrect: true,
  answeredAt: true,
  timeSpent: true,
  previousAnswer: true,
  isChanged: true,
  changeCount: true,
  mcq: {
    select: {
      id: true,
      question: true,
      answer: true,
      options: true,
      explanation: true,
      questionUrl: true,
      context: true,
      contextUrl: true,
      statements: true,
      isMath: true,
      type: true,
      subject: {
        select: {
          id: true,
          name: true,
        },
      },
      chapter: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} as const
