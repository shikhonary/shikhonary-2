"use client"

import { useState, useEffect } from "react"
import { toast } from "@workspace/ui/components/sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"
import { GraduationCap, Loader2, Save, AlertCircle } from "lucide-react"

import { useAcademicClassById, useUpdateAcademicClass } from "../services/use-academic-class"
import { useEditAcademicClassModalStore } from "../store/use-edit-academic-class-modal-store"

export function EditAcademicClassModal() {
  const { isOpen, classId, closeModal } = useEditAcademicClassModalStore()
  const { data: academicClass, isLoading } = useAcademicClassById(classId ?? "", isOpen && Boolean(classId))
  const updateMutation = useUpdateAcademicClass()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Form State
  const [nameEn, setNameEn] = useState("")
  const [nameBn, setNameBn] = useState("")
  const [position, setPosition] = useState(0)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (academicClass) {
      setNameEn(academicClass.nameEn)
      setNameBn(academicClass.nameBn)
      setPosition(academicClass.position)
      setIsActive(academicClass.isActive)
    }
  }, [academicClass])

  const isSubmitting = updateMutation.isPending

  const resetForm = () => {
    setNameEn("")
    setNameBn("")
    setPosition(0)
    setIsActive(true)
    setErrorMessage(null)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm()
      closeModal()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!nameEn.trim() || !nameBn.trim()) {
      setErrorMessage("অনুগ্রহ করে শ্রেণির বাংলা ও ইংরেজি উভয় নাম পূরণ করুন।")
      return
    }

    if (!classId) return

    try {
      await updateMutation.mutateAsync({
        id: classId,
        nameEn: nameEn.trim(),
        nameBn: nameBn.trim(),
        position: Number(position) || 0,
        isActive,
      })

      toast.success("শ্রেণির তথ্য সফলভাবে হালনাগাদ করা হয়েছে।")
      resetForm()
      closeModal()
    } catch (err: any) {
      const msg = err.message || "শ্রেণি হালনাগাদ করতে সমস্যা হয়েছে"
      setErrorMessage(msg)
      toast.error(msg)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-card p-0 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <DialogHeader className="border-b border-slate-200/60 dark:border-white/[0.06] p-5 sm:p-6 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-primary flex items-center justify-center shrink-0">
              <GraduationCap className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold text-foreground font-headline">
                শ্রেণি সম্পাদনা
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5 font-body">
                শ্রেণির বাংলা ও ইংরেজি নাম এবং প্রদর্শন ক্রম পরিবর্তন ও হালনাগাদ করুন
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form Body */}
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-2 text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-indigo-600 dark:text-primary" />
            <span className="text-xs font-semibold">তথ্য লোড হচ্ছে...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
            {/* Error Alert */}
            {errorMessage && (
              <div className="flex items-center gap-2.5 rounded-xl border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/20 p-3 text-rose-600 dark:text-rose-400 text-xs font-medium">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Name BN */}
            <div className="space-y-2">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                শ্রেণির নাম (বাংলা) <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="text"
                disabled={isSubmitting}
                placeholder="যেমন: ষষ্ঠ শ্রেণি বা নবম শ্রেণি"
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 px-3.5"
              />
            </div>

            {/* Name EN */}
            <div className="space-y-2">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                শ্রেণির নাম (ইংরেজি) <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="text"
                disabled={isSubmitting}
                placeholder="e.g. Class 6 or Class 9"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 px-3.5 font-mono"
              />
            </div>

            {/* Position */}
            <div className="space-y-2">
              <Label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                ক্রমিক নম্বর (Position / Order)
              </Label>
              <Input
                type="number"
                min={0}
                disabled={isSubmitting}
                value={position}
                onChange={(e) => setPosition(parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.03] text-foreground text-sm focus:border-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/20 h-10 px-3.5 font-mono"
              />
            </div>

            {/* Is Active Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-3.5">
              <div className="space-y-0.5">
                <Label
                  htmlFor="edit-class-active"
                  className="text-xs font-bold text-foreground cursor-pointer"
                >
                  শ্রেণিটি সক্রিয় রাখুন
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  সক্রিয় থাকলে শিক্ষার্থীরা এই শ্রেণির পাঠ্যবিষয় ও প্রশ্নপত্র দেখতে পাবে।
                </p>
              </div>
              <Switch
                id="edit-class-active"
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={isSubmitting}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200/60 dark:border-white/[0.06]">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => handleOpenChange(false)}
                className="h-10 px-4 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-200 font-bold text-xs"
              >
                বাতিল
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 shadow-sm shadow-indigo-200 dark:shadow-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>আপডেট হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Save className="size-3.5" />
                    <span>পরিবর্তন সংরক্ষণ করুন</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
