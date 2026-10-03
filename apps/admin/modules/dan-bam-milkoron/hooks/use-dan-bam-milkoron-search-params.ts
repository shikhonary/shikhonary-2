import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const danBamMilkoronSortOptions = [
  "All",
  "newest",
  "oldest",
  "popularity",
] as const
export type DanBamMilkoronSortOption = (typeof danBamMilkoronSortOptions)[number]

export const danBamMilkoronSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  classId: parseAsString.withDefault("All"),
  subjectId: parseAsString.withDefault("All"),
  chapterId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<DanBamMilkoronSortOption>(Array.from(danBamMilkoronSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useDanBamMilkoronSearchParams() {
  return useQueryStates(danBamMilkoronSearchParamsParsers, {
    shallow: true,
  })
}
