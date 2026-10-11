import { QUESTION_SOURCE_OPTIONS, type QuestionSource } from "@workspace/utils"

export const SHUDDHO_ASHUDDHO_SOURCE_OPTIONS = QUESTION_SOURCE_OPTIONS
export type ShuddhoAshuddhoSource = QuestionSource


export const SHUDDHO_ASHUDDHO_ANSWER_OPTIONS = [
  { value: "শুদ্ধ", label: "শুদ্ধ (Correct)" },
  { value: "অশুদ্ধ", label: "অশুদ্ধ (Incorrect)" },
] as const
