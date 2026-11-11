/**
 * Single Source of Truth for Question Paper Section / Sub-Section / Distribution
 * topology, quotas, completion status, and title/instruction presentation.
 *
 * Replaces duplicate, divergent logic previously scattered across:
 *   - builder-canvas.tsx
 *   - block-renderer.tsx
 *   - dist-action-block.tsx
 *   - use-dist-limits.ts
 *   - distribution-picker-view.tsx
 */

import { QUESTION_TYPE_CODES, isSingleQuestionType, type QuestionTypeCode } from "../constants/question-type"
import { toBengaliDigits } from "./bengali"
import { resolveDistCategory } from "./resolve-dist-category"

export type SectionMode =
  | "DIRECT"
  | "SUBSECTION_DEDICATED"
  | "SUBSECTION_SHARED"

export type MarksPlacement = "SUBSECTION" | "DISTRIBUTION" | "NONE"

export interface ResolvedSlot {
  /** Stable slot identifier: `${dist.id}::${subSectionId ?? sectionId ?? "root"}` */
  key: string
  mode: SectionMode

  dist: any
  distributionId: string
  sectionId: string | null
  subSectionId: string | null
  /** Strictly OTHER sub-section IDs sharing the exact same distribution (never includes self) */
  siblingSubSectionIds: string[]

  // ── Quantitative Quotas ───────────────────────────────────────────────
  /** Total questions configured on paper for this distribution */
  distTotalQuestions: number
  /** Total questions required to attempt for this distribution */
  distTotalAttempt: number

  /** Maximum questions pickable for THIS slot right now */
  slotPickLimit: number
  /** Questions already added specifically to THIS slot */
  slotAddedCount: number
  /** Questions already added across the ENTIRE distribution (all slots) */
  distAddedCount: number
  /** True when this slot needs no more questions */
  isSlotCompleted: boolean

  // ── Attempt / Dropdown Configuration ──────────────────────────────────
  /** Effective attempt count for this slot */
  slotAttemptCount: number
  /** True ONLY in SUBSECTION_SHARED so user can split distTotalAttempt across sub-sections */
  showAttemptSelector: boolean
  /** Max value allowed in the attempt dropdown (distTotalAttempt - otherSiblingsAttempt) */
  attemptDropdownMax: number
  /** Current sub-section questionsToAttempt clamped to [0, attemptDropdownMax] */
  currentSubAttempt: number

  // ── Presentation Flags ────────────────────────────────────────────────
  category: QuestionTypeCode
  isSingleDefault: boolean
  isCq: boolean
  isMcq: boolean
  isCs: boolean
  marksPerQuestion: number
  marksPlacement: MarksPlacement
  showDistTitle: boolean
  subSectionInstruction: string | null
  distInstruction: string | null
  distTitle: string
}

export interface ResolvedSubSection {
  subSection: any
  mode: SectionMode
  slots: ResolvedSlot[]
  hasQuestions: boolean
  /** True when shared sub-section titles should be hidden (e.g. one sub-section filled all questions or pool is full with 0 questions here) */
  hideSubSection: boolean
  marksPerQuestion: number | null
  attemptCount: number | null
  showMarkDistribution: boolean
  instructions: string | null
  distName: string
}

export interface ResolvedSection {
  section: any
  mode: SectionMode
  isSectionFilled: boolean
  hasQuestions: boolean
  instructions: string | null
  subSections: ResolvedSubSection[]
  directSlots: ResolvedSlot[]
}

export interface ResolvedSubjectTopology {
  subject: any
  sections: ResolvedSection[]
  unassignedSlots: ResolvedSlot[]
  allSlots: ResolvedSlot[]
}

export interface ResolvedPaperTopology {
  subjects: ResolvedSubjectTopology[]
  slotsByKey: Map<string, ResolvedSlot>
  findSlot: (params: {
    distributionId: string
    subSectionId?: string | null
    sectionId?: string | null
  }) => ResolvedSlot | null
}

const TOPIC_KEYWORDS = [
  "সহপাঠ",
  "গদ্য",
  "কবিতা",
  "ব্যাকরণ",
  "নির্মিতি",
  "পাটিগণিত",
  "বীজগণিত",
  "জ্যামিতি",
  "ত্রিকোণমিতি",
  "পরিসংখ্যান",
  "পদার্থ",
  "রসায়ন",
  "জীববিজ্ঞান",
  "পৌরনীতি",
  "অর্থনীতি",
  "ইতিহাস",
  "ভূগোল",
]

