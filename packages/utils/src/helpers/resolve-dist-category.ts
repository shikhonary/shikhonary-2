/**
 * Resolves a distribution's question type to a canonical QuestionTypeCode.
 *
 * Priority order:
 *   1. Normalize each name/label field via normalizeQuestionTypeName → code from QUESTION_TYPE_MAP
 *   2. Use the raw code field if it matches a known QuestionTypeCode
 *   3. Fall back to MCQ
 *
 * This is the single source of truth for category resolution; components should
 * not re-implement the string-matching logic themselves.
 */

import { normalizeQuestionTypeName } from "../constants/question-type"
import { QUESTION_TYPE_MAP } from "../constants/question-type"
import { QUESTION_TYPE_CODES } from "../constants/question-type"
import type { QuestionTypeCode } from "../constants/question-type"

export interface DistCategoryInput {
  questionTypeName?: string | null
  questionTypeNameBn?: string | null
  questionTypeLabel?: string | null
  questionType?: {
    nameEn?: string | null
    nameBn?: string | null
    code?: string | null
  } | null
  /** Top-level code field (some older distributions carry this) */
  code?: string | null
}

export function resolveDistCategory(dist: DistCategoryInput | null | undefined): QuestionTypeCode {
  if (!dist) return QUESTION_TYPE_CODES.MCQ

  // ── 1. Normalize name fields in priority order ──────────────────────────
  const candidates = [
    dist.questionTypeName,
    dist.questionTypeNameBn,
    dist.questionTypeLabel,
    dist.questionType?.nameEn,
    dist.questionType?.nameBn,
  ]

  for (const raw of candidates) {
    if (!raw) continue
    const normalized = normalizeQuestionTypeName(raw)
    if (normalized && QUESTION_TYPE_MAP[normalized]?.code) {
      return QUESTION_TYPE_MAP[normalized].code as QuestionTypeCode
    }
  }

  // ── 2. Try raw code field ───────────────────────────────────────────────
  const rawCode = dist.questionType?.code ?? dist.code ?? ""
  if (rawCode) {
    const upper = rawCode.toUpperCase() as QuestionTypeCode
    if (Object.values(QUESTION_TYPE_CODES).includes(upper)) {
      return upper
    }
  }

  // ── 3. Fallback ─────────────────────────────────────────────────────────
  return QUESTION_TYPE_CODES.MCQ
}
