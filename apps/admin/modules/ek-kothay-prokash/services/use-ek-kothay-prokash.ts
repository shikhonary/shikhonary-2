import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type {
  ListEkKothayProkashInput,
  EkKothayProkashStatsInput,
} from "@workspace/api"

export function useEkKothayProkashList(input: ListEkKothayProkashInput = { limit: 20 }) {
  return useQuery(trpc.ekKothayProkash.list.queryOptions(input))
}

export function useEkKothayProkashStats(input?: EkKothayProkashStatsInput) {
  return useSuspenseQuery(trpc.ekKothayProkash.stats.queryOptions(input))
}

export function useEkKothayProkashById(id: string, enabled = true) {
  return useQuery({
    ...trpc.ekKothayProkash.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

export function useCreateEkKothayProkash() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.ekKothayProkash.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.ekKothayProkash.pathFilter())
    },
  })
}

export function useUpdateEkKothayProkash() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.ekKothayProkash.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.ekKothayProkash.pathFilter())
    },
  })
}

export function useDeleteEkKothayProkash() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.ekKothayProkash.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.ekKothayProkash.pathFilter())
    },
  })
}

export function useBulkDeleteEkKothayProkash() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.ekKothayProkash.bulkDelete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.ekKothayProkash.pathFilter())
    },
  })
}

export function useImportEkKothayProkash() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.ekKothayProkash.import.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.ekKothayProkash.pathFilter())
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
