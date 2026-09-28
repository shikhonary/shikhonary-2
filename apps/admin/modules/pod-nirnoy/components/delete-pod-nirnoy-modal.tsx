"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { toast } from "@workspace/ui/components/sonner"
import { useDeletePodNirnoyModalStore } from "../store/use-delete-pod-nirnoy-modal-store"
import { useDeletePodNirnoy, useBulkDeletePodNirnoys } from "../services/use-pod-nirnoy"
import { Loader2 } from "lucide-react"

export function DeletePodNirnoyModal() {
  const {
    isOpen,
    isBulkOpen,
    deleteId,
    titleSnippet,
    bulkIds,
    closeModal,
    closeBulkModal,
  } = useDeletePodNirnoyModalStore()

  const deleteMutation = useDeletePodNirnoy()
  const bulkDeleteMutation = useBulkDeletePodNirnoys()

  const handleDeleteSingle = async () => {
    if (!deleteId) return

    try {
      await deleteMutation.mutateAsync({ id: deleteId })
      toast.success("Pod Nirnoy deleted successfully.")
      closeModal()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete Pod Nirnoy.")
    }
  }

  const handleDeleteBulk = async () => {
    if (bulkIds.length === 0) return

    try {
      await bulkDeleteMutation.mutateAsync({ ids: bulkIds })
      toast.success(`${bulkIds.length} Pod Nirnoy items deleted successfully.`)
      closeBulkModal()
    } catch (err: any) {
      toast.error(err.message || "Failed to bulk delete Pod Nirnoy items.")
    }
  }

  return (
    <>
      {/* Single Delete Confirmation Dialog */}
      <AlertDialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
        <AlertDialogContent className="rounded-2xl bg-white p-6 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline-sm text-xl font-bold text-on-surface">
              Delete Pod Nirnoy?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body-md text-sm text-on-surface-variant leading-relaxed">
              Are you sure you want to delete this Pod Nirnoy item
              {titleSnippet ? ` "${titleSnippet}"` : ""}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel
              disabled={deleteMutation.isPending}
              className="rounded-xl border border-outline-variant font-bold text-on-surface hover:bg-surface-container-high px-4 h-10"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteSingle()
              }}
              disabled={deleteMutation.isPending}
              className="rounded-xl bg-error hover:bg-error/90 text-white font-bold px-4 h-10 gap-2 shadow-xs"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete</span>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={isBulkOpen} onOpenChange={(open) => !open && closeBulkModal()}>
        <AlertDialogContent className="rounded-2xl bg-white p-6 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline-sm text-xl font-bold text-on-surface">
              Delete {bulkIds.length} Pod Nirnoy Items?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body-md text-sm text-on-surface-variant leading-relaxed">
              Are you sure you want to delete all {bulkIds.length} selected Pod Nirnoy items? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel
              disabled={bulkDeleteMutation.isPending}
              className="rounded-xl border border-outline-variant font-bold text-on-surface hover:bg-surface-container-high px-4 h-10"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteBulk()
              }}
              disabled={bulkDeleteMutation.isPending}
              className="rounded-xl bg-error hover:bg-error/90 text-white font-bold px-4 h-10 gap-2 shadow-xs"
            >
              {bulkDeleteMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete All</span>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
