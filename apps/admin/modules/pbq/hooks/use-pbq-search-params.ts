import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const pbqSortOptions = [
  "All",
  "newest",
  "oldest",
  "context_asc",
  "context_desc",
] as const
export type PbqSortOption = (typeof pbqSortOptions)[number]

export const pbqSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  subjectId: parseAsString.withDefault("All"),
  chapterId: parseAsString.withDefault("All"),
  board: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<PbqSortOption>(Array.from(pbqSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function usePbqSearchParams() {
  return useQueryStates(pbqSearchParamsParsers, {
    shallow: true,
  })
}
