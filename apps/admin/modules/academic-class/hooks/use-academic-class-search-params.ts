import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const academicClassSortOptions = [
  "All",
  "name_asc",
  "name_desc",
  "newest",
  "oldest",
] as const
export type AcademicClassSortOption = (typeof academicClassSortOptions)[number]

export const academicClassSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  status: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<AcademicClassSortOption>(Array.from(academicClassSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(5),
}

export function useAcademicClassSearchParams() {
  return useQueryStates(academicClassSearchParamsParsers, {
    shallow: true,
  })
}

