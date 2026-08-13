"use client"

import { Label } from "@workspace/ui/components/label"
import { Input } from "@workspace/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { DatePicker } from "@workspace/ui/components/date-picker"
import { User, Users, BookOpen, Heart, Home, Briefcase, GraduationCap } from "lucide-react"
import {
  GENDER_OPTIONS,
  RELIGION_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  RESIDENT_TYPE_OPTIONS,
} from "@workspace/utils"

interface PersonalInfoStepProps {
  nameBn: string
  setNameBn: (val: string) => void
  nameEn: string
  setNameEn: (val: string) => void
  fatherNameBn: string
  setFatherNameBn: (val: string) => void
  fatherNameEn: string
  setFatherNameEn: (val: string) => void
  motherNameBn: string
  setMotherNameBn: (val: string) => void
  motherNameEn: string
  setMotherNameEn: (val: string) => void
  dob: Date | undefined
  setDob: (val: Date | undefined) => void
  gender: string
  setGender: (val: string) => void
  religion: string
  setReligion: (val: string) => void
  maritalStatus: string
  setMaritalStatus: (val: string) => void
  residentType: string
  setResidentType: (val: string) => void
  occupation: string
  setOccupation: (val: string) => void
  education: string
  setEducation: (val: string) => void
  showEnglishFields: boolean
  errors: Record<string, string>
  clearError: (field: string) => void
}

