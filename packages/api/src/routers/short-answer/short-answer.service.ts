import type { PrismaClient } from "@workspace/db/main"
import { TRPCError } from "@trpc/server"
import { categorizeReference, isIgnoredReference } from "@workspace/utils"
import type {
  ListShortAnswersInput,
  ShortAnswerStatsInput,
  ShortAnswerBoardYearsInput,
  GetShortAnswerInput,
  CreateShortAnswerInput,
  UpdateShortAnswerInput,
  DeleteShortAnswerInput,
  BulkDeleteShortAnswersInput,
  ToggleShortAnswerActiveInput,
  ResolveShortAnswerReportInput,
  AssignShortAnswerReportInput,
  ImportShortAnswersInput,
} from "./short-answer.schema"

async function resolveShortAnswerQuestionTypeId(db: any, subjectId?: string) {
  if (subjectId) {
    const qt = await db.questionType.findFirst({
      where: {
        OR: [
          { label: { contains: "Short Answer", mode: "insensitive" } },
          { nameEn: { contains: "Short Answer", mode: "insensitive" } },
          { label: { contains: "ShortAnswer", mode: "insensitive" } },
          { nameEn: { contains: "SA", mode: "insensitive" } },
          { nameBn: { contains: "সংক্ষিপ্ত", mode: "insensitive" } },
        ],
        isActive: true,
        subjects: {
          some: {
            subjectId,
          },
        },
      },
      select: { id: true },
    })
    if (qt) return qt.id as string
  }

  const defaultSaQt = await db.questionType.findFirst({
    where: {
      OR: [
        { label: { contains: "Short Answer", mode: "insensitive" } },
        { nameEn: { contains: "Short Answer", mode: "insensitive" } },
        { label: { contains: "ShortAnswer", mode: "insensitive" } },
        { nameEn: { contains: "SA", mode: "insensitive" } },
        { nameBn: { contains: "সংক্ষিপ্ত", mode: "insensitive" } },
      ],
      isActive: true,
    },
    select: { id: true },
  })

  return defaultSaQt?.id as string | undefined
}

