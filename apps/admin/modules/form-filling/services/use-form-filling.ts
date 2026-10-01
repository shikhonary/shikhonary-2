import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListFormFillupInput,
  FormFillupStatsInput,
} from "@workspace/api"

export function useFormFillingList(input: ListFormFillupInput = { limit: 20 }) {
  return useQuery(trpc.formFilling.list.queryOptions(input))
}

export function useFormFillingStats(input?: FormFillupStatsInput) {
  return useSuspenseQuery(trpc.formFilling.stats.queryOptions(input))
}

export function useFormFillingById(id: string, enabled = true) {
  return useQuery({
    ...trpc.formFilling.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

export function useCreateFormFilling() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.formFilling.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.formFilling.pathFilter())
    },
  })
}

export function useUpdateFormFilling() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.formFilling.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.formFilling.pathFilter())
    },
  })
}

export function useDeleteFormFilling() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.formFilling.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.formFilling.pathFilter())
    },
  })
}

export function useBulkDeleteFormFilling() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.formFilling.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.formFilling.pathFilter())
    },
  })
}

export function useImportFormFilling() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.formFilling.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.formFilling.pathFilter())
    },
  })
}

export function useAcademicClassesForSelection() {
  return useQuery({
    ...trpc.academicClass.list.queryOptions({ limit: 100 }),
    select: (data) => data.academicClasses ?? [],
  })
}

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
