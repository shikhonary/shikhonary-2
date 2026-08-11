"use client"

import { User, Phone, MapPin, AlertCircle } from "lucide-react"

interface ReviewStepProps {
  nameBn: string
  nameEn: string
  fatherNameBn: string
  fatherNameEn: string
  motherNameBn: string
  motherNameEn: string
  dob: string
  gender: string
  religion: string
  residentType: string
  mobile: string
  email: string
  nid: string
  birthRegNo: string
  passportNo: string
  presDivisionNameBn: string
  presDistrictNameBn: string
  presUpazilaNameBn: string
  presUnionNameBn: string
  presWardId: string
  presVillageBn: string
  presVillageEn: string
  presHoldingNo: string
  presRoadEn: string
  presPostOfficeBn: string
  presPostCode: string
  sameAsPresent: boolean
  permDivisionNameBn: string
  permDistrictNameBn: string
  permUpazilaNameBn: string
  permUnionNameBn: string
  permWardId: string
  permVillageBn: string
  permVillageEn: string
  permHoldingNo: string
  permRoadEn: string
  permPostOfficeBn: string
  permPostCode: string
  wards: any[]
  showEnglishFields: boolean
}

export function ReviewStep({
  nameBn,
  nameEn,
  fatherNameBn,
  fatherNameEn,
  motherNameBn,
  motherNameEn,
  dob,
  gender,
  religion,
  residentType,
  mobile,
  email,
  nid,
  birthRegNo,
  passportNo,
  presDivisionNameBn,
  presDistrictNameBn,
  presUpazilaNameBn,
  presUnionNameBn,
  presWardId,
  presVillageBn,
  presVillageEn,
  presHoldingNo,
  presRoadEn,
  presPostOfficeBn,
  presPostCode,
  sameAsPresent,
  permDivisionNameBn,
  permDistrictNameBn,
  permUpazilaNameBn,
  permUnionNameBn,
  permWardId,
  permVillageBn,
  permVillageEn,
  permHoldingNo,
  permRoadEn,
  permPostOfficeBn,
  permPostCode,
  wards,
  showEnglishFields,
}: ReviewStepProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-xs sm:text-sm">
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-primary flex gap-2">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <p>অনুগ্রহ করে তথ্য দাখিল করার পূর্বে আবেদনকারীর সকল বিবরণ সতর্কতার সাথে যাচাই করে নিন।</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal details review */}
        <div className="space-y-3 p-4 rounded-xl border bg-muted/5">
          <h4 className="font-bold text-foreground border-b pb-1.5 flex items-center gap-1.5 font-display">
            <User className="h-4 w-4 text-primary" /> ব্যক্তিগত বিবরণী
          </h4>
          <div className="grid grid-cols-2 gap-x-2 gap-y-2 font-body">
            <span className="text-muted-foreground">আবেদনকারী:</span>
            <span className="font-semibold text-foreground">{nameBn}</span>
            {showEnglishFields && (
              <>
                <span className="text-muted-foreground">আবেদনকারী:</span>
                <span className="font-semibold text-foreground">{nameEn || "N/A"}</span>
              </>
            )}
            <span className="text-muted-foreground">পিতার নাম:</span>
            <span className="font-semibold text-foreground">{fatherNameBn}</span>
            {showEnglishFields && (
              <>
                  <span className="text-muted-foreground">পিতার নাম:</span>
                <span className="font-semibold text-foreground">{fatherNameEn || "N/A"}</span>
              </>
            )}
            <span className="text-muted-foreground">মাতার নাম:</span>
            <span className="font-semibold text-foreground">{motherNameBn}</span>
            {showEnglishFields && (
              <>
                  <span className="text-muted-foreground">মাতার নাম:</span>
                <span className="font-semibold text-foreground">{motherNameEn || "N/A"}</span>
              </>
            )}
            <span className="text-muted-foreground">জন্ম তারিখ:</span>
            <span className="font-semibold text-foreground">{dob || "N/A"}</span>
            <span className="text-muted-foreground">লিঙ্গ:</span>
            <span className="font-semibold text-foreground">
              {gender === "MALE" ? "पुरुष" : gender === "FEMALE" ? "মহিলা" : "অন্যান্য"}
            </span>
            <span className="text-muted-foreground">ধর্ম:</span>
            <span className="font-semibold text-foreground">{religion}</span>
            <span className="text-muted-foreground">বাসিন্দার ধরন:</span>
            <span className="font-semibold text-foreground">{residentType === "PERMANENT" ? "স্থায়ী" : "অস্থায়ী"}</span>
          </div>
        </div>

        {/* Contact & Identity review */}
        <div className="space-y-3 p-4 rounded-xl border bg-muted/5">
          <h4 className="font-bold text-foreground border-b pb-1.5 flex items-center gap-1.5 font-display">
            <Phone className="h-4 w-4 text-primary" /> যোগাযোগ ও পরিচয়পত্র
          </h4>
          <div className="grid grid-cols-2 gap-x-2 gap-y-2 font-body">
            <span className="text-muted-foreground">মোবাইল নম্বর:</span>
            <span className="font-semibold text-foreground">{mobile}</span>
            <span className="text-muted-foreground">ইমেইল ঠিকানা:</span>
            <span className="font-semibold text-foreground">{email || "N/A"}</span>
            <span className="text-muted-foreground">NID নম্বর:</span>
            <span className="font-semibold text-foreground">{nid || "N/A"}</span>
            <span className="text-muted-foreground">জন্ম নিবন্ধন নং:</span>
            <span className="font-semibold text-foreground">{birthRegNo || "N/A"}</span>
            <span className="text-muted-foreground">পাসপোর্ট নং:</span>
            <span className="font-semibold text-foreground">{passportNo || "N/A"}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Present Address review */}
        <div className="space-y-3 p-4 rounded-xl border bg-muted/5">
          <h4 className="font-bold text-foreground border-b pb-1.5 flex items-center gap-1.5 font-display">
            <MapPin className="h-4 w-4 text-primary" /> বর্তমান ঠিকানা
          </h4>
          <div className="grid grid-cols-2 gap-x-2 gap-y-2 font-body">
            <span className="text-muted-foreground">বিভাগ ও জেলা:</span>
            <span className="font-semibold text-foreground">{presDivisionNameBn}, {presDistrictNameBn}</span>
            <span className="text-muted-foreground">উপজেলা ও ইউনিয়ন:</span>
            <span className="font-semibold text-foreground">{presUpazilaNameBn}, {presUnionNameBn}</span>
            <span className="text-muted-foreground">ওয়ার্ড নম্বর:</span>
            <span className="font-semibold text-foreground">
              {wards.find((w) => w.id === presWardId)?.nameBn || "N/A"}
            </span>
            <span className="text-muted-foreground">গ্রাম ও হোল্ডিং:</span>
            <span className="font-semibold text-foreground">
              {presVillageBn} {showEnglishFields && presVillageEn ? `(${presVillageEn})` : ""} {presHoldingNo ? `(হোল্ডিং: ${presHoldingNo})` : ""}
            </span>
            {showEnglishFields && presRoadEn && (
              <>
                <span className="text-muted-foreground">রাস্তা:</span>
                <span className="font-semibold text-foreground">{presRoadEn}</span>
              </>
            )}
            <span className="text-muted-foreground">ডাকঘর ও কোড:</span>
            <span className="font-semibold text-foreground">{presPostOfficeBn} ({presPostCode})</span>
          </div>
        </div>

        {/* Permanent Address review */}
        <div className="space-y-3 p-4 rounded-xl border bg-muted/5">
          <h4 className="font-bold text-foreground border-b pb-1.5 flex items-center gap-1.5 font-display">
            <MapPin className="h-4 w-4 text-primary" /> স্থায়ী ঠিকানা
          </h4>
          {sameAsPresent ? (
            <div className="flex h-3/4 items-center justify-center text-muted-foreground text-xs italic font-body">
              বর্তমান এবং স্থায়ী ঠিকানা একই
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-2 gap-y-2 font-body">
              <span className="text-muted-foreground">বিভাগ ও জেলা:</span>
              <span className="font-semibold text-foreground">{permDivisionNameBn}, {permDistrictNameBn}</span>
              <span className="text-muted-foreground">উপজেলা ও ইউনিয়ন:</span>
              <span className="font-semibold text-foreground">{permUpazilaNameBn}, {permUnionNameBn}</span>
              <span className="text-muted-foreground">ওয়ার্ড নম্বর:</span>
              <span className="font-semibold text-foreground">
                {wards.find((w) => w.id === permWardId)?.nameBn || "N/A"}
              </span>
              <span className="text-muted-foreground">গ্রাম ও হোল্ডিং:</span>
              <span className="font-semibold text-foreground">
                {permVillageBn} {showEnglishFields && permVillageEn ? `(${permVillageEn})` : ""} {permHoldingNo ? `(হোল্ডিং: ${permHoldingNo})` : ""}
              </span>
              {showEnglishFields && permRoadEn && (
                <>
                  <span className="text-muted-foreground">রাস্তা:</span>
                  <span className="font-semibold text-foreground">{permRoadEn}</span>
                </>
              )}
              <span className="text-muted-foreground">ডাকঘর ও কোড:</span>
              <span className="font-semibold text-foreground">{permPostOfficeBn} ({permPostCode})</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
