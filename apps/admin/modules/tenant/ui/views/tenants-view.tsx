"use client"

import { useState } from "react"
import { Building2, Plus } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { toast } from "@workspace/ui/components/sonner"
import { useTenantSearchParams } from "../../hooks/use-tenant-search-params"
import {
  useTenantsList,
  useTenantStats,
  useDeleteTenant,
  useToggleTenantStatus,
} from "../../services/use-tenant"
import { useInvitationModalStore } from "../store/use-invitation-modal-store"
import { TenantStatsCards } from "../components/tenant-stats-cards"
import { TenantFilters } from "../components/tenant-filters"
import { TenantTable } from "../components/tenant-table"
import { InviteAdminModal } from "../components/invite-admin-modal"

export function TenantsView() {
  const [
    { query, status, type, sort, page, limit },
    setSearchParams,
  ] = useTenantSearchParams()

  const openInviteModal = useInvitationModalStore((state) => state.openModal)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const deleteMutation = useDeleteTenant()
  const toggleStatusMutation = useToggleTenantStatus()

  // Tenant stats
  const { data: statsData, isLoading: isStatsLoading } = useTenantStats({
    type: type === "ALL" ? undefined : type,
  })

  // Tenant list
  const { data: tenantData, isLoading, isError } = useTenantsList({
    page,
    limit,
    query: query || undefined,
    status: status === "ALL" ? undefined : status,
    type: type === "ALL" ? undefined : type,
    sort: sort === "ALL" ? undefined : sort,
  })

  const items = tenantData?.tenants ?? []
  const totalItems = tenantData?.totalItems ?? items.length
  const totalPages = tenantData?.totalPages ?? 1

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync({ id: deleteTarget.id })
      toast.success(`"${deleteTarget.name}" প্রতিষ্ঠানটি সফলভাবে মুছে ফেলা হয়েছে।`)
      setDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || "প্রতিষ্ঠান ডিলিট করা সম্ভব হয়নি")
    }
  }

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <PageHeader
        title="প্রতিষ্ঠান ব্যবস্থাপনা (Institutions / Tenants)"
        description="শিক্ষা প্রতিষ্ঠানসমূহ, সাবস্ক্রিপশন প্ল্যান এবং অ্যাডমিন এক্সেস পরিচালনা করুন।"
        icon={Building2}
        badge={{ label: "টেন্যান্ট মডিউল", variant: "indigo" }}
        action={{
          label: "নতুন প্রতিষ্ঠান তৈরি করুন",
          href: "/tenants/create",
          icon: Plus,
        }}
      />

      {/* KPI Stats Cards */}
      <TenantStatsCards
        totalCount={statsData?.total}
        activeCount={statsData?.active}
        suspendedCount={statsData?.suspended}
        inactiveCount={statsData?.inactive}
        isLoading={isStatsLoading}
      />

      {/* Filters Bar */}
      <TenantFilters
        searchQuery={query}
        onSearchChange={(q) => setSearchParams({ query: q, page: 1 })}
        selectedStatus={status}
        onStatusChange={(s) => setSearchParams({ status: s, page: 1 })}
        selectedType={type}
        onTypeChange={(t) => setSearchParams({ type: t, page: 1 })}
        selectedSort={sort}
        onSortChange={(s) => setSearchParams({ sort: s, page: 1 })}
      />

      {/* Data Table & Mobile Cards */}
      <TenantTable
        items={items as any}
        isLoading={isLoading}
        isError={isError}
        onDelete={(id, name) => setDeleteTarget({ id, name })}
        onToggleActive={(id) => toggleStatusMutation.mutate({ id })}
        onInvite={(id, name) => openInviteModal(id, name)}
        currentPage={page}
        itemsPerPage={limit}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={(p) => setSearchParams({ page: p })}
        onLimitChange={(newLimit) => setSearchParams({ limit: newLimit, page: 1 })}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="প্রতিষ্ঠানটি মুছে ফেলতে চান?"
        itemName={deleteTarget?.name}
        warningText="এই প্রতিষ্ঠানটি মুছে ফেললে এর সমস্ত ডেটাবেস রেকর্ড, সদস্য এবং সাবস্ক্রিপশন তথ্য স্থায়ীভাবে মুছে যাবে।"
        isLoading={deleteMutation.isPending}
      />

      {/* Invite Member Modal */}
      <InviteAdminModal />
    </div>
  )
}
