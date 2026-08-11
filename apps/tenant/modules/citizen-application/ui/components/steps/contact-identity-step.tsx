"use client"

import { Label } from "@workspace/ui/components/label"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Phone, Mail, Hash, Globe } from "lucide-react"

interface ContactIdentityStepProps {
  mobile: string
  setMobile: (val: string) => void
  email: string
  setEmail: (val: string) => void
  nid: string
  setNid: (val: string) => void
  birthRegNo: string
  setBirthRegNo: (val: string) => void
  passportNo: string
  setPassportNo: (val: string) => void
  commentsBn: string
  setCommentsBn: (val: string) => void
  errors: Record<string, string>
  clearError: (field: string) => void
}

export function ContactIdentityStep({
  mobile,
  setMobile,
  email,
  setEmail,
  nid,
  setNid,
  birthRegNo,
  setBirthRegNo,
  passportNo,
  setPassportNo,
  commentsBn,
  setCommentsBn,
  errors,
  clearError,
}: ContactIdentityStepProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label className="block text-xs font-semibold text-muted-foreground font-display">
            মোবাইল নম্বর <span className="text-destructive">*</span>
          </Label>
          <div className="relative group font-body">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
            <Input
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value)
                clearError("mobile")
              }}
              placeholder="যেমন: 017XXXXXXXX"
              className={`bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all ${
                errors.mobile ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
              }`}
            />
          </div>
          {errors.mobile && (
            <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.mobile}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="block text-xs font-semibold text-muted-foreground font-display">
            ইমেইল ঠিকানা
          </Label>
          <div className="relative group font-body">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                clearError("email")
              }}
              placeholder="example@mail.com"
              className={`bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all ${
                errors.email ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.email}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="space-y-1.5">
          <Label className="block text-xs font-semibold text-muted-foreground font-display">
            জাতীয় পরিচয়পত্র নম্বর (NID)
          </Label>
          <div className="relative group font-body">
            <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
            <Input
              value={nid}
              onChange={(e) => {
                setNid(e.target.value)
                clearError("nid")
              }}
              placeholder="NID নম্বর"
              className={`bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all font-mono ${
                errors.nid ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
              }`}
            />
          </div>
          {errors.nid && (
            <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.nid}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="block text-xs font-semibold text-muted-foreground font-display">
            জন্ম নিবন্ধন নম্বর
          </Label>
          <div className="relative group font-body">
            <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
            <Input
              value={birthRegNo}
              onChange={(e) => {
                setBirthRegNo(e.target.value)
                clearError("birthRegNo")
              }}
              placeholder="১৭ ডিজিটের জন্ম নিবন্ধন নং"
              className={`bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all font-mono ${
                errors.birthRegNo ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
              }`}
            />
          </div>
          {errors.birthRegNo && (
            <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.birthRegNo}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="block text-xs font-semibold text-muted-foreground font-display">
            পাসপোর্ট নম্বর
          </Label>
          <div className="relative group font-body">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
            <Input
              value={passportNo}
              onChange={(e) => {
                setPassportNo(e.target.value)
                clearError("passportNo")
              }}
              placeholder="পাসপোর্ট নং"
              className={`bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all font-mono ${
                errors.passportNo ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
              }`}
            />
          </div>
          {errors.passportNo && (
            <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.passportNo}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="block text-xs font-semibold text-muted-foreground font-display">
          অতিরিক্ত মন্তব্য (যদি থাকে)
        </Label>
        <Textarea
          value={commentsBn}
          onChange={(e) => setCommentsBn(e.target.value)}
          placeholder="মন্তব্য লিখুন..."
          rows={3}
          className="w-full rounded-xl border border-border bg-muted/30 p-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 transition-all min-h-[80px]"
        />
      </div>
    </div>
  )
}
