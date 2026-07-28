/**
 * Exam Attempt domain — business logic service.
 *
 * Student-facing operations: take exams, submit answers, view results.
 * All database queries live here, decoupled from tRPC plumbing.
 */
import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import { ATTEMPT_STATUS, EXAM_STATUS } from "@workspace/utils"
import { badRequest, forbidden, notFound } from "../../utils/errors"
import type {
  CreateAttemptInput,
  GetAttemptResultInput,
  GetExamForAttemptInput,
  GetExamLeaderboardInput,
  ListAvailableExamsInput,
  ListMyAttemptsInput,
  SubmitAnswerInput,
  SubmitExamInput,
  TrackTabSwitchInput,
  UpdateActivityInput,
} from "./exam-attempt.schema"
import { safeAnswerHistorySelect, safeAttemptSelect } from "./exam-attempt.schema"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Resolve the student record from a user ID.
 * Throws FORBIDDEN if no student profile is linked.
 */
async function resolveStudent(db: PrismaClient, userId: string) {
  const student = await db.student.findUnique({
    where: { userId },
    select: { id: true, academicClassId: true },
  })

  if (!student) {
    throw forbidden("Student profile not found. Please contact admin.")
  }

  return student
}

/**
 * Fisher-Yates shuffle for randomizing question order.
 */
function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]
  }
  return shuffled
}

/**
 * Group MCQs by context so questions belonging to the same context stay together.
 */
function groupMcqsByContext<
  T extends {
    id: string
    type?: string | null
    context?: string | null
    contextUrl?: string | null
  },
>(mcqs: T[]): T[][] {
  const groups: T[][] = []
  const contextMap = new Map<string, T[]>()
  let currentAnonymousGroup: T[] | null = null

  for (const mcq of mcqs) {
    const contextText = mcq.context?.trim()
    const contextUrl = mcq.contextUrl?.trim()
    const isContextualType = mcq.type === "CONTEXTUAL"

    if (contextText) {
      currentAnonymousGroup = null
      const key = `text:${contextText}`
      let group = contextMap.get(key)
      if (!group) {
        group = []
        contextMap.set(key, group)
        groups.push(group)
      }
      group.push(mcq)
    } else if (contextUrl) {
      currentAnonymousGroup = null
      const key = `url:${contextUrl}`
      let group = contextMap.get(key)
      if (!group) {
        group = []
        contextMap.set(key, group)
        groups.push(group)
      }
      group.push(mcq)
    } else if (isContextualType) {
      if (currentAnonymousGroup) {
        currentAnonymousGroup.push(mcq)
      } else {
        currentAnonymousGroup = [mcq]
        groups.push(currentAnonymousGroup)
      }
    } else {
      currentAnonymousGroup = null
      groups.push([mcq])
    }
  }

  return groups
}

/**
 * Shuffle questions while keeping MCQs of the same context one after another.
 */
function shuffleMcqsPreservingContext<
  T extends {
    id: string
    type?: string | null
    context?: string | null
    contextUrl?: string | null
  },
