"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { AlertTriangle, Loader2 } from "lucide-react"
import { toast } from "@workspace/ui/components/sonner"
import { useDeleteSeenComprehension, useBulkDeleteSeenComprehensions } from "../services/use-seen-comprehension"
import { useDeleteSeenComprehensionModalStore } from "../store/use-delete-seen-comprehension-modal-store"

export function DeleteSeenComprehensionModal() {
  const { isOpen, comprehensionId, comprehensionTitle, selectedIds, closeModal } =
    useDeleteSeenComprehensionModalStore()

  const deleteMutation = useDeleteSeenComprehension()
  const bulkDeleteMutation = useBulkDeleteSeenComprehensions()

  const isBulk = selectedIds.length > 0
  const isPending = deleteMutation.isPending || bulkDeleteMutation.isPending

  const handleDelete = async () => {
    try {
      if (isBulk) {
        await bulkDeleteMutation.mutateAsync({ ids: selectedIds })
        toast.success(`${selectedIds.length} seen comprehensions deleted`)
      } else if (comprehensionId) {
        await deleteMutation.mutateAsync({ id: comprehensionId })
        toast.success("Seen comprehension deleted")
      }
      closeModal()
    } catch {
      toast.error("Failed to delete seen comprehension")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="rounded-2xl sm:max-w-md bg-surface border-outline-variant/60 shadow-xl">
        <DialogHeader className="gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-1">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-lg font-bold font-headline text-on-surface">
            {isBulk ? "Delete Selected Comprehensions" : "Delete Seen Comprehension"}
          </DialogTitle>
          <DialogDescription className="text-xs text-outline leading-relaxed">
            {isBulk ? (
              <>
                Are you sure you want to delete{" "}
                <span className="font-bold text-on-surface">{selectedIds.length}</span> seen
                comprehensions? All sub-questions and passage contents will be archived.
              </>
            ) : (
              <>
                Are you sure you want to delete this seen comprehension:{" "}
                <span className="font-bold text-on-surface">&ldquo;{comprehensionTitle}&rdquo;</span>?
                This action cannot be undone.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0 mt-3">
          <Button
            type="button"
            variant="outline"
            onClick={closeModal}
            disabled={isPending}
            className="rounded-xl h-10 text-xs font-bold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-xl h-10 text-xs font-bold gap-2"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Confirm Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
