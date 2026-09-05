"use client"

import { toast } from "@workspace/ui/components/sonner"
import { useDeleteThoughtExpansion, useBulkDeleteThoughtExpansions } from "../services/use-thought-expansion"
import { useDeleteThoughtExpansionModalStore } from "../store/use-delete-thought-expansion-modal-store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { AlertTriangle, Info, Loader2, Trash2 } from "lucide-react"

interface DeleteThoughtExpansionModalProps {
  onSuccess?: () => void
}

export function DeleteThoughtExpansionModal({ onSuccess }: DeleteThoughtExpansionModalProps) {
  const { isOpen, thoughtExpansionId, thoughtExpansionTitle, selectedIds, closeModal } =
    useDeleteThoughtExpansionModalStore()

  const deleteMutation = useDeleteThoughtExpansion()
  const bulkDeleteMutation = useBulkDeleteThoughtExpansions()

  const isBulk = selectedIds.length > 0
  const isDeleting = deleteMutation.isPending || bulkDeleteMutation.isPending

  const handleConfirmDelete = async () => {
    try {
      if (isBulk) {
        const res = await bulkDeleteMutation.mutateAsync({ ids: selectedIds })
        toast.success(`Successfully deleted ${res.deletedCount} thought expansions.`)
      } else if (thoughtExpansionId) {
        await deleteMutation.mutateAsync({ id: thoughtExpansionId })
        toast.success("Thought Expansion deleted successfully.")
      }
      closeModal()
      onSuccess?.()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete Thought Expansion")
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
              {isBulk ? `Delete ${selectedIds.length} Thought Expansions?` : "Delete Thought Expansion?"}
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
              selected thought expansions from the question bank.
            </p>
          ) : (
            <>
              <p className="font-body-md text-xs font-semibold uppercase tracking-wider text-outline">
                Selected Thought Expansion
              </p>
              <p className="font-body-md text-sm font-semibold text-on-surface line-clamp-2">
                &ldquo;{thoughtExpansionTitle || "Untitled Thought Expansion"}&rdquo;
              </p>
              {thoughtExpansionId && (
                <p className="font-mono text-[11px] text-outline">
                  ID: {thoughtExpansionId}
                </p>
              )}
            </>
          )}

          <div className="flex items-center gap-2 pt-2 text-[11px] text-amber-700 font-medium">
            <Info className="size-3.5 shrink-0" />
            <span>
              If this thought expansion is attached to active exams or papers, dependent associations may be affected.
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
                <span>{isBulk ? `Delete ${selectedIds.length} Thought Expansions` : "Delete Thought Expansion"}</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