>(mcqs: T[]): T[] {
  const groups = groupMcqsByContext(mcqs)
  const shuffledGroups = shuffleArray(groups)
  return shuffledGroups.flat()
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * List published exams available for a student (within date range).
 */
export async function listAvailableExams(
  db: PrismaClient,
  userId: string,
  input: ListAvailableExamsInput,
) {
  // Safely look up student profile (does not hard-fail if profile is pending creation)
  const student = await db.student.findUnique({
    where: { userId },
    select: { id: true, academicClassId: true },
  })

  // Prioritize explicit academicClassId from input, fallback to student's academicClassId if available
  const targetClassId = input.academicClassId || student?.academicClassId
  const now = new Date()

  const where: any = {
    ...(targetClassId ? { academicClassId: targetClassId } : {}),
    status: EXAM_STATUS.PUBLISHED,
    ...(input.activeOnly
      ? {
          startDate: { lte: now },
          endDate: { gte: now },
        }
      : {}),
    ...(input.type ? { type: input.type } : {}),
    ...(input.query
      ? {
          OR: [
            { title: { contains: input.query, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  const page = input.page ?? 1
  const limit = input.limit ?? 20
  const skip = input.cursor ? 1 : (page - 1) * limit

  const [items, totalItems] = await Promise.all([
    db.exam.findMany({
      take: limit,
      skip,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      where,
      select: {
        id: true,
        title: true,
        total: true,
        duration: true,
        totalMcq: true,
        startDate: true,
        endDate: true,
        type: true,
        status: true,
        hasNegativeMark: true,
        negativeMark: true,
        hasSuffle: true,
        hasRandom: true,
        academicClassId: true,
        academicClass: {
          select: {
            id: true,
            name: true,
          },
        },
        examSubjects: {
          select: {
            subject: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            examAttempts: true,
          },
        },
      },
      orderBy: [{ startDate: "desc" }],
    }),
    db.exam.count({ where }),
  ])

  // Attach student's attempt status for each exam if student profile exists
  const examIds = items.map((item) => item.id)
  const attempts =
    student && examIds.length > 0
      ? await db.examAttempt.findMany({
          where: {
            studentId: student.id,
            examId: { in: examIds },
          },
          select: {
            id: true,
            examId: true,
            status: true,
            score: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        })
      : []

  const attemptsByExamId = new Map<string, (typeof attempts)[0]>()
  for (const attempt of attempts) {
    if (!attemptsByExamId.has(attempt.examId)) {
      attemptsByExamId.set(attempt.examId, attempt)
    }
  }

  const itemsWithAttempt = items.map((exam) => {
    const attempt = attemptsByExamId.get(exam.id)
    return {
      ...exam,
      studentAttempt: attempt
        ? {
            id: attempt.id,
            status: attempt.status,
            score: attempt.score,
          }
        : null,
    }
  })

  const nextCursor =
    items.length === limit ? items[items.length - 1]?.id : undefined

  return {
    items: itemsWithAttempt,
    totalItems,
    totalPages: Math.ceil(totalItems / limit) || 1,
    page,
    limit,
    nextCursor,
  }
}

/**
 * Get exam details with MCQs for the exam-taking UI.
 * Validates access, date range, and returns existing attempt if any.
 */
export async function getExamForAttempt(
  db: PrismaClient,
  userId: string,
  input: GetExamForAttemptInput,
) {
  const student = await resolveStudent(db, userId)

  const exam = await db.exam.findUnique({
    where: { id: input.examId },
    select: {
      id: true,
      title: true,
      total: true,
      duration: true,
      totalMcq: true,
      startDate: true,
      endDate: true,
      hasSuffle: true,
      hasRandom: true,
      hasNegativeMark: true,
      negativeMark: true,
      type: true,
      status: true,
      academicClassId: true,
      examSubjects: {
        select: {
          subjectId: true,
          mcqIds: true,
        },
      },
    },
  })

  if (!exam) throw notFound("Exam")

  if (exam.status !== EXAM_STATUS.PUBLISHED) {
    throw forbidden("This exam is not currently published.")
  }

  if (student.academicClassId && exam.academicClassId !== student.academicClassId) {
    throw forbidden("This exam is not assigned to your class.")
  }

  // Check for existing in-progress or not-started attempt
  const existingAttempt = await db.examAttempt.findFirst({
    where: {
      examId: input.examId,
      studentId: student.id,
      status: {
        in: [ATTEMPT_STATUS.NOT_STARTED, ATTEMPT_STATUS.IN_PROGRESS],
      },
    },
    select: safeAttemptSelect,
  })

  // Fetch MCQs (prioritize explicitly assigned MCQ IDs if any exist)
  const subjectIds = exam.examSubjects.map((es) => es.subjectId)
  const explicitMcqIds = Array.from(
    new Set(exam.examSubjects.flatMap((es) => es.mcqIds ?? []))
  )

  let mcqs = await db.mcq.findMany({
    where: {
      ...(explicitMcqIds.length > 0
        ? { id: { in: explicitMcqIds } }
        : { subjectId: { in: subjectIds } }),
      isActive: true,
    },
    select: {
      id: true,
      question: true,
      options: true,
      statements: true,
      type: true,
      isMath: true,
      questionUrl: true,
      context: true,
      contextUrl: true,
      subject: {
        select: { id: true, name: true },
      },
      chapter: {
        select: { id: true, name: true },
      },
    },
  })

  // If hasRandom, pick `totalMcq` random questions while keeping contextual MCQs together
  if (exam.hasRandom && mcqs.length > exam.totalMcq) {
    mcqs = shuffleMcqsPreservingContext(mcqs).slice(0, exam.totalMcq)
    mcqs = shuffleMcqsPreservingContext(mcqs)
  } else {
    mcqs = mcqs.slice(0, exam.totalMcq)
  }

  // If hasSuffle, randomize question group order (keeping contextual questions contiguous)
  if (exam.hasSuffle) {
    mcqs = shuffleMcqsPreservingContext(mcqs)
  } else {
    // Ensure even without shuffle, contextual questions sharing a context are kept consecutive
    mcqs = groupMcqsByContext(mcqs).flat()
  }

  // If there's an existing attempt, load its answer history
  let answerHistory: any[] = []
  if (existingAttempt) {
    answerHistory = await db.answerHistory.findMany({
      where: { attemptId: existingAttempt.id },
      select: {
        mcqId: true,
        selectedOption: true,
        questionNumber: true,
      },
    })
  }

  return {
    exam,
    questions: mcqs,
    attempt: existingAttempt,
    answerHistory,
  }
}

/**
 * Get full attempt result with all answer history + MCQ details.
 */
export async function getAttemptResult(
  db: PrismaClient,
  userId: string,
  input: GetAttemptResultInput,
) {
  const student = await resolveStudent(db, userId)

  const attempt = await db.examAttempt.findUnique({
    where: { id: input.attemptId },
    select: {
      ...safeAttemptSelect,
      studentId: true,
      hasNegativeMark: true,
      negativeMark: true,
      answerHistory: {
        select: safeAnswerHistorySelect,
        orderBy: { questionNumber: "asc" },
      },
    },
  })

  if (!attempt) throw notFound("Exam Attempt")
  if (attempt.studentId !== student.id) {
    throw forbidden("You do not have access to this attempt.")
  }

  return attempt
}

/**
 * List student's past exam attempts with pagination.
 */
export async function listMyAttempts(
  db: PrismaClient,
  userId: string,
  input: ListMyAttemptsInput,
) {
  const student = await resolveStudent(db, userId)

  const where = {
    studentId: student.id,
    ...(input.status ? { status: input.status } : {}),
  }

  const page = input.page ?? 1
  const limit = input.limit ?? 20
  const skip = input.cursor ? 1 : (page - 1) * limit

  const [items, totalItems] = await Promise.all([
    db.examAttempt.findMany({
      take: limit,
      skip,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      where,
      select: safeAttemptSelect,
      orderBy: [{ createdAt: "desc" }],
    }),
    db.examAttempt.count({ where }),
  ])

  const nextCursor =
    items.length === limit ? items[items.length - 1]?.id : undefined

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / limit) || 1,
    page,
    limit,
    nextCursor,
  }
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/**
 * Create a new exam attempt for a student.
 * Snapshots exam settings into the attempt record.
 */
export async function createAttempt(
  db: PrismaClient,
  userId: string,
  input: CreateAttemptInput,
) {
  const student = await resolveStudent(db, userId)

  const exam = await db.exam.findUnique({
    where: { id: input.examId },
    select: {
      id: true,
      status: true,
      startDate: true,
      endDate: true,
      totalMcq: true,
      total: true,
      type: true,
      hasNegativeMark: true,
      negativeMark: true,
      hasSuffle: true,
      hasRandom: true,
      academicClassId: true,
    },
  })

  if (!exam) throw notFound("Exam")

  if (exam.status !== EXAM_STATUS.PUBLISHED) {
    throw forbidden("This exam is not currently available.")
  }

  if (student.academicClassId && exam.academicClassId !== student.academicClassId) {
    throw forbidden("This exam is not assigned to your class.")
  }

  const now = new Date()

  // Check for existing active attempt
  const existingAttempt = await db.examAttempt.findFirst({
    where: {
      examId: input.examId,
      studentId: student.id,
      status: {
        in: [ATTEMPT_STATUS.NOT_STARTED, ATTEMPT_STATUS.IN_PROGRESS],
      },
    },
    select: { id: true, status: true },
  })

  if (existingAttempt) {
    // Resume existing attempt — update to In Progress if Not Started
    if (existingAttempt.status === ATTEMPT_STATUS.NOT_STARTED) {
      return db.examAttempt.update({
        where: { id: existingAttempt.id },
        data: {
          status: ATTEMPT_STATUS.IN_PROGRESS,
          startTime: now,
        },
        select: safeAttemptSelect,
      })
    }
    // Already in progress — return as-is
    return db.examAttempt.findUniqueOrThrow({
      where: { id: existingAttempt.id },
      select: safeAttemptSelect,
    })
  }

  // Check if already completed (no re-attempts in this version)
  const completedAttempt = await db.examAttempt.findFirst({
    where: {
      examId: input.examId,
      studentId: student.id,
      status: {
        in: [ATTEMPT_STATUS.SUBMITTED, ATTEMPT_STATUS.AUTO_SUBMITTED],
      },
    },
    select: { id: true },
  })

  if (completedAttempt) {
    throw forbidden("You have already completed this exam.")
  }

  // Create new attempt with snapshotted settings
  return db.examAttempt.create({
    data: {
      examId: input.examId,
      studentId: student.id,
      type: exam.type,
      totalQuestions: exam.totalMcq,
      status: ATTEMPT_STATUS.IN_PROGRESS,
      startTime: now,
      // Snapshot exam settings
      hasNegativeMark: exam.hasNegativeMark,
      negativeMark: exam.negativeMark,
      hasShuffle: exam.hasSuffle,
      hasRandom: exam.hasRandom,
    },
    select: safeAttemptSelect,
  })
}

/**
 * Submit (or update) a single answer within an active attempt.
 * Creates/updates the AnswerHistory record and keeps ExamAttempt counters in sync.
 */
export async function submitAnswer(
  db: PrismaClient,
  userId: string,
  input: SubmitAnswerInput,
) {
  const student = await resolveStudent(db, userId)

  const attempt = await db.examAttempt.findUnique({
    where: { id: input.attemptId },
    select: { id: true, studentId: true, status: true },
  })

  if (!attempt) throw notFound("Exam Attempt")
  if (attempt.studentId !== student.id) {
    throw forbidden("You do not have access to this attempt.")
  }
  if (attempt.status !== ATTEMPT_STATUS.IN_PROGRESS) {
    throw badRequest("This exam attempt is no longer active.")
  }

  // Get the MCQ's correct answer
  const mcq = await db.mcq.findUnique({
    where: { id: input.mcqId },
    select: { id: true, answer: true },
  })
  if (!mcq) throw notFound("MCQ")

  const isCorrect = input.selectedOption === mcq.answer

  // Check for existing answer (answer change scenario)
  const existingAnswer = await db.answerHistory.findFirst({
    where: {
      attemptId: input.attemptId,
      mcqId: input.mcqId,
    },
    select: {
      id: true,
      selectedOption: true,
      isCorrect: true,
      changeCount: true,
    },
  })

  if (existingAnswer) {
    // Update existing answer — track the change
    const wasCorrect = existingAnswer.isCorrect

    const updatedAnswer = await db.answerHistory.update({
      where: { id: existingAnswer.id },
      data: {
        previousAnswer: existingAnswer.selectedOption,
        selectedOption: input.selectedOption,
        correctAnswer: mcq.answer,
        isCorrect,
        isChanged: true,
        changeCount: { increment: 1 },
        answeredAt: new Date(),
      },
      select: { id: true, isCorrect: true },
    })

    // Update ExamAttempt counters if correctness changed
    if (wasCorrect !== isCorrect) {
      await db.examAttempt.update({
        where: { id: input.attemptId },
        data: {
          correctAnswers: { increment: isCorrect ? 1 : -1 },
          wrongAnswers: { increment: isCorrect ? -1 : 1 },
          lastActivityAt: new Date(),
        },
      })
    } else {
      await db.examAttempt.update({
        where: { id: input.attemptId },
        data: { lastActivityAt: new Date() },
      })
    }

    return updatedAnswer
  }

  // Create new answer
  const newAnswer = await db.answerHistory.create({
    data: {
      attemptId: input.attemptId,
      mcqId: input.mcqId,
      questionNumber: input.questionNumber,
      selectedOption: input.selectedOption,
      correctAnswer: mcq.answer,
      isCorrect,
    },
    select: { id: true, isCorrect: true },
  })

  // Update ExamAttempt counters
  await db.examAttempt.update({
    where: { id: input.attemptId },
    data: {
      answeredCount: { increment: 1 },
      correctAnswers: { increment: isCorrect ? 1 : 0 },
      wrongAnswers: { increment: isCorrect ? 0 : 1 },
      lastActivityAt: new Date(),
      // Update streak
      currentStreak: isCorrect ? { increment: 1 } : 0,
    },
  })

  // Update bestStreak if needed
  if (isCorrect) {
    const updatedAttempt = await db.examAttempt.findUnique({
      where: { id: input.attemptId },
      select: { currentStreak: true, bestStreak: true },
    })
    if (updatedAttempt && updatedAttempt.currentStreak > updatedAttempt.bestStreak) {
      await db.examAttempt.update({
        where: { id: input.attemptId },
        data: { bestStreak: updatedAttempt.currentStreak },
      })
    }
  }

  return newAnswer
}

/**
 * Final submission of an exam attempt.
 * Calculates score with negative marking and sets final status.
 */
export async function submitExam(
  db: PrismaClient,
  userId: string,
  input: SubmitExamInput,
) {
  const student = await resolveStudent(db, userId)

  const attempt = await db.examAttempt.findUnique({
    where: { id: input.attemptId },
    select: {
      id: true,
      studentId: true,
      status: true,
      examId: true,
      totalQuestions: true,
      hasNegativeMark: true,
      negativeMark: true,
      startTime: true,
    },
  })

  if (!attempt) throw notFound("Exam Attempt")
  if (attempt.studentId !== student.id) {
    throw forbidden("You do not have access to this attempt.")
  }
  if (
    attempt.status === ATTEMPT_STATUS.SUBMITTED ||
    attempt.status === ATTEMPT_STATUS.AUTO_SUBMITTED
  ) {
    return db.examAttempt.findUnique({
      where: { id: input.attemptId },
      select: safeAttemptSelect,
    }).then((a) => a!)
  }

  if (
    attempt.status !== ATTEMPT_STATUS.IN_PROGRESS &&
    attempt.status !== ATTEMPT_STATUS.NOT_STARTED
  ) {
    throw badRequest("This exam attempt has already been submitted.")
  }

  // Get the exam's total marks for score calculation
  const exam = await db.exam.findUnique({
    where: { id: attempt.examId },
    select: { total: true, totalMcq: true },
  })
  if (!exam) throw notFound("Exam")

  // Calculate final stats from answer history
  const answers = await db.answerHistory.findMany({
    where: { attemptId: input.attemptId },
    select: { isCorrect: true },
  })

  const correctAnswers = answers.filter((a) => a.isCorrect).length
  const wrongAnswers = answers.filter((a) => !a.isCorrect).length
  const skippedQuestions = attempt.totalQuestions - answers.length

  // Calculate score
  const marksPerQuestion = exam.totalMcq > 0 ? exam.total / exam.totalMcq : 1
  let score = correctAnswers * marksPerQuestion
  if (attempt.hasNegativeMark) {
    score -= wrongAnswers * attempt.negativeMark
  }
  score = Math.max(0, score) // Score can't go below 0

  // Calculate duration
  const now = new Date()
  const durationSeconds = attempt.startTime
    ? Math.floor((now.getTime() - attempt.startTime.getTime()) / 1000)
    : 0

  return db.examAttempt.update({
    where: { id: input.attemptId },
    data: {
      status: ATTEMPT_STATUS.SUBMITTED,
      submissionType: input.submissionType,
      score,
      correctAnswers,
      wrongAnswers,
      skippedQuestions,
      endTime: now,
      duration: durationSeconds,
    },
    select: safeAttemptSelect,
  })
}

/**
 * Track a tab switch event (anti-cheat).
 */
export async function trackTabSwitch(
  db: PrismaClient,
  userId: string,
  input: TrackTabSwitchInput,
) {
  const student = await resolveStudent(db, userId)

  const attempt = await db.examAttempt.findUnique({
    where: { id: input.attemptId },
    select: { id: true, studentId: true, status: true },
  })

  if (!attempt) throw notFound("Exam Attempt")
  if (attempt.studentId !== student.id) {
    throw forbidden("You do not have access to this attempt.")
  }

  return db.examAttempt.update({
    where: { id: input.attemptId },
    data: {
      tabSwitches: { increment: 1 },
      tabSwitchTimes: { push: new Date() },
      lastActivityAt: new Date(),
    },
    select: {
      id: true,
      tabSwitches: true,
    },
  })
}

/**
 * Update last activity timestamp (heartbeat for monitoring).
 */
export async function updateActivity(
  db: PrismaClient,
  userId: string,
  input: UpdateActivityInput,
) {
  const student = await resolveStudent(db, userId)

  const attempt = await db.examAttempt.findUnique({
    where: { id: input.attemptId },
    select: { id: true, studentId: true },
  })

  if (!attempt) throw notFound("Exam Attempt")
  if (attempt.studentId !== student.id) {
    throw forbidden("You do not have access to this attempt.")
  }

  return db.examAttempt.update({
    where: { id: input.attemptId },
    data: { lastActivityAt: new Date() },
    select: { id: true, lastActivityAt: true },
  })
}

/**
 * Get merit list / leaderboard for a specific exam.
 */
export async function getExamLeaderboard(
  db: PrismaClient,
  userId: string,
  input: GetExamLeaderboardInput,
) {
  const exam = await db.exam.findUnique({
    where: { id: input.examId },
    select: {
      id: true,
      title: true,
      total: true,
      duration: true,
      totalMcq: true,
    },
  })

  if (!exam) {
    throw notFound("Exam not found.")
  }

  // Find all submitted attempts for this exam
  const attempts = await db.examAttempt.findMany({
    where: {
      examId: input.examId,
      status: { in: [ATTEMPT_STATUS.SUBMITTED, ATTEMPT_STATUS.AUTO_SUBMITTED] },
    },
    select: {
      id: true,
      score: true,
      correctAnswers: true,
      wrongAnswers: true,
      totalQuestions: true,
      duration: true,
      createdAt: true,
      startTime: true,
      endTime: true,
      student: {
        select: {
          id: true,
          userId: true,
          name: true,
          nameBn: true,
          imageUrl: true,
          roll: true,
          studentId: true,
        },
      },
    },
    orderBy: [
      { score: "desc" },
      { duration: "asc" },
      { createdAt: "asc" },
    ],
  })

  // Attach rank and identify current student
  const student = await db.student.findUnique({
    where: { userId },
    select: { id: true },
  })

  const leaderboard = attempts.map((att, index) => ({
    rank: index + 1,
    id: att.id,
    score: att.score ?? 0,
    correctAnswers: att.correctAnswers ?? 0,
    wrongAnswers: att.wrongAnswers ?? 0,
    totalQuestions: att.totalQuestions ?? 0,
    duration: att.duration,
    createdAt: att.createdAt,
    student: {
      id: att.student.id,
      name: att.student.name || att.student.nameBn || "শিক্ষার্থী",
      image: att.student.imageUrl,
      roll: att.student.roll,
      studentId: att.student.studentId,
    },
    isCurrentUser: student ? att.student.id === student.id : false,
  }))

  const currentUserEntry = leaderboard.find((entry) => entry.isCurrentUser)

  return {
    exam,
    leaderboard,
    totalParticipants: leaderboard.length,
    currentUserEntry: currentUserEntry ?? null,
  }
}
