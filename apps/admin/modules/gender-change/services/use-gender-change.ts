import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListGenderChangeInput,
  GenderChangeStatsInput,
} from "@workspace/api"

export function useGenderChangeList(input: ListGenderChangeInput = { limit: 20 }) {
  return useQuery(trpc.genderChange.list.queryOptions(input))
}

export function useGenderChangeStats(input?: GenderChangeStatsInput) {
  return useSuspenseQuery(trpc.genderChange.stats.queryOptions(input))
}

export function useGenderChangeById(id: string, enabled = true) {
  return useQuery({
    ...trpc.genderChange.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

export function useCreateGenderChange() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.genderChange.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.genderChange.pathFilter())
    },
  })
}

export function useUpdateGenderChange() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.genderChange.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.genderChange.pathFilter())
    },
  })
}

export function useDeleteGenderChange() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.genderChange.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.genderChange.pathFilter())
    },
  })
}

export function useBulkDeleteGenderChange() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.genderChange.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.genderChange.pathFilter())
    },
  })
}

export function useImportGenderChange() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.genderChange.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.genderChange.pathFilter())
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