function detectDistFlags(dist: any) {
  const nameEn = (dist?.questionType?.nameEn || dist?.questionTypeName || "").toLowerCase()
  const nameBn = (dist?.questionType?.nameBn || dist?.questionTypeNameBn || "").toLowerCase()
  const code = (dist?.questionType?.code || "").toUpperCase()
  const category = resolveDistCategory(dist)

  const isCs =
    code === "CS" ||
    category === QUESTION_TYPE_CODES.CS ||
    nameEn.includes("scenario") ||
    nameBn.includes("সৃজনশীল (cs)")

  const isMcq =
    code === "MCQ" ||
    category === QUESTION_TYPE_CODES.MCQ ||
    nameEn.includes("mcq") ||
    nameEn.includes("multiple choice") ||
    nameBn.includes("বহুনির্বাচনি")

  const isCq =
    !isMcq &&
    (code === "CQ" ||
      category === QUESTION_TYPE_CODES.CQ ||
      isCs ||
      nameEn.includes("cq") ||
      nameEn.includes("creative") ||
      nameBn.includes("সৃজনশীল"))

  const distTitle = (
    dist?.questionTypeLabel?.trim() ||
    dist?.questionTypeNameBn ||
    dist?.questionTypeName ||
    dist?.questionType?.nameBn ||
    (isMcq ? "বহুনির্বাচনি অভীক্ষা" : dist?.questionType?.nameEn) ||
    ""
  ).trim()

  return { category, isCs, isMcq, isCq, distTitle }
}

function buildDistInstruction(params: {
  isCs: boolean
  isCq: boolean
  isMcq: boolean
  totalProvided: number
  attemptCount: number
}): string | null {
  const { isCs, isCq, isMcq, totalProvided, attemptCount } = params
  if (isMcq) return null

  if (isCs) {
    if (totalProvided > 0 && attemptCount > 0 && attemptCount < totalProvided) {
      return `[যেকোনো ${toBengaliDigits(attemptCount)}টি প্রশ্নের উত্তর দিতে হবে]`
    }
    return `[সবগুলো প্রশ্নের উত্তর দিতে হবে]`
  }

  if ((isCq || !isMcq) && attemptCount > 0 && totalProvided > 0 && attemptCount < totalProvided) {
    return `[${toBengaliDigits(totalProvided)}টি প্রশ্ন থেকে যে কোনো ${toBengaliDigits(attemptCount)}টি প্রশ্নের উত্তর দাও]`
  }
  if ((isCq || !isMcq) && attemptCount > 0) {
    return `[যে কোনো ${toBengaliDigits(attemptCount)}টি প্রশ্নের উত্তর দাও]`
  }
  return null
}

