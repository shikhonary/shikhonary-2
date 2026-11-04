import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const subjectSortOptions = [
  "All",
  "newest",
  "oldest",
  "name_asc",
  "name_desc",
  "code_asc",
  "code_desc",
] as const

export type SubjectSortOption = (typeof subjectSortOptions)[number]

export const subjectSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  sort: parseAsStringEnum<SubjectSortOption>(Array.from(subjectSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
  academicYearId: parseAsString.withDefault("All"),
  classId: parseAsString.withDefault("All"),
  group: parseAsString.withDefault("All"),
  isActive: parseAsString.withDefault("All"),
}

export function useSubjectSearchParams() {
  return useQueryStates(subjectSearchParamsParsers, {
    shallow: true,
  })
}
