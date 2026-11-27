"use client"

import React from "react"
import { toast } from "@workspace/ui/components/sonner"
import { useUpdateQuestionPaper } from "../services/use-question-paper"
import { usePublishQuestionPaperModalStore } from "../store/use-publish-question-paper-modal-store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Globe, Loader2, Lock } from "lucide-react"

export function PublishQuestionPaperModal() {
  const { isOpen, paperId, paperTitle, closeModal } =
    usePublishQuestionPaperModalStore()

  const updateMutation = useUpdateQuestionPaper()

  const handleConfirmPublish = async () => {
    if (!paperId) return

    try {
      await updateMutation.mutateAsync({
        id: paperId,
        status: "Published",
      })
      toast.success(
        `প্রশ্নপত্র "${paperTitle || "Question Paper"}" সফলভাবে পাবলিশ করা হয়েছে।`
      )
      closeModal()
    } catch (err: any) {
      toast.error(err?.message || "পাবলিশ করা সম্ভব হয়নি")
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
          <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold tracking-tight text-on-surface">
              প্রশ্নপত্র পাবলিশ করবেন?
            </DialogTitle>
            <p className="text-xs text-outline mt-0.5">
              ফাইনাল ও সুরক্ষিত প্রশ্নপত্র হিসেবে প্রকাশ করুন
            </p>
          </div>
        </div>

        <DialogHeader className="pt-1 font-body">
          <DialogDescription className="text-sm leading-relaxed text-on-surface-variant">
            আপনি কি নিশ্চিতভাবে{" "}
            <span className="font-bold text-on-surface">
              &quot;{paperTitle || "নির্বাচিত প্রশ্নপত্র"}&quot;
            </span>{" "}
            পাবলিশ করতে চান?
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-800 font-body">
          <Lock className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
          <p className="leading-snug">
            পাবলিশ করার পর প্রশ্নপত্রের প্রশ্নসমূহ ও কাঠামো লক হয়ে যাবে এবং এটি আর ড্রাফটে রূপান্তর করা যাবে না।
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={updateMutation.isPending}
            onClick={closeModal}
            className="w-full sm:w-auto rounded-lg border border-outline-variant px-5 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-high cursor-pointer h-10"
          >
            বাতিল
          </Button>
          <Button
            type="button"
            disabled={updateMutation.isPending}
            onClick={handleConfirmPublish}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer h-10 disabled:opacity-50 font-bold text-xs"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>পাবলিশ হচ্ছে...</span>
              </>
            ) : (
              <>
                <Globe className="h-4 w-4" />
                <span>হ্যাঁ, পাবলিশ করুন</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
