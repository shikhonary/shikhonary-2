"use client"

import { Label } from "@workspace/ui/components/label"
import { Input } from "@workspace/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { MapPin, Home, Hash, Building2 } from "lucide-react"

interface PermanentAddressStepProps {
  sameAsPresent: boolean
  setSameAsPresent: (val: boolean) => void
  permDivisionId: string
  permDistrictId: string
  permUpazilaId: string
  permUnionId: string
  permWardId: string
  permVillageBn: string
  permVillageEn: string
  permHoldingNo: string
  permRoadBn: string
  permRoadEn: string
  permPostId: string
  permPostOfficeBn: string
  permPostCode: string
  setPermPostOfficeBn: (val: string) => void
  setPermPostId: (val: string) => void
  setPermPostCode: (val: string) => void
  setPermVillageBn: (val: string) => void
  setPermVillageEn: (val: string) => void
  setPermHoldingNo: (val: string) => void
  setPermRoadBn: (val: string) => void
  setPermRoadEn: (val: string) => void
  setPermWardId: (val: string) => void
  handlePermDivisionChange: (val: string) => void
  handlePermDistrictChange: (val: string) => void
  handlePermUpazilaChange: (val: string) => void
  handlePermUnionChange: (val: string) => void
  permDivisions: any[]
  permDistricts: any[]
  permUpazilas: any[]
  permUnions: any[]
  permPosts: any[]
  wards: any[]
  showEnglishFields: boolean
  errors: Record<string, string>
  clearError: (field: string) => void
}

