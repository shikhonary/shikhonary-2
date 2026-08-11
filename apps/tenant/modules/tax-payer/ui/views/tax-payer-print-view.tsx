"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { trpc } from "@/trpc/client"
import { useTenant } from "@/modules/layout/ui/components/tenant-provider"
import { Button } from "@workspace/ui/components/button"
import { Printer, ArrowLeft, Loader2, AlertCircle } from "lucide-react"

interface TaxPayerPrintViewProps {
  taxPayerId: string
}

function ItemRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div style={{ display: "flex", marginBottom: "5px", fontSize: "12px", lineHeight: "1.4", color: "#000" }}>
      <span style={{ width: "130px", flexShrink: 0, color: "#000", fontWeight: "700" }}>{label}</span>
      <span style={{ color: "#000" }}>: {value || "—"}</span>
    </div>
  )
}

export function TaxPayerPrintView({ taxPayerId }: TaxPayerPrintViewProps) {
  const { tenant } = useTenant()

  const { data: taxPayer, isLoading, error } = useQuery(
    trpc.taxPayer.byId.queryOptions({ id: taxPayerId })
  )

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "12px", background: "white" }}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p style={{ fontSize: "14px", color: "#64748b" }}>লোড হচ্ছে...</p>
      </div>
    )
  }

  if (error || !taxPayer) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "16px", background: "white", textAlign: "center", padding: "16px" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <h3 style={{ fontSize: "18px", fontWeight: "700" }}>করদাতার তথ্য পাওয়া যায়নি</h3>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/tax-payers">
            <ArrowLeft className="w-4 h-4" />
            <span>ফিরে যান</span>
          </Link>
        </Button>
      </div>
    )
  }

  const locationString = [tenant.upazilaName, tenant.districtName, tenant.divisionName].filter(Boolean).join(", ")
  const tenantName = tenant.unionName || tenant.nameBn || tenant.name || "ইউনিয়ন পরিষদ"

  const wardName = taxPayer.ward?.nameBn || taxPayer.ward?.name || "N/A"
  const payments = taxPayer.payments || []

  return (
    <>
      <style>{`
        @import url('https://fonts.maateen.me/solaiman-lipi/font.css');
        * { font-family: 'SolaimanLipi', sans-serif !important; box-sizing: border-box; }
        body, html { background: white !important; margin: 0; padding: 0; height: 100%; }

        #action-bar { display: flex; }

        .main-card {
          background: white;
          padding: 24px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          color: #000;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-sizing: border-box;
        }

        /* ── Mobile ───────────────────────────────── */
        @media screen and (max-width: 600px) {
          #print-container { padding: 10px 6px !important; }
          .main-card { gap: 10px !important; }
          .section-grid { grid-template-columns: 1fr !important; gap: 4px !important; }
          .table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .table-wrap table { min-width: 500px; }
          .header-logo { width: 48px !important; height: 48px !important; }
          .header-logo-box { width: 52px !important; }
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

        /* ── Screen only ───────────────────────────── */
        @media screen {
          #print-container { min-height: calc(100vh - 53px); }
        }

        /* ── Print ───────────────────────────────── */
        @media print {
          @page { size: A4 portrait; margin: 8mm 10mm; }
          #action-bar { display: none !important; }
          body * { visibility: hidden !important; }
          .main-card, .main-card * { visibility: visible !important; }
          .main-card {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: auto !important;
            padding: 8mm 10mm !important;
            border: none !important;
            border-radius: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
            gap: 10px !important;
            zoom: 1.1;
            box-sizing: border-box !important;
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>

      {/* Action bar — screen only */}
      <div
        id="action-bar"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", padding: "10px 20px", borderBottom: "1px solid #1e3a5f", background: "#1e3a5f" }}
      >
        <Button asChild variant="ghost" size="sm" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.3)" }} className="gap-2 text-sm hover:bg-white/10">
          <Link href={`/tax-payers/${taxPayerId}`}>
            <ArrowLeft className="w-4 h-4" />
            প্রোফাইলে ফিরে যান
          </Link>
        </Button>
        <Button
          onClick={() => window.print()}
          style={{ background: "#16a34a", color: "#fff" }}
          className="gap-2 text-sm px-5 hover:opacity-90"
        >
          <Printer className="w-4 h-4" />
          বিবরণী প্রিন্ট করুন
        </Button>
      </div>

      {/* Main Print Container */}
      <div
        id="print-container"
        style={{ background: "white", display: "flex", justifyContent: "center", padding: "20px 10px" }}
      >
        <div id="print-wrapper" style={{ width: "100%", maxWidth: "800px", display: "flex", flexDirection: "column", gap: "0" }}>

          <div className="main-card">

            {/* Block 1: Header + Document Title */}
            <div>
              {/* Header matches Government demo */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "2px double #000", paddingBottom: "5px", marginBottom: "6px" }}>
                {/* Left logo */}
                <div className="header-logo-box" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "70px", flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="header-logo" src="/gob-logo.jpg" alt="GOB" style={{ width: "48px", height: "48px", objectFit: "contain" }} />
                </div>

                {/* Center text */}
                <div style={{ textAlign: "center", color: "#000", padding: "0 10px", flex: 1 }}>
                  <div style={{ fontSize: "16px", fontWeight: "900", color: "#1d4ed8", lineHeight: 1.1 }}>{tenantName}</div>
                  {locationString && <div style={{ fontSize: "12px", fontWeight: "700", marginTop: "2px", color: "#000" }}>{locationString}</div>}
                  {(tenant.phone || tenant.email) && (
                    <div style={{ fontSize: "10px", fontWeight: "600", marginTop: "2px", color: "#000" }}>
                      {tenant.phone ? `মোবাইল: ${tenant.phone}` : ""}
                      {tenant.phone && tenant.email ? " | " : ""}
                      {tenant.email ? `ই-মেইল: ${tenant.email}` : ""}
                    </div>
                  )}
                </div>

                {/* Right logo */}
                <div className="header-logo-box" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "70px", flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="header-logo" src="/union-logo.jpg" alt="UP" style={{ width: "48px", height: "48px", objectFit: "contain" }} />
                </div>
              </div>

              {/* Document title */}
              <div style={{ textAlign: "center", marginBottom: "6px" }}>
                <div style={{ fontSize: "15px", fontWeight: "800", display: "inline-block", borderBottom: "2px solid #000", paddingBottom: "2px", color: "#000", textTransform: "uppercase" }}>
                  হোল্ডিং ও করদাতা তথ্য বিবরণী
                </div>
              </div>
            </div>

            {/* Block 2: Taxpayer Info layout */}
            <div style={{ border: "1px solid #cbd5e1", borderRadius: "4px", padding: "6px 12px" }}>
              <div className="section-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px", color: "#000" }}>
                <div>
                  <ItemRow label="নাম (বাংলা)" value={taxPayer.name} />
                  <ItemRow label="পিতার নাম" value={taxPayer.fatherName} />
                  <ItemRow label="হোল্ডিং নং" value={taxPayer.holding} />
                  <ItemRow label="মোবাইল" value={taxPayer.phone} />
                  <ItemRow label="উপজেলা/থানা" value={tenant.upazilaName} />
                </div>
                <div>
                  <ItemRow label="ন্যাশনাল আইডি (NID)" value={taxPayer.nid} />
                  <ItemRow label="ওয়ার্ড নং" value={wardName} />
                  <ItemRow label="গ্রাম/মহল্লা" value={taxPayer.village} />
                  <ItemRow label="নিবন্ধনের তারিখ" value={new Date(taxPayer.createdAt).toLocaleDateString("bn-BD")} />
                  <ItemRow label="জেলা" value={tenant.districtName} />
                </div>
              </div>
            </div>

            {/* Block 3: Financial Assessment Info */}
            <div style={{ textAlign: "center", borderTop: "1px dashed #000", borderBottom: "1px dashed #000", paddingTop: "4px", paddingBottom: "4px" }}>
              <div style={{ fontSize: "12px", fontWeight: "800", display: "inline-block", borderBottom: "1px solid #000", paddingBottom: "1px", color: "#000", marginBottom: "4px" }}>
                হোল্ডিং কর নির্ধারণ ও বকেয়া তথ্য
              </div>
              <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "5px 15px", color: "#000", maxWidth: "650px", margin: "0 auto" }}>
                <div style={{ fontSize: "12px" }}>
                  <span>ধার্যকৃত কর: </span>
                  <strong style={{ fontWeight: "700" }}>৳ {taxPayer.tax?.toLocaleString()}/-</strong>
                </div>
                <div style={{ fontSize: "12px", color: "#059669" }}>
                  <span>আদায়কৃত: </span>
                  <strong style={{ fontWeight: "700" }}>৳ {taxPayer.totalPaid?.toLocaleString()}/-</strong>
                </div>
                <div style={{ fontSize: "12px", color: taxPayer.dueAmount > 0 ? "#dc2626" : "#059669" }}>
                  <span>বকেয়া: </span>
                  <strong style={{ fontWeight: "800" }}>
                    {taxPayer.dueAmount > 0 ? `৳ ${taxPayer.dueAmount.toLocaleString()}/-` : "পরিশোধিত"}
                  </strong>
                </div>
              </div>
            </div>

            {/* Block 4: Collection History Grid */}
            <div>
              <div style={{ fontSize: "12px", fontWeight: "700", textDecoration: "underline", marginBottom: "4px", color: "#000" }}>কর আদায় ও রসিদ বিবরণী:</div>
              <div className="table-wrap">
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", color: "#000" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      <th style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "left", color: "#000", fontWeight: "700" }}>রসিদ নং</th>
                      <th style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "center", color: "#000", fontWeight: "700" }}>অর্থবছর</th>
                      <th style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "center", color: "#000", fontWeight: "700" }}>তারিখ</th>
                      <th style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "center", color: "#000", fontWeight: "700" }}>মাধ্যম</th>
                      <th style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "right", color: "#000", fontWeight: "700" }}>পরিমাণ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ border: "1px solid #000", padding: "10px", textAlign: "center", color: "#64748b", fontStyle: "italic" }}>
                          কোনো কর আদায়ের তথ্য রেকর্ড করা হয়নি।
                        </td>
                      </tr>
                    ) : (
                      payments.slice(0, 6).map((pm: any) => (
                        <tr key={pm.id}>
                          <td style={{ border: "1px solid #000", padding: "3px 6px", color: "#000", fontWeight: "600" }}>
                            #{pm.receiptNo || pm.id.slice(0, 8)}
                          </td>
                          <td style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "center", color: "#000" }}>
                            {pm.fiscalYear?.year || "N/A"}
                          </td>
                          <td style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "center", color: "#000" }}>
                            {new Date(pm.paymentDate).toLocaleDateString("bn-BD")}
                          </td>
                          <td style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "center", color: "#000" }}>
                            {pm.paymentMethod || "নগদ"}
                          </td>
                          <td style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "right", fontWeight: "700", color: "#000" }}>
                            ৳ {pm.amount?.toLocaleString()}/-
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Block 5: Signatures + Footer Info */}
            <div>
              {/* Signatures */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#000", padding: "0 10px", marginBottom: "6px", marginTop: "6px" }}>
                <div style={{ textAlign: "center", width: "28%" }}>
                  <div style={{ borderBottom: "1px dashed #000", marginBottom: "3px", height: "16px" }} />
                  <strong style={{ color: "#000" }}>আদায়কারীর স্বাক্ষর</strong>
                </div>
                <div style={{ textAlign: "center", width: "28%" }}>
                  <div style={{ borderBottom: "1px dashed #000", marginBottom: "3px", height: "16px" }} />
                  <strong style={{ color: "#000" }}>ইউনিয়ন পরিষদ সচিব</strong>
                </div>
                <div style={{ textAlign: "center", width: "28%" }}>
                  <div style={{ borderBottom: "1px dashed #000", marginBottom: "3px", height: "16px" }} />
                  <strong style={{ color: "#000" }}>ইউনিয়ন পরিষদ চেয়ারম্যান</strong>
                </div>
              </div>

              {/* Bottom Footer Info */}
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "6px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "10px", color: "#64748b" }}>
                <div>
                  ই-মেইল: {tenant.email || `info@${tenant.slug}.uphub.gov.bd`}
                </div>
                <div>
                  কারিগরি সহযোগিতায়: <strong>ইউনিয়ন পরিষদ পোর্টাল (UP-Hub)</strong>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
