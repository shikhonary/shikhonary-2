import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const subjectSortOptions = [
  "All",
  "position_asc",
  "position_desc",
  "name_asc",
  "name_desc",
  "newest",
  "oldest",
] as const
export type SubjectSortOption = (typeof subjectSortOptions)[number]

export const subjectSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  academicClassId: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<SubjectSortOption>(Array.from(subjectSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(5),
}

export function useSubjectSearchParams() {
  return useQueryStates(subjectSearchParamsParsers, {
    shallow: true,
  })
}
