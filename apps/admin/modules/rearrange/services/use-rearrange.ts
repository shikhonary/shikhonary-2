import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListRearrangeInput,
  RearrangeStatsInput,
  CreateRearrangeInput,
  UpdateRearrangeInput,
} from "@workspace/api"

export function useRearrangeList(input: ListRearrangeInput) {
  return useQuery(trpc.rearrange.list.queryOptions(input))
}

export function useRearrangeStats(input?: RearrangeStatsInput) {
  return useQuery(trpc.rearrange.stats.queryOptions(input || {}))
}

export function useRearrangeById(id: string, enabled = true) {
  return useQuery({
    ...trpc.rearrange.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

export function useRearrangeBoardYears(input?: { subjectId?: string; chapterId?: string }) {
  return useQuery({
    ...trpc.rearrange.boardYears.queryOptions(input || {}),
    enabled: Boolean(input?.subjectId && input.subjectId !== "All"),
  })
}

export function useCreateRearrange() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.rearrange.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.rearrange.pathFilter())
    },
  })
}

export function useUpdateRearrange() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.rearrange.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.rearrange.pathFilter())
    },
  })
}

export function useDeleteRearrange() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.rearrange.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.rearrange.pathFilter())
    },
  })
}

export function useBulkDeleteRearrange() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.rearrange.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.rearrange.pathFilter())
    },
  })
}

export function useImportRearrange() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.rearrange.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.rearrange.pathFilter())
    },
  })
}

export function useToggleRearrangeActive() {
  const queryClient = useQueryClient()
  return useMutation({
    ...trpc.rearrange.toggleActive.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.rearrange.pathFilter())
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
