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
import { useDeleteDanBamMilkoronModalStore } from "../store/use-delete-dan-bam-milkoron-modal-store"
import { useDeleteDanBamMilkoron, useBulkDeleteDanBamMilkoron } from "../services/use-dan-bam-milkoron"

interface DeleteDanBamMilkoronModalProps {
  onSuccess?: () => void
}

export function DeleteDanBamMilkoronModal({ onSuccess }: DeleteDanBamMilkoronModalProps) {
  const { isOpen, danBamMilkoronId, itemText, selectedIds, closeModal } =
    useDeleteDanBamMilkoronModalStore()

  const deleteSingle = useDeleteDanBamMilkoron()
  const deleteBulk = useBulkDeleteDanBamMilkoron()

  const isBulk = selectedIds.length > 0
  const isPending = deleteSingle.isPending || deleteBulk.isPending

  const handleDelete = () => {
    if (isBulk) {
      deleteBulk.mutate(
        { ids: selectedIds },
        {
          onSuccess: (data) => {
            toast.success(`Successfully deleted ${data.deletedCount} items`)
            closeModal()
            onSuccess?.()
          },
          onError: (err) => {
            toast.error(err.message || "Failed to delete selected items")
          },
        }
      )
    } else if (danBamMilkoronId) {
      deleteSingle.mutate(
        { id: danBamMilkoronId },
        {
          onSuccess: () => {
            toast.success("ডান-বাম মিলকরণ সফলভাবে মুছে ফেলা হয়েছে")
            closeModal()
            onSuccess?.()
          },
          onError: (err) => {
            toast.error(err.message || "মুছে ফেলতে ব্যর্থ হয়েছে")
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
            {isBulk ? "Delete Selected Items" : "Delete ডান-বাম মিলকরণ"}
          </DialogTitle>
          <DialogDescription>
            {isBulk
              ? `Are you sure you want to delete ${selectedIds.length} selected items? This action cannot be undone.`
              : `Are you sure you want to delete "${itemText ?? "this item"}"? This action cannot be undone.`}
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
