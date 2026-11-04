import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const academicYearSortOptions = [
  "All",
  "newest",
  "oldest",
  "name_asc",
  "name_desc",
] as const
export type AcademicYearSortOption = (typeof academicYearSortOptions)[number]

export const academicYearSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  sort: parseAsStringEnum<AcademicYearSortOption>(Array.from(academicYearSortOptions)).withDefault("All"),
  isActive: parseAsString.withDefault("All"),
  isCurrent: parseAsString.withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useAcademicYearSearchParams() {
  return useQueryStates(academicYearSearchParamsParsers, {
    shallow: true,
  })
}