export async function listShortAnswers(db: PrismaClient, input: ListShortAnswersInput) {
  const {
    page,
    limit,
    query,
    subjectId,
    chapterId,
    academicClassId,
    difficulty,
    source,
    session,
    year,
    board,
    isMath,
    isActive,
    hasReport,
    sort,
  } = input
  const resolvedPage = page ?? 1
  const resolvedLimit = limit ?? 20
  const skip = (resolvedPage - 1) * resolvedLimit

  const where: any = {}

  if (subjectId && subjectId !== "All") where.subjectId = subjectId
  if (chapterId && chapterId !== "All") where.chapterId = chapterId
  if (difficulty && difficulty !== "All") where.difficulty = difficulty
  if (typeof isMath === "boolean") where.isMath = isMath

  if (academicClassId && academicClassId !== "All") {
    where.subject = {
      classSubjects: {
        some: {
          classId: academicClassId,
        },
      },
    }
  }

  if (isActive !== undefined && isActive !== "All") {
    if (typeof isActive === "boolean") {
      where.isActive = isActive
    } else if (isActive === "true" || isActive === "ACTIVE") {
      where.isActive = true
    } else if (isActive === "false" || isActive === "INACTIVE") {
      where.isActive = false
    }
  }

  if (hasReport !== undefined && hasReport !== "All") {
    const isReported = hasReport === true || hasReport === "YES" || hasReport === "true"
    const reports = await db.questionReport.findMany({
      where: { entityType: "SHORT_ANSWER", status: { in: ["PENDING", "ASSIGNED"] } },
      select: { entityId: true },
      distinct: ["entityId"],
    })
    const reportedIds = reports.map((r) => r.entityId)
    if (isReported) {
      where.id = { in: reportedIds }
    } else {
      where.id = { notIn: reportedIds }
    }
  }

  if (source && source !== "All" && year !== undefined) {
    const boardRef = [source, year].filter(Boolean).join("-")
    where.OR = [
      { AND: [{ source }, { session: String(year) }] },
      { reference: { has: boardRef } },
    ]
  } else {
    if (source && source !== "All") where.source = source
    if (session && session !== "All") where.session = session
    if (year !== undefined) {
      where.reference = { has: String(year) }
    }
  }

  if (board && board !== "All" && (!source || source === "All")) {
    if (board === "SCHOOL_ALL") {
      const itemsWithRef = await db.shortAnswer.findMany({
        where: {
          NOT: { reference: { equals: [] } },
          ...(where.subjectId ? { subjectId: where.subjectId } : {}),
          ...(where.chapterId ? { chapterId: where.chapterId } : {}),
          ...(where.subject ? { subject: where.subject } : {}),
        },
        select: { reference: true },
      })
      const schoolRefs = new Set<string>()
      for (const q of itemsWithRef) {
        for (const ref of q.reference || []) {
          if (!ref || isIgnoredReference(ref)) continue
          if (categorizeReference(ref) === "SCHOOL") {
            schoolRefs.add(ref)
          }
        }
      }
      if (schoolRefs.size > 0) {
        where.reference = { hasSome: Array.from(schoolRefs) }
      } else {
        where.id = "__NO_MATCHING_SCHOOL_SHORT_ANSWER__"
      }
    } else {
      where.reference = { has: board }
    }
  }

  if (query) {
    const queryConditions: any[] = [
      { question: { contains: query, mode: "insensitive" } },
      { answer: { contains: query, mode: "insensitive" } },
      { source: { contains: query, mode: "insensitive" } },
      { session: { contains: query, mode: "insensitive" } },
      { reference: { has: query } },
    ]
    if (where.OR) {
      where.AND = [
        ...(where.AND || []),
        { OR: where.OR },
        { OR: queryConditions },
      ]
      delete where.OR
    } else {
      where.OR = queryConditions
    }
  }

  let orderBy: any = { createdAt: "desc" }
  if (sort === "createdAt_asc" || sort === "oldest") {
    orderBy = { createdAt: "asc" }
  } else if (sort === "createdAt_desc" || sort === "newest") {
    orderBy = { createdAt: "desc" }
  } else if (sort === "question_asc") {
    orderBy = { question: "asc" }
  } else if (sort === "question_desc") {
    orderBy = { question: "desc" }
  }

  const [items, totalItems] = await Promise.all([
    db.shortAnswer.findMany({
      where,
      skip,
      take: resolvedLimit,
      orderBy,
      include: {
        subject: {
          select: {
            id: true,
            nameEn: true,
            nameBn: true,
            code: true,
            group: true,
            classSubjects: {
              select: {
                academicClass: {
                  select: {
                    id: true,
                    nameBn: true,
                    nameEn: true,
                  },
                },
              },
            },
          },
        },
        chapter: {
          select: {
            id: true,
            nameEn: true,
            nameBn: true,
            position: true,
          },
        },
        questionType: {
          select: {
            id: true,
            nameEn: true,
            nameBn: true,
            label: true,
            mark: true,
          },
        },
        attachments: {
          orderBy: {
            position: "asc",
          },
        },
      },
    }),
    db.shortAnswer.count({ where }),
  ])

  const itemIds = items.map((it) => it.id)
  const itemReports =
    itemIds.length > 0
      ? await db.questionReport.findMany({
          where: { entityType: "SHORT_ANSWER", entityId: { in: itemIds } },
          select: {
            id: true,
            entityId: true,
            status: true,
            reportType: true,
            description: true,
            resolvedNote: true,
            resolvedAt: true,
            createdAt: true,
            resolver: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        })
      : []

  const reportMap = new Map<string, typeof itemReports>()
  for (const rep of itemReports) {
    if (!reportMap.has(rep.entityId)) reportMap.set(rep.entityId, [])
    reportMap.get(rep.entityId)!.push(rep)
  }

  const enhancedItems = items.map((item) => {
    const repList = reportMap.get(item.id) || []
    const hasActiveReport = repList.some(
      (r) => r.status === "PENDING" || r.status === "ASSIGNED"
    )
    return {
      ...item,
      hasReport: hasActiveReport,
      reports: repList,
    }
  })

  return {
    items: enhancedItems,
    totalItems,
    totalPages: Math.ceil(totalItems / resolvedLimit) || 1,
    page: resolvedPage,
    limit: resolvedLimit,
  }
}

export async function getShortAnswerById(db: PrismaClient, input: GetShortAnswerInput) {
  const sa = await db.shortAnswer.findUnique({
    where: { id: input.id },
    include: {
      subject: {
        include: {
          classSubjects: {
            include: {
              academicClass: true,
            },
          },
        },
      },
      chapter: true,
      questionType: true,
      attachments: {
        orderBy: {
          position: "asc",
        },
      },
    },
  })

  if (!sa) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Short Answer with ID ${input.id} not found`,
    })
  }

  return sa
}

export async function createShortAnswer(db: PrismaClient, input: CreateShortAnswerInput) {
  const { attachments, context, contextCaption, contextBottomContent, ...data } = input
  const allAttachments = Array.isArray(attachments) ? [...attachments] : []
  const contextText = context?.trim() || null
  const captionText = contextCaption?.trim() || null
  const bottomText = contextBottomContent?.trim() || null
  const hasPassage = allAttachments.some(
    (a) => (a.type === "PASSAGE" || a.type === "text") && Boolean(a.content?.trim())
  )
  if ((contextText || captionText || bottomText) && !hasPassage) {
    allAttachments.unshift({
      type: "PASSAGE",
      content: contextText,
      caption: captionText,
      bottomContent: bottomText,
      position: 0,
    })
  }

  const resolvedQuestionTypeId =
    data.questionTypeId || (await resolveShortAnswerQuestionTypeId(db, data.subjectId))

  const refList = Array.isArray(data.reference) ? [...data.reference] : []
  const currentYear = new Date().getFullYear().toString()
  const resolvedSource = data.source ? data.source.trim() : "সহায়ক সংকলন"
  const resolvedSession = data.session
    ? data.session.trim()
    : data.year
      ? String(data.year)
      : currentYear

  return db.shortAnswer.create({
    data: {
      subjectId: data.subjectId,
      chapterId: data.chapterId,
      question: data.question,
      answer: data.answer || null,
      options: data.options || [],
      isMath: data.isMath ?? false,
      difficulty: data.difficulty,
      reference: refList,
      source: resolvedSource,
      session: resolvedSession,
      questionTypeId: resolvedQuestionTypeId || undefined,
      isActive: data.isActive ?? true,
      attachments:
        allAttachments.length > 0
          ? {
              create: allAttachments.map((att, idx) => ({
                type: att.type ?? "image",
                caption: att.caption ?? null,
                content: att.content ?? null,
                url: att.url ?? null,
                table: att.table ?? undefined,
                bottomContent: att.bottomContent ?? null,
                tableBorder: att.tableBorder ?? false,
                position:
                  att.position !== undefined && att.position !== null ? att.position : idx,
              })),
            }
          : undefined,
    } as any,
    include: {
      attachments: {
        orderBy: {
          position: "asc",
        },
      },
    },
  })
}

export async function updateShortAnswer(db: PrismaClient, input: UpdateShortAnswerInput) {
  const { id, attachments, context, contextCaption, contextBottomContent, ...data } = input

  // Verify existence
  await getShortAnswerById(db, { id })

  const allAttachments = Array.isArray(attachments) ? [...attachments] : []
  const contextText = context?.trim() || null
  const captionText = contextCaption?.trim() || null
  const bottomText = contextBottomContent?.trim() || null
  const hasPassage = allAttachments.some(
    (a) => (a.type === "PASSAGE" || a.type === "text") && Boolean(a.content?.trim())
  )
  if ((contextText || captionText || bottomText) && !hasPassage) {
    allAttachments.unshift({
      type: "PASSAGE",
      content: contextText,
      caption: captionText,
      bottomContent: bottomText,
      position: 0,
    })
  }

  let resolvedQuestionTypeId = data.questionTypeId
  if (data.questionTypeId !== undefined && !resolvedQuestionTypeId && data.subjectId) {
    resolvedQuestionTypeId = await resolveShortAnswerQuestionTypeId(db, data.subjectId)
  }

  const resolvedReference =
    data.reference !== undefined
      ? Array.isArray(data.reference)
        ? data.reference
        : []
      : undefined

  const currentYear = new Date().getFullYear().toString()
  const updateData: any = {
    subjectId: data.subjectId,
    chapterId: data.chapterId,
    question: data.question,
    answer: data.answer,
    options: data.options,
    isMath: data.isMath,
    difficulty: data.difficulty,
    reference: resolvedReference,
    questionTypeId:
      data.questionTypeId !== undefined ? resolvedQuestionTypeId || null : undefined,
    isActive: data.isActive,
  }

  if (data.source !== undefined) {
    updateData.source = data.source ? data.source.trim() : null
  }
  if (data.session !== undefined) {
    updateData.session = data.session
      ? data.session.trim()
      : data.year
        ? String(data.year)
        : currentYear
  }

  return db.shortAnswer.update({
    where: { id },
    data: {
      ...updateData,
      ...(attachments !== undefined || context !== undefined || contextCaption !== undefined || contextBottomContent !== undefined
        ? {
            attachments:
              allAttachments.length > 0
                ? {
                    deleteMany: {},
                    create: allAttachments.map((att, idx) => ({
                      type: att.type ?? "image",
                      caption: att.caption ?? null,
                      content: att.content ?? null,
                      url: att.url ?? null,
                      table: att.table ?? undefined,
                      bottomContent: att.bottomContent ?? null,
                      tableBorder: att.tableBorder ?? false,
                      position:
                        att.position !== undefined && att.position !== null ? att.position : idx,
                    })),
                  }
                : { deleteMany: {} },
          }
        : {}),
    } as any,
    include: {
      attachments: {
        orderBy: {
          position: "asc",
        },
      },
    },
  })
}

export async function deleteShortAnswer(db: PrismaClient, input: DeleteShortAnswerInput) {
  await getShortAnswerById(db, { id: input.id })

  return db.shortAnswer.delete({
    where: { id: input.id },
  })
}

export async function bulkDeleteShortAnswers(
  db: PrismaClient,
  input: BulkDeleteShortAnswersInput
) {
  const res = await db.shortAnswer.deleteMany({
    where: {
      id: { in: input.ids },
    },
  })
  return { deletedCount: res.count }
}

export async function toggleShortAnswerActive(
  db: PrismaClient,
  input: ToggleShortAnswerActiveInput
) {
  await getShortAnswerById(db, { id: input.id })

  return db.shortAnswer.update({
    where: { id: input.id },
    data: { isActive: input.isActive },
  })
}

export async function getShortAnswerStats(
  db: PrismaClient,
  input: ShortAnswerStatsInput = {}
) {
  const where: any = {}
  if (input.subjectId && input.subjectId !== "All") where.subjectId = input.subjectId
  if (input.chapterId && input.chapterId !== "All") where.chapterId = input.chapterId
  if (input.academicClassId && input.academicClassId !== "All") {
    where.subject = {
      classSubjects: {
        some: {
          classId: input.academicClassId,
        },
      },
    }
  }

  const [totalCount, activeCount, inactiveCount, mathCount, easyCount, mediumCount, hardCount] =
    await Promise.all([
      db.shortAnswer.count({ where }),
      db.shortAnswer.count({ where: { ...where, isActive: true } }),
      db.shortAnswer.count({ where: { ...where, isActive: false } }),
      db.shortAnswer.count({ where: { ...where, isMath: true } }),
      db.shortAnswer.count({ where: { ...where, difficulty: "EASY" } }),
      db.shortAnswer.count({ where: { ...where, difficulty: "MEDIUM" } }),
      db.shortAnswer.count({ where: { ...where, difficulty: "HARD" } }),
    ])

  return {
    totalCount,
    activeCount,
    inactiveCount,
    mathCount,
    difficultyCounts: {
      easy: easyCount,
      medium: mediumCount,
      hard: hardCount,
    },
  }
}

export async function getShortAnswerBoardYears(
  db: PrismaClient,
  input: ShortAnswerBoardYearsInput = {}
) {
  const where: any = {
    NOT: { reference: { equals: [] } },
  }

  if (input.subjectId && input.subjectId !== "All") where.subjectId = input.subjectId
  if (input.chapterId && input.chapterId !== "All") where.chapterId = input.chapterId
  if (input.academicClassId && input.academicClassId !== "All") {
    where.subject = {
      classSubjects: {
        some: {
          classId: input.academicClassId,
        },
      },
    }
  }

  const questions = await db.shortAnswer.findMany({
    where,
    select: { reference: true },
  })

  const countMap = new Map<string, number>()
  for (const q of questions) {
    for (const ref of q.reference || []) {
      if (!ref || isIgnoredReference(ref)) continue
      countMap.set(ref, (countMap.get(ref) || 0) + 1)
    }
  }

  const categoryOrder: Record<string, number> = {
    BOARD: 1,
    CADET: 2,
    SCHOOL: 3,
    TEST_EXAM: 4,
    TEXTBOOK: 5,
    OTHER: 6,
  }

  return Array.from(countMap.entries())
    .map(([rawRef, count]) => {
      const parts = rawRef.split("-")
      const yearStr = parts[parts.length - 1]
      const year = !isNaN(Number(yearStr)) ? Number(yearStr) : 0
      const boardName = parts.length > 1 ? parts.slice(0, parts.length - 1).join("-") : rawRef
      const category = categorizeReference(rawRef)
      return {
        rawRef,
        boardName,
        year,
        category,
        count,
      }
    })
    .sort((a, b) => {
      const diff = (categoryOrder[a.category] || 99) - (categoryOrder[b.category] || 99)
      if (diff !== 0) return diff
      return b.count - a.count
    })
}

export async function importShortAnswers(db: PrismaClient, input: ImportShortAnswersInput) {
  const fallbackQtId = await resolveShortAnswerQuestionTypeId(db)
  const subjectQtCache: Record<string, string> = {}

  const fallbackSource = input.source || "সহায়ক সংকলন"
  const fallbackSession = input.session || new Date().getFullYear().toString()
  const fallbackDifficulty = input.difficulty || "MEDIUM"

  const created = await db.$transaction(
    async (tx: any) => {
      const results = []
      for (const sa of input.shortAnswers) {
        const { attachments, context, contextCaption, contextBottomContent, ...data } = sa
        const allAttachments = Array.isArray(attachments) ? [...attachments] : []
        const contextText = context?.trim() || null
        const captionText = contextCaption?.trim() || null
        const bottomText = contextBottomContent?.trim() || null
        const hasPassage = allAttachments.some(
          (a) => (a.type === "PASSAGE" || a.type === "text") && Boolean(a.content?.trim())
        )
        if ((contextText || captionText || bottomText) && !hasPassage) {
          allAttachments.unshift({
            type: "PASSAGE",
            content: contextText,
            caption: captionText,
            bottomContent: bottomText,
            position: 0,
          })
        }

        let resolvedQuestionTypeId = data.questionTypeId
        if (!resolvedQuestionTypeId && data.subjectId) {
          const subId = data.subjectId
          if (subjectQtCache[subId]) {
            resolvedQuestionTypeId = subjectQtCache[subId]
          } else {
            const qtId = await resolveShortAnswerQuestionTypeId(tx, subId)
            if (qtId) {
              resolvedQuestionTypeId = qtId
              subjectQtCache[subId] = qtId
            } else if (fallbackQtId) {
              resolvedQuestionTypeId = fallbackQtId
            }
          }
        }

        const refList = Array.isArray(data.reference) ? [...data.reference] : []
        const resolvedSource = data.source ? data.source.trim() : fallbackSource
        const resolvedSession = data.session
          ? data.session.trim()
          : data.year
            ? String(data.year)
            : fallbackSession

        const createdSa = await tx.shortAnswer.create({
          data: {
            subjectId: data.subjectId,
            chapterId: data.chapterId,
            question: data.question,
            answer: data.answer || null,
            options: data.options || [],
            isMath: data.isMath ?? false,
            difficulty: data.difficulty ?? fallbackDifficulty,
            reference: refList,
            source: resolvedSource,
            session: resolvedSession,
            questionTypeId: resolvedQuestionTypeId || undefined,
            isActive: data.isActive ?? true,
            attachments:
              allAttachments.length > 0
                ? {
                    create: allAttachments.map((att, idx) => ({
                      type: att.type ?? "image",
                      caption: att.caption ?? null,
                      content: att.content ?? null,
                      url: att.url ?? null,
                      table: att.table ?? undefined,
                      bottomContent: att.bottomContent ?? null,
                      tableBorder: att.tableBorder ?? false,
                      position:
                        att.position !== undefined && att.position !== null ? att.position : idx,
                    })),
                  }
                : undefined,
          } as any,
        })

        // Flag missing image URLs for review
        const missingImageAttachments = allAttachments.filter(
          (att) =>
            att.type?.toLowerCase() === "image" &&
            (!att.url ||
              !att.url.trim() ||
              att.url === "text-context" ||
              att.url.toLowerCase() === "null")
        )

        if (missingImageAttachments.length > 0) {
          const captions = missingImageAttachments
            .map((att, i) => (att.caption ? `"${att.caption}"` : `Image #${i + 1}`))
            .join(", ")

          await tx.questionReport.create({
            data: {
              entityType: "SHORT_ANSWER",
              entityId: createdSa.id,
              reportType: "MISSING_IMAGE",
              description: `Image URL missing for ${missingImageAttachments.length} image attachment(s): ${captions}`,
              status: "PENDING",
            },
          })
        }

        results.push(createdSa)
      }
      return results
    },
    { timeout: 30000 }
  )

  return { importedCount: created.length }
}