function buildSlot(params: {
  mode: SectionMode
  dist: any
  sectionId: string | null
  subSection: any | null
  siblingSubSections: any[]
  allPaperQuestions: any[]
  statusInfo?: any
  isSingleDistInSub?: boolean
}): ResolvedSlot {
  const {
    mode,
    dist,
    sectionId,
    subSection,
    siblingSubSections,
    allPaperQuestions,
    statusInfo,
    isSingleDistInSub = true,
  } = params

  const subSectionId = subSection?.id ?? null
  const siblingSubSectionIds = siblingSubSections
    .map((s: any) => s.id as string)
    .filter((id) => id !== subSectionId)

  const { category, isCs, isMcq, isCq, distTitle } = detectDistFlags(dist)
  const distTotalQuestions = Number(dist?.questionCount ?? statusInfo?.targetCount ?? 0)
  const distTotalAttempt =
    dist?.questionsToAttempt !== undefined &&
    dist?.questionsToAttempt !== null &&
    Number(dist.questionsToAttempt) > 0
      ? Number(dist.questionsToAttempt)
      : distTotalQuestions

  // Single-type policy is only a default when questionCount <= 1;
  // an explicit questionCount > 1 MUST ALWAYS allow multi-selection.
  const isSingleDefault =
    distTotalQuestions === 1 ||
    (!(distTotalQuestions > 1) && isSingleQuestionType(category))

  const primaryDistQuestions = allPaperQuestions.filter(
    (q: any) => !q.parentQuestionId && q.distributionId === dist.id
  )
  const distAddedCount =
    statusInfo?.addedCount !== undefined
      ? Number(statusInfo.addedCount)
      : primaryDistQuestions.length

  // Strict per-slot question counting (prevents unassigned bleed across shared siblings)
  let slotAddedCount = 0
  if (mode === "SUBSECTION_SHARED" && subSectionId) {
    slotAddedCount = primaryDistQuestions.filter(
      (q: any) => q.subSectionId === subSectionId
    ).length
  } else if (mode === "SUBSECTION_DEDICATED" && subSectionId) {
    slotAddedCount = primaryDistQuestions.filter(
      (q: any) =>
        q.subSectionId === subSectionId ||
        (!q.subSectionId && (!sectionId || q.sectionId === sectionId || !q.sectionId))
    ).length
  } else {
    slotAddedCount = primaryDistQuestions.filter(
      (q: any) =>
        !q.subSectionId &&
        (!sectionId || q.sectionId === sectionId || !q.sectionId)
    ).length
  }

  // ── Pick Quota & Slot Completion ─────────────────────────────────────
  let slotPickLimit = 1
  let isSlotCompleted = false

  if (mode === "SUBSECTION_SHARED") {
    const otherSiblingsOccupied = siblingSubSections
      .filter((s: any) => s.id !== subSectionId)
      .reduce((sum: number, s: any) => {
        const sibAdded = primaryDistQuestions.filter(
          (q: any) => q.subSectionId === s.id
        ).length
        const sibReq =
          s.questionsToAttempt && Number(s.questionsToAttempt) > 0
            ? Number(s.questionsToAttempt)
            : 0
        return sum + Math.max(sibAdded, sibReq)
      }, 0)

    slotPickLimit =
      distTotalQuestions > 0
        ? Math.max(1, distTotalQuestions - otherSiblingsOccupied)
        : 1

    // In shared-pool mode, the pool is full once total dist questions reach distTotalQuestions
    isSlotCompleted =
      statusInfo?.status === "COMPLETED" ||
      (distTotalQuestions > 0 && distAddedCount >= distTotalQuestions)
  } else {
    // DIRECT & SUBSECTION_DEDICATED: slot owns its full distTotalQuestions independently!
    slotPickLimit = isSingleDefault
      ? 1
      : distTotalQuestions > 0
      ? distTotalQuestions
      : 1

    isSlotCompleted =
      statusInfo?.status === "COMPLETED" ||
      (distTotalQuestions > 0 && slotAddedCount >= distTotalQuestions)
  }

  // ── Attempt Budget & Dropdown Math ───────────────────────────────────
  const otherSiblingsAttemptSum =
    mode === "SUBSECTION_SHARED"
      ? siblingSubSections
          .filter((s: any) => s.id !== subSectionId)
          .reduce((sum: number, s: any) => {
            const req =
              s.questionsToAttempt && Number(s.questionsToAttempt) > 0
                ? Number(s.questionsToAttempt)
                : 0
            return sum + req
          }, 0)
      : 0

  const showAttemptSelector = mode === "SUBSECTION_SHARED" && Boolean(subSectionId)
  const attemptDropdownMax =
    showAttemptSelector && distTotalAttempt > 0
      ? Math.max(0, distTotalAttempt - otherSiblingsAttemptSum)
      : 0

  const rawSubAttempt =
    subSection?.questionsToAttempt && Number(subSection.questionsToAttempt) > 0
      ? Number(subSection.questionsToAttempt)
      : 0
  const currentSubAttempt =
    showAttemptSelector && rawSubAttempt > 0
      ? Math.min(rawSubAttempt, Math.max(1, attemptDropdownMax))
      : rawSubAttempt

  const slotAttemptCount =
    mode === "SUBSECTION_SHARED"
      ? rawSubAttempt
      : rawSubAttempt > 0
      ? rawSubAttempt
      : distTotalAttempt

  // ── Presentation Flags ────────────────────────────────────────────────
  const marksPerQuestion = Number(
    dist?.marksPerQuestion ?? statusInfo?.marksPerQuestion ?? 10
  )

  let subSectionInstruction: string | null = null
  // Shared question-type sub-sections omit per-subsection attempt instructions because
  // the breakdown is communicated at the parent section level.
  if (mode === "SUBSECTION_DEDICATED" && isSingleDistInSub) {
    if (
      distTotalQuestions > 0 &&
      slotAttemptCount > 0 &&
      slotAttemptCount < distTotalQuestions
    ) {
      subSectionInstruction = `(যেকোনো ${toBengaliDigits(slotAttemptCount)}টি প্রশ্নের উত্তর দিতে হবে)`
    } else {
      subSectionInstruction = "(সবগুলো প্রশ্নের উত্তর দিতে হবে)"
    }
  }

  const distInstruction = buildDistInstruction({
    isCs,
    isCq,
    isMcq,
    totalProvided: distTotalQuestions,
    attemptCount: slotAttemptCount,
  })

  let marksPlacement: MarksPlacement = "NONE"
  if (mode === "SUBSECTION_SHARED") {
    marksPlacement = "NONE"
  } else if (mode === "SUBSECTION_DEDICATED") {
    marksPlacement = isSingleDistInSub ? "SUBSECTION" : "DISTRIBUTION"
  } else {
    marksPlacement = isMcq ? "NONE" : "DISTRIBUTION"
  }

  const subTitle = (subSection?.titleBn || subSection?.title || "").trim()
  const needsDistTitle =
    (isCq || category === QUESTION_TYPE_CODES.SA) && !isMcq && !isCs

  const showDistTitle =
    !needsDistTitle || mode === "SUBSECTION_SHARED"
      ? false
      : mode === "DIRECT"
      ? !sectionId
      : !isSingleDistInSub ||
        Boolean(distTitle && subTitle && distTitle.toLowerCase() !== subTitle.toLowerCase())

  return {
    key: `${dist.id}::${subSectionId ?? sectionId ?? "root"}`,
    mode,
    dist,
    distributionId: dist.id,
    sectionId,
    subSectionId,
    siblingSubSectionIds,
    distTotalQuestions,
    distTotalAttempt,
    slotPickLimit,
    slotAddedCount,
    distAddedCount,
    isSlotCompleted,
    slotAttemptCount,
    showAttemptSelector,
    attemptDropdownMax,
    currentSubAttempt,
    category,
    isSingleDefault,
    isCq,
    isMcq,
    isCs,
    marksPerQuestion,
    marksPlacement,
    showDistTitle,
    subSectionInstruction,
    distInstruction,
    distTitle,
  }
}

