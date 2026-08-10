"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { trpc } from "@/trpc/client"
import { useTenant } from "@/modules/layout/ui/components/tenant-provider"
import { Button } from "@workspace/ui/components/button"
import { Printer, ArrowLeft, Loader2, AlertCircle } from "lucide-react"

interface TaxReceiptPrintViewProps {
  paymentId: string
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div style={{ display: "flex", marginBottom: "2px", fontSize: "11.5px", lineHeight: "1.4", color: "#000" }}>
      <span style={{ width: "115px", flexShrink: 0, color: "#000" }}>{label}</span>
      <span style={{ color: "#000" }}>: {value}</span>
    </div>
  )
}

interface ReceiptSlipProps {
  copyLabel: string
  tenantName: string
  locationString: string
  tenant: any
  payment: any
  taxPayer: any
  fiscalYear: any
}

function ReceiptSlip({ copyLabel, tenantName, locationString, tenant, payment, taxPayer, fiscalYear }: ReceiptSlipProps) {
  return (
    <div className="receipt-slip" style={{ background: "white", padding: "10px 14px", border: "1px solid #94a3b8", borderRadius: "4px", color: "#000" }}>
      {/* Copy badge */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "4px" }}>
        <span style={{ fontSize: "10px", fontWeight: "700", border: "1px solid #334155", padding: "1px 7px", borderRadius: "3px", background: "#f8fafc", color: "#000" }}>
          {copyLabel}
        </span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "2px solid #000", paddingBottom: "7px", marginBottom: "8px" }}>
        {/* Left logo */}
        <div className="receipt-header-logo-box" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "70px", flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="receipt-header-logo" src="/gob-logo.jpg" alt="GOB" style={{ width: "64px", height: "64px", objectFit: "contain" }} />
        </div>
        {/* Center text */}
        <div style={{ textAlign: "center", color: "#000", padding: "0 6px" }}>
          <div style={{ fontSize: "18px", fontWeight: "900", color: "#1d4ed8", lineHeight: 1.2 }}>{tenantName}</div>
          {locationString && <div style={{ fontSize: "11px", fontWeight: "700", marginTop: "1px", color: "#000" }}>{locationString}</div>}
          {(tenant.phone || tenant.email) && (
            <div style={{ fontSize: "10.5px", fontWeight: "600", marginTop: "1px", color: "#000" }}>
              {tenant.phone ? `মোবাইল: ${tenant.phone}` : ""}
              {tenant.phone && tenant.email ? ", " : ""}
              {tenant.email ? `ই-মেইল: ${tenant.email}` : ""}
            </div>
          )}
          <div style={{ fontSize: "10.5px", marginTop: "1px", color: "#000" }}>
            ওয়েবসাইট : {tenant?.website || `https://${tenant.slug}.uphub.gov.bd`}
          </div>
        </div>
        {/* Right logo */}
        <div className="receipt-header-logo-box" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "70px", flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="receipt-header-logo" src="/union-logo.jpg" alt="UP" style={{ width: "64px", height: "64px", objectFit: "contain" }} />
        </div>
      </div>

      {/* Document title */}
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <span style={{ fontSize: "13px", fontWeight: "800", borderBottom: "2px solid #000", paddingBottom: "1px", textTransform: "uppercase", letterSpacing: "0.3px", color: "#000" }}>
          হোল্ডিং কর আদায় রসিদ পত্র
        </span>
      </div>

      {/* Section 1 */}
      <div style={{ borderBottom: "1px solid #000", paddingBottom: "7px", marginBottom: "8px" }}>
        <div style={{ fontSize: "11.5px", fontWeight: "700", textDecoration: "underline", marginBottom: "5px", color: "#000" }}>১. করদাতা ও চালানের বিবরণ</div>
        <div className="receipt-section1-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px", color: "#000" }}>
          <div>
            <Row label="আদায়ের তারিখ" value={new Date(payment.paymentDate).toLocaleDateString("bn-BD")} />
            <Row label="রসিদ নম্বর" value={payment.receiptNo || "N/A"} />
            <Row label="অর্থবছর" value={fiscalYear?.year || "N/A"} />
            <Row label="করদাতার নাম" value={taxPayer?.name} />
            {taxPayer?.fatherName && <Row label="পিতার নাম" value={taxPayer.fatherName} />}
          </div>
          <div>
            <Row label="হোল্ডিং নম্বর" value={`#${taxPayer?.holding}`} />
            <Row label="ওয়ার্ড নম্বর" value={taxPayer?.ward?.nameBn || taxPayer?.ward?.name} />
            <Row label="গ্রাম / মহল্লা" value={taxPayer?.village} />
            {taxPayer?.phone && <Row label="মোবাইল নম্বর" value={taxPayer.phone} />}
            {taxPayer?.nid && <Row label="জাতীয় পরিচয়পত্র" value={taxPayer.nid} />}
          </div>
        </div>
      </div>

      {/* Section 2 */}
      <div style={{ marginBottom: "8px" }}>
        <div style={{ fontSize: "11.5px", fontWeight: "700", textDecoration: "underline", marginBottom: "5px", color: "#000" }}>২. কর ধার্য ও আদায় হিসাব বিবরণী</div>
        <div className="receipt-table-wrap">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11.5px", color: "#000" }}>
          <thead>
            <tr style={{ background: "#f1f5f9" }}>
              <th style={{ border: "1px solid #334155", padding: "4px 7px", textAlign: "left", width: "33%", color: "#000" }}>বিবরণ</th>
              <th style={{ border: "1px solid #334155", padding: "4px 7px", textAlign: "right", width: "25%", color: "#000" }}>টাকার পরিমাণ (৳)</th>
              <th style={{ border: "1px solid #334155", padding: "4px 7px", textAlign: "left", color: "#000" }}>পরিশোধের তথ্য</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #334155", padding: "4px 7px", color: "#000" }}>বাৎসরিক ধার্যকৃত কর</td>
              <td style={{ border: "1px solid #334155", padding: "4px 7px", textAlign: "right", fontWeight: "700", color: "#000" }}>
                ৳ {(taxPayer?.tax || payment.amount)?.toLocaleString()}
              </td>
              <td style={{ border: "1px solid #334155", padding: "4px 7px", color: "#000" }}>ইউনিয়ন পরিষদ বাৎসরিক কর অ্যাসেসমেন্ট</td>
            </tr>
            <tr style={{ background: "#f0fdf4" }}>
              <td style={{ border: "1px solid #334155", padding: "4px 7px", fontWeight: "700", color: "#065f46" }}>আদায়কৃত মোট হোল্ডিং কর</td>
              <td style={{ border: "1px solid #334155", padding: "4px 7px", textAlign: "right", fontWeight: "800", color: "#047857" }}>
                ৳ {payment.amount?.toLocaleString()}
              </td>
              <td style={{ border: "1px solid #334155", padding: "4px 7px", fontWeight: "700", color: "#065f46" }}>
                পরিশোধিত (মাধ্যম: {payment.paymentMethod || "নগদ"})
              </td>
            </tr>
            {payment.note && (
              <tr>
                <td style={{ border: "1px solid #334155", padding: "4px 7px", color: "#000" }}>মন্তব্য / নোট</td>
                <td colSpan={2} style={{ border: "1px solid #334155", padding: "4px 7px", fontStyle: "italic", color: "#000" }}>{payment.note}</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Signatures */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", marginTop: "28px", color: "#000" }}>
        <div style={{ textAlign: "center", width: "38%" }}>
          <div style={{ borderBottom: "1px dashed #000", marginBottom: "6px", height: "28px" }} />
          <strong style={{ color: "#000" }}>আদায়কারীর স্বাক্ষর</strong>
        </div>
        <div style={{ textAlign: "center", width: "38%" }}>
          <div style={{ borderBottom: "1px dashed #000", marginBottom: "6px", height: "28px" }} />
          <strong style={{ color: "#000" }}>ইউনিয়ন পরিষদ সিল ও স্বাক্ষর</strong>
        </div>
      </div>
    </div>
  )
}

