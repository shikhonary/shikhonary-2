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
import { MapPin, Tag, Building2, Loader2 } from "lucide-react"

import { useWardModalStore } from "../store/use-ward-modal-store"

export function WardModal() {
  const queryClient = useQueryClient()
  const { isOpen, ward, closeModal } = useWardModalStore()

  const [nameInput, setNameInput] = useState("")
  const [nameBnInput, setNameBnInput] = useState("")

  useEffect(() => {
    if (isOpen) {
      if (ward) {
        setNameInput(ward.name)
        setNameBnInput(ward.nameBn)
      } else {
        setNameInput("")
        setNameBnInput("")
      }
    }
  }, [isOpen, ward])

  const createMutation = useMutation({
    ...trpc.tenantWard.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.tenantWard.pathFilter())
      toast.success("ওয়ার্ড সফলভাবে তৈরি করা হয়েছে।")
      closeModal()
    },
    onError: (err: any) => {
      toast.error(err.message || "ওয়ার্ড তৈরি করতে ব্যর্থ হয়েছে")
    },
  })

  const updateMutation = useMutation({
    ...trpc.tenantWard.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.tenantWard.pathFilter())
      toast.success("ওয়ার্ড সফলভাবে আপডেট করা হয়েছে।")
      closeModal()
    },
    onError: (err: any) => {
      toast.error(err.message || "ওয়ার্ড আপডেট করতে ব্যর্থ হয়েছে")
    },
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nameInput.trim() || !nameBnInput.trim()) return

    if (ward?.id) {
      updateMutation.mutate({
        id: ward.id,
        name: nameInput.trim(),
        nameBn: nameBnInput.trim(),
      })
    } else {
      createMutation.mutate({
        name: nameInput.trim(),
        nameBn: nameBnInput.trim(),
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="bg-card border border-white/[0.08] shadow-2xl rounded-2xl overflow-hidden text-foreground max-w-lg p-0">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-6 text-primary-foreground">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-primary-foreground shrink-0 shadow-sm">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="font-display text-xl font-extrabold text-primary-foreground">
                {ward ? "ওয়ার্ড সম্পাদনা করুন" : "নতুন ওয়ার্ড যুক্ত করুন"}
              </DialogTitle>
              <DialogDescription className="font-body text-xs text-primary-foreground/90 mt-0.5">
                ওয়ার্ড নম্বর এবং বাংলা ও ইংরেজি শিরোনাম প্রদান করুন
              </DialogDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Bangla Name */}
          <div className="space-y-1.5">
            <Label className="block text-xs font-semibold text-muted-foreground">
              ওয়ার্ডের নাম (বাংলা)
            </Label>
            <div className="relative group">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
              <Input
                value={nameBnInput}
                onChange={(e) => setNameBnInput(e.target.value)}
                placeholder="যেমন: ওয়ার্ড নং ১"
                disabled={isSubmitting}
                required
                className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all"
              />
            </div>
          </div>

          {/* English Name */}
          <div className="space-y-1.5">
            <Label className="block text-xs font-semibold text-muted-foreground">
              Name (English)
            </Label>
            <div className="relative group">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
              <Input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Ward No 1"
                disabled={isSubmitting}
                required
                className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all font-mono"
              />
            </div>
          </div>

          {/* Actions Footer */}
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
            <Button
              type="submit"
              disabled={isSubmitting || !nameInput.trim() || !nameBnInput.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl px-6 py-2.5 text-xs cursor-pointer shadow-md shadow-primary/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </div>
              ) : ward ? (
                "আপডেট করুন"
              ) : (
                "সংরক্ষণ করুন"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
