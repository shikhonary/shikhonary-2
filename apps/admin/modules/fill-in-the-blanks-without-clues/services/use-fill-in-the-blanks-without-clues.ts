import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListFillInTheBlanksWithoutCluesInput,
  FillInTheBlanksWithoutCluesStatsInput,
} from "@workspace/api"

/**
 * Hook to list Fill in the Blanks without Clues with filtering & pagination.
 */
export function useFillInTheBlanksWithoutCluesList(input: ListFillInTheBlanksWithoutCluesInput = { limit: 20 }) {
  return useQuery(trpc.fillInTheBlanksWithoutClues.list.queryOptions(input))
}

/**
 * Hook to fetch summary statistics for Fill in the Blanks without Clues using suspense.
 */
export function useFillInTheBlanksWithoutCluesStats(input?: FillInTheBlanksWithoutCluesStatsInput) {
  return useSuspenseQuery(trpc.fillInTheBlanksWithoutClues.stats.queryOptions(input))
}

/**
 * Hook to fetch a single Fill in the Blanks without Clues item by ID.
 */
export function useFillInTheBlanksWithoutCluesById(id: string, enabled = true) {
  return useQuery({
    ...trpc.fillInTheBlanksWithoutClues.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to create a new Fill in the Blanks without Clues record.
 */
export function useCreateFillInTheBlanksWithoutClues() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.fillInTheBlanksWithoutClues.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.fillInTheBlanksWithoutClues.pathFilter())
    },
  })
}

/**
 * Hook to update an existing Fill in the Blanks without Clues record.
 */
export function useUpdateFillInTheBlanksWithoutClues() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.fillInTheBlanksWithoutClues.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.fillInTheBlanksWithoutClues.pathFilter())
    },
  })
}

/**
 * Hook to delete a single Fill in the Blanks without Clues record.
 */
export function useDeleteFillInTheBlanksWithoutClues() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.fillInTheBlanksWithoutClues.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.fillInTheBlanksWithoutClues.pathFilter())
    },
  })
}

/**
 * Hook to bulk delete Fill in the Blanks without Clues records.
 */
export function useBulkDeleteFillInTheBlanksWithoutClues() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.fillInTheBlanksWithoutClues.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.fillInTheBlanksWithoutClues.pathFilter())
    },
  })
}

/**
 * Hook to bulk import Fill in the Blanks without Clues records.
 */
export function useImportFillInTheBlanksWithoutClues() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.fillInTheBlanksWithoutClues.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.fillInTheBlanksWithoutClues.pathFilter())
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
