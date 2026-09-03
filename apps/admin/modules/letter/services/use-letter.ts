import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListLettersInput,
  LetterStatsInput,
} from "@workspace/api"

/**
 * Hook to list Letters with filtering & pagination.
 */
export function useLettersList(input: ListLettersInput = { limit: 20 }) {
  return useQuery(trpc.letter.list.queryOptions(input))
}

/**
 * Hook to fetch summary statistics for Letters using suspense.
 */
export function useLetterStats(input?: LetterStatsInput) {
  return useSuspenseQuery(trpc.letter.stats.queryOptions(input))
}

/**
 * Hook to fetch a single Letter by ID.
 */
export function useLetterById(id: string, enabled = true) {
  return useQuery({
    ...trpc.letter.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to create a new Letter record.
 */
export function useCreateLetter() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.letter.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.letter.pathFilter())
    },
  })
}

/**
 * Hook to update an existing Letter record.
 */
export function useUpdateLetter() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.letter.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.letter.pathFilter())
    },
  })
}

/**
 * Hook to delete a single Letter record.
 */
export function useDeleteLetter() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.letter.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.letter.pathFilter())
    },
  })
}

/**
 * Hook to bulk delete Letter records.
 */
export function useBulkDeleteLetters() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.letter.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.letter.pathFilter())
    },
  })
}

/**
 * Hook to bulk import Letter records.
 */
export function useImportLetters() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.letter.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.letter.pathFilter())
    },
  })
}

/**
 * Hook to fetch academic classes for select options list.
 */
export function useAcademicClassesForSelection() {
  return useQuery({
    ...trpc.academicClass.list.queryOptions({ limit: 100 }),
    select: (data) => data.academicClasses ?? [],
  })
}

/**
 * Hook to fetch academic subjects for dropdown select list.
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
