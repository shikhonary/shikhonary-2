import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const formFillingSortOptions = [
  "All",
  "newest",
  "oldest",
  "scenario_asc",
  "scenario_desc",
  "popularity",
] as const
export type FormFillingSortOption = (typeof formFillingSortOptions)[number]

export const formFillingSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  classId: parseAsString.withDefault("All"),
  subjectId: parseAsString.withDefault("All"),
  chapterId: parseAsString.withDefault("All"),
  difficulty: parseAsString.withDefault("All"),
  sort: parseAsStringEnum<FormFillingSortOption>(Array.from(formFillingSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useFormFillingSearchParams() {
  return useQueryStates(formFillingSearchParamsParsers, {
    shallow: true,
  })
}
