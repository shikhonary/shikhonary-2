import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListSeenComprehensionsInput,
  SeenComprehensionStatsInput,
} from "@workspace/api"

/**
 * Hook to list Seen Comprehensions with filtering & pagination.
 */
export function useSeenComprehensionsList(input: ListSeenComprehensionsInput = { limit: 20 }) {
  return useQuery(trpc.seenComprehension.list.queryOptions(input))
}

/**
 * Hook to fetch summary statistics for Seen Comprehensions using suspense.
 */
export function useSeenComprehensionStats(input?: SeenComprehensionStatsInput) {
  return useSuspenseQuery(trpc.seenComprehension.stats.queryOptions(input))
}

/**
 * Hook to fetch a single Seen Comprehension by ID.
 */
export function useSeenComprehensionById(id: string, enabled = true) {
  return useQuery({
    ...trpc.seenComprehension.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to fetch Board/Year references for filtering.
 */
export function useSeenComprehensionBoardYears(input: {
  subjectId: string
  chapterId?: string
  academicChapterId?: string
  comprehensionType?: string
}) {
  return useQuery({
    ...trpc.seenComprehension.boardYears.queryOptions(input),
    enabled: Boolean(input.subjectId),
  })
}

/**
 * Hook to create a new Seen Comprehension record.
 */
export function useCreateSeenComprehension() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.seenComprehension.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.seenComprehension.pathFilter())
    },
  })
}

/**
 * Hook to update an existing Seen Comprehension record.
 */
export function useUpdateSeenComprehension() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.seenComprehension.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.seenComprehension.pathFilter())
    },
  })
}

/**
 * Hook to delete a single Seen Comprehension record.
 */
export function useDeleteSeenComprehension() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.seenComprehension.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.seenComprehension.pathFilter())
    },
  })
}

/**
 * Hook to bulk delete Seen Comprehension records.
 */
export function useBulkDeleteSeenComprehensions() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.seenComprehension.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.seenComprehension.pathFilter())
    },
  })
}

/**
 * Hook to toggle Seen Comprehension active state.
 */
export function useToggleSeenComprehensionActive() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.seenComprehension.toggleActive.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.seenComprehension.pathFilter())
    },
  })
}

/**
 * Hook to bulk import Seen Comprehension records.
 */
export function useImportSeenComprehensions() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.seenComprehension.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.seenComprehension.pathFilter())
    },
  })
}

/**
 * Hook to fetch academic classes for select options list (returns array directly).
 */
export function useAcademicClassesForSelection() {
  return useQuery({
    ...trpc.academicClass.list.queryOptions({ limit: 100 }),
    select: (data) => data.academicClasses ?? [],
  })
}

/**
 * Hook to fetch academic subjects for dropdown select list (returns array directly).
 */
export function useSubjectsForSelection(input?: { academicClassId?: string }) {
  const classId = input?.academicClassId === "All" ? undefined : input?.academicClassId
  return useQuery({
    ...trpc.academicSubject.list.queryOptions({
      limit: 100,
      classId,
    }),
    select: (data) => data.academicSubjects ?? [],
  })
}

/**
 * Hook to fetch academic chapters for dropdown select list (returns array directly).
 */
export function useChaptersForSelection(input?: { subjectId?: string }) {
  const subjectId = input?.subjectId === "All" ? undefined : input?.subjectId
  return useQuery({
    ...trpc.academicChapter.list.queryOptions({
      limit: 100,
      subjectId,
    }),
    select: (data) => data.academicChapters ?? [],
    enabled: input === undefined || (subjectId !== undefined && subjectId !== ""),
  })
}
