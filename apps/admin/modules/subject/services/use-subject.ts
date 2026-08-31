import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type { ListAcademicSubjectsInput } from "@workspace/api"
import { toast } from "@workspace/ui/components/sonner"

/**
 * Hook to list academic subjects.
 */
export function useSubjectsList(input: ListAcademicSubjectsInput) {
  return useQuery(trpc.academicSubject.list.queryOptions(input))
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
 * Hook to fetch academic years for dropdown select list.
 */
export function useAcademicYearsForSelection() {
  return useQuery(trpc.academicYear.list.queryOptions({ limit: 100 }))
}

/**
 * Hook to fetch academic classes for select options list.
 */
export function useAcademicClassesForSelection(academicYearId?: string) {
  return useQuery(trpc.academicClass.list.queryOptions({ limit: 100, academicYearId }))
}

/**
 * Hook to create a new academic subject.
 */
export function useCreateSubject() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.academicSubject.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.academicSubject.pathFilter())
    },
  })
}

/**
 * Hook to update an existing academic subject.
 */
export function useUpdateSubject() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.academicSubject.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.academicSubject.pathFilter())
    },
  })
}

/**
 * Hook to delete an academic subject.
 */
export function useDeleteSubject() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.academicSubject.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.academicSubject.pathFilter())
    },
  })
}

/**
 * Hook to toggle active status of a subject.
 */
export function useToggleSubjectStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.academicSubject.toggleStatus.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.academicSubject.pathFilter())
      toast.success("Academic Subject status updated.")
    },
    onError: (err: any) => toast.error(err.message || "Failed to update status"),
  })
}

/**
 * Hook to save question type associations for a subject.
 */
export function useSaveSubjectQuestionTypes() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.academicSubject.saveQuestionTypes.mutationOptions(),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(trpc.academicSubject.pathFilter())
    },
  })
}

/**
 * Hook to save the unified subject structure (sections, sub-sections, and question types).
 */
export function useSaveSubjectStructure() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.subjectStructure.save.mutationOptions(),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(trpc.academicSubject.pathFilter())
    },
  })
}

