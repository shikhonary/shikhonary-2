"use client"

import { toast } from "@workspace/ui/components/sonner"
import { useDuplicateQuestionPaper } from "../services/use-question-paper"
import { useDuplicateQuestionPaperModalStore } from "../store/use-duplicate-question-paper-modal-store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Copy, Loader2, Info } from "lucide-react"

export function DuplicateQuestionPaperModal() {
  const { isOpen, paperId, paperTitle, closeModal } =
    useDuplicateQuestionPaperModalStore()

  const duplicateMutation = useDuplicateQuestionPaper()

  const handleConfirmDuplicate = async () => {
    if (!paperId) return

    try {
      await duplicateMutation.mutateAsync({ id: paperId })
      toast.success(
        `প্রশ্নপত্র "${paperTitle || "Question Paper"}" সফলভাবে ডুপ্লিকেট করা হয়েছে।`
      )
      closeModal()
    } catch (err: any) {
      toast.error(err.message || "ডুপ্লিকেট করতে ব্যর্থ হয়েছে")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent
        showCloseButton={false}
        style={{ minWidth: "320px", maxWidth: "480px", width: "calc(100vw - 2rem)" }}
        className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-white p-5 sm:p-6 shadow-xl text-left gap-4 font-display"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Copy className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold tracking-tight text-on-surface">
              প্রশ্নপত্র ডুপ্লিকেট করবেন?
            </DialogTitle>
            <p className="text-xs text-outline mt-0.5">
              এই কার্যক্রমে নিশ্চিতকরণ প্রয়োজন
            </p>
          </div>
        </div>

        <DialogHeader className="pt-1 font-body">
          <DialogDescription className="text-sm leading-relaxed text-on-surface-variant">
            আপনি কি নিশ্চিতভাবে{" "}
            <span className="font-bold text-on-surface">
              &quot;{paperTitle || "নির্বাচিত প্রশ্নপত্র"}&quot;
            </span>{" "}
            ডুপ্লিকেট করতে চান? এর ফলে হুবহু একই পরীক্ষা সেটিংস, সেকশন এবং প্রশ্ন নিয়ে একটি খসড়া (Copy) কপি তৈরি হবে।
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-primary font-body">
          <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
          <p className="leading-snug">
            নতুন কপিটি খসড়া (Draft) হিসেবে থাকবে, আপনি এটি পরে যেকোনো সময় পরিবর্তন করতে পারবেন।
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={duplicateMutation.isPending}
            onClick={closeModal}
            className="w-full sm:w-auto rounded-lg border border-outline-variant px-5 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer h-10"
          >
            বাতিল করুন
          </Button>
          <Button
            type="button"
            disabled={duplicateMutation.isPending}
            onClick={handleConfirmDuplicate}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 cursor-pointer h-10 disabled:opacity-50 font-bold"
          >
            {duplicateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>ডুপ্লিকেট হচ্ছে...</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>নিশ্চিত ডুপ্লিকেট</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