export async function resolveShortAnswerReport(
  db: PrismaClient,
  input: ResolveShortAnswerReportInput,
  userId?: string | null
) {
  const { shortAnswerId, reportId, resolvedNote } = input

  const item = await db.shortAnswer.findUnique({
    where: { id: shortAnswerId },
    select: { id: true },
  })

  if (!item) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Short Answer with ID ${shortAnswerId} not found`,
    })
  }

  const whereClause: any = {
    entityType: "SHORT_ANSWER",
    entityId: shortAnswerId,
  }

  if (reportId) {
    whereClause.id = reportId
  }

  const existingReports = await db.questionReport.findMany({
    where: whereClause,
  })

  if (existingReports.length === 0) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No report found for this short answer question",
    })
  }

  const result = await db.questionReport.updateMany({
    where: whereClause,
    data: {
      status: "RESOLVED",
      resolvedNote: resolvedNote?.trim() || "Resolved by admin",
      resolvedById: userId ?? null,
      resolvedAt: new Date(),
    },
  })

  return {
    success: true,
    resolvedCount: result.count,
  }
}

export async function assignShortAnswerReport(
  db: PrismaClient,
  input: AssignShortAnswerReportInput,
  currentUserId?: string | null
) {
  const { shortAnswerId, reportId, assignedToId, note } = input

  const item = await db.shortAnswer.findUnique({
    where: { id: shortAnswerId },
    select: { id: true },
  })

  if (!item) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Short Answer with ID ${shortAnswerId} not found`,
    })
  }

  const assignee = await db.user.findUnique({
    where: { id: assignedToId },
    select: { id: true, name: true, email: true },
  })

  if (!assignee) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Assignee user with ID ${assignedToId} not found`,
    })
  }

  const whereClause: any = {
    entityType: "SHORT_ANSWER",
    entityId: shortAnswerId,
  }

  if (reportId) {
    whereClause.id = reportId
  }

  const existingReports = await db.questionReport.findMany({
    where: whereClause,
  })

  if (existingReports.length === 0) {
    const newReport = await db.questionReport.create({
      data: {
        entityType: "SHORT_ANSWER",
        entityId: shortAnswerId,
        reportType: "OTHER",
        description:
          note?.trim() || "সংক্ষিপ্ত উত্তর প্রশ্ন পর্যালোচনা ও যাচাইয়ের জন্য দায়িত্ব অর্পণ করা হয়েছে",
        status: "ASSIGNED",
        reportedById: currentUserId ?? null,
        resolvedById: assignedToId,
        resolvedNote: note?.trim() || null,
        resolvedAt: null,
      },
    })

    return {
      success: true,
      assignedCount: 1,
      assignee,
      createdReportId: newReport.id,
    }
  }

  const result = await db.questionReport.updateMany({
    where: whereClause,
    data: {
      status: "ASSIGNED",
      resolvedById: assignedToId,
      resolvedNote: note?.trim() || null,
      resolvedAt: null,
    },
  })

  return {
    success: true,
    assignedCount: result.count,
    assignee,
  }
}
