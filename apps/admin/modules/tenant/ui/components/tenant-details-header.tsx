"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Edit, Mail, ToggleLeft, ToggleRight, Trash2 } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { toast } from "@workspace/ui/components/sonner"
import { useDeleteTenantModalStore } from "../store/use-delete-tenant-modal-store"
import { useInvitationModalStore } from "../store/use-invitation-modal-store"

interface TenantDetailsHeaderProps {
  isActive: boolean
  isSuspended: boolean
  tenantId: string
  tenantName: string
}

export function TenantDetailsHeader({
  isActive,
  isSuspended,
  tenantId,
  tenantName,
}: TenantDetailsHeaderProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const openDeleteModal = useDeleteTenantModalStore((state) => state.openModal)
  const openInvitationModal = useInvitationModalStore((state) => state.openModal)

  const toggleStatusMutation = useMutation({
    ...trpc.tenant.toggleStatus.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.tenant.pathFilter())
      toast.success(isActive ? `Deactivated "${tenantName}"` : `Activated "${tenantName}"`)
    },
    onError: (err: any) => toast.error(err.message || "Failed to update tenant status"),
  })

  const handleToggle = () => {
    toggleStatusMutation.mutate({ id: tenantId })
  }

  const handleDelete = () => {
    openDeleteModal(tenantId, tenantName)
  }

  const handleInvite = () => {
    openInvitationModal(tenantId, tenantName)
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/tenants")}
        className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all -ml-2"
        title="Back to Tenants"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Back to Tenants</span>
      </Button>

      <div className="flex items-center gap-2">
        {/* Edit Tenant Action */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/tenants/${tenantId}/edit`)}
          className="rounded-xl font-bold border-outline-variant hover:bg-surface-container-high cursor-pointer size-9 p-0 sm:size-auto sm:px-3 sm:py-1.5 sm:h-9 flex items-center justify-center gap-2"
          title="Edit Tenant"
        >
          <Edit className="h-4 w-4 text-primary" />
          <span className="hidden sm:inline text-xs">Edit Tenant</span>
        </Button>

        {/* Invite Member Action */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleInvite}
          className="rounded-xl font-bold border-outline-variant hover:bg-surface-container-high cursor-pointer size-9 p-0 sm:size-auto sm:px-3 sm:py-1.5 sm:h-9 flex items-center justify-center gap-2"
          title="Invite Member"
        >
          <Mail className="h-4 w-4 text-primary" />
          <span className="hidden sm:inline text-xs">Invite Member</span>
        </Button>

        {/* Activate/Deactivate Action */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggle}
          disabled={toggleStatusMutation.isPending}
          className={`rounded-xl border font-bold transition-all cursor-pointer size-9 p-0 sm:size-auto sm:px-3 sm:py-1.5 sm:h-9 flex items-center justify-center gap-2 ${
            isActive
              ? "border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
              : "border-green-500/30 text-green-600 hover:bg-green-500/10"
          }`}
          title={isActive ? "Deactivate Tenant" : "Activate Tenant"}
        >
          {isActive ? (
            <>
              <ToggleLeft className="h-4 w-4 text-amber-500" />
              <span className="hidden sm:inline text-xs">Deactivate Tenant</span>
            </>
          ) : (
            <>
              <ToggleRight className="h-4 w-4 text-emerald-500" />
              <span className="hidden sm:inline text-xs">Activate Tenant</span>
            </>
          )}
        </Button>

        {/* Delete Action */}
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          className="rounded-xl font-bold transition-all cursor-pointer size-9 p-0 sm:size-auto sm:px-3 sm:py-1.5 sm:h-9 flex items-center justify-center gap-2"
          title="Delete Tenant"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">Delete Tenant</span>
        </Button>
      </div>
    </div>
  )
}
