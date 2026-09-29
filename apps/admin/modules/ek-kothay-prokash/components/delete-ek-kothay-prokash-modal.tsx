"use client"

import { toast } from "@workspace/ui/components/sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { useDeleteEkKothayProkashModalStore } from "../store/use-delete-ek-kothay-prokash-modal-store"
import { useDeleteEkKothayProkash, useBulkDeleteEkKothayProkash } from "../services/use-ek-kothay-prokash"

interface DeleteEkKothayProkashModalProps {
  onSuccess?: () => void
}

export function DeleteEkKothayProkashModal({ onSuccess }: DeleteEkKothayProkashModalProps) {
  const { isOpen, ekKothayProkashId, phraseText, selectedIds, closeModal } =
    useDeleteEkKothayProkashModalStore()

  const deleteSingle = useDeleteEkKothayProkash()
  const deleteBulk = useBulkDeleteEkKothayProkash()

  const isBulk = selectedIds.length > 0
  const isPending = deleteSingle.isPending || deleteBulk.isPending

  const handleDelete = () => {
    if (isBulk) {
      deleteBulk.mutate(
        { ids: selectedIds },
        {
          onSuccess: (data) => {
            toast.success(`Successfully deleted ${data.deletedCount} Ek Kothay Prokash items`)
            closeModal()
            onSuccess?.()
          },
          onError: (err) => {
            toast.error(err.message || "Failed to delete selected Ek Kothay Prokash items")
          },
        }
      )
    } else if (ekKothayProkashId) {
      deleteSingle.mutate(
        { id: ekKothayProkashId },
        {
          onSuccess: () => {
            toast.success("Ek Kothay Prokash item deleted successfully")
            closeModal()
            onSuccess?.()
          },
          onError: (err) => {
            toast.error(err.message || "Failed to delete Ek Kothay Prokash item")
          },
        }
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isBulk ? "Delete Selected Ek Kothay Prokash Items" : "Delete Ek Kothay Prokash Item"}
          </DialogTitle>
          <DialogDescription>
            {isBulk
              ? `Are you sure you want to delete ${selectedIds.length} selected Ek Kothay Prokash entries? This action cannot be undone.`
              : `Are you sure you want to delete "${phraseText ?? "this Ek Kothay Prokash entry"}"? This action cannot be undone.`}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={closeModal} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
