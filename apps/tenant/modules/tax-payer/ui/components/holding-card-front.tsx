"use client"

import React from "react"
import { QRCodeSVG } from "qrcode.react"
import type { TenantInfo } from "@/modules/layout/ui/components/tenant-provider"

export interface TaxPayerCardData {
  id: string
  name: string
  fatherName?: string | null
  holding: string
  ward?: {
    id?: string
    name?: string
    nameBn?: string | null
  } | null
  village: string
  tax: number
  phone?: string | null
  nid?: string | null
}

interface CardFrontProps {
  taxPayer: TaxPayerCardData
  tenant: Partial<TenantInfo> & {
    name: string
    nameBn?: string | null
    unionName?: string | null
    upazilaName?: string | null
    districtName?: string | null
    logo?: string | null
    chairmanName?: string | null
  }
  forExport?: boolean
}

const BENGALI_FONT_FAMILY = "'SolaimanLipi', sans-serif"
const BENGALI_TEXT_STYLE: React.CSSProperties = {
  fontFamily: BENGALI_FONT_FAMILY,
  lineHeight: 1.25,
}

const LABEL_GREEN = "#058749"
const LABEL_PURPLE = "#5C2E87"
const VALUE_BLACK = "#000000"

export const CardFront: React.FC<CardFrontProps> = ({ taxPayer, tenant, forExport = false }) => {
  const unionName = tenant.nameBn || tenant.unionName || tenant.name || "ইউনিয়ন পরিষদ"
  const upazila = tenant.upazilaName ? `উপজেলা ঃ ${tenant.upazilaName}` : ""
  const district = tenant.districtName ? `জেলা ঃ ${tenant.districtName}` : ""
  const subHeaderLocation = [upazila, district].filter(Boolean).join(", ")
  const locationDisplay = subHeaderLocation ? `${subHeaderLocation}।` : "উপজেলা ঃ নবাবগঞ্জ, জেলা ঃ নারায়ণগঞ্জ।"

  const wardName = taxPayer.ward?.nameBn || taxPayer.ward?.name || ""
  const logoUrl = tenant.logo || "/union-logo.png"

  const qrData = `https://bec-admin.cloud/tax-payers/${taxPayer.id}/preview`

  return (
    <div
      className={`bengali-text overflow-hidden relative flex flex-col select-none ${forExport ? "" : "rounded-sm"
        }`}
      style={{
        width: "3.3in",
        height: "2.05in",
        backgroundColor: "#FFFFFF",
        ...(forExport ? {} : { boxShadow: "0 1px 4px rgba(0,0,0,0.12)", border: "1px solid #000000" }),
        ...BENGALI_TEXT_STYLE,
      }}
    >
      <div className="flex flex-col h-full w-full px-2 py-1.5 relative z-10 justify-between">
        {/* Header Section */}
        <div className="relative text-center w-full">
          {/* GOB Logo Left */}
          <div className="absolute left-0 top-0 w-11 h-11 flex items-center justify-center z-20">
            <img src="/gob-logo.jpg" alt="সরকার" className="w-11 h-11 object-contain" />
          </div>

          {/* Union Logo Right */}
          <div className="absolute right-0 top-0 w-11 h-11 flex items-center justify-center z-20">
            <img src={logoUrl} alt="ইউনিয়ন পরিষদ" className="w-11 h-11 object-contain" />
          </div>

          {/* Header Titles */}
          <div className="px-10 flex flex-col items-center">
            {/* Top govt text */}
            <p
              style={{
                margin: 0,
                lineHeight: 1.1,
                fontSize: "9px",
                color: "#000000",
                fontWeight: "bold",
                ...BENGALI_TEXT_STYLE,
              }}
            >
              গণপ্রজাতন্ত্রী বাংলাদেশ সরকার (স্থানীয় সরকার বিভাগ)
            </p>

            {/* Union Name */}
            <h1
              style={{
                margin: "1px 0",
                lineHeight: 1.1,
                fontSize: "17px",
                fontWeight: "bold",
                color: "#e62224",
                letterSpacing: "-0.3px",
                ...BENGALI_TEXT_STYLE,
              }}
            >
              {unionName}
            </h1>

            {/* Sub-district & District */}
            <p
              style={{
                margin: 0,
                lineHeight: 1.1,
                fontSize: "9px",
                color: "#343580",
                fontWeight: "bold",
                ...BENGALI_TEXT_STYLE,
              }}
            >
              {locationDisplay}
            </p>

            {/* Badge */}
            <div className="mt-0.5">
              <span
                style={{
                  display: "inline-block",
                  fontSize: "9.5px",
                  fontWeight: "bold",
                  color: "#0A804E",
                  border: "1.5px solid #e62224",
                  padding: "0px 8px",
                  paddingTop: "1px",
                  backgroundColor: "#FFFFFF",
                  borderRadius: "4px",
                  lineHeight: "1.2",
                  ...BENGALI_TEXT_STYLE,
                }}
              >
                হোল্ডিং স্মার্ট কার্ড
              </span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="relative flex-1 flex items-center px-0.5 mt-0.5">
          {/* Watermark */}
          <div
            className="absolute inset-0 pointer-events-none flex items-center justify-center z-0"
            style={{ opacity: 0.35 }}
          >
            <img src="/bd-national-emblem.png" alt="" className="w-[85px] h-[85px] object-contain" />
          </div>

          {/* Info & QR Row */}
          <div className="flex w-full items-center justify-between z-10 relative">
            {/* Left Info Fields */}
            <div className="flex-1 space-y-0.5" style={{ lineHeight: 1.35 }}>
              {/* নাম */}
              <div className="flex items-center">
                <span
                  style={{
                    display: "inline-flex",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: LABEL_PURPLE,
                    whiteSpace: "nowrap",
                    width: "68px",
                    justifyContent: "space-between",
                    ...BENGALI_TEXT_STYLE,
                  }}
                >
                  <span>নাম</span>
                  <span className="mr-1">ঃ</span>
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: VALUE_BLACK,
                    flex: 1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    ...BENGALI_TEXT_STYLE,
                  }}
                >
                  {taxPayer.name}
                </span>
              </div>

              {/* হোল্ডিং নং */}
              <div className="flex items-center">
                <span
                  style={{
                    display: "inline-flex",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: LABEL_GREEN,
                    whiteSpace: "nowrap",
                    width: "68px",
                    justifyContent: "space-between",
                    ...BENGALI_TEXT_STYLE,
                  }}
                >
                  <span>হোল্ডিং নং</span>
                  <span className="mr-1">ঃ</span>
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: VALUE_BLACK,
                    flex: 1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    ...BENGALI_TEXT_STYLE,
                  }}
                >
                  {taxPayer.holding}
                </span>
              </div>

              {/* ওয়ার্ড নং */}
              <div className="flex items-center">
                <span
                  style={{
                    display: "inline-flex",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: LABEL_GREEN,
                    whiteSpace: "nowrap",
                    width: "68px",
                    justifyContent: "space-between",
                    ...BENGALI_TEXT_STYLE,
                  }}
                >
                  <span>ওয়ার্ড নং</span>
                  <span className="mr-1">ঃ</span>
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: VALUE_BLACK,
                    flex: 1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    ...BENGALI_TEXT_STYLE,
                  }}
                >
                  {wardName}
                </span>
              </div>

              {/* গ্রাম/মহল্লা */}
              <div className="flex items-center">
                <span
                  style={{
                    display: "inline-flex",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: LABEL_GREEN,
                    whiteSpace: "nowrap",
                    width: "68px",
                    justifyContent: "space-between",
                    ...BENGALI_TEXT_STYLE,
                  }}
                >
                  <span>গ্রাম/মহল্লা</span>
                  <span className="mr-1">ঃ</span>
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: VALUE_BLACK,
                    flex: 1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    ...BENGALI_TEXT_STYLE,
                  }}
                >
                  {taxPayer.village}
                </span>
              </div>

              {/* ধার্যকৃত কর */}
              <div className="flex items-center">
                <span
                  style={{
                    display: "inline-flex",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: LABEL_GREEN,
                    whiteSpace: "nowrap",
                    width: "68px",
                    justifyContent: "space-between",
                    ...BENGALI_TEXT_STYLE,
                  }}
                >
                  <span>ধার্যকৃত কর</span>
                  <span className="mr-1">ঃ</span>
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#D97706",
                    flex: 1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    ...BENGALI_TEXT_STYLE,
                  }}
                >
                  ৳{taxPayer.tax?.toLocaleString()}/-
                </span>
              </div>
            </div>

            {/* Right: QR code */}
            <div style={{ zIndex: 2, flexShrink: 0, marginLeft: "4px", position: "absolute", right: "0px", bottom: "-4px" }}>
              <QRCodeSVG
                value={qrData}
                size={80}
                level="M"
                fgColor="#000000"
                bgColor="transparent"
              />
            </div>
          </div>
        </div>

        {/* Bottom tax reminder text */}
        <div
          style={{
            textAlign: "center",
            fontSize: "11px",
            fontWeight: "bold",
            letterSpacing: "1px",
            ...BENGALI_TEXT_STYLE,
            color: "#962954",
            marginTop: "2px",
            lineHeight: 1.1,
          }}
        >
          * নিয়মিত ইউপি কর (ট্যাক্স) পরিশোধ করুন *
        </div>
      </div>
    </div>
  )
}
