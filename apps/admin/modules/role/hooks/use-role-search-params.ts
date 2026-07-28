import { useQueryStates, parseAsString, parseAsInteger, parseAsStringEnum } from "nuqs"

export const roleSortOptions = [
  "All",
  "name_asc",
  "name_desc",
  "newest",
  "oldest",
] as const
export type RoleSortOption = (typeof roleSortOptions)[number]

export const roleSearchParamsParsers = {
  query: parseAsString.withDefault(""),
  sort: parseAsStringEnum<RoleSortOption>(Array.from(roleSortOptions)).withDefault("All"),
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(5),
}

export function useRoleSearchParams() {
  return useQueryStates(roleSearchParamsParsers, {
    shallow: true,
  })
}
