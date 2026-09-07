import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListFillInTheBlanksWithCluesInput,
  FillInTheBlanksWithCluesStatsInput,
} from "@workspace/api"

/**
 * Hook to list Fill in the Blanks with Clues with filtering & pagination.
 */
export function useFillInTheBlanksWithCluesList(input: ListFillInTheBlanksWithCluesInput = { limit: 20 }) {
  return useQuery(trpc.fillInTheBlanksWithClues.list.queryOptions(input))
}

/**
 * Hook to fetch summary statistics for Fill in the Blanks with Clues using suspense.
 */
export function useFillInTheBlanksWithCluesStats(input?: FillInTheBlanksWithCluesStatsInput) {
  return useSuspenseQuery(trpc.fillInTheBlanksWithClues.stats.queryOptions(input))
}

/**
 * Hook to fetch a single Fill in the Blanks with Clues item by ID.
 */
export function useFillInTheBlanksWithCluesById(id: string, enabled = true) {
  return useQuery({
    ...trpc.fillInTheBlanksWithClues.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to create a new Fill in the Blanks with Clues record.
 */
export function useCreateFillInTheBlanksWithClues() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.fillInTheBlanksWithClues.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.fillInTheBlanksWithClues.pathFilter())
    },
  })
}

/**
 * Hook to update an existing Fill in the Blanks with Clues record.
 */
export function useUpdateFillInTheBlanksWithClues() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.fillInTheBlanksWithClues.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.fillInTheBlanksWithClues.pathFilter())
    },
  })
}

/**
 * Hook to delete a single Fill in the Blanks with Clues record.
 */
export function useDeleteFillInTheBlanksWithClues() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.fillInTheBlanksWithClues.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.fillInTheBlanksWithClues.pathFilter())
    },
  })
}

/**
 * Hook to bulk delete Fill in the Blanks with Clues records.
 */
export function useBulkDeleteFillInTheBlanksWithClues() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.fillInTheBlanksWithClues.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.fillInTheBlanksWithClues.pathFilter())
    },
  })
}

/**
 * Hook to bulk import Fill in the Blanks with Clues records.
 */
export function useImportFillInTheBlanksWithClues() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.fillInTheBlanksWithClues.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.fillInTheBlanksWithClues.pathFilter())
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
