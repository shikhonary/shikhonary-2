/**
 * ExamGroup domain — business logic service.
 *
 * All database queries and calculation logic live here.
 */
import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import { badRequest, notFound } from "../../utils/errors"
import type {
  AddExamGroupItemInput,
  BulkDeleteExamGroupsInput,
  CalculateExamGroupResultsInput,
  CreateExamGroupInput,
  DeleteExamGroupInput,
  ExamGroupStatsInput,
  GetExamGroupInput,
  GetStudentExamGroupResultInput,
  ListExamGroupResultsInput,
  ListExamGroupsInput,
  RemoveExamGroupItemInput,
  ReorderExamGroupItemsInput,
  StudentExamGroupLeaderboardInput,
  StudentExamGroupsInput,
  TogglePublishExamGroupInput,
  UpdateExamGroupInput,
  UpdateExamGroupItemInput,
} from "./exam-group.schema"
import { safeExamGroupSelect } from "./exam-group.schema"


// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function listExamGroups(db: PrismaClient, input: ListExamGroupsInput) {
  const where = {
    ...(input.type ? { type: input.type } : {}),
    ...(input.academicClassId ? { academicClassId: input.academicClassId } : {}),
    ...(typeof input.isPublished === "boolean" ? { isPublished: input.isPublished } : {}),
    ...(input.query
      ? {
          OR: [
            { title: { contains: input.query, mode: "insensitive" as const } },
            { code: { contains: input.query, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  let orderBy: any = [{ createdAt: "desc" }]
  switch (input.sort) {
    case "oldest":
      orderBy = [{ createdAt: "asc" }]
      break
    case "title_asc":
      orderBy = [{ title: "asc" }]
      break
    case "title_desc":
      orderBy = [{ title: "desc" }]
      break
    case "newest":
    default:
      orderBy = [{ createdAt: "desc" }]
      break
  }

  const page = input.page ?? 1
  const limit = input.limit ?? 20
  const skip = input.cursor ? 1 : (page - 1) * limit

  const [items, totalItems] = await Promise.all([
    db.examGroup.findMany({
      take: limit,
      skip,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      where,
      select: safeExamGroupSelect,
      orderBy,
    }),
    db.examGroup.count({ where }),
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

export async function getExamGroupById(db: PrismaClient, input: GetExamGroupInput) {
  const item = await db.examGroup.findUnique({
    where: { id: input.id },
    select: safeExamGroupSelect,
  })

  if (!item) throw notFound("Exam Group")
  return item
}

export async function getExamGroupStats(db: PrismaClient, input?: ExamGroupStatsInput) {
  const where = {
    ...(input?.type ? { type: input?.type } : {}),
    ...(input?.academicClassId ? { academicClassId: input?.academicClassId } : {}),
  }

  const [totalCount, publishedCount, typeGroup] = await Promise.all([
    db.examGroup.count({ where }),
    db.examGroup.count({ where: { ...where, isPublished: true } }),
    db.examGroup.groupBy({
      by: ["type"],
      where,
      _count: { id: true },
    }),
  ])

  const typeCounts = typeGroup.reduce<Record<string, number>>((acc, item) => {
    acc[item.type] = item._count.id
    return acc
  }, {})

  return {
    totalCount,
    publishedCount,
    draftCount: totalCount - publishedCount,
    typeCounts,
  }
}

// ---------------------------------------------------------------------------
// Mutations: ExamGroup CRUD
// ---------------------------------------------------------------------------

export async function createExamGroup(db: PrismaClient, input: CreateExamGroupInput) {
  const { items, academicClassId, ...data } = input

  if (academicClassId) {
    const classExists = await db.academicClass.findUnique({
      where: { id: academicClassId },
      select: { id: true },
    })
    if (!classExists) throw badRequest("Invalid academic class ID")
  }

  const examGroup = await db.examGroup.create({
    data: {
      ...data,
      academicClassId: academicClassId || null,
      items: items && items.length > 0
        ? {
            create: items.map((item, idx) => ({
              examId: item.examId,
              position: item.position ?? idx,
              weightage: item.weightage ?? 100.0,
              isRequired: item.isRequired ?? true,
            })),
          }
        : undefined,
    },
    select: safeExamGroupSelect,
  })

  return examGroup
}

export async function updateExamGroup(db: PrismaClient, input: UpdateExamGroupInput) {
  const { id, academicClassId, ...data } = input

  const existing = await db.examGroup.findUnique({
    where: { id },
    select: { id: true },
  })
  if (!existing) throw notFound("Exam Group")

  if (academicClassId !== undefined && academicClassId !== null) {
    const classExists = await db.academicClass.findUnique({
      where: { id: academicClassId },
      select: { id: true },
    })
    if (!classExists) throw badRequest("Invalid academic class ID")
  }

  const updated = await db.examGroup.update({
    where: { id },
    data: {
      ...data,
      ...(academicClassId !== undefined ? { academicClassId } : {}),
    },
    select: safeExamGroupSelect,
  })

  return updated
}

export async function deleteExamGroup(db: PrismaClient, input: DeleteExamGroupInput) {
  const existing = await db.examGroup.findUnique({
    where: { id: input.id },
    select: { id: true },
  })
  if (!existing) throw notFound("Exam Group")

  await db.examGroup.delete({ where: { id: input.id } })
  return { success: true, id: input.id }
}

export async function bulkDeleteExamGroups(db: PrismaClient, input: BulkDeleteExamGroupsInput) {
  const result = await db.examGroup.deleteMany({
    where: { id: { in: input.ids } },
  })

  return { success: true, count: result.count }
}

export async function togglePublishExamGroup(db: PrismaClient, input: TogglePublishExamGroupInput) {
  const existing = await db.examGroup.findUnique({
    where: { id: input.id },
    select: { id: true },
  })
  if (!existing) throw notFound("Exam Group")

  const updated = await db.examGroup.update({
    where: { id: input.id },
    data: { isPublished: input.isPublished },
    select: safeExamGroupSelect,
  })

  return updated
}

// ---------------------------------------------------------------------------
// Mutations: ExamGroup Items Management
// ---------------------------------------------------------------------------

export async function addExamGroupItem(db: PrismaClient, input: AddExamGroupItemInput) {
  const [group, exam] = await Promise.all([
    db.examGroup.findUnique({ where: { id: input.examGroupId }, select: { id: true } }),
    db.exam.findUnique({ where: { id: input.examId }, select: { id: true } }),
  ])

  if (!group) throw notFound("Exam Group")
  if (!exam) throw notFound("Exam")

  const existingItem = await db.examGroupItem.findUnique({
    where: {
      examGroupId_examId: {
        examGroupId: input.examGroupId,
        examId: input.examId,
      },
    },
  })

  if (existingItem) {
    throw badRequest("Exam is already added to this group")
  }

  const item = await db.examGroupItem.create({
    data: {
      examGroupId: input.examGroupId,
      examId: input.examId,
      position: input.position ?? 0,
      weightage: input.weightage ?? 100.0,
      isRequired: input.isRequired ?? true,
    },
    include: {
      exam: {
        select: {
          id: true,
          title: true,
          total: true,
          duration: true,
          status: true,
        },
      },
    },
  })

  return item
}

export async function updateExamGroupItem(db: PrismaClient, input: UpdateExamGroupItemInput) {
  const existing = await db.examGroupItem.findUnique({
    where: { id: input.id },
  })
  if (!existing) throw notFound("Exam Group Item")

  const updated = await db.examGroupItem.update({
    where: { id: input.id },
    data: {
      ...(input.position !== undefined ? { position: input.position } : {}),
      ...(input.weightage !== undefined ? { weightage: input.weightage } : {}),
      ...(input.isRequired !== undefined ? { isRequired: input.isRequired } : {}),
    },
    include: {
      exam: {
        select: {
          id: true,
          title: true,
          total: true,
        },
      },
    },
  })

  return updated
}

export async function removeExamGroupItem(db: PrismaClient, input: RemoveExamGroupItemInput) {
  const item = await db.examGroupItem.findUnique({
    where: {
      examGroupId_examId: {
        examGroupId: input.examGroupId,
        examId: input.examId,
      },
    },
  })

  if (!item) throw notFound("Exam Group Item")

  await db.examGroupItem.delete({ where: { id: item.id } })
  return { success: true, id: item.id }
}

export async function reorderExamGroupItems(db: PrismaClient, input: ReorderExamGroupItemsInput) {
  const group = await db.examGroup.findUnique({
    where: { id: input.examGroupId },
    select: { id: true },
  })
  if (!group) throw notFound("Exam Group")

  await db.$transaction(
    input.items.map((item) =>
      db.examGroupItem.update({
        where: {
          examGroupId_examId: {
            examGroupId: input.examGroupId,
            examId: item.examId,
          },
        },
        data: {
          position: item.position,
          ...(item.weightage !== undefined ? { weightage: item.weightage } : {}),
          ...(item.isRequired !== undefined ? { isRequired: item.isRequired } : {}),
        },
      })
    )
  )

  return getExamGroupById(db, { id: input.examGroupId })
}

// ---------------------------------------------------------------------------
// Calculations & Results Engine
// ---------------------------------------------------------------------------

/**
 * Calculates aggregated score, total max marks, percentages, pass/fail status,
 * and updates merit position ranks for all students in an ExamGroup.
 */
export async function calculateExamGroupResults(
  db: PrismaClient,
  input: CalculateExamGroupResultsInput
) {
  const group = await db.examGroup.findUnique({
    where: { id: input.examGroupId },
    include: {
      items: {
        include: {
          exam: {
            select: {
              id: true,
              total: true,
            },
          },
        },
        orderBy: { position: "asc" },
      },
    },
  })

  if (!group) throw notFound("Exam Group")
  if (group.items.length === 0) {
    return {
      success: true,
      count: 0,
      message: "No exams added to this group yet.",
    }
  }

  const examIds = group.items.map((i) => i.examId)

  // Fetch all completed/submitted attempts for exams in this group
  const attempts = await db.examAttempt.findMany({
    where: {
      examId: { in: examIds },
      status: {
        in: [
          "Submitted",
          "Auto-Submitted",
          "Completed",
          "SUBMITTED",
          "AUTO_SUBMITTED",
          "COMPLETED",
        ],
      },

      ...(input.studentId ? { studentId: input.studentId } : {}),
    },
    select: {
      id: true,
      examId: true,
      studentId: true,
      score: true,
      totalQuestions: true,
    },
  })

  // Map best attempt per student per exam
  // studentId -> Map(examId -> bestAttemptScore)
  const studentAttemptMap = new Map<string, Map<string, number>>()

  for (const att of attempts) {
    if (!studentAttemptMap.has(att.studentId)) {
      studentAttemptMap.set(att.studentId, new Map())
    }
    const examScores = studentAttemptMap.get(att.studentId)!
    const existingScore = examScores.get(att.examId) ?? -Infinity
    if (att.score > existingScore) {
      examScores.set(att.examId, att.score)
    }
  }

  const calculatedResults: Array<{
    studentId: string
    totalObtainedMarks: number
    totalMaxMarks: number
    percentage: number
    status: string
    examsAttempted: number
    totalExamsInGroup: number
  }> = []

  const totalExamsInGroup = group.items.length

  // Process calculation for each student
  for (const [studentId, examScoresMap] of studentAttemptMap.entries()) {
    let totalObtained = 0
    let totalMax = 0
    const examScoreList: Array<{ obtained: number; max: number; weight: number }> = []

    for (const item of group.items) {
      const score = examScoresMap.get(item.examId)
      const examMax = item.exam.total || 100

      if (score !== undefined) {
        examScoreList.push({
          obtained: score,
          max: examMax,
          weight: item.weightage,
        })
      }
    }

    const examsAttempted = examScoreList.length

    if (group.calculationType === "SUM") {
      // Direct sum of obtained scores vs group total marks or sum of exams max
      totalObtained = examScoreList.reduce((acc, curr) => acc + curr.obtained, 0)
      totalMax = group.totalMarks ?? group.items.reduce((acc, curr) => acc + (curr.exam.total || 100), 0)
    } else if (group.calculationType === "AVERAGE") {
      // Average score percentage
      const totalPct = examScoreList.reduce((acc, curr) => acc + (curr.obtained / curr.max), 0)
      totalObtained = examsAttempted > 0 ? (totalPct / examsAttempted) * (group.totalMarks ?? 100) : 0
      totalMax = group.totalMarks ?? 100
    } else if (group.calculationType === "WEIGHTED_AVERAGE") {
      // Weighted average score: sum(score * weightage / 100)
      totalObtained = examScoreList.reduce((acc, curr) => acc + (curr.obtained * (curr.weight / 100)), 0)
      totalMax = group.totalMarks ?? group.items.reduce((acc, curr) => acc + ((curr.exam.total || 100) * (curr.weightage / 100)), 0)
    } else if (group.calculationType === "BEST_OF_N") {
      // Sort obtained descending and pick top N
      const bestN = group.bestOfNCount ?? totalExamsInGroup
      const sorted = [...examScoreList].sort((a, b) => b.obtained - a.obtained)
      const topN = sorted.slice(0, bestN)
      totalObtained = topN.reduce((acc, curr) => acc + curr.obtained, 0)
      totalMax = topN.reduce((acc, curr) => acc + curr.max, 0)
    }

    const percentage = totalMax > 0 ? Math.min(100, Math.max(0, (totalObtained / totalMax) * 100)) : 0

    // Determine pass/fail
    let status = "PASSED"
    if (group.passMarks && totalObtained < group.passMarks) {
      status = "FAILED"
    } else if (percentage < 33.0) {
      status = "FAILED"
    }

    calculatedResults.push({
      studentId,
      totalObtainedMarks: Number(totalObtained.toFixed(2)),
      totalMaxMarks: Number(totalMax.toFixed(2)),
      percentage: Number(percentage.toFixed(2)),
      status,
      examsAttempted,
      totalExamsInGroup,
    })
  }

  // Sort by totalObtainedMarks descending to assign merit rank positions
  calculatedResults.sort((a, b) => b.totalObtainedMarks - a.totalObtainedMarks)

  // Upsert results with merit ranks into DB
  const now = new Date()
  await db.$transaction(
    calculatedResults.map((res, index) =>
      db.examGroupResult.upsert({
        where: {
          examGroupId_studentId: {
            examGroupId: group.id,
            studentId: res.studentId,
          },
        },
        create: {
          examGroupId: group.id,
          studentId: res.studentId,
          totalObtainedMarks: res.totalObtainedMarks,
          totalMaxMarks: res.totalMaxMarks,
          percentage: res.percentage,
          meritPosition: index + 1,
          status: res.status,
          examsAttempted: res.examsAttempted,
          totalExamsInGroup: res.totalExamsInGroup,
          calculatedAt: now,
        },
        update: {
          totalObtainedMarks: res.totalObtainedMarks,
          totalMaxMarks: res.totalMaxMarks,
          percentage: res.percentage,
          meritPosition: index + 1,
          status: res.status,
          examsAttempted: res.examsAttempted,
          totalExamsInGroup: res.totalExamsInGroup,
          calculatedAt: now,
        },
      })
    )
  )

  return {
    success: true,
    count: calculatedResults.length,
    calculatedAt: now,
    message: `Calculated results and merit list for ${calculatedResults.length} student(s).`,
  }
}

export async function listExamGroupResults(db: PrismaClient, input: ListExamGroupResultsInput) {
  const where = {
    examGroupId: input.examGroupId,
    ...(input.status ? { status: input.status } : {}),
    ...(input.query
      ? {
          student: {
            OR: [
              { name: { contains: input.query, mode: "insensitive" as const } },
              { nameBn: { contains: input.query, mode: "insensitive" as const } },
              { fPhone: { contains: input.query } },
              { mPhone: { contains: input.query } },
            ],
          },
        }
      : {}),
  }

  let orderBy: any = [{ meritPosition: "asc" }]
  switch (input.sort) {
    case "score_desc":
      orderBy = [{ totalObtainedMarks: "desc" }]
      break
    case "score_asc":
      orderBy = [{ totalObtainedMarks: "asc" }]
      break
    case "rank_desc":
      orderBy = [{ meritPosition: "desc" }]
      break
    case "name_asc":
      orderBy = [{ student: { name: "asc" } }]
      break
    case "rank_asc":
    default:
      orderBy = [{ meritPosition: "asc" }]
      break
  }

  const page = input.page ?? 1
  const limit = input.limit ?? 20
  const skip = input.cursor ? 1 : (page - 1) * limit

  const [items, totalItems] = await Promise.all([
    db.examGroupResult.findMany({
      take: limit,
      skip,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      where,
      orderBy,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            roll: true,
            user: {
              select: {
                image: true,
              },
            },
          },
        },
      },
    }),
    db.examGroupResult.count({ where }),
  ])

  const nextCursor =
    items.length === limit ? items[items.length - 1]?.id : undefined

  const mappedItems = items.map((item) => {
    const student = item.student
    return {
      ...item,
      student: student ? {
        id: student.id,
        name: student.name,
        roll: student.roll,
        studentId: student.roll || (parseInt(student.id.replace(/\D/g, '').slice(0, 6)) || 100000),
        nameBn: student.name,
        section: "",
        imageUrl: student.user?.image || null,
      } : null,
    }
  })

  return {
    items: mappedItems,
    totalItems,
    totalPages: Math.ceil(totalItems / limit) || 1,
    page,
    limit,
    nextCursor,
  }
}

export async function getStudentExamGroupResult(db: PrismaClient, input: GetStudentExamGroupResultInput) {
  const result = await db.examGroupResult.findUnique({
    where: {
      examGroupId_studentId: {
        examGroupId: input.examGroupId,
        studentId: input.studentId!,
      },
    },
    include: {
      examGroup: {
        select: safeExamGroupSelect,
      },
      student: {
        select: {
          id: true,
          name: true,
          roll: true,
          user: {
            select: {
              image: true,
            },
          },
        },
      },
    },
  })

  if (!result) throw notFound("Student Exam Group Result")

  // Fetch individual attempt scores for breakdown
  const examIds = result.examGroup.items.map((i) => i.examId)
  const attempts = await db.examAttempt.findMany({
    where: {
      studentId: input.studentId,
      examId: { in: examIds },
      status: { in: ["Submitted", "Auto-Submitted", "Completed"] },
    },
    select: {
      id: true,
      examId: true,
      score: true,
      createdAt: true,
    },
  })

  const attemptMap = new Map(attempts.map((a) => [a.examId, a]))

  const breakdown = result.examGroup.items.map((item) => {
    const att = attemptMap.get(item.examId)
    return {
      examId: item.examId,
      title: item.exam.title,
      totalMarks: item.exam.total,
      weightage: item.weightage,
      isRequired: item.isRequired,
      scoreObtained: att ? att.score : null,
      attempted: !!att,
    }
  })

  return {
    ...result,
    student: result.student ? {
      id: result.student.id,
      name: result.student.name,
      roll: result.student.roll,
      studentId: result.student.roll || (parseInt(result.student.id.replace(/\D/g, '').slice(0, 6)) || 100000),
      nameBn: result.student.name,
      imageUrl: result.student.user?.image || null,
    } : null,
    breakdown,
  }
}

// ---------------------------------------------------------------------------
// Student-Facing Queries (studentProcedure)
// ---------------------------------------------------------------------------

/**
 * List published exam groups matching the logged-in student's academic class,
 * with the student's own merit position and percentage (if calculated or on-demand).
 */
export async function listStudentExamGroups(
  db: PrismaClient,
  userId: string,
  input: StudentExamGroupsInput,
) {
  // Resolve the current student
  const student = await db.student.findFirst({
    where: { userId },
    select: { id: true, academicClassId: true },
  })

  if (!student) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Student profile not found for this user",
    })
  }

  const where = {
    isPublished: true,
    academicClassId: student.academicClassId,
  }

  const page = input.page ?? 1
  const limit = input.limit ?? 20
  const skip = (page - 1) * limit

  const [groups, totalItems] = await Promise.all([
    db.examGroup.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ createdAt: "desc" }],
      select: {
        ...safeExamGroupSelect,
        // Also eagerly load this student's result if it exists
        groupResults: {
          where: { studentId: student.id },
          select: {
            meritPosition: true,
            percentage: true,
            totalObtainedMarks: true,
            totalMaxMarks: true,
            status: true,
          },
        },
      },
    }),
    db.examGroup.count({ where }),
  ])

  // Automatically calculate results for any group where results are missing or need update
  await Promise.allSettled(
    groups.map((g) =>
      calculateExamGroupResults(db, { examGroupId: g.id }).catch(() => null),
    ),
  )

  // Re-fetch updated student results for accuracy
  const groupIds = groups.map((g) => g.id)
  const freshResults = await db.examGroupResult.findMany({
    where: {
      examGroupId: { in: groupIds },
      studentId: student.id,
    },
    select: {
      examGroupId: true,
      meritPosition: true,
      percentage: true,
      totalObtainedMarks: true,
      totalMaxMarks: true,
      status: true,
    },
  })

  const freshResultMap = new Map(freshResults.map((r) => [r.examGroupId, r]))

  // Flatten: attach student's own result directly to each group card
  const items = groups.map((g) => {
    const myResult = freshResultMap.get(g.id) ?? g.groupResults[0] ?? null
    const { groupResults, ...rest } = g
    return {
      ...rest,
      myResult,
    }
  })

  return {
    items,
    totalItems,
    totalPages: Math.ceil(totalItems / limit) || 1,
    page,
    limit,
  }
}

