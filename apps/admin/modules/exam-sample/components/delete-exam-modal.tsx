"use client"

import { toast } from "@workspace/ui/components/sonner"
import { useDeleteExam } from "../services/use-exam"
import { useDeleteExamModalStore } from "../store/use-delete-exam-modal-store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { AlertTriangle, Info, Loader2, Trash2 } from "lucide-react"

export function DeleteExamModal() {
  const { isOpen, examId, examTitle, closeModal } = useDeleteExamModalStore()

  const deleteMutation = useDeleteExam()

  const handleConfirmDelete = async () => {
    if (!examId) return

    try {
      await deleteMutation.mutateAsync({ id: examId })
      toast.success(`Exam "${examTitle || "Exam"}" deleted successfully.`)
      closeModal()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete exam")
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
              Delete Exam?
            </DialogTitle>
            <p className="text-xs text-outline mt-0.5">
              This action requires confirmation
            </p>
          </div>
        </div>

        {/* Textual Description */}
        <DialogHeader className="pt-1">
          <DialogDescription className="font-body-md text-sm leading-relaxed text-on-surface-variant">
            Are you sure you want to delete exam{" "}
            <span className="font-bold text-on-surface">
              &quot;{examTitle || "selected exam"}&quot;
            </span>
            ? All exam configurations, student attempt logs, and grade history will be permanently removed.
          </DialogDescription>
        </DialogHeader>

        {/* Informational Alert Box */}
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-700">
          <Info className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <p className="leading-snug">
            This action cannot be undone. Student portal links and grade reports will be removed.
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
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Delete Exam</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
