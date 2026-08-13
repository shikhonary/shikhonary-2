"use client"

import { useState, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Hash, Key, Loader2, ArrowUpDown } from "lucide-react"
import { COUNTER_KEY_OPTIONS } from "@workspace/utils"

import { useCounterModalStore } from "../store/use-counter-modal-store"

export function CounterModal() {
  const queryClient = useQueryClient()
  const { isOpen, mode, counter, closeModal } = useCounterModalStore()

  const [keyInput, setKeyInput] = useState("")
  const [valueInput, setValueInput] = useState<number>(0)
  const [adjustInput, setAdjustInput] = useState<number>(1)

  useEffect(() => {
    if (isOpen) {
      if (counter) {
        setKeyInput(counter.key)
        setValueInput(counter.value)
        setAdjustInput(1)
      } else {
        setKeyInput("")
        setValueInput(0)
        setAdjustInput(1)
      }
    }
  }, [isOpen, counter])

  const setMutation = useMutation({
    ...trpc.tenantCounter.set.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.tenantCounter.pathFilter())
      toast.success("কাউন্টার সফলভাবে সংরক্ষণ করা হয়েছে।")
      closeModal()
    },
    onError: (err: any) => {
      toast.error(err.message || "কাউন্টার সংরক্ষণ করতে ব্যর্থ হয়েছে")
    },
  })

  const incrementMutation = useMutation({
    ...trpc.tenantCounter.increment.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.tenantCounter.pathFilter())
      toast.success("কাউন্টার সফলভাবে বৃদ্ধি করা হয়েছে।")
      closeModal()
    },
    onError: (err: any) => {
      toast.error(err.message || "কাউন্টার বৃদ্ধি করতে ব্যর্থ হয়েছে")
    },
  })

  const decrementMutation = useMutation({
    ...trpc.tenantCounter.decrement.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.tenantCounter.pathFilter())
      toast.success("কাউন্টার সফলভাবে হ্রাস করা হয়েছে।")
      closeModal()
    },
    onError: (err: any) => {
      toast.error(err.message || "কাউন্টার হ্রাস করতে ব্যর্থ হয়েছে")
    },
  })

  const isSubmitting =
    setMutation.isPending ||
    incrementMutation.isPending ||
    decrementMutation.isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!keyInput.trim()) return

    if (mode === "create" || mode === "edit") {
      setMutation.mutate({
        key: keyInput.trim().toUpperCase(),
        value: valueInput,
      })
    }
  }

  const handleIncrement = () => {
    if (!keyInput.trim()) return
    incrementMutation.mutate({
      key: keyInput,
      by: adjustInput,
    })
  }

  const handleDecrement = () => {
    if (!keyInput.trim()) return
    decrementMutation.mutate({
      key: keyInput,
      by: adjustInput,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="bg-card border border-white/[0.08] shadow-2xl rounded-2xl overflow-hidden text-foreground max-w-md p-0">
        <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-6 text-primary-foreground">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-primary-foreground shrink-0 shadow-sm">
              <Hash className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="font-display text-xl font-extrabold text-primary-foreground">
                {mode === "create" && "নতুন কাউন্টার তৈরি করুন"}
                {mode === "edit" && "কাউন্টার মান পরিবর্তন করুন"}
                {mode === "adjust" && "কাউন্টার মান সমন্বয় করুন"}
              </DialogTitle>
              <DialogDescription className="font-body text-xs text-primary-foreground/90 mt-0.5">
                {mode === "create" && "সিস্টেম ট্র্যাক করার জন্য নতুন মডিউল কী ও প্রারম্ভিক মান সেট করুন"}
                {mode === "edit" && "কাউন্টারটির সুনির্দিষ্ট মান নির্ধারণ করুন"}
                {mode === "adjust" && "কাউন্টারের বর্তমান মান বৃদ্ধি বা হ্রাস করুন"}
              </DialogDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Key Input */}
          <div className="space-y-1.5">
            <Label className="block text-xs font-semibold text-muted-foreground">
              কাউন্টার কী (Counter Key)
            </Label>
            {mode === "create" ? (
              <Select
                value={keyInput}
                onValueChange={(val) => setKeyInput(val)}
                disabled={isSubmitting}
              >
                <SelectTrigger
                  className="w-full rounded-xl border border-border bg-muted/30 py-2.5 px-4 font-solaiman text-xs sm:text-sm text-foreground h-11 justify-between focus:border-primary/40 focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Key className="h-4 w-4 text-primary shrink-0" />
                    <SelectValue placeholder="কাউন্টার কী নির্বাচন করুন" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border shadow-xl rounded-xl text-popover-foreground">
                  {COUNTER_KEY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="cursor-pointer font-solaiman">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="relative group font-body">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors h-4 w-4" />
                <Input
                  value={keyInput}
                  disabled
                  className="bg-muted/50 border-border text-foreground pl-10 h-11 rounded-xl text-sm transition-all uppercase"
                />
              </div>
            )}
          </div>

          {/* Value Inputs based on mode */}
          {(mode === "create" || mode === "edit") ? (
            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-muted-foreground">
                কাউন্টার মান (Counter Value)
              </Label>
              <div className="relative group">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                <Input
                  type="number"
                  value={valueInput}
                  onChange={(e) => setValueInput(parseInt(e.target.value) || 0)}
                  disabled={isSubmitting}
                  required
                  min={0}
                  className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all font-mono"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-muted-foreground">
                সমন্বয় করার পরিমাণ (Amount to Adjust)
              </Label>
              <div className="relative group">
                <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                <Input
                  type="number"
                  value={adjustInput}
                  onChange={(e) => setAdjustInput(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={isSubmitting}
                  required
                  min={1}
                  className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all font-mono"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={closeModal}
              className="border-border text-foreground hover:bg-muted rounded-xl px-5 py-2.5 text-xs font-medium cursor-pointer"
            >
              বাতিল
            </Button>

            {mode === "adjust" ? (
              <div className="flex gap-2">
                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleDecrement}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold rounded-xl px-5 py-2.5 text-xs cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "হ্রাস করুন (-)"
                  )}
                </Button>
                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleIncrement}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl px-5 py-2.5 text-xs cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "বৃদ্ধি করুন (+)"
                  )}
                </Button>
              </div>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting || !keyInput.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl px-6 py-2.5 text-xs cursor-pointer shadow-md shadow-primary/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>সংরক্ষণ হচ্ছে...</span>
                  </div>
                ) : (
                  "সংরক্ষণ করুন"
                )}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