export function TaxReceiptPrintView({ paymentId }: TaxReceiptPrintViewProps) {
  const { tenant } = useTenant()

  const { data: payment, isLoading, error } = useQuery(
    trpc.taxPayment.byId.queryOptions({ id: paymentId })
  )

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "12px", background: "white" }}>
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p style={{ fontSize: "14px", color: "#64748b" }}>রসিদ লোড হচ্ছে...</p>
      </div>
    )
  }

  if (error || !payment) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "16px", background: "white", textAlign: "center", padding: "16px" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <h3 style={{ fontSize: "18px", fontWeight: "700" }}>রসিদ পাওয়া যায়নি</h3>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/tax-collection">
            <ArrowLeft className="w-4 h-4" />
            <span>ফিরে যান</span>
          </Link>
        </Button>
      </div>
    )
  }

  const taxPayer = (payment as any).taxPayer
  const fiscalYear = (payment as any).fiscalYear
  const locationString = [tenant.upazilaName, tenant.districtName, tenant.divisionName].filter(Boolean).join(", ")
  const tenantName = tenant.unionName || tenant.nameBn || tenant.name || "ইউনিয়ন পরিষদ"
  const slipProps = { tenantName, locationString, tenant, payment: payment as any, taxPayer, fiscalYear }

  return (
    <>
      <style>{`
        @import url('https://fonts.maateen.me/solaiman-lipi/font.css');
        * { font-family: 'SolaimanLipi', sans-serif !important; box-sizing: border-box; }
        body, html { background: white !important; margin: 0; padding: 0; }

        #action-bar { display: flex; }

        /* ── Mobile ──────────────────────────────────────── */
        @media screen and (max-width: 600px) {
          #receipt-container { padding: 10px 8px !important; }

          .receipt-section1-grid { grid-template-columns: 1fr !important; }

          .receipt-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .receipt-table-wrap table { min-width: 480px; }

          .receipt-header-logo { width: 48px !important; height: 48px !important; }
          .receipt-header-logo-box { width: 52px !important; }

          .receipt-slip { padding: 8px 10px !important; }

          #action-bar {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
            padding: 10px 12px !important;
          }
          #action-bar a, #action-bar button {
            width: 100% !important;
            justify-content: center !important;
          }
        }

        /* ── Print ───────────────────────────────────────── */
        @media print {
          #action-bar { display: none !important; }
          @page { size: A4 portrait; margin: 0 !important; }
          body, html { background: white !important; margin: 0; padding: 0; }
          #receipt-container {
            padding: 6mm 8mm !important;
            min-height: unset !important;
            height: auto !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>

      {/* Action bar — screen only */}
      <div
        id="action-bar"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", padding: "12px 20px", borderBottom: "1px solid #1e3a5f", background: "#1e3a5f" }}
      >
        <Button asChild variant="ghost" size="sm" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.3)" }} className="gap-2 text-sm hover:bg-white/10">
          <Link href="/tax-collection">
            <ArrowLeft className="w-4 h-4" />
            রেজিস্টারে ফিরে যান
          </Link>
        </Button>
        <Button
          onClick={() => window.print()}
          style={{ background: "#16a34a", color: "#fff" }}
          className="gap-2 text-sm px-5 hover:opacity-90"
        >
          <Printer className="w-4 h-4" />
          রসিদ প্রিন্ট করুন
        </Button>
      </div>

      {/* Receipt container — centered, max 720px */}
      <div
        id="receipt-container"
        style={{ background: "white", minHeight: "calc(100vh - 53px)", display: "flex", justifyContent: "center", padding: "20px 16px" }}
      >
        <div style={{ width: "100%", maxWidth: "720px", display: "flex", flexDirection: "column", gap: "0" }}>
          {/* Taxpayer Copy */}
          <ReceiptSlip copyLabel="করদাতার অনুলিপি" {...slipProps} />

          {/* Cut line */}
          <div style={{ display: "flex", alignItems: "center", margin: "8px 0", gap: "8px", color: "#94a3b8" }}>
            <div style={{ flex: 1, borderTop: "2px dashed #94a3b8" }} />
            <span style={{ fontSize: "11px", fontWeight: "700", whiteSpace: "nowrap", color: "#64748b" }}>✂ কর্তন রেখা</span>
            <div style={{ flex: 1, borderTop: "2px dashed #94a3b8" }} />
          </div>

          {/* Office Copy */}
          <ReceiptSlip copyLabel="অফিস অনুলিপি" {...slipProps} />
        </div>
      </div>
    </>
  )
}
