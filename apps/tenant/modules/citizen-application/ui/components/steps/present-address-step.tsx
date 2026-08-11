"use client"

import { Label } from "@workspace/ui/components/label"
import { Input } from "@workspace/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { MapPin, Home, Hash, Building2 } from "lucide-react"

interface PresentAddressStepProps {
  presDivisionId: string
  presDistrictId: string
  presUpazilaId: string
  presUnionId: string
  presWardId: string
  presVillageBn: string
  presVillageEn: string
  presHoldingNo: string
  presRoadBn: string
  presRoadEn: string
  presPostId: string
  presPostOfficeBn: string
  presPostCode: string
  setPresPostOfficeBn: (val: string) => void
  setPresPostId: (val: string) => void
  setPresPostCode: (val: string) => void
  setPresVillageBn: (val: string) => void
  setPresVillageEn: (val: string) => void
  setPresHoldingNo: (val: string) => void
  setPresRoadBn: (val: string) => void
  setPresRoadEn: (val: string) => void
  setPresWardId: (val: string) => void
  handlePresDivisionChange: (val: string) => void
  handlePresDistrictChange: (val: string) => void
  handlePresUpazilaChange: (val: string) => void
  handlePresUnionChange: (val: string) => void
  presDivisions: any[]
  presDistricts: any[]
  presUpazilas: any[]
  presUnions: any[]
  presPosts: any[]
  wards: any[]
  showEnglishFields: boolean
  errors: Record<string, string>
  clearError: (field: string) => void
}

