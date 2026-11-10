import { useMemo } from "react"
import { resolvePaperSlots, type ResolvedSlot } from "@workspace/utils"

export interface DistLimits {
  pickLimit: number
  dropdownMax: number
  currentAttempt: number
  sharedTypeAttempt: number
  addedCount: number
  targetCount: number
  showAttemptSelector: boolean
  isCompleted: boolean
  category: string
}

/**
 * Returns quota & limit state for DistActionBlock.
 * Uses the pre-resolved `ResolvedSlot` from `resolvePaperSlots` when available,
 * and falls back to running `resolvePaperSlots` on `paperQuery` if `slot` was
 * omitted (e.g. legacy serialized blocks).
 */
export function useDistLimits(
  blockData: any,
  paperQuery: any
): DistLimits {
  return useMemo(() => {
    const dist = blockData?.dist
    const sectionId: string | null = blockData?.sectionId ?? dist?.sectionId ?? null
    const subSectionId: string | null = blockData?.subSectionId ?? dist?.subSectionId ?? null

    let slot: ResolvedSlot | null = blockData?.slot ?? null

    // Always prefer live slot resolution from paperQuery when available so
    // optimistic/refetched question counts update immediately.
    if (paperQuery && dist?.id) {
      const topology = resolvePaperSlots(paperQuery)
      const liveSlot = topology.findSlot({
        distributionId: dist.id,
        subSectionId,
        sectionId,
      })
      if (liveSlot) {
        slot = liveSlot
      }
    }

    if (slot) {
      return {
        pickLimit: slot.slotPickLimit,
        dropdownMax: slot.attemptDropdownMax,
        currentAttempt: slot.currentSubAttempt,
        sharedTypeAttempt: slot.distTotalAttempt,
        addedCount: slot.slotAddedCount,
        targetCount: slot.distTotalQuestions > 0 ? slot.distTotalQuestions : 1,
        showAttemptSelector: slot.showAttemptSelector,
        isCompleted: slot.isSlotCompleted,
        category: slot.category,
      }
    }

    // Minimal fallback if paperQuery hasn't loaded yet
    const distTotal = Number(dist?.questionCount ?? blockData?.statusInfo?.targetCount ?? 1)
    const addedCount = Number(blockData?.statusInfo?.addedCount ?? 0)
    const isCompleted =
      blockData?.status === "COMPLETED" ||
      (distTotal > 0 && addedCount >= distTotal)

    return {
      pickLimit: distTotal > 0 ? distTotal : 1,
      dropdownMax: Number(dist?.questionsToAttempt ?? distTotal),
      currentAttempt: Number(blockData?.subQuestionsToAttempt ?? 0),
      sharedTypeAttempt: Number(dist?.questionsToAttempt ?? distTotal),
      addedCount,
      targetCount: distTotal > 0 ? distTotal : 1,
      showAttemptSelector: Boolean(subSectionId && blockData?.isSharedQuestionType),
      isCompleted,
      category: "MCQ",
    }
  }, [blockData, paperQuery])
}