export function PersonalInfoStep({
  nameBn,
  setNameBn,
  nameEn,
  setNameEn,
  fatherNameBn,
  setFatherNameBn,
  fatherNameEn,
  setFatherNameEn,
  motherNameBn,
  setMotherNameBn,
  motherNameEn,
  setMotherNameEn,
  dob,
  setDob,
  gender,
  setGender,
  religion,
  setReligion,
  maritalStatus,
  setMaritalStatus,
  residentType,
  setResidentType,
  occupation,
  setOccupation,
  education,
  setEducation,
  showEnglishFields,
  errors,
  clearError,
}: PersonalInfoStepProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Name fields */}
      <div className={showEnglishFields ? "grid grid-cols-1 sm:grid-cols-2 gap-5" : "space-y-5"}>
        <div className="space-y-1.5">
          <Label className="block text-xs font-semibold text-muted-foreground font-display">
            আবেদনকারীর নাম <span className="text-destructive">*</span>
          </Label>
          <div className="relative group font-body">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
            <Input
              value={nameBn}
              onChange={(e) => {
                setNameBn(e.target.value)
                clearError("nameBn")
              }}
              placeholder="যেমন: মোঃ আবদুর রহমান"
              className={`bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all ${errors.nameBn ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
                }`}
            />
          </div>
          {errors.nameBn && (
            <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.nameBn}</p>
          )}
        </div>

        {showEnglishFields && (
          <div className="space-y-1.5 animate-in fade-in duration-200">
            <Label className="block text-xs font-semibold text-muted-foreground font-display">
              Name
            </Label>
            <div className="relative group font-body">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
              <Input
                value={nameEn}
                onChange={(e) => {
                  setNameEn(e.target.value)
                  clearError("nameEn")
                }}
                placeholder="e.g. Md. Abdur Rahman"
                className={`bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all ${errors.nameEn ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
                  }`}
              />
            </div>
            {errors.nameEn && (
              <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.nameEn}</p>
            )}
          </div>
        )}
      </div>

      {/* Father Name fields */}
      <div className={showEnglishFields ? "grid grid-cols-1 sm:grid-cols-2 gap-5" : "space-y-5"}>
        <div className="space-y-1.5">
          <Label className="block text-xs font-semibold text-muted-foreground font-display">
            পিতার নাম <span className="text-destructive">*</span>
          </Label>
          <div className="relative group font-body">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
            <Input
              value={fatherNameBn}
              onChange={(e) => {
                setFatherNameBn(e.target.value)
                clearError("fatherNameBn")
              }}
              placeholder="পিতার নাম"
              className={`bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all ${errors.fatherNameBn ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
                }`}
            />
          </div>
          {errors.fatherNameBn && (
            <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.fatherNameBn}</p>
          )}
        </div>

        {showEnglishFields && (
          <div className="space-y-1.5 animate-in fade-in duration-200">
            <Label className="block text-xs font-semibold text-muted-foreground font-display">
              Father's Name
            </Label>
            <div className="relative group font-body">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
              <Input
                value={fatherNameEn}
                onChange={(e) => {
                  setFatherNameEn(e.target.value)
                  clearError("fatherNameEn")
                }}
                placeholder="Father's Name"
                className={`bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all ${errors.fatherNameEn ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
                  }`}
              />
            </div>
            {errors.fatherNameEn && (
              <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.fatherNameEn}</p>
            )}
          </div>
        )}
      </div>

      {/* Mother Name fields */}
      <div className={showEnglishFields ? "grid grid-cols-1 sm:grid-cols-2 gap-5" : "space-y-5"}>
        <div className="space-y-1.5">
          <Label className="block text-xs font-semibold text-muted-foreground font-display">
            মাতার নাম <span className="text-destructive">*</span>
          </Label>
          <div className="relative group font-body">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
            <Input
              value={motherNameBn}
              onChange={(e) => {
                setMotherNameBn(e.target.value)
                clearError("motherNameBn")
              }}
              placeholder="মাতার নাম"
              className={`bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all ${errors.motherNameBn ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
                }`}
            />
          </div>
          {errors.motherNameBn && (
            <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.motherNameBn}</p>
          )}
        </div>

        {showEnglishFields && (
          <div className="space-y-1.5 animate-in fade-in duration-200">
            <Label className="block text-xs font-semibold text-muted-foreground font-display">
              Mother's Name
            </Label>
            <div className="relative group font-body">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
              <Input
                value={motherNameEn}
                onChange={(e) => {
                  setMotherNameEn(e.target.value)
                  clearError("motherNameEn")
                }}
                placeholder="Mother's Name"
                className={`bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all ${errors.motherNameEn ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
                  }`}
              />
            </div>
            {errors.motherNameEn && (
              <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.motherNameEn}</p>
            )}
          </div>
        )}
      </div>

      {/* DOB, Gender, Religion */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="space-y-1.5">
          <Label className="block text-xs font-semibold text-muted-foreground font-display">
            জন্ম তারিখ <span className="text-destructive">*</span>
          </Label>
          <div className={errors.dob ? "[&>button]:border-destructive [&>button]:focus:border-destructive [&>button]:focus:ring-destructive/20" : ""}>
            <DatePicker
              date={dob}
              setDate={(date) => {
                setDob(date)
                clearError("dob")
              }}
              placeholder="জন্ম তারিখ নির্বাচন করুন"
              captionLayout="dropdown"
              startMonth={new Date(1900, 0)}
              endMonth={new Date()}
            />
          </div>
          {errors.dob && (
            <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.dob}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="block text-xs font-semibold text-muted-foreground font-display">
            লিঙ্গ <span className="text-destructive">*</span>
          </Label>
          <Select
            value={gender}
            onValueChange={(val) => {
              setGender(val)
              clearError("gender")
            }}
          >
            <SelectTrigger
              className={`w-full rounded-xl border border-border bg-muted/30 py-2.5 px-4 font-body text-xs sm:text-sm text-foreground h-11 justify-between focus:border-primary/40 focus:ring-2 focus:ring-primary/20 cursor-pointer ${errors.gender ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
                }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Users className="h-4 w-4 text-primary shrink-0" />
                <SelectValue placeholder="লিঙ্গ নির্বাচন করুন" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-xl rounded-xl text-popover-foreground">
              {GENDER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.gender && (
            <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.gender}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="block text-xs font-semibold text-muted-foreground font-display">
            ধর্ম <span className="text-destructive">*</span>
          </Label>
          <Select
            value={religion}
            onValueChange={(val) => {
              setReligion(val)
              clearError("religion")
            }}
          >
            <SelectTrigger
              className={`w-full rounded-xl border border-border bg-muted/30 py-2.5 px-4 font-body text-xs sm:text-sm text-foreground h-11 justify-between focus:border-primary/40 focus:ring-2 focus:ring-primary/20 cursor-pointer ${errors.religion ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
                }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <BookOpen className="h-4 w-4 text-primary shrink-0" />
                <SelectValue placeholder="ধর্ম নির্বাচন করুন" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-xl rounded-xl text-popover-foreground">
              {RELIGION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.religion && (
            <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.religion}</p>
          )}
        </div>
      </div>

      {/* Marital Status, Resident Type, Occupation, Education */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="space-y-1.5">
          <Label className="block text-xs font-semibold text-muted-foreground font-display">
            বৈবাহিক অবস্থা <span className="text-destructive">*</span>
          </Label>
          <Select
            value={maritalStatus}
            onValueChange={(val) => {
              setMaritalStatus(val)
              clearError("maritalStatus")
            }}
          >
            <SelectTrigger
              className={`w-full rounded-xl border border-border bg-muted/30 py-2.5 px-4 font-body text-xs sm:text-sm text-foreground h-11 justify-between focus:border-primary/40 focus:ring-2 focus:ring-primary/20 cursor-pointer ${errors.maritalStatus ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
                }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Heart className="h-4 w-4 text-primary shrink-0" />
                <SelectValue placeholder="বৈবাহিক অবস্থা" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-xl rounded-xl text-popover-foreground">
              {MARITAL_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.maritalStatus && (
            <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.maritalStatus}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="block text-xs font-semibold text-muted-foreground font-display">
            বাসিন্দার ধরন <span className="text-destructive">*</span>
          </Label>
          <Select
            value={residentType}
            onValueChange={(val) => {
              setResidentType(val)
              clearError("residentType")
            }}
          >
            <SelectTrigger
              className={`w-full rounded-xl border border-border bg-muted/30 py-2.5 px-4 font-body text-xs sm:text-sm text-foreground h-11 justify-between focus:border-primary/40 focus:ring-2 focus:ring-primary/20 cursor-pointer ${errors.residentType ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
                }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Home className="h-4 w-4 text-primary shrink-0" />
                <SelectValue placeholder="বাসিন্দার ধরন" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-xl rounded-xl text-popover-foreground">
              {RESIDENT_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.residentType && (
            <p className="text-[11px] text-destructive font-semibold font-body mt-1">{errors.residentType}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="block text-xs font-semibold text-muted-foreground font-display">
            পেশা
          </Label>
          <div className="relative group font-body">
            <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
            <Input
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              placeholder="যেমন: ব্যবসা, ছাত্র, গৃহিণী"
              className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="block text-xs font-semibold text-muted-foreground font-display">
            শিক্ষাগত যোগ্যতা
          </Label>
          <div className="relative group font-body">
            <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors h-4 w-4" />
            <Input
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="শিক্ষাগত যোগ্যতা"
              className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:bg-muted/50 focus:border-primary/40 focus:ring-primary/20 focus:ring-2 pl-10 h-11 rounded-xl text-sm transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
