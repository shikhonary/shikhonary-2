import { useQueryStates, parseAsString, parseAsInteger } from "nuqs"

export function useShortAnswerSearchParams() {
  return useQueryStates({
    query: parseAsString.withDefault(""),
    subjectId: parseAsString.withDefault("All"),
    chapterId: parseAsString.withDefault("All"),
    board: parseAsString.withDefault("All"),
    difficulty: parseAsString.withDefault("All"),
    sort: parseAsString.withDefault("createdAt_desc"),
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
  })
}
