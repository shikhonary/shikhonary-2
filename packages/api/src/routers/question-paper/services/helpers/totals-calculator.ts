import type { TenantPrismaClient } from "@workspace/db/tenant"

export async function syncTotals(
  tenantDb: TenantPrismaClient,
  questionPaperId: string,
  paperSubjectId: string
) {
  // 1. Calculate subject marks total from all its distributions
  const distributions = await tenantDb.questionPaperSubjectMarkDistribution.findMany({
    where: { paperSubjectId },
    select: { totalMarks: true },
  })
  const subjectTotal = distributions.reduce((sum, d) => sum + d.totalMarks, 0)

  // 2. Update the subject
  await tenantDb.questionPaperSubject.update({
    where: { id: paperSubjectId },
    data: { subjectTotal },
  })

  // 3. Calculate paper marks total from all its subjects
  const subjects = await tenantDb.questionPaperSubject.findMany({
    where: { questionPaperId },
    select: { subjectTotal: true },
  })
  const paperTotal = subjects.reduce((sum, s) => sum + s.subjectTotal, 0)

  // 4. Update the paper
  await tenantDb.questionPaper.update({
    where: { id: questionPaperId },
    data: { total: paperTotal },
  })
}

export function syncMarkDistribution(
  marksPerQuestion: number,
  rawMarkDist?: any,
  sqTypeMarkDist?: any
): any {
  let parsedSqTypeDist = sqTypeMarkDist
  if (typeof parsedSqTypeDist === "string") {
    try {
      parsedSqTypeDist = JSON.parse(parsedSqTypeDist)
    } catch {
      parsedSqTypeDist = null
    }
  }

  let dist = rawMarkDist
  if (typeof dist === "string") {
    try {
      dist = JSON.parse(dist)
    } catch {
      dist = null
    }
  }

  // If rawMarkDist is missing or has only 1 generic single key (e.g. { a: 10 }),
  // but the subject question type has a detailed sub-question distribution (e.g. { a: 1, b: 2, c: 3, d: 4 }),
  // prefer the subject's configured sub-question distribution!
  const hasMultipleSqKeys =
    parsedSqTypeDist &&
    typeof parsedSqTypeDist === "object" &&
    !Array.isArray(parsedSqTypeDist) &&
    Object.keys(parsedSqTypeDist).length > 1

  const hasGenericRawKey =
    dist &&
    typeof dist === "object" &&
    !Array.isArray(dist) &&
    Object.keys(dist).length <= 1

  if ((!dist || hasGenericRawKey) && hasMultipleSqKeys) {
    dist = parsedSqTypeDist
  } else if (!dist) {
    dist = parsedSqTypeDist
  }

  if (dist && typeof dist === "object" && !Array.isArray(dist)) {
    const keys = Object.keys(dist)
    if (keys.length === 1) {
      // Single-key distribution (e.g. {"a": 10} or {"ক": 10}) -> update to marksPerQuestion
      const key = keys[0]!
      return { [key]: marksPerQuestion }
    } else if (keys.length > 1) {
      const sum = Object.values(dist).reduce((acc: number, val: any) => acc + (Number(val) || 0), 0)
      if (sum === marksPerQuestion || sum === 0) {
        return dist
      }
      const ratio = marksPerQuestion / sum
      const scaled: Record<string, number> = {}
      for (const k of keys) {
        scaled[k] = Math.round(((Number(dist[k]) || 0) * ratio) * 100) / 100
      }
      return scaled
    }
  }

  if (Array.isArray(dist)) {
    if (dist.length === 1) {
      return [marksPerQuestion]
    }
    return dist
  }

  return { a: marksPerQuestion }
}
