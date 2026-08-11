"use client"

import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { Loader2, UserPlus, Pen } from "lucide-react"

interface TaxPayerFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingTaxPayer?: any
}

export function TaxPayerFormModal({
  open,
  onOpenChange,
  editingTaxPayer,
}: TaxPayerFormModalProps) {
  const queryClient = useQueryClient()

  const [holding, setHolding] = useState("")
  const [name, setName] = useState("")
  const [fatherName, setFatherName] = useState("")
  const [phone, setPhone] = useState("")
  const [nid, setNid] = useState("")
  const [wardId, setWardId] = useState("")
  const [village, setVillage] = useState("")
  const [tax, setTax] = useState<number>(0)

  // Fetch Wards for dropdown
  const { data: wardsData } = useQuery(
    trpc.tenantWard.list.queryOptions({ limit: 100 })
  )
  const wards = wardsData?.wards || []

  useEffect(() => {
    if (editingTaxPayer) {
      setHolding(editingTaxPayer.holding || "")
      setName(editingTaxPayer.name || "")
      setFatherName(editingTaxPayer.fatherName || "")
      setPhone(editingTaxPayer.phone || "")
      setNid(editingTaxPayer.nid || "")
      setWardId(editingTaxPayer.wardId || "")
      setVillage(editingTaxPayer.village || "")
      setTax(editingTaxPayer.tax || 0)
    } else {
      resetForm()
    }
  }, [editingTaxPayer, open])

  const resetForm = () => {
    setHolding("")
    setName("")
    setFatherName("")
    setPhone("")
    setNid("")
    setWardId("")
    setVillage("")
    setTax(0)
  }

  const createMutation = useMutation({
    ...trpc.taxPayer.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.taxPayer.pathFilter())
      toast.success("নতুন করদাতা সফলভাবে নিবন্ধিত হয়েছে।")
      onOpenChange(false)
      resetForm()
    },
    onError: (err: any) => {
      toast.error(err.message || "করদাতা তৈরি করতে ব্যর্থ হয়েছে")
    },
  })

  const updateMutation = useMutation({
    ...trpc.taxPayer.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.taxPayer.pathFilter())
      toast.success("করদাতার তথ্য আপডেট করা হয়েছে।")
      onOpenChange(false)
      resetForm()
    },
    onError: (err: any) => {
      toast.error(err.message || "করদাতা আপডেট করতে ব্যর্থ হয়েছে")
    },
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!holding.trim() || !name.trim() || !wardId || !village.trim()) {
      toast.error("অনুগ্রহ করে সকল প্রয়োজনীয় (স্টার চিহ্নিত) ফিল্ড পূরণ করুন।")
      return
    }

    if (editingTaxPayer) {
      updateMutation.mutate({
        id: editingTaxPayer.id,
        holding: holding.trim(),
        name: name.trim(),
        fatherName: fatherName.trim() || undefined,
        phone: phone.trim() || undefined,
        nid: nid.trim() || undefined,
        wardId,
        village: village.trim(),
        tax: Number(tax) || 0,
      })
    } else {
      createMutation.mutate({
        holding: holding.trim(),
        name: name.trim(),
        fatherName: fatherName.trim() || undefined,
        phone: phone.trim() || undefined,
        nid: nid.trim() || undefined,
        wardId,
        village: village.trim(),
        tax: Number(tax) || 0,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            {editingTaxPayer ? (
              <>
                <Pen className="w-5 h-5 text-primary" />
                করদাতার তথ্য সম্পাদনা
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5 text-primary" />
                নতুন করদাতা নিবন্ধন
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {editingTaxPayer
              ? "করদাতার নাম, হোল্ডিং নম্বর, ওয়ার্ড বা ধার্যকৃত ট্যাক্স পরিবর্তন করুন।"
              : "ইউনিয়ন পরিষদের নতুন করদাতার তথ্য পূরণ করে যুক্ত করুন।"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="holding" className="text-sm font-semibold">
                হোল্ডিং নম্বর <span className="text-destructive">*</span>
              </Label>
              <Input
                id="holding"
                placeholder="যেমন: H-102 বা ১২"
                value={holding}
                onChange={(e) => setHolding(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="wardId" className="text-sm font-semibold">
                ওয়ার্ড <span className="text-destructive">*</span>
              </Label>
              <Select value={wardId} onValueChange={setWardId}>
                <SelectTrigger id="wardId">
                  <SelectValue placeholder="ওয়ার্ড নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {wards.map((w: any) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.nameBn || w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-semibold">
                করদাতার নাম <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="করদাতার পূর্ণ নাম"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fatherName" className="text-sm font-semibold">
                পিতার নাম
              </Label>
              <Input
                id="fatherName"
                placeholder="পিতার নাম"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="village" className="text-sm font-semibold">
                গ্রামের নাম <span className="text-destructive">*</span>
              </Label>
              <Input
                id="village"
                placeholder="গ্রামের নাম"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tax" className="text-sm font-semibold">
                ধার্যকৃত বাৎসরিক কর (টাকা) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tax"
                type="number"
                min={0}
                placeholder="0"
                value={tax}
                onChange={(e) => setTax(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-semibold">
                মোবাইল নম্বর
              </Label>
              <Input
                id="phone"
                placeholder="01700000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nid" className="text-sm font-semibold">
                জাতীয় পরিচয়পত্র (NID)
              </Label>
              <Input
                id="nid"
                placeholder="এনআইডি নম্বর"
                value={nid}
                onChange={(e) => setNid(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              বাতিল
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  সংরক্ষণ হচ্ছে...
                </>
              ) : editingTaxPayer ? (
                "হালনাগাদ করুন"
              ) : (
                "করদাতা সংরক্ষণ করুন"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
