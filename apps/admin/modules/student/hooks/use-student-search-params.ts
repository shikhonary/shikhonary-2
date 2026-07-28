import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const studentSortOptions = [
  "All",
  "name_asc",
  "name_desc",
  "roll_asc",
  "roll_desc",
  "newest",
  "oldest",
] as const
export type StudentSortOption = (typeof studentSortOptions)[number]

export const studentStatusOptions = ["All", "offline", "online"] as const
export type StudentStatusOption = (typeof studentStatusOptions)[number]

export const studentLinkedOptions = ["All", "linked", "unlinked"] as const
export type StudentLinkedOption = (typeof studentLinkedOptions)[number]

export const studentSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  academicClassId: parseAsString.withDefault(""),
  status: parseAsStringEnum<StudentStatusOption>(Array.from(studentStatusOptions)).withDefault("All"),
  linked: parseAsStringEnum<StudentLinkedOption>(Array.from(studentLinkedOptions)).withDefault("All"),
  sort: parseAsStringEnum<StudentSortOption>(Array.from(studentSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
}

export function useStudentSearchParams() {
  return useQueryStates(studentSearchParamsParsers, {
    shallow: true,
  })
}
