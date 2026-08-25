import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type { ListAcademicChaptersInput } from "@workspace/api"
import { toast } from "@workspace/ui/components/sonner"

/**
 * Hook to list academic chapters.
 */
export function useChaptersList(input: ListAcademicChaptersInput) {
  return useQuery(trpc.academicChapter.list.queryOptions(input))
}

/**
 * Hook to fetch a single academic chapter by ID.
 */
export function useChapterById(id: string, enabled = true) {
  return useQuery({
    ...trpc.academicChapter.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to fetch a single academic subject by ID.
 */
export function useSubjectById(id: string, enabled = true) {
  return useQuery({
    ...trpc.academicSubject.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to fetch academic subjects for dropdown select list.
 */
export function useSubjectsForSelection(academicYearId?: string, classId?: string) {
  return useQuery(
    trpc.academicSubject.list.queryOptions({
      limit: 100,
      academicYearId: academicYearId === "All" || !academicYearId ? undefined : academicYearId,
      classId: classId === "All" || !classId ? undefined : classId,
    })
  )
}

/**
 * Hook to fetch academic classes for select options list.
 */
export function useAcademicClassesForSelection(academicYearId?: string) {
  return useQuery(
    trpc.academicClass.list.queryOptions({
      limit: 100,
      academicYearId: academicYearId === "All" || !academicYearId ? undefined : academicYearId,
    })
  )
}

/**
 * Hook to fetch academic years for dropdown select list.
 */
export function useAcademicYearsForSelection() {
  return useQuery(trpc.academicYear.list.queryOptions({ limit: 100 }))
}

/**
 * Hook to create a new academic chapter.
 */
export function useCreateChapter() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.academicChapter.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.academicChapter.pathFilter())
    },
  })
}

/**
 * Hook to update an existing academic chapter.
 */
export function useUpdateChapter() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.academicChapter.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.academicChapter.pathFilter())
    },
  })
}

/**
 * Hook to delete an academic chapter.
 */
export function useDeleteChapter() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.academicChapter.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.academicChapter.pathFilter())
    },
  })
}

/**
 * Hook to toggle active status of a chapter.
 */
export function useToggleChapterStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.academicChapter.toggleStatus.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.academicChapter.pathFilter())
      toast.success("Academic Chapter status updated.")
    },
    onError: (err: any) => toast.error(err.message || "Failed to update status"),
  })
}
