"use client"

import { Label } from "@workspace/ui/components/label"
import { Input } from "@workspace/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { MapPin, Home, Hash, Building2 } from "lucide-react"

interface PresentAddressStepProps {
  presWardId: string
  presVillageBn: string
  presVillageEn: string
  presHoldingNo: string
  presRoadBn: string
  presRoadEn: string
  presPostOfficeBn: string
  setPresPostOfficeBn: (val: string) => void
  setPresPostId: (val: string) => void
  setPresVillageBn: (val: string) => void
  setPresVillageEn: (val: string) => void
  setPresHoldingNo: (val: string) => void
  setPresRoadBn: (val: string) => void
  setPresRoadEn: (val: string) => void
  setPresWardId: (val: string) => void
  wards: any[]
  showEnglishFields: boolean
  errors: Record<string, string>
  clearError: (field: string) => void
}

export function PresentAddressStep({
  presWardId,
  presVillageBn,
  presVillageEn,
  presHoldingNo,
  presRoadBn,
  presRoadEn,
  presPostOfficeBn,
  setPresPostOfficeBn,
  setPresPostId,
  setPresVillageBn,
  setPresVillageEn,
  setPresHoldingNo,
  setPresRoadBn,
  setPresRoadEn,
  setPresWardId,
  wards,
  showEnglishFields,
  errors,
  clearError,
}: PresentAddressStepProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Row 1: Required Fields (Ward No, Village/Neighborhood, Post Office) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Ward No */}
        <div className="space-y-1.5">
          <Label className="block text-xs font-semibold text-muted-foreground font-display">
            ওয়ার্ড নং <span className="text-destructive">*</span>
          </Label>
          <Select
            value={presWardId}
            onValueChange={(val) => {
              setPresWardId(val)
              clearError("presWardId")
            }}
          >
            <SelectTrigger
              className={`w-full rounded-xl border border-border bg-muted/30 py-2.5 px-4 font-body text-xs sm:text-sm text-foreground h-11 justify-between focus:border-primary/40 focus:ring-2 focus:ring-primary/20 cursor-pointer ${
                errors.presWardId ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <SelectValue placeholder="ওয়ার্ড নম্বর" />
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
          {errors.presWardId && (
            <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.presWardId}</p>
          )}
        </div>

        {/* Village/Neighborhood (Bangla) */}
        <div className="space-y-1.5">
          <Label className="block text-xs font-semibold text-muted-foreground font-display">
            গ্রাম/মহল্লা <span className="text-destructive">*</span>
          </Label>
          <div className="relative group font-body">
            <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
            <Input
              value={presVillageBn}
              onChange={(e) => {
                setPresVillageBn(e.target.value)
                clearError("presVillageBn")
              }}
              placeholder="গ্রামের নাম"
              className={`bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all ${
                errors.presVillageBn ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
              }`}
            />
          </div>
          {errors.presVillageBn && (
            <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.presVillageBn}</p>
          )}
        </div>

        {/* Post Office (Bangla) */}
        <div className="space-y-1.5">
          <Label className="block text-xs font-semibold text-muted-foreground font-display">
            ডাকঘর <span className="text-destructive">*</span>
          </Label>
          <div className="relative group font-body">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
            <Input
              value={presPostOfficeBn}
              onChange={(e) => {
                setPresPostOfficeBn(e.target.value)
                setPresPostId(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"))
                clearError("presPostOfficeBn")
              }}
              placeholder="ডাকঘর"
              className={`bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all ${
                errors.presPostOfficeBn ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
              }`}
            />
          </div>
          {errors.presPostOfficeBn && (
            <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.presPostOfficeBn}</p>
          )}
        </div>
      </div>

      {/* Row 2: Optional Fields (Holding No, Road/Block) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Holding No */}
        <div className="space-y-1.5">
          <Label className="block text-xs font-semibold text-muted-foreground font-display">
            হোল্ডিং নং
          </Label>
          <div className="relative group font-body">
            <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
            <Input
              value={presHoldingNo}
              onChange={(e) => setPresHoldingNo(e.target.value)}
              placeholder="যেমন: ১২৩"
              className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all font-mono"
            />
          </div>
        </div>

        {/* Road/Block (Bangla) */}
        <div className="space-y-1.5">
          <Label className="block text-xs font-semibold text-muted-foreground font-display">
            রাস্তা/পাড়া
          </Label>
          <div className="relative group font-body">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
            <Input
              value={presRoadBn}
              onChange={(e) => setPresRoadBn(e.target.value)}
              placeholder="রাস্তা বা পাড়ার নাম"
              className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all"
            />
          </div>
        </div>
      </div>

      {/* Row 3: Optional English Fields (rendered only if English Fields toggle is checked) */}
      {showEnglishFields && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-in fade-in duration-200">
          {/* Village/Neighborhood (English) */}
          <div className="space-y-1.5">
            <Label className="block text-xs font-semibold text-muted-foreground font-display">
              Village/Neighborhood
            </Label>
            <div className="relative group font-body">
              <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
              <Input
                value={presVillageEn}
                onChange={(e) => {
                  setPresVillageEn(e.target.value)
                  clearError("presVillageEn")
                }}
                placeholder="Village name in English"
                className={`bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all ${
                  errors.presVillageEn ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
                }`}
              />
            </div>
            {errors.presVillageEn && (
              <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.presVillageEn}</p>
            )}
          </div>

          {/* Road/Block (English) */}
          <div className="space-y-1.5">
            <Label className="block text-xs font-semibold text-muted-foreground font-display">
              Road/Block
            </Label>
            <div className="relative group font-body">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
              <Input
                value={presRoadEn}
                onChange={(e) => {
                  setPresRoadEn(e.target.value)
                  clearError("presRoadEn")
                }}
                placeholder="Road name in English"
                className={`bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all ${
                  errors.presRoadEn ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
                }`}
              />
            </div>
            {errors.presRoadEn && (
              <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.presRoadEn}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
