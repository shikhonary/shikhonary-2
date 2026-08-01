import type { PrismaClient } from "@workspace/db/main"

export async function getAdminStats(db: PrismaClient) {
  const [totalStudents, publishedExamGroups, totalMcqs, avgMeritGroup] = await Promise.all([
    db.student.count(),
    db.examGroup.count({ where: { isPublished: true } }),
    db.mcq.count(),
    db.examGroupResult.aggregate({
      _avg: { percentage: true },
    }),
  ])

  return {
    totalStudents,
    publishedExamGroups,
    totalMcqs,
    avgMerit: avgMeritGroup._avg.percentage ? Number(avgMeritGroup._avg.percentage.toFixed(1)) : 0,
  }
}

export async function getSubjectPerformance(db: PrismaClient) {
  const examSubjects = await db.examSubject.findMany({
    select: {
      subject: { select: { name: true } },
      exam: {
        select: {
          total: true,
          examAttempts: {
            where: { status: "Submitted" },
            select: { score: true },
          },
        },
      },
    },
  })

  const subjectScores: Record<string, { totalScore: number; count: number }> = {}

  for (const es of examSubjects) {
    const subjName = es.subject.name
    const attempts = es.exam.examAttempts
    if (attempts.length === 0) continue

    if (!subjectScores[subjName]) {
      subjectScores[subjName] = { totalScore: 0, count: 0 }
    }

    for (const att of attempts) {
      const pct = es.exam.total > 0 ? (att.score / es.exam.total) * 100 : 0
      subjectScores[subjName].totalScore += pct
      subjectScores[subjName].count += 1
    }
  }

  const clinicalColors: Record<string, string> = {
    Physics: "#af101a",
    Chemistry: "#2b6485",
    Biology: "#2e5f61",
    Math: "#8f6f6c",
    English: "#1e9e6b",
  }

  return Object.entries(subjectScores).map(([subj, data]) => ({
    subject: subj,
    avg: Math.round(data.totalScore / data.count),
    color: clinicalColors[subj] || "#2b6485",
  }))
}

export async function getAttemptStatus(db: PrismaClient) {
  const statusGroup = await db.examAttempt.groupBy({
    by: ["status"],
    _count: { id: true },
  })

  const total = statusGroup.reduce((sum, item) => sum + item._count.id, 0)

  const statusColors: Record<string, string> = {
    Submitted: "#1e9e6b",
    "In Progress": "#b9791f",
    "Auto-Submitted": "#2b6485",
    Abandoned: "#ba1a1a",
  }

  if (total === 0) {
    return []
  }

  return statusGroup.map((item) => ({
    name: item.status,
    value: Math.round((item._count.id / total) * 100),
    color: statusColors[item.status] || "#8f6f6c",
  }))
}

export async function getCohortDistribution(db: PrismaClient) {
  const cohorts = await db.academicClass.findMany({
    select: {
      name: true,
      _count: { select: { students: true } },
    },
  })

  const cohortColors = ["#af101a", "#2b6485", "#2e5f61", "#8f6f6c", "#1e9e6b"]

  return cohorts.map((c, i) => ({
    name: c.name,
    students: c._count.students,
    color: cohortColors[i % cohortColors.length] || "#2b6485",
  }))
}

export async function getProctoringFlags(db: PrismaClient) {
  const flags = await db.examAttempt.findMany({
    where: { tabSwitches: { gt: 0 } },
    orderBy: { lastActivityAt: "desc" },
    take: 10,
    select: {
      student: { select: { name: true } },
      exam: { select: { title: true } },
      tabSwitches: true,
      status: true,
    },
  })

  return flags.map((f) => ({
    student: f.student.name,
    exam: f.exam.title,
    tabSwitches: f.tabSwitches,
    status: f.status,
  }))
}

export async function getMeritList(db: PrismaClient) {
  const results = await db.examGroupResult.findMany({
    orderBy: { meritPosition: "asc" },
    take: 10,
    select: {
      meritPosition: true,
      percentage: true,
      grade: true,
      gpa: true,
      totalObtainedMarks: true,
      totalMaxMarks: true,
      student: {
        select: {
          name: true,
          roll: true,
          academicClass: { select: { name: true } },
        },
      },
    },
  })

  return results.map((r) => ({
    rank: r.meritPosition ?? 99,
    name: r.student.name,
    roll: r.student.roll ? r.student.roll.toString() : "N/A",
    cls: r.student.academicClass?.name ?? "N/A",
    obtained: r.totalObtainedMarks,
    total: r.totalMaxMarks,
    pct: r.percentage,
    grade: r.grade ?? "N/A",
    gpa: r.gpa ?? 0.0,
    attempted: "N/A",
  }))
}

export async function getRecentAttempts(db: PrismaClient) {
  const attempts = await db.examAttempt.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      student: { select: { name: true } },
      exam: { select: { title: true } },
      status: true,
      score: true,
      tabSwitches: true,
      createdAt: true,
    },
  })

  const now = Date.now()

  return attempts.map((a) => {
    const diffMs = now - new Date(a.createdAt).getTime()
    const diffMins = Math.max(0, Math.floor(diffMs / 60000))
    const timeStr = diffMins === 0 ? "just now" : diffMins < 60 ? `${diffMins}m ago` : `${Math.floor(diffMins / 60)}h ago`

    return {
      student: a.student.name,
      exam: a.exam.title,
      status: a.status,
      score: a.score,
      tabSwitches: a.tabSwitches,
      last: timeStr,
    }
  })
}