function scoreDistMatchForSub(sub: any, d: any): number {
  const subStr = `${sub.title || ""} ${sub.titleBn || ""} ${sub.instructions || ""}`.toLowerCase()
  const distTitleEn = (d.questionType?.nameEn || d.questionTypeName || "").toLowerCase().trim()
  const distTitleBn = (d.questionType?.nameBn || d.questionTypeNameBn || "").toLowerCase().trim()
  const distLabel = (d.questionTypeLabel || "").toLowerCase().trim()
  const distStr = `${distLabel} ${distTitleEn} ${distTitleBn}`.toLowerCase()

  let score = 0
  if (distTitleEn && subStr.includes(distTitleEn)) score += 200
  if (distTitleBn && subStr.includes(distTitleBn)) score += 200
  if (distLabel && subStr.includes(distLabel)) score += 200

  for (const kw of TOPIC_KEYWORDS) {
    const distHas = distStr.includes(kw)
    const subHas = subStr.includes(kw)
    if (distHas && subHas) score += 150
    else if (distHas && !subHas) score -= 300
  }
  return score
}

function matchSubSectionsToDists(
  validSubSections: any[],
  secDists: any[],
  subjectQuestions: any[]
): Map<string, any[]> {
  const result = new Map<string, any[]>()
  if (validSubSections.length === 0 || secDists.length === 0) {
    for (const sub of validSubSections) result.set(sub.id, [])
    return result
  }

  const claimedDistIds = new Set<string>()

  // Pass 1: Authoritative links (explicit DB junction + any questions already placed in sub)
  for (const sub of validSubSections) {
    const matched: any[] = []
    const seenIds = new Set<string>()

    for (const d of secDists) {
      const hasExplicitLink =
        d.subSections?.some((rel: any) => rel.subSectionId === sub.id) ||
        sub.distributions?.some((rel: any) => rel.distributionId === d.id)
      const hasPlacedQuestion = subjectQuestions.some(
        (q: any) => q.subSectionId === sub.id && q.distributionId === d.id
      )
      if ((hasExplicitLink || hasPlacedQuestion) && !seenIds.has(d.id)) {
        seenIds.add(d.id)
        matched.push(d)
        claimedDistIds.add(d.id)
      }
    }

    if (matched.length > 0) {
      result.set(sub.id, matched)
    }
  }

  // Pass 2: Match remaining unlinked sub-sections without colliding onto already-claimed dists
  for (const sub of validSubSections) {
    if (result.has(sub.id)) continue

    const unclaimed = secDists.filter((d: any) => !claimedDistIds.has(d.id))
    if (unclaimed.length > 0) {
      const scored = unclaimed
        .map((d: any) => ({ dist: d, score: scoreDistMatchForSub(sub, d) }))
        .sort((a, b) => b.score - a.score)

      const chosen = scored[0] && scored[0].score > 0 ? scored[0].dist : unclaimed[0]
      if (chosen) {
        claimedDistIds.add(chosen.id)
        result.set(sub.id, [chosen])
        continue
      }
    }

    // No unclaimed dists left: share ONLY if section has a single shared dist OR explicit positive keyword match
    if (secDists.length === 1) {
      result.set(sub.id, [secDists[0]])
    } else {
      const scoredAll = secDists
        .map((d: any) => ({ dist: d, score: scoreDistMatchForSub(sub, d) }))
        .sort((a, b) => b.score - a.score)
      result.set(sub.id, scoredAll[0] && scoredAll[0].score > 0 ? [scoredAll[0].dist] : [])
    }
  }

  return result
}

