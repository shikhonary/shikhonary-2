import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListParagraphsInput,
  ParagraphStatsInput,
} from "@workspace/api"

/**
 * Hook to list Paragraphs with filtering & pagination.
 */
export function useParagraphsList(input: ListParagraphsInput = { limit: 20 }) {
  return useQuery(trpc.paragraph.list.queryOptions(input))
}

/**
 * Hook to fetch summary statistics for Paragraphs using suspense.
 */
export function useParagraphStats(input?: ParagraphStatsInput) {
  return useSuspenseQuery(trpc.paragraph.stats.queryOptions(input))
}

/**
 * Hook to fetch a single Paragraph by ID.
 */
export function useParagraphById(id: string, enabled = true) {
  return useQuery({
    ...trpc.paragraph.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to create a new Paragraph record.
 */
export function useCreateParagraph() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.paragraph.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.paragraph.pathFilter())
    },
  })
}

/**
 * Hook to update an existing Paragraph record.
 */
export function useUpdateParagraph() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.paragraph.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.paragraph.pathFilter())
    },
  })
}

/**
 * Hook to delete a single Paragraph record.
 */
export function useDeleteParagraph() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.paragraph.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.paragraph.pathFilter())
    },
  })
}

/**
 * Hook to bulk delete Paragraph records.
 */
export function useBulkDeleteParagraphs() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.paragraph.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.paragraph.pathFilter())
    },
  })
}

/**
 * Hook to bulk import Paragraph records.
 */
export function useImportParagraphs() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.paragraph.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.paragraph.pathFilter())
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
