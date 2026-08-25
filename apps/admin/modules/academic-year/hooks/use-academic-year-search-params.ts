import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const academicYearSortOptions = [
  "All",
  "name_asc",
  "name_desc",
  "newest",
  "oldest",
] as const
export type AcademicYearSortOption = (typeof academicYearSortOptions)[number]

export const academicYearSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  sort: parseAsStringEnum<AcademicYearSortOption>(Array.from(academicYearSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useAcademicYearSearchParams() {
  return useQueryStates(academicYearSearchParamsParsers, {
    shallow: true,
  })
}
