"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { toast } from "@workspace/ui/components/sonner"

import { Pagination } from "../components/pagination"
import { Filter } from "../components/filter"
import { TenantListStat } from "../components/tenant-list-stat"
import { TenantList } from "../components/tenant-list"
import { DeleteTenantModal } from "../components/delete-tenant-modal"
import { InviteAdminModal } from "../components/invite-admin-modal"

export const TenantsView = () => {
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()

  const search = searchParams?.get("search") || undefined
  const status = searchParams?.get("status") || undefined
  const type = searchParams?.get("type") || undefined
  const sort = searchParams?.get("sort") || undefined
  const page = Number(searchParams?.get("page") || 1)
  const limit = Number(searchParams?.get("limit") || 10)

  const { data: tenantData, isLoading } = useQuery(
    trpc.tenant.list.queryOptions({
      query: search || undefined,
      status: status || undefined,
      type: type || undefined,
      sort: sort || undefined,
      page,
      limit,
    })
  )

  const toggleStatusMutation = useMutation({
    ...trpc.tenant.toggleStatus.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.tenant.pathFilter())
      toast.success("Union Porishod status updated.")
    },
    onError: (err: any) => toast.error(err.message || "Failed to update status"),
  })

  const deleteMutation = useMutation({
    ...trpc.tenant.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.tenant.pathFilter())
      toast.success("Union Porishod deleted.")
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete"),
  })

  const onActivate = async (id: string) => {
    await toggleStatusMutation.mutateAsync({ id })
  }

  const onDeactivate = async (id: string) => {
    await toggleStatusMutation.mutateAsync({ id })
  }

  const handleDeleteTenant = (tenantId: string, tenantName: string) => {
    if (confirm(`Are you sure you want to delete "${tenantName}"?`)) {
      deleteMutation.mutate({ id: tenantId })
    }
  }

  return (
    <div className="w-full">
      {/* Header matched 1:1 with Role module */}
      <section className="mb-6 sm:mb-8 flex flex-col justify-between gap-4 sm:gap-6 md:flex-row md:items-end">
        <div>
          <h2 className="mb-1 font-headline-md text-2xl sm:text-3xl font-extrabold text-primary md:text-4xl">
            Tenants Management
          </h2>
          <p className="max-w-2xl font-body-md text-xs sm:text-sm md:text-base leading-relaxed text-on-surface-variant">
            Manage Union Porishod tenants, SaaS subscriptions, and administrative access across the platform.
          </p>
        </div>
        <Button
          asChild
          className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary-container px-6 py-2.5 sm:py-3 font-headline-md text-sm sm:text-base font-bold text-on-primary-container shadow-sm hover:shadow-md hover:shadow-primary/20 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 hover:bg-primary hover:text-white h-auto normal-case tracking-normal cursor-pointer overflow-hidden"
        >
          <Link href="/tenants/create">
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 ease-out group-hover:rotate-90 group-hover:scale-110" />
            <span className="relative z-10">Add New Tenant</span>
          </Link>
        </Button>
      </section>

      {/* Stats Section */}
      <div className="mb-6 sm:mb-8">
        <TenantListStat />
      </div>

      {/* Filters & Action Bar */}
      <Filter isLoading={isLoading} />

      {/* Data Table & Pagination matched 1:1 with Role module */}
      <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-xs">
        <TenantList
          onActive={onActivate}
          onDeactivate={onDeactivate}
          isLoading={isLoading}
          handleDelete={handleDeleteTenant}
          items={tenantData?.tenants ?? []}
        />

        <Pagination totalItem={tenantData?.totalItems ?? 0} />
      </div>

      {/* Delete Tenant Modal matched 1:1 with User module */}
      <DeleteTenantModal />

      {/* Invite Member Modal */}
      <InviteAdminModal />
    </div>
  )
}