function buildSectionInstruction(params: {
  sec: any
  secDists: any[]
  resolvedSubs: ResolvedSubSection[]
  statuses: any[]
  secTotalProvided: number
  secTotalRequired: number
}): string | null {
  const { sec, secDists, resolvedSubs, statuses, secTotalProvided, secTotalRequired } = params
  const existingInst = typeof sec.instructions === "string" ? sec.instructions.trim() : ""
  const prefix = "[দ্রষ্টব্য: ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক।"

  const sharedSubsWithAttempts = resolvedSubs.filter(
    (rs) =>
      !rs.hideSubSection &&
      rs.mode === "SUBSECTION_SHARED" &&
      (rs.subSection.questionsToAttempt || 0) > 0
  )

  if (sharedSubsWithAttempts.length > 0 && !existingInst) {
    const subClauses = sharedSubsWithAttempts.map((rs) => {
      const name = (rs.subSection.titleBn || rs.subSection.title || "").trim()
      const countBn = toBengaliDigits(Number(rs.subSection.questionsToAttempt || 0))
      return name ? `${name} থেকে যেকোনো ${countBn}টি` : `যেকোনো ${countBn}টি`
    })

    const sharedAttemptSum = sharedSubsWithAttempts.reduce(
      (sum, rs) => sum + Number(rs.subSection.questionsToAttempt || 0),
      0
    )
    const firstSharedSlot = sharedSubsWithAttempts[0]?.slots[0]
    const totalSectionToAnswer =
      firstSharedSlot && firstSharedSlot.distTotalAttempt > 0
        ? firstSharedSlot.distTotalAttempt
        : sharedAttemptSum

    let breakdown = ""
    if (subClauses.length === 1) {
      breakdown = `${subClauses[0]} সহ মোট ${toBengaliDigits(totalSectionToAnswer)}টি প্রশ্নের উত্তর দিতে হবে`
    } else if (subClauses.length === 2) {
      breakdown = `${subClauses[0]} এবং ${subClauses[1]} সহ মোট ${toBengaliDigits(totalSectionToAnswer)}টি প্রশ্নের উত্তর দিতে হবে`
    } else if (subClauses.length > 2) {
      const head = subClauses.slice(0, -1).join(", ")
      const tail = subClauses[subClauses.length - 1]
      breakdown = `${head} এবং ${tail} সহ মোট ${toBengaliDigits(totalSectionToAnswer)}টি প্রশ্নের উত্তর দিতে হবে`
    }
    return `${prefix} ${breakdown}।]`
  }

  const hasSharedSubs = resolvedSubs.some((rs) => rs.mode === "SUBSECTION_SHARED")

  // Collect ONLY the distinct distribution(s) belonging to shared sub-sections
  // so we NEVER accumulate unrelated question types (e.g. CS / SA) into the shared count.
  const sharedDistIds = new Set<string>()
  const sharedDists: any[] = []
  for (const rs of resolvedSubs) {
    if (rs.mode !== "SUBSECTION_SHARED") continue
    for (const sl of rs.slots) {
      if (!sharedDistIds.has(sl.distributionId)) {
        sharedDistIds.add(sl.distributionId)
        sharedDists.push(sl.dist)
      }
    }
  }

  // Only aggregate across distributions when all belong to the shared group or there is 1 distribution.
  // Never sum across different question types.
  const distsForInstruction = hasSharedSubs
    ? sharedDists
    : secDists.length === 1
    ? secDists
    : []

  const getDistReq = (d: any) => {
    const st = statuses?.find((s: any) => s.distributionId === d.id)
    const explicitAttempt =
      d.questionsToAttempt !== undefined && d.questionsToAttempt !== null && Number(d.questionsToAttempt) > 0
        ? Number(d.questionsToAttempt)
        : null
    return explicitAttempt ?? st?.targetCount ?? d.questionCount ?? 0
  }

  const reqCount =
    distsForInstruction.length > 0
      ? distsForInstruction.reduce((sum: number, d: any) => sum + getDistReq(d), 0)
      : 0
  const provCount =
    distsForInstruction.length > 0
      ? distsForInstruction.reduce((sum: number, d: any) => sum + (d.questionCount || 0), 0)
      : 0

  if (existingInst) {
    if (distsForInstruction.length === 0) {
      return existingInst
    }
    let updatedInst = existingInst
    const fromPattern = /([০-৯\d]+)টি প্রশ্ন থেকে\s*(?:যে কোনো|যেকোনো)?\s*([০-৯\d]+)টি/
    const anyPattern = /(যে কোনো|যেকোনো|মোট)\s*([০-৯\d]+)টি/

    if (provCount > 0 && reqCount > 0 && fromPattern.test(updatedInst)) {
      updatedInst = updatedInst.replace(
        fromPattern,
        `${toBengaliDigits(provCount)}টি প্রশ্ন থেকে যেকোনো ${toBengaliDigits(reqCount)}টি`
      )
    } else if (reqCount > 0 && anyPattern.test(updatedInst)) {
      updatedInst = updatedInst.replace(
        anyPattern,
        `যেকোনো ${toBengaliDigits(reqCount)}টি`
      )
    } else if (reqCount > 0 && provCount > 0 && reqCount < provCount && updatedInst.includes("সবগুলো")) {
      updatedInst = updatedInst.replace("সবগুলো", `যেকোনো ${toBengaliDigits(reqCount)}টি`)
    }
    return updatedInst
  }

  const rawSecTitle = (sec.titleBn || sec.title)?.trim() || ""
  const isGenericSec = rawSecTitle.toLowerCase() === "section"
  if ((!rawSecTitle || isGenericSec) && !hasSharedSubs) return null

  if (distsForInstruction.length === 0) {
    return `${prefix}]`
  }

  if (provCount > 0 && reqCount >= provCount) {
    return `${prefix} সবগুলো প্রশ্নের উত্তর দিতে হবে।]`
  }
  if (reqCount > 0) {
    return `${prefix} যেকোনো ${toBengaliDigits(reqCount)}টি প্রশ্নের উত্তর দিতে হবে।]`
  }
  return null
}

