"use client"

import React, { useState, useEffect } from "react"
import { toast } from "@workspace/ui/components/sonner"
import { useUpdateQuestionPaper } from "../services/use-question-paper"
import { useRenameQuestionPaperModalStore } from "../store/use-rename-question-paper-modal-store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Pencil, Loader2, Info } from "lucide-react"

export function RenameQuestionPaperModal() {
  const { isOpen, paperId, paperTitle, closeModal } =
    useRenameQuestionPaperModalStore()

  const [title, setTitle] = useState("")
  const updateMutation = useUpdateQuestionPaper()

  useEffect(() => {
    if (isOpen && paperTitle) {
      setTitle(paperTitle)
    }
  }, [isOpen, paperTitle])

  const handleConfirmRename = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paperId) return

    const trimmed = title.trim()
    if (!trimmed) {
      toast.error("অনুগ্রহ করে প্রশ্নপত্রের নাম প্রদান করুন")
      return
    }

    try {
      await updateMutation.mutateAsync({
        id: paperId,
        title: trimmed,
      })
      toast.success("প্রশ্নপত্রের নাম সফলভাবে পরিবর্তন করা হয়েছে।")
      closeModal()
    } catch (err: any) {
      toast.error(err?.message || "নাম পরিবর্তন করা সম্ভব হয়নি")
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
            <Pencil className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold tracking-tight text-on-surface">
              নাম পরিবর্তন করুন
            </DialogTitle>
            <p className="text-xs text-outline mt-0.5">
              প্রশ্নপত্রের শিরোনাম আপডেট করুন
            </p>
          </div>
        </div>

        <DialogHeader className="pt-1 font-body">
          <DialogDescription className="text-sm leading-relaxed text-on-surface-variant">
            বর্তমান নাম:{" "}
            <span className="font-bold text-on-surface">
              &quot;{paperTitle || "নির্বাচিত প্রশ্নপত্র"}&quot;
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleConfirmRename} className="space-y-4 font-body">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface flex items-center justify-between">
              <span>নতুন নাম</span>
              <span className="text-[11px] text-outline font-normal">*বাধ্যতামূলক</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="প্রশ্নপত্রের নতুন শিরোনাম লিখুন..."
              className="h-10 rounded-xl border border-outline-variant/60 bg-white text-xs sm:text-sm text-on-surface placeholder:text-outline focus-visible:ring-primary/20"
              autoFocus
              required
            />
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-primary font-body">
            <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <p className="leading-snug">
              নাম পরিবর্তন করা হলেও প্রশ্নপত্রের ভেতরের সব প্রশ্ন, বিন্যাস ও সেটিংস অপরিবর্তিত থাকবে।
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
              type="submit"
              disabled={updateMutation.isPending || !title.trim()}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 cursor-pointer h-10 disabled:opacity-50 font-bold text-xs"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4" />
                  <span>নাম সংরক্ষণ করুন</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