export function PresentAddressStep({
  presDivisionId,
  presDistrictId,
  presUpazilaId,
  presUnionId,
  presWardId,
  presVillageBn,
  presVillageEn,
  presHoldingNo,
  presRoadBn,
  presRoadEn,
  presPostId,
  presPostOfficeBn,
  presPostCode,
  setPresPostOfficeBn,
  setPresPostId,
  setPresPostCode,
  setPresVillageBn,
  setPresVillageEn,
  setPresHoldingNo,
  setPresRoadBn,
  setPresRoadEn,
  setPresWardId,
  handlePresDivisionChange,
  handlePresDistrictChange,
  handlePresUpazilaChange,
  handlePresUnionChange,
  presDivisions,
  presDistricts,
  presUpazilas,
  presUnions,
  presPosts,
  wards,
  showEnglishFields,
  errors,
  clearError,
}: PresentAddressStepProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="space-y-1.5">
          <Label className="block text-xs font-semibold text-muted-foreground font-display">
            বিভাগ <span className="text-destructive">*</span>
          </Label>
          <Select
            value={presDivisionId}
            onValueChange={(val) => {
              handlePresDivisionChange(val)
              clearError("presDivisionId")
            }}
          >
            <SelectTrigger
              className={`w-full rounded-xl border border-border bg-muted/30 py-2.5 px-4 font-body text-xs sm:text-sm text-foreground h-11 justify-between focus:border-primary/40 focus:ring-2 focus:ring-primary/20 cursor-pointer ${
                errors.presDivisionId ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-xl rounded-xl text-popover-foreground">
              {presDivisions.map((d: any) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.nameBn || d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.presDivisionId && (
            <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.presDivisionId}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="block text-xs font-semibold text-muted-foreground font-display">
            জেলা <span className="text-destructive">*</span>
          </Label>
          <Select
            value={presDistrictId}
            onValueChange={(val) => {
              handlePresDistrictChange(val)
              clearError("presDistrictId")
            }}
            disabled={!presDivisionId}
          >
            <SelectTrigger
              className={`w-full rounded-xl border border-border bg-muted/30 py-2.5 px-4 font-body text-xs sm:text-sm text-foreground h-11 justify-between focus:border-primary/40 focus:ring-2 focus:ring-primary/20 cursor-pointer disabled:opacity-50 ${
                errors.presDistrictId ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <SelectValue placeholder={presDivisionId ? "জেলা নির্বাচন করুন" : "প্রথমে বিভাগ সিলেক্ট করুন"} />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-xl rounded-xl text-popover-foreground">
              {presDistricts.map((d: any) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.nameBn || d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.presDistrictId && (
            <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.presDistrictId}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="block text-xs font-semibold text-muted-foreground font-display">
            উপজেলা <span className="text-destructive">*</span>
          </Label>
          <Select
            value={presUpazilaId}
            onValueChange={(val) => {
              handlePresUpazilaChange(val)
              clearError("presUpazilaId")
            }}
            disabled={!presDistrictId}
          >
            <SelectTrigger
              className={`w-full rounded-xl border border-border bg-muted/30 py-2.5 px-4 font-body text-xs sm:text-sm text-foreground h-11 justify-between focus:border-primary/40 focus:ring-2 focus:ring-primary/20 cursor-pointer disabled:opacity-50 ${
                errors.presUpazilaId ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <SelectValue placeholder={presDistrictId ? "উপজেলা নির্বাচন করুন" : "প্রথমে জেলা সিলেক্ট করুন"} />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-xl rounded-xl text-popover-foreground">
              {presUpazilas.map((u: any) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.nameBn || u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.presUpazilaId && (
            <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.presUpazilaId}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="space-y-1.5">
          <Label className="block text-xs font-semibold text-muted-foreground font-display">
            ইউনিয়ন <span className="text-destructive">*</span>
          </Label>
          <Select
            value={presUnionId}
            onValueChange={(val) => {
              handlePresUnionChange(val)
              clearError("presUnionId")
            }}
            disabled={!presUpazilaId}
          >
            <SelectTrigger
              className={`w-full rounded-xl border border-border bg-muted/30 py-2.5 px-4 font-body text-xs sm:text-sm text-foreground h-11 justify-between focus:border-primary/40 focus:ring-2 focus:ring-primary/20 cursor-pointer disabled:opacity-50 ${
                errors.presUnionId ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <SelectValue placeholder={presUpazilaId ? "ইউনিয়ন নির্বাচন করুন" : "প্রথমে উপজেলা সিলেক্ট করুন"} />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-xl rounded-xl text-popover-foreground">
              {presUnions.map((u: any) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.nameBn || u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.presUnionId && (
            <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.presUnionId}</p>
          )}
        </div>

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

        <div className={showEnglishFields ? "grid grid-cols-1 sm:grid-cols-2 gap-5" : "space-y-1.5"}>
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

          {showEnglishFields && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
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
              value={presHoldingNo}
              onChange={(e) => setPresHoldingNo(e.target.value)}
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
                value={presRoadBn}
                onChange={(e) => setPresRoadBn(e.target.value)}
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
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="block text-xs font-semibold text-muted-foreground font-display">
            ডাকঘর <span className="text-destructive">*</span>
          </Label>
          <Select
            value={presPostId}
            onValueChange={(val) => {
              setPresPostId(val)
              const selected = presPosts.find((p: any) => p.id === val)
              if (selected) {
                setPresPostOfficeBn(selected.postOfficeBn || selected.postOffice)
                setPresPostCode(selected.postCode)
              } else {
                setPresPostOfficeBn("")
                setPresPostCode("")
              }
              clearError("presPostOfficeBn")
              clearError("presPostCode")
            }}
            disabled={!presUpazilaId}
          >
            <SelectTrigger
              className={`w-full rounded-xl border border-border bg-muted/30 py-2.5 px-4 font-body text-xs sm:text-sm text-foreground h-11 justify-between focus:border-primary/40 focus:ring-2 focus:ring-primary/20 cursor-pointer disabled:opacity-50 ${
                errors.presPostOfficeBn ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Building2 className="h-4 w-4 text-primary shrink-0" />
                <SelectValue placeholder={presUpazilaId ? "ডাকঘর নির্বাচন করুন" : "প্রথমে উপজেলা সিলেক্ট করুন"} />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-xl rounded-xl text-popover-foreground">
              {presPosts.map((p: any) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.postOfficeBn || p.postOffice} ({p.postCode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.presPostOfficeBn && (
            <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.presPostOfficeBn}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="block text-xs font-semibold text-muted-foreground font-display">
            ডাক কোড <span className="text-destructive">*</span>
          </Label>
          <div className="relative group font-body">
            <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
            <Input
              value={presPostCode}
              readOnly
              placeholder="ডাক কোড"
              className={`bg-muted/10 border-border text-foreground placeholder:text-muted-foreground pl-10 h-11 rounded-xl text-sm transition-all font-mono cursor-not-allowed ${
                errors.presPostCode ? "border-destructive" : ""
              }`}
            />
          </div>
          {errors.presPostCode && (
            <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.presPostCode}</p>
          )}
        </div>
      </div>
    </div>
  )
}