/**
 * Resolves the complete paper topology across all subjects, sections,
 * sub-sections, and distributions into deterministic ResolvedSlot objects.
 */
export function resolvePaperSlots(
  paperQuery: any,
  statuses: any[] = [],
  options?: {
    dismissedSectionIds?: string[]
    dismissedSubSectionIds?: string[]
  }
): ResolvedPaperTopology {
  const slotsByKey = new Map<string, ResolvedSlot>()
  if (!paperQuery) {
    return { subjects: [], slotsByKey, findSlot: () => null }
  }

  const dismissedSecSet = new Set(options?.dismissedSectionIds ?? [])
  const dismissedSubSet = new Set(options?.dismissedSubSectionIds ?? [])
  const allPaperQuestions: any[] = paperQuery.questions ?? []
  const allSections: any[] = paperQuery.sections ?? []
  const allSubSectionIds = new Set(
    allSections.flatMap((s: any) => (s.subSections ?? []).map((sub: any) => sub.id))
  )
  const allSectionIds = new Set(allSections.map((s: any) => s.id))

  const subjects: ResolvedSubjectTopology[] = (paperQuery.subjects ?? []).map((subject: any) => {
    const subjectDists: any[] = subject.distributions ?? []
    const subjectDistIds = new Set(subjectDists.map((d: any) => d.id))

    const subjectQuestions = allPaperQuestions.filter((q: any) => {
      if (q.distributionId && subjectDistIds.has(q.distributionId)) return true
      if (q.subSectionId && allSubSectionIds.has(q.subSectionId)) return true
      if (q.sectionId && allSectionIds.has(q.sectionId)) return true
      return false
    })

    const allSubjectSlots: ResolvedSlot[] = []
    const handledDistIds = new Set<string>()
    const resolvedSections: ResolvedSection[] = []

    const subjectSections = allSections.filter((sec: any) => {
      if (dismissedSecSet.has(sec.id)) return false
      const secSubIds = new Set((sec.subSections ?? []).map((sub: any) => sub.id))
      const belongsByDist = subjectDists.some(
        (d: any) =>
          d.sectionId === sec.id ||
          d.subSections?.some((rel: any) => secSubIds.has(rel.subSectionId)) ||
          sec.subSections?.some((sub: any) =>
            sub.distributions?.some((rel: any) => rel.distributionId === d.id)
          )
      )
      const belongsByQ = subjectQuestions.some(
        (q: any) => q.sectionId === sec.id || secSubIds.has(q.subSectionId)
      )
      return belongsByDist || belongsByQ
    })

    for (const sec of subjectSections) {
      const secSubIds = new Set((sec.subSections ?? []).map((sub: any) => sub.id))
      const secDists = subjectDists.filter(
        (d: any) =>
          d.sectionId === sec.id ||
          d.subSections?.some((rel: any) => secSubIds.has(rel.subSectionId)) ||
          sec.subSections?.some((sub: any) =>
            sub.distributions?.some((rel: any) => rel.distributionId === d.id)
          ) ||
          ((!d.sectionId || d.sectionId === sec.id) &&
            subjectQuestions.some(
              (q: any) =>
                q.distributionId === d.id &&
                (q.sectionId === sec.id || secSubIds.has(q.subSectionId))
            ))
      )

      const totalSectionTarget = secDists.reduce((sum: number, d: any) => {
        const st = statuses?.find((s: any) => s.distributionId === d.id)
        return sum + (st?.targetCount || d.questionCount || 0)
      }, 0)
      const secTotalProvided = secDists.reduce(
        (sum: number, d: any) => sum + (d.questionCount || 0),
        0
      )
      const secTotalRequired =
        sec.questionsToAttempt ??
        (totalSectionTarget > 0 ? totalSectionTarget : secTotalProvided)

      const totalSectionAdded = secDists.reduce((sum: number, d: any) => {
        const st = statuses?.find((s: any) => s.distributionId === d.id)
        return sum + (st?.addedCount ?? 0)
      }, 0)
      const isSectionFilled =
        totalSectionTarget > 0 && totalSectionAdded >= totalSectionTarget

      const secQuestionsCount = subjectQuestions.filter(
        (q: any) => q.sectionId === sec.id || secSubIds.has(q.subSectionId)
      ).length

      const validSubSections = (sec.subSections ?? []).filter(
        (sub: any) => !dismissedSubSet.has(sub.id)
      )

      if (validSubSections.length > 0) {
        const subToDistsMap = matchSubSectionsToDists(
          validSubSections,
          secDists,
          subjectQuestions
        )

        // Build reverse map: distributionId -> list of subSections sharing it
        const subsByDistId = new Map<string, any[]>()
        for (const sub of validSubSections) {
          for (const d of subToDistsMap.get(sub.id) ?? []) {
            const list = subsByDistId.get(d.id) ?? []
            list.push(sub)
            subsByDistId.set(d.id, list)
          }
        }

        let sectionHasShared = false
        const resolvedSubs: ResolvedSubSection[] = validSubSections.map((sub: any) => {
          const targetDists = subToDistsMap.get(sub.id) ?? []
          const isSingleDistInSub = targetDists.length <= 1

          const subSlots = targetDists.map((d: any) => {
            handledDistIds.add(d.id)
            const siblingsForDist = subsByDistId.get(d.id) ?? [sub]
            const mode: SectionMode =
              siblingsForDist.length > 1 ? "SUBSECTION_SHARED" : "SUBSECTION_DEDICATED"
            if (mode === "SUBSECTION_SHARED") sectionHasShared = true

            const statusInfo = statuses?.find((s: any) => s.distributionId === d.id)
            const slot = buildSlot({
              mode,
              dist: d,
              sectionId: sec.id,
              subSection: sub,
              siblingSubSections: siblingsForDist,
              allPaperQuestions: subjectQuestions,
              statusInfo,
              isSingleDistInSub,
            })
            slotsByKey.set(slot.key, slot)
            allSubjectSlots.push(slot)
            return slot
          })

          const primarySlot = subSlots[0]
          const subMode: SectionMode =
            subSlots.some((s) => s.mode === "SUBSECTION_SHARED")
              ? "SUBSECTION_SHARED"
              : "SUBSECTION_DEDICATED"

          const hasQuestions = subjectQuestions.some((q: any) => q.subSectionId === sub.id)

          return {
            subSection: sub,
            mode: subMode,
            slots: subSlots,
            hasQuestions,
            hideSubSection: false,
            marksPerQuestion:
              primarySlot && primarySlot.marksPlacement === "SUBSECTION"
                ? primarySlot.marksPerQuestion
                : null,
            attemptCount:
              subMode === "SUBSECTION_DEDICATED" && primarySlot
                ? primarySlot.slotAttemptCount
                : null,
            showMarkDistribution:
              Boolean(primarySlot && primarySlot.marksPlacement === "SUBSECTION"),
            instructions:
              subMode === "SUBSECTION_SHARED" ? null : (primarySlot?.subSectionInstruction ?? null),
            distName:
              subMode === "SUBSECTION_SHARED" ? "" : (primarySlot?.distTitle ?? ""),
          }
        })

        // If any single sub-section in a shared-type group filled ALL questions of that distribution,
        // hide ALL sub-sections sharing that distribution; also hide empty siblings once pool is full.
        const sharedDistFilledAll = new Set<string>()
        for (const rs of resolvedSubs) {
          if (rs.mode !== "SUBSECTION_SHARED") continue
          for (const sl of rs.slots) {
            if (sl.distTotalQuestions > 0 && sl.slotAddedCount >= sl.distTotalQuestions) {
              sharedDistFilledAll.add(sl.distributionId)
            }
          }
        }
        for (const rs of resolvedSubs) {
          if (rs.mode !== "SUBSECTION_SHARED") continue
          const sharesFilledDist = rs.slots.some((sl) => sharedDistFilledAll.has(sl.distributionId))
          const isEmptyAndPoolFull =
            !rs.hasQuestions && rs.slots.length > 0 && rs.slots.every((sl) => sl.isSlotCompleted)
          if (sharesFilledDist || isEmptyAndPoolFull) {
            rs.hideSubSection = true
          }
        }

        // Also handle any section-level distributions that weren't linked to any sub-section
        const orphanSecDists = secDists.filter((d: any) => !handledDistIds.has(d.id))
        const directSlots: ResolvedSlot[] = orphanSecDists.map((d: any) => {
          handledDistIds.add(d.id)
          const statusInfo = statuses?.find((s: any) => s.distributionId === d.id)
          const slot = buildSlot({
            mode: "DIRECT",
            dist: d,
            sectionId: sec.id,
            subSection: null,
            siblingSubSections: [],
            allPaperQuestions: subjectQuestions,
            statusInfo,
          })
          slotsByKey.set(slot.key, slot)
          allSubjectSlots.push(slot)
          return slot
        })

        const sectionMode: SectionMode = sectionHasShared
          ? "SUBSECTION_SHARED"
          : "SUBSECTION_DEDICATED"

        const instructions = buildSectionInstruction({
          sec,
          secDists,
          resolvedSubs,
          statuses,
          secTotalProvided,
          secTotalRequired,
        })

        resolvedSections.push({
          section: sec,
          mode: sectionMode,
          isSectionFilled,
          hasQuestions: secQuestionsCount > 0,
          instructions,
          subSections: resolvedSubs,
          directSlots,
        })
      } else {
        // Mode 3: DIRECT (section has no sub-sections)
        const directSecDists = subjectDists.filter(
          (d: any) => d.sectionId === sec.id && !d.subSectionId
        )
        const targetDirectDists = directSecDists.length > 0 ? directSecDists : secDists

        const directSlots: ResolvedSlot[] = targetDirectDists.map((d: any) => {
          handledDistIds.add(d.id)
          const statusInfo = statuses?.find((s: any) => s.distributionId === d.id)
          const slot = buildSlot({
            mode: "DIRECT",
            dist: d,
            sectionId: sec.id,
            subSection: null,
            siblingSubSections: [],
            allPaperQuestions: subjectQuestions,
            statusInfo,
          })
          slotsByKey.set(slot.key, slot)
          allSubjectSlots.push(slot)
          return slot
        })

        const instructions = buildSectionInstruction({
          sec,
          secDists: targetDirectDists,
          resolvedSubs: [],
          statuses,
          secTotalProvided,
          secTotalRequired,
        })

        resolvedSections.push({
          section: sec,
          mode: "DIRECT",
          isSectionFilled,
          hasQuestions: secQuestionsCount > 0,
          instructions,
          subSections: [],
          directSlots,
        })
      }
    }

    // Unassigned distributions (no section, or paper without sections)
    const unassignedDists = subjectDists.filter((d: any) => !handledDistIds.has(d.id))
    const unassignedSlots: ResolvedSlot[] = unassignedDists.map((d: any) => {
      handledDistIds.add(d.id)
      const statusInfo = statuses?.find((s: any) => s.distributionId === d.id)
      const slot = buildSlot({
        mode: "DIRECT",
        dist: d,
        sectionId: d.sectionId ?? null,
        subSection: null,
        siblingSubSections: [],
        allPaperQuestions: subjectQuestions,
        statusInfo,
      })
      slotsByKey.set(slot.key, slot)
      allSubjectSlots.push(slot)
      return slot
    })

    return {
      subject,
      sections: resolvedSections,
      unassignedSlots,
      allSlots: allSubjectSlots,
    }
  })

  const findSlot: ResolvedPaperTopology["findSlot"] = ({
    distributionId,
    subSectionId,
    sectionId,
  }) => {
    const exactKey = `${distributionId}::${subSectionId ?? sectionId ?? "root"}`
    const exact = slotsByKey.get(exactKey)
    if (exact) return exact

    for (const subj of subjects) {
      for (const slot of subj.allSlots) {
        if (slot.distributionId !== distributionId) continue
        if (subSectionId && slot.subSectionId === subSectionId) return slot
        if (!subSectionId && sectionId && slot.sectionId === sectionId && !slot.subSectionId) {
          return slot
        }
      }
      // Fallback: first slot matching distributionId
      const byDist = subj.allSlots.find((s) => s.distributionId === distributionId)
      if (byDist) return byDist
    }
    return null
  }

  return { subjects, slotsByKey, findSlot }
}
