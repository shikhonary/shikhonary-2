import { NextRequest } from "next/server";
import { db } from "@workspace/db/main";
import { getTenantDb } from "@workspace/db/tenant";
import { parseTenantHost } from "@workspace/utils";
import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import os from "os";

// Helper function to convert English digits to Bengali digits
function toBengaliDigits(num: number | string): string {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().replace(/\d/g, (digit) => bengaliDigits[parseInt(digit)]!);
}

// Helper to locate Chrome/Edge on server host (cross-platform)
function getBrowserPath(): string {
  const platform = os.platform();

  if (platform === "win32") {
    const username = os.userInfo().username;
    const paths = [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      `C:\\Users\\${username}\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe`,
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    ];
    for (const p of paths) {
      if (fs.existsSync(p)) return p;
    }
  } else if (platform === "darwin") {
    const paths = [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    ];
    for (const p of paths) {
      if (fs.existsSync(p)) return p;
    }
  } else {
    // Linux/Docker paths
    const paths = [
      "/usr/bin/google-chrome",
      "/usr/bin/chromium",
      "/usr/bin/chromium-browser",
      "/usr/bin/chrome",
    ];
    for (const p of paths) {
      if (fs.existsSync(p)) return p;
    }
  }

  throw new Error(
    `No compatible Google Chrome or Microsoft Edge installation found for server platform: ${platform}`
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 1. Resolve tenant from hostname
  const host = request.headers.get("host");
  const { slug, customDomain } = parseTenantHost(host, process.env["NEXT_PUBLIC_APP_URL"]);

  let tenantWhere: any = null;

  if (slug) {
    tenantWhere = { slug, isActive: true, isSuspended: false };
  } else if (customDomain) {
    tenantWhere = { customDomain, customDomainVerified: true, isActive: true, isSuspended: false };
  } else {
    // Fall back to the first active tenant for local dev bare localhost
    const firstTenant = await db.tenant.findFirst({
      where: { isActive: true },
      select: { slug: true },
    });
    if (firstTenant) {
      tenantWhere = { slug: firstTenant.slug, isActive: true, isSuspended: false };
    }
  }

  if (!tenantWhere) {
    return new Response("Tenant not found", { status: 404 });
  }

  const tenant = await db.tenant.findFirst({
    where: tenantWhere,
    select: {
      id: true,
      name: true,
      nameBn: true,
      slug: true,
      logo: true,
      isActive: true,
      isSuspended: true,
      phone: true,
      email: true,
      divisionId: true,
      districtId: true,
      upazilaId: true,
      unionId: true,
      division: { select: { name: true, nameBn: true } },
      district: { select: { name: true, nameBn: true } },
      upazila: { select: { name: true, nameBn: true } },
      union: { select: { name: true, nameBn: true } },
      connectionString: true,
    },
  });

  if (!tenant) {
    return new Response("Tenant database record not found", { status: 404 });
  }

  // 2. Query taxpayer details in the tenant-specific database
  const tenantDb = getTenantDb(tenant.id, tenant.connectionString);

  const [taxPayer, currentFiscalYear] = await Promise.all([
    tenantDb.taxPayer.findUnique({
      where: { id },
      include: {
        ward: true,
        payments: {
          include: { fiscalYear: true },
          orderBy: { paymentDate: "desc" },
        },
      },
    }),
    tenantDb.fiscalYear.findFirst({
      where: { isCurrent: true },
    }),
  ]);

  if (!taxPayer) {
    return new Response("Taxpayer not found", { status: 404 });
  }

  // 3. Compute statistics and format variables
  const totalPaid = taxPayer.payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const currentYearPayment = currentFiscalYear
    ? taxPayer.payments.find((p) => p.fiscalYearId === currentFiscalYear.id)
    : undefined;
  const currentYearPaidAmount = currentYearPayment?.amount || 0;
  const dueAmount = Math.max(0, taxPayer.tax - currentYearPaidAmount);

  const locationString = [
    tenant.upazila?.nameBn || tenant.upazila?.name,
    tenant.district?.nameBn || tenant.district?.name,
    tenant.division?.nameBn || tenant.division?.name,
  ]
    .filter(Boolean)
    .join(", ");
  const tenantName = tenant.union?.nameBn || tenant.nameBn || tenant.name || "ইউনিয়ন পরিষদ";
  const wardName = taxPayer.ward?.nameBn || taxPayer.ward?.name || "N/A";
  const payments = taxPayer.payments || [];

  // 4. Load assets locally on server
  let fontBase64 = "";
  try {
    const fontPath = path.join(process.cwd(), "public/fonts/SolaimanLipi.ttf");
    if (fs.existsSync(fontPath)) {
      fontBase64 = fs.readFileSync(fontPath).toString("base64");
    }
  } catch (err) {
    console.error("Failed to load local font file:", err);
  }

  let gobLogoUrl = "";
  try {
    const gobLogoPath = path.join(process.cwd(), "public/gob-logo.jpg");
    if (fs.existsSync(gobLogoPath)) {
      gobLogoUrl = `data:image/jpeg;base64,${fs.readFileSync(gobLogoPath).toString("base64")}`;
    }
  } catch (e) {
    console.error("Could not load GOB logo:", e);
  }

  let unionLogoUrl = "";
  try {
    const unionLogoPath = path.join(process.cwd(), "public/union-logo.jpg");
    if (fs.existsSync(unionLogoPath)) {
      unionLogoUrl = `data:image/jpeg;base64,${fs.readFileSync(unionLogoPath).toString("base64")}`;
    }
  } catch (e) {
    console.error("Could not load UP logo:", e);
  }

  const contactText = [
    tenant.phone ? `মোবাইল: ${toBengaliDigits(tenant.phone)}` : "",
    tenant.email ? `ই-মেইল: ${tenant.email}` : "",
  ]
    .filter(Boolean)
    .join(" | ");

  // 5. Generate Payment History Rows HTML
  const rowsHtml =
    payments.length === 0
      ? `<tr>
          <td colspan="5" class="text-center" style="color: #000000; font-style: italic; padding: 10px;">
            কোনো কর আদায়ের তথ্য রেকর্ড করা হয়নি।
          </td>
        </tr>`
      : payments
          .slice(0, 6)
          .map((pm: any) => {
            const receiptNo = toBengaliDigits(pm.receiptNo || pm.id.slice(0, 8));
            const fiscalYear = toBengaliDigits(pm.fiscalYear?.year || "N/A");
            const dateText = new Date(pm.paymentDate).toLocaleDateString("bn-BD");
            const methodText = pm.paymentMethod || "নগদ";
            const amountText = `৳ ${toBengaliDigits(pm.amount?.toLocaleString())}/-`;
            return `
            <tr>
              <td class="text-left" style="font-weight: 600; padding: 4px 8px;">#${receiptNo}</td>
              <td class="text-center" style="padding: 4px 8px;">${fiscalYear}</td>
              <td class="text-center" style="padding: 4px 8px;">${dateText}</td>
              <td class="text-center" style="padding: 4px 8px;">${methodText}</td>
              <td class="text-right" style="font-weight: 700; padding: 4px 8px;">${amountText}</td>
            </tr>
          `;
          })
          .join("");

  // 6. Construct full HTML page with embedded fonts & styles
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="utf-8">
      <title>করদাতা কর বিবরণী মুদ্রণ</title>
      <style>
        @font-face {
          font-family: 'SolaimanLipi';
          src: url(data:font/truetype;charset=utf-8;base64,${fontBase64}) format('truetype');
          font-weight: normal;
          font-style: normal;
        }
        :root {
          --brand: #0f4c81;
          --brand-dark: #0a3760;
          --accent: #b8860b;
          --ink: #000000;
          --muted: #000000;
          --paid: #0d7a4f;
          --due: #c02626;
          --bg-soft: #f4f7fa;
        }
        * {
          font-family: 'SolaimanLipi', sans-serif;
          box-sizing: border-box;
        }
        html, body {
          background: white;
          margin: 0;
          padding: 0;
          color: var(--ink);
          font-size: 13px;
          -webkit-font-smoothing: antialiased;
        }
        .page-frame {
          border-top: 1.5px solid var(--border);
          border-bottom: 1.5px solid var(--border);
          border-radius: 6px;
          overflow: hidden;
          position: relative;
        }
        .accent-bar {
          height: 6px;
          background: linear-gradient(90deg, var(--brand) 0%, var(--brand-dark) 55%, var(--accent) 100%);
        }
        .main-card {
          background: white;
          padding: 16px 20px 12px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* ---------- Header ---------- */
        .header-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          border-bottom: 2px solid var(--brand);
          padding-bottom: 10px;
        }
        .header-logo-container {
          width: 62px;
          height: 62px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .header-logo {
          width: 54px;
          height: 54px;
          object-fit: contain;
        }
        .header-center {
          text-align: center;
          flex: 1;
        }
        .eyebrow {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.5px;
          color: var(--muted);
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        .union-title {
          font-size: 19px;
          font-weight: 800;
          color: var(--brand-dark);
          line-height: 1.15;
          margin: 0;
        }
        .location-text {
          font-size: 11.5px;
          font-weight: 600;
          margin-top: 3px;
          color: var(--ink);
        }
        .contact-text {
          font-size: 10.5px;
          font-weight: 500;
          margin: 4px 0 0 0;
          color: var(--muted);
        }

        /* ---------- Document title + status ribbon ---------- */
        .doc-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 2px;
        }
        .doc-title-box {
          text-align: left;
        }
        .doc-title {
          font-size: 13.5px;
          font-weight: 800;
          color: var(--brand-dark);
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }
        .doc-subtitle {
          font-size: 10px;
          color: var(--muted);
          margin-top: 1px;
        }
        .status-badge {
          font-size: 11px;
          font-weight: 800;
          padding: 5px 14px;
          border-radius: 999px;
          border: 1.5px solid;
          white-space: nowrap;
        }
        .status-badge.paid {
          color: var(--paid);
          border-color: var(--paid);
          background: #e9f8f1;
        }
        .status-badge.due {
          color: var(--due);
          border-color: var(--due);
          background: #fdecec;
        }

        /* ---------- Info grid ---------- */
        .section-label {
          font-size: 10.5px;
          font-weight: 800;
          color: white;
          background: var(--brand);
          display: inline-block;
          padding: 3px 10px;
          border-radius: 3px;
          margin-bottom: 8px;
          letter-spacing: 0.3px;
        }
        .info-grid-box {
          border: 1px solid var(--border);
          border-radius: 5px;
          padding: 10px 16px 4px 16px;
          background: var(--bg-soft);
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0 36px;
        }
        .item-row {
          display: flex;
          padding-bottom: 6px;
          margin-bottom: 6px;
          font-size: 12px;
          line-height: 1.4;
          border-bottom: 1px dotted var(--border);
        }
        .item-label {
          width: 128px;
          font-weight: 700;
          color: var(--muted);
          flex-shrink: 0;
        }
        .item-val {
          color: var(--ink);
          font-weight: 600;
        }

        /* ---------- Financial summary as stat cards ---------- */
        .financial-box {
          margin: 2px 0 4px 0;
        }
        .financial-row {
          display: flex;
          gap: 10px;
        }
        .stat-card {
          flex: 1;
          border: 1px solid var(--border);
          border-top: 3px solid var(--brand);
          border-radius: 5px;
          padding: 8px 10px;
          text-align: center;
          background: white;
        }
        .stat-card.paid { border-top-color: var(--paid); }
        .stat-card.due { border-top-color: var(--due); }
        .stat-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--muted);
          margin-bottom: 3px;
        }
        .stat-value {
          font-size: 15px;
          font-weight: 800;
          color: var(--ink);
        }
        .stat-card.paid .stat-value { color: var(--paid); }
        .stat-card.due .stat-value { color: var(--due); }

        /* ---------- History table ---------- */
        .history-title-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        .history-note {
          font-size: 9.5px;
          color: var(--muted);
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
          border: 1px solid var(--border);
        }
        th, td {
          border: 1px solid var(--border-light);
          padding: 6px 8px;
          color: var(--ink);
        }
        thead th {
          background: var(--brand);
          color: white;
          font-weight: 700;
          text-align: center;
          border-color: var(--brand);
        }
        tbody tr:nth-child(even) {
          background: var(--bg-soft);
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }

        /* ---------- Signatures ---------- */
        .signatures-box {
          display: flex;
          justify-content: space-between;
          font-size: 10.5px;
          margin-top: 34px;
          padding: 0 6px;
        }
        .sig-col {
          text-align: center;
          width: 28%;
        }
        .sig-line {
          border-top: 1px solid var(--ink);
          margin-bottom: 5px;
          height: 8px;
        }
        .sig-role {
          font-weight: 700;
          color: var(--ink);
        }

        /* ---------- Footer ---------- */
        .footer-box {
          border-top: 1px solid var(--border-light);
          padding-top: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 9.5px;
          color: var(--muted);
          margin-top: 18px;
        }
        .footer-box strong {
          color: var(--brand-dark);
        }
      </style>
    </head>
    <body>
      <div class="page-frame">
        <div class="accent-bar"></div>
        <div class="main-card">

          <!-- Header -->
          <div class="header-box">
            <div class="header-logo-container">
              ${gobLogoUrl ? `<img class="header-logo" src="${gobLogoUrl}" alt="GOB" />` : ""}
            </div>
            <div class="header-center">
              <h1 class="union-title">${tenantName} ইউনিয়ন পরিষদ</h1>
              ${locationString ? `<div class="location-text">${locationString}</div>` : ""}
              ${contactText ? `<p class="contact-text">${contactText}</p>` : ""}
            </div>
            <div class="header-logo-container">
              ${unionLogoUrl ? `<img class="header-logo" src="${unionLogoUrl}" alt="UP" />` : ""}
            </div>
          </div>

          <!-- Document Title + Status -->
          <div class="doc-title-row">
            <div class="doc-title-box">
              <div class="doc-title">হোল্ডিং ও করদাতা তথ্য বিবরণী</div>
              <div class="doc-subtitle">Holding &amp; Taxpayer Assessment Statement</div>
            </div>
            <div class="status-badge ${dueAmount > 0 ? "due" : "paid"}">
              ${dueAmount > 0 ? "বকেয়া রয়েছে" : "সম্পূর্ণ পরিশোধিত"}
            </div>
          </div>

          <!-- Taxpayer Details Grid -->
          <div>
            <div class="section-label">করদাতার বিবরণ</div>
            <div class="info-grid-box">
              <div class="info-grid">
                <div>
                  <div class="item-row">
                    <span class="item-label">নাম (বাংলা)</span>
                    <span class="item-val">: ${taxPayer.name}</span>
                  </div>
                  <div class="item-row">
                    <span class="item-label">পিতার নাম</span>
                    <span class="item-val">: ${taxPayer.fatherName || "—"}</span>
                  </div>
                  <div class="item-row">
                    <span class="item-label">হোল্ডিং নং</span>
                    <span class="item-val">: ${toBengaliDigits(taxPayer.holding)}</span>
                  </div>
                  <div class="item-row">
                    <span class="item-label">মোবাইল</span>
                    <span class="item-val">: ${toBengaliDigits(taxPayer.phone || "—")}</span>
                  </div>
                  <div class="item-row">
                    <span class="item-label">উপজেলা/থানা</span>
                    <span class="item-val">: ${tenant.upazila?.nameBn || tenant.upazila?.name || "—"}</span>
                  </div>
                </div>
                <div>
                  <div class="item-row">
                    <span class="item-label">ন্যাশনাল আইডি (NID)</span>
                    <span class="item-val">: ${toBengaliDigits(taxPayer.nid || "—")}</span>
                  </div>
                  <div class="item-row">
                    <span class="item-label">ওয়ার্ড নং</span>
                    <span class="item-val">: ${toBengaliDigits(wardName)}</span>
                  </div>
                  <div class="item-row">
                    <span class="item-label">গ্রাম/মহল্লা</span>
                    <span class="item-val">: ${taxPayer.village || "—"}</span>
                  </div>
                  <div class="item-row">
                    <span class="item-label">নিবন্ধনের তারিখ</span>
                    <span class="item-val">: ${new Date(taxPayer.createdAt).toLocaleDateString("bn-BD")}</span>
                  </div>
                  <div class="item-row">
                    <span class="item-label">জেলা</span>
                    <span class="item-val">: ${tenant.district?.nameBn || tenant.district?.name || "—"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Financial Summary Info -->
          <div>
            <div class="section-label">কর নির্ধারণ ও বকেয়া তথ্য</div>
            <div class="financial-box">
              <div class="financial-row">
                <div class="stat-card">
                  <div class="stat-label">ধার্যকৃত কর</div>
                  <div class="stat-value">৳ ${toBengaliDigits(taxPayer.tax.toLocaleString())}/-</div>
                </div>
                <div class="stat-card paid">
                  <div class="stat-label">আদায়কৃত</div>
                  <div class="stat-value">৳ ${toBengaliDigits(totalPaid.toLocaleString())}/-</div>
                </div>
                <div class="stat-card ${dueAmount > 0 ? "due" : "paid"}">
                  <div class="stat-label">বকেয়া</div>
                  <div class="stat-value">
                    ${dueAmount > 0 ? `৳ ${toBengaliDigits(dueAmount.toLocaleString())}/-` : "পরিশোধিত"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment History Table -->
          <div>
            <div class="history-title-row">
              <div class="section-label" style="margin-bottom: 0;">কর আদায় ও রসিদ বিবরণী</div>
              ${payments.length > 6 ? `<div class="history-note">সর্বশেষ ৬টি রশিদ দেখানো হচ্ছে</div>` : ""}
            </div>
            <table>
              <thead>
                <tr>
                  <th class="text-left">রসিদ নং</th>
                  <th class="text-center">অর্থবছর</th>
                  <th class="text-center">তারিখ</th>
                  <th class="text-center">মাধ্যম</th>
                  <th class="text-right">পরিমাণ</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>

          <!-- Signatures Section -->
          <div class="signatures-box">
            <div class="sig-col">
              <div class="sig-line"></div>
              <span class="sig-role">আদায়কারীর স্বাক্ষর</span>
            </div>
            <div class="sig-col">
              <div class="sig-line"></div>
              <span class="sig-role">ইউনিয়ন পরিষদ সচিব</span>
            </div>
            <div class="sig-col">
              <div class="sig-line"></div>
              <span class="sig-role">ইউনিয়ন পরিষদ চেয়ারম্যান</span>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer-box">
            <div>ই-মেইল: ${tenant.email || `info@${tenant.slug}.uphub.gov.bd`}</div>
            <div>প্রস্তুতের তারিখ: ${new Date().toLocaleDateString("bn-BD")}</div>
            <div>কারিগরি সহযোগিতায়: <strong>ইউনিয়ন পরিষদ পোর্টাল (UP-Hub)</strong></div>
          </div>

        </div>
      </div>
    </body>
    </html>
  `;

  // 7. Launch local Chrome/Edge via puppeteer-core and render layout
  const browser = await puppeteer.launch({
    executablePath: getBrowserPath(),
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
  });

  try {
    const page = await browser.newPage();
    // Render the HTML content directly on the page
    await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });

    // Print to A4 PDF buffer
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "8mm",
        bottom: "8mm",
        left: "10mm",
        right: "10mm",
      },
    });

    // 8. Return Response Stream with application/pdf header
    return new Response(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="tax-payer-assessment-${id}.pdf"`,
        "Cache-Control": "no-store, must-revalidate",
      },
    });
  } finally {
    await browser.close();
  }
}
