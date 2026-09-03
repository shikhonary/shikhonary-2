"use client"

import { toast } from "@workspace/ui/components/sonner"
import { useDeleteEssence, useBulkDeleteEssences } from "../services/use-essence"
import { useDeleteEssenceModalStore } from "../store/use-delete-essence-modal-store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { AlertTriangle, Info, Loader2, Trash2 } from "lucide-react"

interface DeleteEssenceModalProps {
  onSuccess?: () => void
}

export function DeleteEssenceModal({ onSuccess }: DeleteEssenceModalProps) {
  const { isOpen, essenceId, essenceTitle, selectedIds, closeModal } =
    useDeleteEssenceModalStore()

  const deleteMutation = useDeleteEssence()
  const bulkDeleteMutation = useBulkDeleteEssences()

  const isBulk = selectedIds.length > 0
  const isDeleting = deleteMutation.isPending || bulkDeleteMutation.isPending

  const handleConfirmDelete = async () => {
    try {
      if (isBulk) {
        const res = await bulkDeleteMutation.mutateAsync({ ids: selectedIds })
        toast.success(`Successfully deleted ${res.deletedCount} essences.`)
      } else if (essenceId) {
        await deleteMutation.mutateAsync({ id: essenceId })
        toast.success("Essence deleted successfully.")
      }
      closeModal()
      onSuccess?.()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete Essence")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent
        showCloseButton={false}
        className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-white p-5 sm:p-6 shadow-xl text-left gap-4"
      >
        {/* Warning Header Icon */}
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-red-500/10 text-red-600 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="font-headline-md text-lg font-bold tracking-tight text-on-surface normal-case">
              {isBulk ? `Delete ${selectedIds.length} Essences?` : "Delete Essence?"}
            </DialogTitle>
            <DialogDescription className="font-body-md text-xs text-on-surface-variant mt-0.5">
              This operation is permanent and cannot be reversed.
            </DialogDescription>
          </div>
        </div>

        {/* Content Details */}
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 space-y-2">
          {isBulk ? (
            <p className="font-body-md text-sm text-on-surface leading-relaxed">
              You are about to permanently delete{" "}
              <span className="font-bold text-red-600 font-mono">
                {selectedIds.length}
              </span>{" "}
              selected essences from the question bank.
            </p>
          ) : (
            <>
              <p className="font-body-md text-xs font-semibold uppercase tracking-wider text-outline">
                Selected Essence
              </p>
              <p className="font-body-md text-sm font-semibold text-on-surface line-clamp-2">
                &ldquo;{essenceTitle || "Untitled Essence"}&rdquo;
              </p>
              {essenceId && (
                <p className="font-mono text-[11px] text-outline">
                  ID: {essenceId}
                </p>
              )}
            </>
          )}

          <div className="flex items-center gap-2 pt-2 text-[11px] text-amber-700 font-medium">
            <Info className="size-3.5 shrink-0" />
            <span>
              If this essence is attached to active exams or papers, dependent associations may be affected.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={closeModal}
            className="rounded-xl border-outline-variant font-bold text-on-surface hover:bg-surface-container-high px-4 h-10 cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={isDeleting}
            onClick={handleConfirmDelete}
            className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold px-5 h-10 gap-2 shadow-xs cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="size-4" />
                <span>{isBulk ? `Delete ${selectedIds.length} Essences` : "Delete Essence"}</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
