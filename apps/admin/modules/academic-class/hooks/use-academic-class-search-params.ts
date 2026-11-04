import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const academicClassSortOptions = [
  "All",
  "position_asc",
  "position_desc",
  "name_asc",
  "name_desc",
  "newest",
  "oldest",
] as const

export type AcademicClassSortOption = (typeof academicClassSortOptions)[number]

export const academicClassSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  sort: parseAsStringEnum<AcademicClassSortOption>(Array.from(academicClassSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
  academicYearId: parseAsString.withDefault("All"),
  isActive: parseAsString.withDefault("All"),
}

export function useAcademicClassSearchParams() {
  return useQueryStates(academicClassSearchParamsParsers, {
    shallow: true,
  })
}
