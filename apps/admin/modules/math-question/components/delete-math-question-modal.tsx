"use client"

import { useState } from "react"
import { toast } from "@workspace/ui/components/sonner"
import { useDeleteMathQuestionModalStore } from "../store/use-delete-math-question-modal-store"
import { useDeleteMathQuestion, useBulkDeleteMathQuestions } from "../services/use-math-question"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { AlertTriangle, Info, Loader2, Trash2 } from "lucide-react"

export function DeleteMathQuestionModal() {
  const { isOpen, mathQuestionId, questionText, selectedIds, closeModal } =
    useDeleteMathQuestionModalStore()

  const deleteMutation = useDeleteMathQuestion()
  const bulkDeleteMutation = useBulkDeleteMathQuestions()
  const [isDeleting, setIsDeleting] = useState(false)

  const isBulkOpen = isOpen && selectedIds.length > 0

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      if (isBulkOpen) {
        const count = selectedIds.length
        await bulkDeleteMutation.mutateAsync({ ids: selectedIds })
        toast.success(`Successfully deleted ${count} Math Questions.`)
      } else if (mathQuestionId) {
        await deleteMutation.mutateAsync({ id: mathQuestionId })
        toast.success("Math Question deleted successfully.")
      }
      closeModal()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete Math Question")
    } finally {
      setIsDeleting(false)
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
              {isBulkOpen ? `Delete ${selectedIds.length} Math Questions?` : "Delete Math Question?"}
            </DialogTitle>
            <p className="text-xs text-outline mt-0.5">
              This action requires confirmation
            </p>
          </div>
        </div>

        {/* Textual Description */}
        <DialogHeader className="pt-1">
          <DialogDescription className="font-body-md text-sm leading-relaxed text-on-surface-variant">
            {isBulkOpen ? (
              <>
                You are about to delete <span className="font-bold text-on-surface">{selectedIds.length}</span> Math Questions. This action cannot be undone.
              </>
            ) : (
              <>
                Are you sure you want to delete this Math Question?
                {questionText && (
                  <span className="block mt-2 italic text-xs text-outline line-clamp-2 border-l-2 border-outline/30 pl-2">
                    &ldquo;{questionText}&rdquo;
                  </span>
                )}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Informational Callout */}
        <div className="flex items-start gap-2.5 rounded-xl bg-surface-container-low p-3 text-xs text-on-surface-variant">
          <Info className="h-4 w-4 text-outline shrink-0 mt-0.5" />
          <p>
            Deleting questions from the question bank will remove them from subsequent paper generator pools. Existing published papers containing snapshots will remain unaffected.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={closeModal}
            disabled={isDeleting}
            className="rounded-xl border border-outline-variant/60 font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="gap-2 rounded-xl bg-red-600 font-semibold text-white hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Confirm Delete
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
