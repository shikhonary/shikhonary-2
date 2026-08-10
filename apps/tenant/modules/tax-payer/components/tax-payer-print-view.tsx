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
    <div style={{ display: "flex", marginBottom: "8px", fontSize: "13px", lineHeight: "1.5", color: "#000" }}>
      <span style={{ width: "140px", flexShrink: 0, color: "#000", fontWeight: "700" }}>{label}</span>
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
          justify-content: space-between;
          min-height: 262mm;
          box-sizing: border-box;
        }

        /* ── Mobile ──────────────────────────────────────── */
        @media screen and (max-width: 600px) {
          #print-container { padding: 10px 6px !important; }
          .main-card { min-height: unset !important; gap: 20px !important; }
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

        /* ── Print ───────────────────────────────────────── */
        @media print {
          #action-bar { display: none !important; }
          @page { size: A4 portrait; margin: 10mm 12mm; }
          body, html { background: white !important; margin: 0; padding: 0; height: 100%; }
          #print-container { padding: 0 !important; min-height: unset !important; height: 100%; }
          .main-card {
            border: none !important;
            padding: 0 !important;
            height: 265mm;
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
        style={{ background: "white", minHeight: "calc(100vh - 53px)", display: "flex", justifyContent: "center", padding: "20px 10px" }}
      >
        <div style={{ width: "100%", maxWidth: "800px", display: "flex", flexDirection: "column", gap: "0" }}>
          
          <div className="main-card">
            
            {/* Block 1: Header + Document Title */}
            <div>
              {/* Header matches Government demo */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "3px double #000", paddingBottom: "10px", marginBottom: "14px" }}>
                {/* Left logo */}
                <div className="header-logo-box" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "70px", flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="header-logo" src="/gob-logo.jpg" alt="GOB" style={{ width: "60px", height: "60px", objectFit: "contain" }} />
                </div>
                
                {/* Center text */}
                <div style={{ textAlign: "center", color: "#000", padding: "0 10px", flex: 1 }}>
                  <div style={{ fontSize: "21px", fontWeight: "900", color: "#1d4ed8", lineHeight: 1.2 }}>{tenantName}</div>
                  {locationString && <div style={{ fontSize: "13px", fontWeight: "700", marginTop: "3px", color: "#000" }}>{locationString}</div>}
                  {(tenant.phone || tenant.email) && (
                    <div style={{ fontSize: "11px", fontWeight: "600", marginTop: "3px", color: "#000" }}>
                      {tenant.phone ? `মোবাইল: ${tenant.phone}` : ""}
                      {tenant.phone && tenant.email ? " | " : ""}
                      {tenant.email ? `ই-মেইল: ${tenant.email}` : ""}
                    </div>
                  )}
                  <div style={{ fontSize: "11px", marginTop: "3px", color: "#000" }}>
                    ওয়েবসাইট : https://{tenant.slug}.uphub.gov.bd
                  </div>
                </div>
                
                {/* Right logo */}
                <div className="header-logo-box" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "70px", flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="header-logo" src="/union-logo.jpg" alt="UP" style={{ width: "60px", height: "60px", objectFit: "contain" }} />
                </div>
              </div>

              {/* Document title - Underlined like demo */}
              <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "17px", fontWeight: "800", display: "inline-block", borderBottom: "2px solid #000", paddingBottom: "2px", color: "#000", textTransform: "uppercase" }}>
                  হোল্ডিং ও করদাতা তথ্য বিবরণী
                </div>
              </div>
            </div>

            {/* Block 2: Taxpayer Info layout */}
            <div style={{ border: "1px solid #cbd5e1", borderRadius: "6px", padding: "16px 20px" }}>
              <div className="section-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 40px", color: "#000" }}>
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
            <div style={{ textAlign: "center", borderTop: "1px dashed #000", borderBottom: "1px dashed #000", paddingTop: "14px", paddingBottom: "14px" }}>
              <div style={{ fontSize: "15px", fontWeight: "800", display: "inline-block", borderBottom: "2px solid #000", paddingBottom: "2px", color: "#000", marginBottom: "12px" }}>
                হোল্ডিং কর নির্ধারণ ও বকেয়া তথ্য
              </div>
              <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "10px 20px", color: "#000", maxWidth: "650px", margin: "0 auto" }}>
                <div style={{ fontSize: "13px" }}>
                  <span>ধার্যকৃত বাৎসরিক কর: </span>
                  <strong style={{ fontSize: "14px", fontWeight: "700" }}>৳ {taxPayer.tax?.toLocaleString()}/-</strong>
                </div>
                <div style={{ fontSize: "13px", color: "#059669" }}>
                  <span>সর্বমোট আদায়কৃত কর: </span>
                  <strong style={{ fontSize: "14px", fontWeight: "700" }}>৳ {taxPayer.totalPaid?.toLocaleString()}/-</strong>
                </div>
                <div style={{ fontSize: "13px", color: taxPayer.dueAmount > 0 ? "#dc2626" : "#059669" }}>
                  <span>চলতি অর্থবছরে বকেয়া: </span>
                  <strong style={{ fontSize: "14px", fontWeight: "800" }}>
                    {taxPayer.dueAmount > 0 ? `৳ ${taxPayer.dueAmount.toLocaleString()}/-` : "পরিশোধিত (৳ ০/-)"}
                  </strong>
                </div>
              </div>
            </div>

            {/* Block 4: Collection History Grid */}
            <div>
              <div style={{ fontSize: "14px", fontWeight: "700", textDecoration: "underline", marginBottom: "10px", color: "#000" }}>কর আদায় ও রসিদ বিবরণী:</div>
              <div className="table-wrap">
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", color: "#000" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      <th style={{ border: "1px solid #000", padding: "6px 10px", textAlign: "left", color: "#000", fontWeight: "700" }}>রসিদ নম্বর</th>
                      <th style={{ border: "1px solid #000", padding: "6px 10px", textAlign: "center", color: "#000", fontWeight: "700" }}>অর্থবছর</th>
                      <th style={{ border: "1px solid #000", padding: "6px 10px", textAlign: "center", color: "#000", fontWeight: "700" }}>আদায়ের তারিখ</th>
                      <th style={{ border: "1px solid #000", padding: "6px 10px", textAlign: "center", color: "#000", fontWeight: "700" }}>পেমেন্ট মাধ্যম</th>
                      <th style={{ border: "1px solid #000", padding: "6px 10px", textAlign: "right", color: "#000", fontWeight: "700" }}>আদায়কৃত পরিমাণ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ border: "1px solid #000", padding: "12px", textAlign: "center", color: "#64748b", fontStyle: "italic" }}>
                          কোনো কর আদায়ের তথ্য রেকর্ড করা হয়নি।
                        </td>
                      </tr>
                    ) : (
                      payments.slice(0, 8).map((pm: any) => (
                        <tr key={pm.id}>
                          <td style={{ border: "1px solid #000", padding: "6px 10px", color: "#000", fontWeight: "600" }}>
                            #{pm.receiptNo || pm.id.slice(0, 8)}
                          </td>
                          <td style={{ border: "1px solid #000", padding: "6px 10px", textAlign: "center", color: "#000" }}>
                            {pm.fiscalYear?.year || "N/A"}
                          </td>
                          <td style={{ border: "1px solid #000", padding: "6px 10px", textAlign: "center", color: "#000" }}>
                            {new Date(pm.paymentDate).toLocaleDateString("bn-BD")}
                          </td>
                          <td style={{ border: "1px solid #000", padding: "6px 10px", textAlign: "center", color: "#000" }}>
                            {pm.paymentMethod || "নগদ"}
                          </td>
                          <td style={{ border: "1px solid #000", padding: "6px 10px", textAlign: "right", fontWeight: "700", color: "#000" }}>
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
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#000", padding: "0 10px", marginBottom: "16px" }}>
                <div style={{ textAlign: "center", width: "28%" }}>
                  <div style={{ borderBottom: "1px dashed #000", marginBottom: "6px", height: "30px" }} />
                  <strong style={{ color: "#000" }}>আদায়কারীর স্বাক্ষর</strong>
                </div>
                <div style={{ textAlign: "center", width: "28%" }}>
                  <div style={{ borderBottom: "1px dashed #000", marginBottom: "6px", height: "30px" }} />
                  <strong style={{ color: "#000" }}>ইউনিয়ন পরিষদ সচিব</strong>
                </div>
                <div style={{ textAlign: "center", width: "28%" }}>
                  <div style={{ borderBottom: "1px dashed #000", marginBottom: "6px", height: "30px" }} />
                  <strong style={{ color: "#000" }}>ইউনিয়ন পরিষদ চেয়ারম্যান</strong>
                </div>
              </div>

              {/* Bottom Footer Info */}
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "10.5px", color: "#64748b" }}>
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
