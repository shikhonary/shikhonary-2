import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import type { ListAcademicYearsInput, YearStatsInput } from "@workspace/api"
import { toast } from "@workspace/ui/components/sonner"

/**
 * Hook to list academic years.
 */
export function useAcademicYearsList(
  input: ListAcademicYearsInput = { limit: 100 }
) {
  return useQuery(trpc.academicYear.list.queryOptions(input))
}

/**
 * Hook to fetch academic year statistics.
 */
export function useAcademicYearStats(input?: YearStatsInput) {
  return useQuery(trpc.academicYear.stats.queryOptions(input))
}

/**
 * Hook to fetch a single academic year by ID.
 */
export function useAcademicYearById(id: string, enabled = true) {
  return useQuery({
    ...trpc.academicYear.byId.queryOptions({ id }),
    enabled: Boolean(id) && enabled,
  })
}

/**
 * Hook to create a new academic year.
 */
export function useCreateAcademicYear() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.academicYear.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.academicYear.pathFilter())
    },
  })
}

/**
 * Hook to update an existing academic year.
 */
export function useUpdateAcademicYear() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.academicYear.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.academicYear.pathFilter())
    },
  })
}

/**
 * Hook to delete an academic year.
 */
export function useDeleteAcademicYear() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.academicYear.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.academicYear.pathFilter())
    },
  })
}

/**
 * Hook to toggle active status of a year.
 */
export function useToggleAcademicYearStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    ...trpc.academicYear.toggleStatus.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.academicYear.pathFilter())
      toast.success("শিক্ষাবর্ষের স্ট্যাটাস সফলভাবে পরিবর্তন করা হয়েছে।")
    },
    onError: (err: any) => toast.error(err.message || "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে"),
  })
}
