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
import { useDeleteJuktobornoModalStore } from "../store/use-delete-juktoborno-modal-store"
import { useDeleteJuktoborno, useBulkDeleteJuktoborno } from "../services/use-juktoborno"

interface DeleteJuktobornoModalProps {
  onSuccess?: () => void
}

export function DeleteJuktobornoModal({ onSuccess }: DeleteJuktobornoModalProps) {
  const { isOpen, juktobornoId, juktobornoText, selectedIds, closeModal } =
    useDeleteJuktobornoModalStore()

  const deleteSingle = useDeleteJuktoborno()
  const deleteBulk = useBulkDeleteJuktoborno()

  const isBulk = selectedIds.length > 0
  const isPending = deleteSingle.isPending || deleteBulk.isPending

  const handleDelete = () => {
    if (isBulk) {
      deleteBulk.mutate(
        { ids: selectedIds },
        {
          onSuccess: (data) => {
            toast.success(`Successfully deleted ${data.deletedCount} Juktoborno items`)
            closeModal()
            onSuccess?.()
          },
          onError: (err) => {
            toast.error(err.message || "Failed to delete selected Juktoborno items")
          },
        }
      )
    } else if (juktobornoId) {
      deleteSingle.mutate(
        { id: juktobornoId },
        {
          onSuccess: () => {
            toast.success("Juktoborno item deleted successfully")
            closeModal()
            onSuccess?.()
          },
          onError: (err) => {
            toast.error(err.message || "Failed to delete Juktoborno item")
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
            {isBulk ? "Delete Selected Juktoborno Items" : "Delete Juktoborno Item"}
          </DialogTitle>
          <DialogDescription>
            {isBulk
              ? `Are you sure you want to delete ${selectedIds.length} selected Juktoborno entries? This action cannot be undone.`
              : `Are you sure you want to delete "${juktobornoText ?? "this Juktoborno entry"}"? This action cannot be undone.`}
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
