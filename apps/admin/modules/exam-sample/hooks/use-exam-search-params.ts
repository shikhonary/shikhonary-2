import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const examSortOptions = [
  "All",
  "newest",
  "oldest",
  "title_asc",
  "title_desc",
] as const
export type ExamSortOption = (typeof examSortOptions)[number]

export const examStatusOptions = ["All", "Pending", "Published", "Archived"] as const
export type ExamStatusOption = (typeof examStatusOptions)[number]

export const examSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  status: parseAsString.withDefault("All"),
  type: parseAsString.withDefault("All"),
  academicClassId: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<ExamSortOption>(Array.from(examSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useExamSearchParams() {
  return useQueryStates(examSearchParamsParsers, {
    shallow: true,
  })
}
