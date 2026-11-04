import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type { ListAcademicClassesInput } from "@workspace/api"
import { toast } from "@workspace/ui/components/sonner"

/**
 * Hook to list academic classes.
 */
export function useAcademicClassesList(
  input: ListAcademicClassesInput = { limit: 100 }
) {
  return useQuery(trpc.academicClass.list.queryOptions(input))
}

/**
 * Hook to fetch academic class stats.
 */
export function useAcademicClassStats(input?: { academicYearId?: string }) {
  return useQuery(
    trpc.academicClass.stats.queryOptions({
      academicYearId: input?.academicYearId === "All" ? undefined : input?.academicYearId,
    })
  )
}

/**
 * Hook to fetch academic years for filter dropdown.
 */
export function useAcademicYearsForSelection() {
  return useQuery(trpc.academicYear.list.queryOptions({ limit: 100 }))
}

/**
 * Hook to fetch a single academic class by ID.
 */
export function useAcademicClassById(id: string, enabled = true) {
  return useQuery({
    ...trpc.academicClass.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to create a new academic class.
 */
export function useCreateAcademicClass() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.academicClass.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.academicClass.pathFilter())
    },
  })
}

/**
 * Hook to update an existing academic class.
 */
export function useUpdateAcademicClass() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.academicClass.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.academicClass.pathFilter())
    },
  })
}

/**
 * Hook to delete an academic class.
 */
export function useDeleteAcademicClass() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.academicClass.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.academicClass.pathFilter())
    },
  })
}

/**
 * Hook to toggle active status of a class.
 */
export function useToggleAcademicClassStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.academicClass.toggleStatus.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.academicClass.pathFilter())
      toast.success("শ্রেণির সক্রিয় অবস্থা সফলভাবে পরিবর্তন করা হয়েছে।")
    },
    onError: (err: any) => toast.error(err.message || "অবস্থা পরিবর্তন ব্যর্থ হয়েছে"),
  })
}
