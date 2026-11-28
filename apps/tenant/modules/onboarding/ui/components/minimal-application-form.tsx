"use client"

import React, { useState, useEffect } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { trpc } from "@/trpc/client"
import { toast } from "@workspace/ui/components/sonner"
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card"
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
  GraduationCap,
  Building2,
  Phone,
  MapPin,
  Share2,
  Gift,
  Loader2,
  Sparkles,
  CheckCircle2,
  X,
  AlertCircle,
} from "lucide-react"
import { isValidBdPhoneNumber, normalizeBdPhoneNumber } from "@workspace/utils"

export const INSTITUTION_TYPE_OPTIONS = [
  { value: "SCHOOL", label: "বিদ্যালয়" },
  { value: "COACHING", label: "কোচিং সেন্টার" },
  { value: "TUTOR", label: "ব্যক্তিগত টিউটর / গৃহশিক্ষক" },
  { value: "COLLEGE", label: "কলেজ" },
  { value: "MADRASAH", label: "মাদরাসা" },
  { value: "OTHER", label: "অন্যান্য" },
] as const

interface MinimalApplicationFormProps {
  onSuccess: () => void
  onCancel?: () => void
  previousApplication?: any
}

export function MinimalApplicationForm({
  onSuccess,
  onCancel,
  previousApplication,
}: MinimalApplicationFormProps) {
  const [type, setType] = useState<string>(previousApplication?.type || "SCHOOL")
  const [name, setName] = useState(previousApplication?.name || "")
  const [phone, setPhone] = useState(previousApplication?.phone || "")
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [divisionId, setDivisionId] = useState<string>(
    previousApplication?.divisionId || ""
  )
  const [districtId, setDistrictId] = useState<string>(
    previousApplication?.districtId || ""
  )
  const [referralCode, setReferralCode] = useState(
    previousApplication?.referralCode || ""
  )

  // Auto-populate referral code from localStorage if not already set
  useEffect(() => {
    if (!referralCode) {
      try {
        const storedCode = localStorage.getItem("shikhonary_referral_code")
        if (storedCode) {
          setReferralCode(storedCode.toUpperCase())
        }
      } catch {
        // Safe fallback
      }
    }
  }, [referralCode])

  // Queries for divisions and cascading districts
  const { data: divisions = [], isLoading: isDivisionsLoading } = useQuery(
    trpc.location.divisions.queryOptions()
  )

  const { data: districts = [], isLoading: isDistrictsLoading } = useQuery({
    ...trpc.location.districts.queryOptions({ divisionId }),
    enabled: Boolean(divisionId),
  })

  // Submit mutation
  const submitMutation = useMutation(
    trpc.tenantApplication.submit.mutationOptions({
      onSuccess: () => {
        toast.success("আপনার প্রতিষ্ঠানের তথ্য সফলভাবে জমা হয়েছে!")
        onSuccess()
      },
      onError: (err: any) => {
        toast.error(err?.message || "তথ্য জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।")
      },
    })
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("প্রতিষ্ঠানের নাম আবশ্যক।")
      return
    }

    const normalizedPhone = normalizeBdPhoneNumber(phone)
    if (!normalizedPhone) {
      toast.error("যোগাযোগের মোবাইল নম্বর প্রদান করুন।")
      setPhoneError("মোবাইল নম্বর প্রদান আবশ্যক")
      return
    }

    if (!isValidBdPhoneNumber(normalizedPhone)) {
      toast.error("সঠিক ১১ ডিজিটের বাংলাদেশী মোবাইল নম্বর দিন (যেমন: ০১৭০০-০০০০০০)")
      setPhoneError("সঠিক ১১ ডিজিটের বাংলাদেশী মোবাইল নম্বর দিন (০১XXXXXXXXX)")
      return
    }

    setPhoneError(null)

    submitMutation.mutate({
      type: type as any,
      name: name.trim(),
      phone: normalizedPhone,
      divisionId: divisionId || null,
      districtId: districtId || null,
      referralCode: referralCode.trim() || null,
    })
  }

  return (
    <Card className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden font-body">
      {/* Card Header — 1:1 MCQ Module Concept */}
      <CardHeader className="border-b border-border/60 bg-muted/20 p-4 sm:p-6 flex flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
            <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 stroke-[1.8]" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-xl font-bold font-headline text-foreground">
              {previousApplication ? "প্রতিষ্ঠানের তথ্য পরিবর্তন করুন" : "প্রতিষ্ঠানের প্রাথমিক বিবরণ"}
            </CardTitle>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 leading-snug">
              নিচের তথ্যগুলো পূরণ করে আপনার প্রতিষ্ঠানের জন্য পোর্টাল অ্যাকাউন্ট চালু করুন।
            </p>
          </div>
        </div>

        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="rounded-xl text-muted-foreground hover:text-foreground h-8 w-8 sm:h-9 sm:w-9"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-4 sm:p-7">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* 2-Column Responsive Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5">
            {/* 1. Institution Type */}
            <div className="space-y-1 sm:space-y-1.5">
              <Label className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                প্রতিষ্ঠানের ধরন <span className="text-rose-500">*</span>
              </Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full h-10 sm:h-11 rounded-xl border border-border/60 bg-muted/30 text-foreground text-xs sm:text-sm focus:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20 px-3.5 sm:px-4 justify-between">
                  <SelectValue placeholder="প্রতিষ্ঠানের ধরন নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border border-border/80 rounded-xl shadow-lg">
                  {INSTITUTION_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} label={opt.label}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 2. Institution / Coaching / Tutor Name */}
            <div className="space-y-1 sm:space-y-1.5">
              <Label className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                প্রতিষ্ঠানের নাম <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <Input
                  type="text"
                  placeholder="যেমন: আইডিয়াল স্কুল অ্যান্ড কলেজ বা রফিক প্রাইভেট কেয়ার"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitMutation.isPending}
                  className="pl-9 sm:pl-10 h-10 sm:h-11 rounded-xl border border-border/60 bg-muted/30 text-foreground text-xs sm:text-sm placeholder:text-muted-foreground/50 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
            </div>

            {/* 3. Mobile Phone */}
            <div className="space-y-1 sm:space-y-1.5">
              <Label className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline">
                যোগাযোগের মোবাইল নম্বর <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <Input
                  type="tel"
                  placeholder="০১XXXXXXXXX (যেমন: ০১৭০০-০০০০০০)"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    if (phoneError) {
                      const clean = normalizeBdPhoneNumber(e.target.value)
                      if (isValidBdPhoneNumber(clean)) {
                        setPhoneError(null)
                      }
                    }
                  }}
                  disabled={submitMutation.isPending}
                  className={`pl-9 sm:pl-10 h-10 sm:h-11 rounded-xl border ${
                    phoneError ? "border-rose-500/80 focus-visible:ring-rose-500/20" : "border-border/60"
                  } bg-muted/30 text-foreground text-xs sm:text-sm placeholder:text-muted-foreground/50 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20`}
                />
              </div>
              {phoneError && (
                <p className="text-[11px] text-rose-500 font-medium font-body flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{phoneError}</span>
                </p>
              )}
            </div>

            {/* 4. Referral Code (Optional) */}
            <div className="space-y-1 sm:space-y-1.5">
              <Label className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline flex items-center justify-between">
                <span>রেফারেল কোড</span>
                <span className="text-[10px] sm:text-[11px] font-normal normal-case text-primary font-body">ঐচ্ছিক (+১০০ ক্রেডিট)</span>
              </Label>
              <div className="relative">
                <Share2 className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <Input
                  type="text"
                  placeholder="রেফারেল কোড (ঐচ্ছিক)"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  disabled={submitMutation.isPending}
                  className="pl-9 sm:pl-10 h-10 sm:h-11 rounded-xl border border-border/60 bg-muted/30 text-foreground text-xs sm:text-sm placeholder:text-muted-foreground/50 uppercase tracking-widest focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20 font-mono"
                />
              </div>
            </div>

            {/* 5. Division (Optional) */}
            <div className="space-y-1 sm:space-y-1.5">
              <Label className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline flex items-center justify-between">
                <span>বিভাগ</span>
                <span className="text-[10px] sm:text-[11px] font-normal normal-case text-muted-foreground font-body">ঐচ্ছিক</span>
              </Label>
              <Select
                value={divisionId}
                onValueChange={(val) => {
                  setDivisionId(val)
                  setDistrictId("")
                }}
                disabled={isDivisionsLoading || submitMutation.isPending}
              >
                <SelectTrigger className="w-full h-10 sm:h-11 rounded-xl border border-border/60 bg-muted/30 text-foreground text-xs sm:text-sm focus:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20 px-3.5 sm:px-4 justify-between">
                  <SelectValue placeholder="বিভাগ নির্বাচন করুন (ঐচ্ছিক)" />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border border-border/80 rounded-xl shadow-lg max-h-64">
                  {divisions.map((div: any) => (
                    <SelectItem
                      key={div.id}
                      value={div.id}
                      label={div.nameBn || div.name}
                    >
                      {div.nameBn || div.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 6. District (Optional) */}
            <div className="space-y-1 sm:space-y-1.5">
              <Label className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground font-headline flex items-center justify-between">
                <span>জেলা</span>
                <span className="text-[10px] sm:text-[11px] font-normal normal-case text-muted-foreground font-body">ঐচ্ছিক</span>
              </Label>
              <Select
                value={districtId}
                onValueChange={setDistrictId}
                disabled={!divisionId || isDistrictsLoading || submitMutation.isPending}
              >
                <SelectTrigger className="w-full h-10 sm:h-11 rounded-xl border border-border/60 bg-muted/30 text-foreground text-xs sm:text-sm focus:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20 px-3.5 sm:px-4 justify-between disabled:opacity-50">
                  <SelectValue
                    placeholder={
                      divisionId
                        ? "জেলা নির্বাচন করুন (ঐচ্ছিক)"
                        : "আগে বিভাগ নির্বাচন করুন"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border border-border/80 rounded-xl shadow-lg max-h-64">
                  {districts.map((dist: any) => (
                    <SelectItem
                      key={dist.id}
                      value={dist.id}
                      label={dist.nameBn || dist.name}
                    >
                      {dist.nameBn || dist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Referral Bonus Highlight Box */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 sm:p-4 flex items-start gap-2.5 sm:gap-3">
            <div className="size-7 sm:size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="text-[11px] sm:text-xs space-y-0.5 sm:space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-foreground font-headline">
                <span>রেফারেল বোনাস অফার</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-primary/20 text-primary font-bold">
                  +১০০ ফ্রি ক্রেডিট
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                কোনো রেফারেল কোড ব্যবহার করলে আপনার নতুন প্রতিষ্ঠান পেয়ে যাবে{" "}
                <span className="text-primary font-semibold">১০০টি ফ্রি ক্রেডিট</span> এবং যিনি রেফার করেছেন তিনি পাবেন{" "}
                <span className="text-primary font-semibold">৩০০টি বোনাস ক্রেডিট</span>।
              </p>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-1 sm:pt-2 flex items-center gap-2.5 sm:gap-3">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="h-10 sm:h-11 px-4 sm:px-5 rounded-xl border-border/70 text-foreground font-headline font-bold text-xs sm:text-sm"
              >
                বাতিল
              </Button>
            )}

            <Button
              type="submit"
              disabled={submitMutation.isPending}
              className="flex-1 h-10 sm:h-11 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-headline font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>জমা দেওয়া হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {previousApplication ? "তথ্য আপডেট করুন" : "প্রতিষ্ঠান যুক্ত করতে জমা দিন"}
                  </span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
