"use client"

import { Label } from "@workspace/ui/components/label"
import { Input } from "@workspace/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { MapPin, Home, Hash, Building2 } from "lucide-react"

interface PermanentAddressStepProps {
  sameAsPresent: boolean
  setSameAsPresent: (val: boolean) => void
  permWardId: string
  permVillageBn: string
  permVillageEn: string
  permHoldingNo: string
  permRoadBn: string
  permRoadEn: string
  permPostOfficeBn: string
  setPermPostOfficeBn: (val: string) => void
  setPermPostId: (val: string) => void
  setPermVillageBn: (val: string) => void
  setPermVillageEn: (val: string) => void
  setPermHoldingNo: (val: string) => void
  setPermRoadBn: (val: string) => void
  setPermRoadEn: (val: string) => void
  setPermWardId: (val: string) => void
  wards: any[]
  showEnglishFields: boolean
  errors: Record<string, string>
  clearError: (field: string) => void
}

export function PermanentAddressStep({
  sameAsPresent,
  setSameAsPresent,
  permWardId,
  permVillageBn,
  permVillageEn,
  permHoldingNo,
  permRoadBn,
  permRoadEn,
  permPostOfficeBn,
  setPermPostOfficeBn,
  setPermPostId,
  setPermVillageBn,
  setPermVillageEn,
  setPermHoldingNo,
  setPermRoadBn,
  setPermRoadEn,
  setPermWardId,
  wards,
  showEnglishFields,
  errors,
  clearError,
}: PermanentAddressStepProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center space-x-2.5 pb-2.5 mb-2 border-b border-border/40 font-body">
        <Checkbox
          id="sameAsPresent"
          checked={sameAsPresent}
          onCheckedChange={(checked) => {
            const isChecked = !!checked
            setSameAsPresent(isChecked)
            if (isChecked) {
              setPermWardId("")
              setPermVillageBn("")
              setPermVillageEn("")
              setPermHoldingNo("")
              setPermRoadBn("")
              setPermRoadEn("")
              setPermPostOfficeBn("")
              setPermPostId("")
              // Clear any permanent errors
              clearError("permDivisionId")
              clearError("permDistrictId")
              clearError("permUpazilaId")
              clearError("permUnionId")
              clearError("permWardId")
              clearError("permVillageBn")
              clearError("permVillageEn")
              clearError("permRoadEn")
              clearError("permPostOfficeBn")
            }
          }}
        />
        <Label htmlFor="sameAsPresent" className="text-xs sm:text-sm font-semibold text-foreground cursor-pointer select-none font-display">
          বর্তমান এবং স্থায়ী ঠিকানা একই
        </Label>
      </div>

      {!sameAsPresent ? (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Row 1: Required Fields (Ward No, Village/Neighborhood, Post Office) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Ward No */}
            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-muted-foreground font-display">
                ওয়ার্ড নং <span className="text-destructive">*</span>
              </Label>
              <Select
                value={permWardId}
                onValueChange={(val) => {
                  setPermWardId(val)
                  clearError("permWardId")
                }}
              >
                <SelectTrigger
                  className={`w-full rounded-xl border border-border bg-muted/30 py-2.5 px-4 font-body text-xs sm:text-sm text-foreground h-11 justify-between focus:border-primary/40 focus:ring-2 focus:ring-primary/20 cursor-pointer ${
                    errors.permWardId ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
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
              {errors.permWardId && (
                <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.permWardId}</p>
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
                  value={permVillageBn}
                  onChange={(e) => {
                    setPermVillageBn(e.target.value)
                    clearError("permVillageBn")
                  }}
                  placeholder="গ্রামের নাম"
                  className={`bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all ${
                    errors.permVillageBn ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
                  }`}
                />
              </div>
              {errors.permVillageBn && (
                <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.permVillageBn}</p>
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
                  value={permPostOfficeBn}
                  onChange={(e) => {
                    setPermPostOfficeBn(e.target.value)
                    setPermPostId(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"))
                    clearError("permPostOfficeBn")
                  }}
                  placeholder="ডাকঘর"
                  className={`bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all ${
                    errors.permPostOfficeBn ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
                  }`}
                />
              </div>
              {errors.permPostOfficeBn && (
                <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.permPostOfficeBn}</p>
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
                  value={permHoldingNo}
                  onChange={(e) => setPermHoldingNo(e.target.value)}
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
                  value={permRoadBn}
                  onChange={(e) => setPermRoadBn(e.target.value)}
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
                    value={permVillageEn}
                    onChange={(e) => {
                      setPermVillageEn(e.target.value)
                      clearError("permVillageEn")
                    }}
                    placeholder="Village name in English"
                    className={`bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all ${
                      errors.permVillageEn ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
                    }`}
                  />
                </div>
                {errors.permVillageEn && (
                  <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.permVillageEn}</p>
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
                    value={permRoadEn}
                    onChange={(e) => {
                      setPermRoadEn(e.target.value)
                      clearError("permRoadEn")
                    }}
                    placeholder="Road name in English"
                    className={`bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all ${
                      errors.permRoadEn ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
                    }`}
                  />
                </div>
                {errors.permRoadEn && (
                  <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.permRoadEn}</p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-10 text-center border border-dashed rounded-xl text-muted-foreground text-xs sm:text-sm bg-muted/10 font-body animate-in fade-in duration-350">
          স্থায়ী ঠিকানা বর্তমান ঠিকানার অনুরূপ হিসেবে সফলভাবে লিংক করা হয়েছে।
        </div>
      )}
    </div>
  )
}