export function PermanentAddressStep({
  sameAsPresent,
  setSameAsPresent,
  permDivisionId,
  permDistrictId,
  permUpazilaId,
  permUnionId,
  permWardId,
  permVillageBn,
  permVillageEn,
  permHoldingNo,
  permRoadBn,
  permRoadEn,
  permPostId,
  permPostOfficeBn,
  permPostCode,
  setPermPostOfficeBn,
  setPermPostId,
  setPermPostCode,
  setPermVillageBn,
  setPermVillageEn,
  setPermHoldingNo,
  setPermRoadBn,
  setPermRoadEn,
  setPermWardId,
  handlePermDivisionChange,
  handlePermDistrictChange,
  handlePermUpazilaChange,
  handlePermUnionChange,
  permDivisions,
  permDistricts,
  permUpazilas,
  permUnions,
  permPosts,
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
              setPermPostCode("")
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
              clearError("permPostCode")
            }
          }}
        />
        <Label htmlFor="sameAsPresent" className="text-xs sm:text-sm font-semibold text-foreground cursor-pointer select-none font-display">
          বর্তমান এবং স্থায়ী ঠিকানা একই
        </Label>
      </div>

      {!sameAsPresent ? (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-muted-foreground font-display">
                বিভাগ <span className="text-destructive">*</span>
              </Label>
              <Select
                value={permDivisionId}
                onValueChange={(val) => {
                  handlePermDivisionChange(val)
                  clearError("permDivisionId")
                }}
              >
                <SelectTrigger
                  className={`w-full rounded-xl border border-border bg-muted/30 py-2.5 px-4 font-body text-xs sm:text-sm text-foreground h-11 justify-between focus:border-primary/40 focus:ring-2 focus:ring-primary/20 cursor-pointer ${
                    errors.permDivisionId ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border shadow-xl rounded-xl text-popover-foreground">
                  {permDivisions.map((d: any) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.nameBn || d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.permDivisionId && (
                <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.permDivisionId}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-muted-foreground font-display">
                জেলা <span className="text-destructive">*</span>
              </Label>
              <Select
                value={permDistrictId}
                onValueChange={(val) => {
                  handlePermDistrictChange(val)
                  clearError("permDistrictId")
                }}
                disabled={!permDivisionId}
              >
                <SelectTrigger
                  className={`w-full rounded-xl border border-border bg-muted/30 py-2.5 px-4 font-body text-xs sm:text-sm text-foreground h-11 justify-between focus:border-primary/40 focus:ring-2 focus:ring-primary/20 cursor-pointer disabled:opacity-50 ${
                    errors.permDistrictId ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <SelectValue placeholder={permDivisionId ? "জেলা নির্বাচন করুন" : "প্রথমে বিভাগ সিলেক্ট করুন"} />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border shadow-xl rounded-xl text-popover-foreground">
                  {permDistricts.map((d: any) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.nameBn || d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.permDistrictId && (
                <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.permDistrictId}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-muted-foreground font-display">
                উপজেলা <span className="text-destructive">*</span>
              </Label>
              <Select
                value={permUpazilaId}
                onValueChange={(val) => {
                  handlePermUpazilaChange(val)
                  clearError("permUpazilaId")
                }}
                disabled={!permDistrictId}
              >
                <SelectTrigger
                  className={`w-full rounded-xl border border-border bg-muted/30 py-2.5 px-4 font-body text-xs sm:text-sm text-foreground h-11 justify-between focus:border-primary/40 focus:ring-2 focus:ring-primary/20 cursor-pointer disabled:opacity-50 ${
                    errors.permUpazilaId ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <SelectValue placeholder={permDistrictId ? "উপজেলা নির্বাচন করুন" : "প্রথমে জেলা সিলেক্ট করুন"} />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border shadow-xl rounded-xl text-popover-foreground">
                  {permUpazilas.map((u: any) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.nameBn || u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.permUpazilaId && (
                <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.permUpazilaId}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-muted-foreground font-display">
                ইউনিয়ন <span className="text-destructive">*</span>
              </Label>
              <Select
                value={permUnionId}
                onValueChange={(val) => {
                  handlePermUnionChange(val)
                  clearError("permUnionId")
                }}
                disabled={!permUpazilaId}
              >
                <SelectTrigger
                  className={`w-full rounded-xl border border-border bg-muted/30 py-2.5 px-4 font-body text-xs sm:text-sm text-foreground h-11 justify-between focus:border-primary/40 focus:ring-2 focus:ring-primary/20 cursor-pointer disabled:opacity-50 ${
                    errors.permUnionId ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <SelectValue placeholder={permUpazilaId ? "ইউনিয়ন নির্বাচন করুন" : "প্রথমে উপজেলা সিলেক্ট করুন"} />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border shadow-xl rounded-xl text-popover-foreground">
                  {permUnions.map((u: any) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.nameBn || u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.permUnionId && (
                <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.permUnionId}</p>
              )}
            </div>

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

            <div className={showEnglishFields ? "grid grid-cols-1 sm:grid-cols-2 gap-5" : "space-y-1.5"}>
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

              {showEnglishFields && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
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
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
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

            <div className={showEnglishFields ? "grid grid-cols-1 sm:grid-cols-2 gap-5 col-span-2 sm:col-span-1" : "space-y-1.5"}>
              <div className="space-y-1.5">
                <Label className="block text-xs font-semibold text-muted-foreground font-display">
                  রাস্তা
                </Label>
                <div className="relative group font-body">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                  <Input
                    value={permRoadBn}
                    onChange={(e) => setPermRoadBn(e.target.value)}
                    placeholder="রাস্তা/পাড়া"
                    className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all"
                  />
                </div>
              </div>

              {showEnglishFields && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
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
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-muted-foreground font-display">
                ডাকঘর <span className="text-destructive">*</span>
              </Label>
              <Select
                value={permPostId}
                onValueChange={(val) => {
                  setPermPostId(val)
                  const selected = permPosts.find((p: any) => p.id === val)
                  if (selected) {
                    setPermPostOfficeBn(selected.postOfficeBn || selected.postOffice)
                    setPermPostCode(selected.postCode)
                  } else {
                    setPermPostOfficeBn("")
                    setPermPostCode("")
                  }
                  clearError("permPostOfficeBn")
                  clearError("permPostCode")
                }}
                disabled={!permUpazilaId}
              >
                <SelectTrigger
                  className={`w-full rounded-xl border border-border bg-muted/30 py-2.5 px-4 font-body text-xs sm:text-sm text-foreground h-11 justify-between focus:border-primary/40 focus:ring-2 focus:ring-primary/20 cursor-pointer disabled:opacity-50 ${
                    errors.permPostOfficeBn ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Building2 className="h-4 w-4 text-primary shrink-0" />
                    <SelectValue placeholder={permUpazilaId ? "ডাকঘর নির্বাচন করুন" : "প্রথমে উপজেলা সিলেক্ট করুন"} />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border shadow-xl rounded-xl text-popover-foreground">
                  {permPosts.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.postOfficeBn || p.postOffice} ({p.postCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.permPostOfficeBn && (
                <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.permPostOfficeBn}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="block text-xs font-semibold text-muted-foreground font-display">
                ডাক কোড <span className="text-destructive">*</span>
              </Label>
              <div className="relative group font-body">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
                <Input
                  value={permPostCode}
                  readOnly
                  placeholder="ডাক কোড"
                  className={`bg-muted/10 border-border text-foreground placeholder:text-muted-foreground pl-10 h-11 rounded-xl text-sm transition-all font-mono cursor-not-allowed ${
                    errors.permPostCode ? "border-destructive" : ""
                  }`}
                />
              </div>
              {errors.permPostCode && (
                <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.permPostCode}</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-10 text-center border border-dashed rounded-xl text-muted-foreground text-xs sm:text-sm bg-muted/10 font-body animate-in fade-in duration-350">
          স্থায়ী ঠিকানা বর্তমান ঠিকানার অনুরূপ হিসেবে সফলভাবে লিংক করা হয়েছে।
        </div>
      )}
    </div>
  )
}
