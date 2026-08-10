"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { toast } from "@workspace/ui/components/sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Card,
  CardContent,
} from "@workspace/ui/components/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  ArrowLeft,
  User,
  MapPin,
  Coins,
  Phone,
  Save,
  Loader2,
  Home,
  CreditCard,
  Hash,
  RotateCcw,
} from "lucide-react"

interface TaxPayerFormProps {
  initialData?: any
  isEditing?: boolean
}

export function TaxPayerForm({ initialData, isEditing = false }: TaxPayerFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [holding, setHolding] = useState("")
  const [name, setName] = useState("")
  const [fatherName, setFatherName] = useState("")
  const [phone, setPhone] = useState("")
  const [nid, setNid] = useState("")
  const [wardId, setWardId] = useState("")
  const [village, setVillage] = useState("")
  const [tax, setTax] = useState<number>(0)

  // Fetch Wards
  const { data: wardsData } = useQuery(
    trpc.tenantWard.list.queryOptions({ limit: 100 })
  )
  const wards = wardsData?.wards || []

  useEffect(() => {
    if (initialData) {
      setHolding(initialData.holding || "")
      setName(initialData.name || "")
      setFatherName(initialData.fatherName || "")
      setPhone(initialData.phone || "")
      setNid(initialData.nid || "")
      setWardId(initialData.wardId || "")
      setVillage(initialData.village || "")
      setTax(initialData.tax || 0)
    }
  }, [initialData])

  const createMutation = useMutation({
    ...trpc.taxPayer.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.taxPayer.pathFilter())
      toast.success("নতুন করদাতা সফলভাবে নিবন্ধিত হয়েছে।")
      router.push("/tax-payers")
    },
    onError: (err: any) => {
      toast.error(err.message || "করদাতা নিবন্ধন করতে ব্যর্থ হয়েছে")
    },
  })

  const updateMutation = useMutation({
    ...trpc.taxPayer.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.taxPayer.pathFilter())
      toast.success("করদাতার তথ্য আপডেট করা হয়েছে।")
      router.push("/tax-payers")
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

    if (isEditing && initialData?.id) {
      updateMutation.mutate({
        id: initialData.id,
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
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12 font-body">
      {/* Back Link & Page Title Section — Matched with Tenant App Header Theme */}
      <div className="flex flex-col gap-3">
        <Link
          href="/tax-payers"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-primary transition-colors w-fit cursor-pointer font-display"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>করদাতা তালিকায় ফিরে যান</span>
        </Link>

        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground md:text-4xl">
            {isEditing ? "করদাতার তথ্য সম্পাদনা" : "নতুন করদাতা নিবন্ধন"}
          </h2>
          <p className="max-w-2xl font-body text-xs sm:text-sm md:text-base leading-relaxed text-muted-foreground mt-1">
            {isEditing
              ? "ইউনিয়ন পরিষদের নিবন্ধিত করদাতার তথ্য পরিবর্তন ও হালনাগাদ করুন।"
              : "ইউনিয়ন পরিষদের নতুন হোল্ডিং করদাতার তথ্য পূরণ করে যুক্ত করুন।"}
          </p>
        </div>
      </div>

      {/* Main Single-Page Form — Matched with Tenant App UI Design System */}
      <form onSubmit={handleSubmit} className="space-y-6 font-body">
        {/* Card 1: Basic Info */}
        <Card className="overflow-hidden rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xs shadow-sm p-0">
          <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-5 sm:p-6 text-primary-foreground">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-primary-foreground shrink-0 shadow-sm">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-extrabold text-primary-foreground">
                  করদাতার সাধারণ তথ্য
                </h3>
                <p className="font-body text-xs text-primary-foreground/90 mt-0.5">
                  হোল্ডিং নম্বর, করদাতার পূর্ণ নাম ও পিতার নাম প্রদান করুন
                </p>
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Holding Number */}
              <div className="space-y-1.5">
                <Label className="block text-xs font-semibold text-muted-foreground font-display">
                  হোল্ডিং নম্বর <span className="text-destructive">*</span>
                </Label>
                <div className="relative group font-body">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                  <Input
                    value={holding}
                    onChange={(e) => setHolding(e.target.value)}
                    placeholder="যেমন: H-102 বা ১২"
                    disabled={isSubmitting}
                    required
                    className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all font-mono"
                  />
                </div>
              </div>

              {/* Tax Payer Name */}
              <div className="space-y-1.5">
                <Label className="block text-xs font-semibold text-muted-foreground font-display">
                  করদাতার নাম <span className="text-destructive">*</span>
                </Label>
                <div className="relative group font-body">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="করদাতার পূর্ণ নাম"
                    disabled={isSubmitting}
                    required
                    className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Father Name */}
            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-muted-foreground font-display">
                পিতার নাম
              </Label>
              <div className="relative group font-body">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                <Input
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="করদাতার পিতার নাম"
                  disabled={isSubmitting}
                  className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Location & Ward */}
        <Card className="overflow-hidden rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xs shadow-sm p-0">
          <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-5 sm:p-6 text-primary-foreground">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-primary-foreground shrink-0 shadow-sm">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-extrabold text-primary-foreground">
                  এলাকা ও অবস্থান
                </h3>
                <p className="font-body text-xs text-primary-foreground/90 mt-0.5">
                  করদাতার ওয়ার্ড নম্বর এবং গ্রামের নাম নির্বাচন করুন
                </p>
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Ward Select */}
              <div className="space-y-1.5">
                <Label className="block text-xs font-semibold text-muted-foreground font-display">
                  ওয়ার্ড নম্বর <span className="text-destructive">*</span>
                </Label>
                <Select value={wardId} onValueChange={setWardId}>
                  <SelectTrigger className="w-full rounded-xl border border-border bg-muted/30 py-2.5 px-4 font-body text-xs sm:text-sm text-foreground h-11 justify-between focus:border-primary/40 focus:ring-2 focus:ring-primary/20">
                    <div className="flex items-center gap-2.5 truncate">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <SelectValue placeholder="ওয়ার্ড নির্বাচন করুন" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-xl rounded-xl text-popover-foreground">
                    {wards.map((w: any) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.nameBn || w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Village */}
              <div className="space-y-1.5">
                <Label className="block text-xs font-semibold text-muted-foreground font-display">
                  গ্রামের নাম <span className="text-destructive">*</span>
                </Label>
                <div className="relative group font-body">
                  <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                  <Input
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="গ্রামের নাম"
                    disabled={isSubmitting}
                    required
                    className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Tax Assessment & Contact */}
        <Card className="overflow-hidden rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xs shadow-sm p-0">
          <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-5 sm:p-6 text-primary-foreground">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-primary-foreground shrink-0 shadow-sm">
                <Coins className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-extrabold text-primary-foreground">
                  ধার্যকৃত বাৎসরিক কর ও যোগাযোগ
                </h3>
                <p className="font-body text-xs text-primary-foreground/90 mt-0.5">
                  ধার্যকৃত বাৎসরিক করের পরিমাণ এবং মোবাইল/এনআইডি নম্বর যুক্ত করুন
                </p>
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-5">
            {/* Base Tax */}
            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-muted-foreground font-display">
                ধার্যকৃত বাৎসরিক কর (টাকা) <span className="text-destructive">*</span>
              </Label>
              <div className="relative group font-body">
                <Coins className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={tax}
                  onChange={(e) => setTax(Number(e.target.value))}
                  disabled={isSubmitting}
                  required
                  className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm font-mono font-bold transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Phone */}
              <div className="space-y-1.5">
                <Label className="block text-xs font-semibold text-muted-foreground font-display">
                  মোবাইল নম্বর
                </Label>
                <div className="relative group font-body">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01700000000"
                    disabled={isSubmitting}
                    className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm font-mono transition-all"
                  />
                </div>
              </div>

              {/* NID */}
              <div className="space-y-1.5">
                <Label className="block text-xs font-semibold text-muted-foreground font-display">
                  জাতীয় পরিচয়পত্র (NID)
                </Label>
                <div className="relative group font-body">
                  <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                  <Input
                    value={nid}
                    onChange={(e) => setNid(e.target.value)}
                    placeholder="জাতীয় পরিচয়পত্র নম্বর"
                    disabled={isSubmitting}
                    className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm font-mono transition-all"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions Footer — Matched with Tenant App Dialog / Form Actions Theme */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => router.push("/tax-payers")}
            className="border-border text-foreground hover:bg-muted rounded-xl px-5 py-2.5 text-xs font-medium cursor-pointer h-11"
          >
            বাতিল
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || !holding.trim() || !name.trim() || !wardId || !village.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl px-7 py-2.5 text-xs cursor-pointer shadow-md shadow-primary/20 disabled:opacity-50 h-11"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>সংরক্ষণ হচ্ছে...</span>
              </div>
            ) : isEditing ? (
              <>
                <Save className="w-4 h-4 mr-1.5" />
                তথ্য হালনাগাদ করুন
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-1.5" />
                করদাতা সংরক্ষণ করুন
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