/**
 * Get a paginated leaderboard for a specific exam group, annotating
 * each row with whether it belongs to the current (logged-in) student.
 */
export async function getStudentGroupLeaderboard(
  db: PrismaClient,
  userId: string,
  input: StudentExamGroupLeaderboardInput,
) {
  // Resolve group
  const group = await db.examGroup.findUnique({
    where: { id: input.examGroupId, isPublished: true },
    select: safeExamGroupSelect,
  })

  if (!group) throw notFound("Exam Group")

  // Dynamically calculate and refresh group results on demand
  try {
    await calculateExamGroupResults(db, { examGroupId: input.examGroupId })
  } catch (err) {
    console.error("Auto calculate exam group results error:", err)
  }

  // Resolve current student
  const student = await db.student.findFirst({
    where: { userId },
    select: { id: true },
  })

  // Build sort
  let orderBy: any = [{ meritPosition: "asc" }]
  if (input.sort === "score_desc") orderBy = [{ totalObtainedMarks: "desc" }]
  if (input.sort === "name_asc") orderBy = [{ student: { name: "asc" } }]

  const where: any = { examGroupId: input.examGroupId }
  if (input.query) {
    where.student = {
      name: { contains: input.query, mode: "insensitive" },
    }
  }

  const page = input.page ?? 1
  const limit = input.limit ?? 50
  const skip = (page - 1) * limit

  const [results, totalItems] = await Promise.all([
    db.examGroupResult.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            roll: true,
            user: {
              select: {
                image: true,
              },
            },
          },
        },
      },
    }),
    db.examGroupResult.count({ where: { examGroupId: input.examGroupId } }),
  ])

  const leaderboard = results.map((r) => ({
    id: r.id,
    meritPosition: r.meritPosition,
    totalObtainedMarks: r.totalObtainedMarks,
    totalMaxMarks: r.totalMaxMarks,
    percentage: r.percentage,
    gpa: r.gpa,
    grade: r.grade,
    status: r.status,
    examsAttempted: r.examsAttempted,
    totalExamsInGroup: r.totalExamsInGroup,
    calculatedAt: r.calculatedAt,
    student: {
      id: r.student.id,
      studentId: r.student.roll || (parseInt(r.student.id.replace(/\D/g, '').slice(0, 6)) || 100000),
      name: r.student.name || "শিক্ষার্থী",
      image: r.student.user?.image || null,
      roll: r.student.roll,
      section: "",
    },
    isCurrentUser: student ? r.student.id === student.id : false,
  }))

  // The current user's entry (may be null if not yet calculated)
  const currentUserEntry = leaderboard.find((e) => e.isCurrentUser) ?? null

  return {
    examGroup: group,
    leaderboard,
    totalParticipants: totalItems,
    currentUserEntry,
    totalPages: Math.ceil(totalItems / limit) || 1,
    page,
    limit,
  }
}


