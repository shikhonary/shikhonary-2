"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Ban, PlayCircle } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { toast } from "@workspace/ui/components/sonner"

interface TenantDetailsHeaderProps {
  isSuspended: boolean
  tenantId: string
  tenantName: string
}

export function TenantDetailsHeader({
  isSuspended,
  tenantId,
  tenantName,
}: TenantDetailsHeaderProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const toggleStatusMutation = useMutation({
    ...trpc.tenant.toggleStatus.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.tenant.pathFilter())
      toast.success(isSuspended ? `Reactivated "${tenantName}"` : `Suspended "${tenantName}"`)
    },
    onError: (err: any) => toast.error(err.message || "Failed to update tenant status"),
  })

  const handleToggle = () => {
    toggleStatusMutation.mutate({ id: tenantId })
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all -ml-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tenants
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        disabled={toggleStatusMutation.isPending}
        className={`gap-2 rounded-xl border font-bold text-xs transition-all ${
          isSuspended
            ? "border-green-500/30 text-green-600 hover:bg-green-500/10"
            : "border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
        }`}
      >
        {isSuspended ? (
          <>
            <PlayCircle className="h-4 w-4" />
            Unsuspend Tenant
          </>
        ) : (
          <>
            <Ban className="h-4 w-4" />
            Suspend Tenant
          </>
        )}
      </Button>
    </div>
  )
}
