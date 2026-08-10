"use client"

import { toast } from "@workspace/ui/components/sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { useDeleteTenantModalStore } from "../store/use-delete-tenant-modal-store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { AlertTriangle, Info, Loader2, Trash2 } from "lucide-react"

export function DeleteTenantModal() {
  const queryClient = useQueryClient()
  const { isOpen, tenantId, tenantName, closeModal } = useDeleteTenantModalStore()

  const deleteMutation = useMutation({
    ...trpc.tenant.delete.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.tenant.pathFilter())
      toast.success(`Union Porishod "${tenantName || "Tenant"}" deleted successfully.`)
      closeModal()
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete Union Porishod")
    },
  })

  const handleConfirmDelete = async () => {
    if (!tenantId) return
    deleteMutation.mutate({ id: tenantId })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent
        showCloseButton={false}
        style={{ minWidth: "320px", maxWidth: "480px", width: "calc(100vw - 2rem)" }}
        className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-white p-5 sm:p-6 shadow-xl text-left gap-4"
      >
        {/* Warning Header Icon */}
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-red-500/10 text-red-600 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="font-headline-md text-lg font-bold tracking-tight text-on-surface normal-case">
              Delete Union Porishod?
            </DialogTitle>
            <p className="text-xs text-outline mt-0.5">
              This action requires confirmation
            </p>
          </div>
        </div>

        {/* Textual Description */}
        <DialogHeader className="pt-1">
          <DialogDescription className="font-body-md text-sm leading-relaxed text-on-surface-variant">
            Are you sure you want to delete{" "}
            <span className="font-bold text-on-surface">
              &quot;{tenantName || "selected tenant"}&quot;
            </span>
            ? All associated database records, member assignments, and subscription history will be permanently purged.
          </DialogDescription>
        </DialogHeader>

        {/* Informational Alert Box */}
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-700">
          <Info className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <p className="leading-snug">
            This action cannot be undone. The portal database and access credentials will be dropped permanently.
          </p>
        </div>

        {/* Actions Footer */}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={deleteMutation.isPending}
            onClick={closeModal}
            className="w-full sm:w-auto rounded-lg border border-outline-variant px-5 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer h-10 normal-case tracking-normal"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteMutation.isPending}
            onClick={handleConfirmDelete}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 cursor-pointer h-10 normal-case tracking-normal disabled:opacity-50"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Purging Tenant...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Delete Tenant</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
