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

// Map application status to Bengali label + badge class
function getStatusMeta(status: string): { label: string; cls: "pending" | "approved" | "rejected" } {
  switch (status) {
    case "APPROVED":
      return { label: "অনুমোদিত", cls: "approved" };
    case "REJECTED":
      return { label: "বাতিলকৃত", cls: "rejected" };
    default:
      return { label: "পর্যালোচনাধীন", cls: "pending" };
  }
}

// Bengali label lookup maps for citizen application enum fields
const GENDER_BN: Record<string, string> = {
  MALE: "পুরুষ",
  FEMALE: "মহিলা",
  OTHER: "অন্যান্য",
};

const RELIGION_BN: Record<string, string> = {
  ISLAM: "ইসলাম",
  HINDU: "হিন্দু",
  BUDDHIST: "বৌদ্ধ",
  CHRISTIAN: "খ্রিস্টান",
  OTHER: "অন্যান্য",
};

const MARITAL_STATUS_BN: Record<string, string> = {
  UNMARRIED: "অবিবাহিত",
  MARRIED: "বিবাহিত",
  WIDOWED: "বিপত্নীক/বিধবা",
  DIVORCED: "তালাকপ্রাপ্ত",
  OTHER: "অন্যান্য",
};

const RESIDENT_TYPE_BN: Record<string, string> = {
  PERMANENT: "স্থায়ী",
  TEMPORARY: "অস্থায়ী",
};

// Format an address block into a single readable line-set (returns null if no address)
function formatAddress(addr: any, wardLabel: string | null) {
  if (!addr) return null;
  return {
    village: addr.villageBn || "—",
    road: addr.roadBn || "—",
    holdingNo: addr.holdingNo ? toBengaliDigits(addr.holdingNo) : "—",
    ward: wardLabel || "—",
    union: addr.unionNameBn || "—",
    postOffice: addr.postOfficeBn || "—",
    upazila: addr.upazilaNameBn || "—",
    district: addr.districtNameBn || "—",
    division: addr.divisionNameBn || "—",
  };
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

  // 2. Query citizen application details in the tenant-specific database
  const tenantDb = getTenantDb(tenant.id, tenant.connectionString);

  const application = await tenantDb.citizenApplication.findUnique({
    where: { id },
    include: {
      presentAddress: { include: { ward: true } },
      permanentAddress: { include: { ward: true } },
    },
  });

  if (!application) {
    return new Response("Citizen application not found", { status: 404 });
  }

  // 3. Compute derived / formatted variables
  const { label: statusLabel, cls: statusCls } = getStatusMeta(application.status);

  const presentWardLabel = application.presentAddress?.ward
    ? application.presentAddress.ward.nameBn || application.presentAddress.ward.name || null
    : null;
  const permanentWardLabel = application.permanentAddress?.ward
    ? application.permanentAddress.ward.nameBn || application.permanentAddress.ward.name || null
    : null;

  const presentAddr = formatAddress(application.presentAddress, presentWardLabel);
  const permanentAddr = application.sameAsPresent
    ? null
    : formatAddress(application.permanentAddress, permanentWardLabel);

  const tenantName = tenant.union?.nameBn || tenant.nameBn || tenant.name || "ইউনিয়ন পরিষদ";
  const locationString = [
    tenant.upazila?.nameBn || tenant.upazila?.name,
    tenant.district?.nameBn || tenant.district?.name,
    tenant.division?.nameBn || tenant.division?.name,
  ]
    .filter(Boolean)
    .join(", ");

  const contactText = [
    tenant.phone ? `মোবাইল: ${toBengaliDigits(tenant.phone)}` : "",
    tenant.email ? `ই-মেইল: ${tenant.email}` : "",
  ]
    .filter(Boolean)
    .join(" | ");

  const identityNo = application.nid
    ? `এনআইডি: ${toBengaliDigits(application.nid)}`
    : application.birthRegNo
    ? `জন্মনিবন্ধন: ${toBengaliDigits(application.birthRegNo)}`
    : application.passportNo
    ? `পাসপোর্ট: ${toBengaliDigits(application.passportNo)}`
    : "—";

  const dobText = application.dob ? new Date(application.dob).toLocaleDateString("bn-BD") : "—";
  const appliedDateText = new Date(application.createdAt).toLocaleDateString("bn-BD");
  const printedDateText = new Date().toLocaleDateString("bn-BD");

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

  // 5. Build the address block HTML (reused for present + permanent)
  function addressBlockHtml(addr: ReturnType<typeof formatAddress>): string {
    if (!addr) {
      return `<div class="empty-note">ঠিকানার তথ্য প্রদান করা হয়নি।</div>`;
    }
    return `
      <div class="info-grid">
        <div>
          <div class="item-row">
            <span class="item-label">গ্রাম/মহল্লা</span>
            <span class="item-val">: ${addr.village}</span>
          </div>
          <div class="item-row">
            <span class="item-label">রাস্তা</span>
            <span class="item-val">: ${addr.road}</span>
          </div>
          <div class="item-row">
            <span class="item-label">হোল্ডিং নং</span>
            <span class="item-val">: ${addr.holdingNo}</span>
          </div>
          <div class="item-row">
            <span class="item-label">ওয়ার্ড</span>
            <span class="item-val">: ${addr.ward}</span>
          </div>
          <div class="item-row">
            <span class="item-label">ডাকঘর</span>
            <span class="item-val">: ${addr.postOffice}</span>
          </div>
        </div>
        <div>
          <div class="item-row">
            <span class="item-label">ইউনিয়ন</span>
            <span class="item-val">: ${addr.union}</span>
          </div>
          <div class="item-row">
            <span class="item-label">উপজেলা/থানা</span>
            <span class="item-val">: ${addr.upazila}</span>
          </div>
          <div class="item-row">
            <span class="item-label">জেলা</span>
            <span class="item-val">: ${addr.district}</span>
          </div>
          <div class="item-row">
            <span class="item-label">বিভাগ</span>
            <span class="item-val">: ${addr.division}</span>
          </div>
        </div>
      </div>
    `;
  }

  // 6. Construct full HTML page with embedded fonts & styles
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="utf-8">
      <title>নাগরিক সনদের আবেদনপত্র মুদ্রণ</title>
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
          --border: #cdd5df;
          --border-light: #e6eaef;
          --approved: #0d7a4f;
          --rejected: #c02626;
          --pending: #b7791f;
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
        .status-badge.approved {
          color: var(--approved);
          border-color: var(--approved);
          background: #e9f8f1;
        }
        .status-badge.rejected {
          color: var(--rejected);
          border-color: var(--rejected);
          background: #fdecec;
        }
        .status-badge.pending {
          color: var(--pending);
          border-color: var(--pending);
          background: #fdf3e0;
        }

        /* ---------- Section labels ---------- */
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
        .section-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .section-label-row .section-label {
          margin-bottom: 0;
        }
        .same-as-badge {
          font-size: 9.5px;
          font-weight: 700;
          color: var(--muted);
          background: var(--bg-soft);
          border: 1px solid var(--border);
          padding: 2px 8px;
          border-radius: 999px;
        }

        /* ---------- Info grid ---------- */
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
        .empty-note {
          font-size: 11.5px;
          color: var(--muted);
          font-style: italic;
          padding: 8px 4px;
        }

        /* ---------- Callout boxes (rejection reason / comments) ---------- */
        .callout {
          border: 1px solid var(--border);
          border-left: 4px solid var(--brand);
          border-radius: 4px;
          padding: 8px 12px;
          font-size: 11.5px;
          background: var(--bg-soft);
          line-height: 1.5;
        }
        .callout.reject {
          border-left-color: var(--rejected);
          background: #fdecec;
        }
        .callout-label {
          font-weight: 800;
          font-size: 10.5px;
          margin-bottom: 3px;
          display: block;
        }
        .callout.reject .callout-label { color: var(--rejected); }
        .callout:not(.reject) .callout-label { color: var(--brand-dark); }

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
              <div class="doc-title">নাগরিক সনদের আবেদনপত্র</div>
              <div class="doc-subtitle">Citizen Certificate Application</div>
            </div>
            <div class="status-badge ${statusCls}">${statusLabel}</div>
          </div>

          <!-- Applicant Identity -->
          <div>
            <div class="section-label">আবেদনকারীর পরিচিতি</div>
            <div class="info-grid-box">
              <div class="info-grid">
                <div>
                  <div class="item-row">
                    <span class="item-label">নাম (বাংলা)</span>
                    <span class="item-val">: ${application.nameBn}</span>
                  </div>
                  ${
                    application.nameEn
                      ? `<div class="item-row">
                    <span class="item-label">Name (English)</span>
                    <span class="item-val">: ${application.nameEn}</span>
                  </div>`
                      : ""
                  }
                  <div class="item-row">
                    <span class="item-label">পিতার নাম</span>
                    <span class="item-val">: ${application.fatherNameBn}</span>
                  </div>
                  <div class="item-row">
                    <span class="item-label">মাতার নাম</span>
                    <span class="item-val">: ${application.motherNameBn}</span>
                  </div>
                  <div class="item-row">
                    <span class="item-label">জন্ম তারিখ</span>
                    <span class="item-val">: ${dobText}</span>
                  </div>
                  <div class="item-row">
                    <span class="item-label">পরিচয় নম্বর</span>
                    <span class="item-val">: ${identityNo}</span>
                  </div>
                </div>
                <div>
                  <div class="item-row">
                    <span class="item-label">লিঙ্গ</span>
                    <span class="item-val">: ${GENDER_BN[application.gender] || application.gender}</span>
                  </div>
                  <div class="item-row">
                    <span class="item-label">বৈবাহিক অবস্থা</span>
                    <span class="item-val">: ${MARITAL_STATUS_BN[application.maritalStatus] || application.maritalStatus}</span>
                  </div>
                  <div class="item-row">
                    <span class="item-label">ধর্ম</span>
                    <span class="item-val">: ${RELIGION_BN[application.religion] || application.religion}</span>
                  </div>
                  <div class="item-row">
                    <span class="item-label">পেশা</span>
                    <span class="item-val">: ${application.occupation || "—"}</span>
                  </div>
                  <div class="item-row">
                    <span class="item-label">শিক্ষাগত যোগ্যতা</span>
                    <span class="item-val">: ${application.education || "—"}</span>
                  </div>
                  <div class="item-row">
                    <span class="item-label">বাসিন্দার ধরন</span>
                    <span class="item-val">: ${RESIDENT_TYPE_BN[application.residentType] || application.residentType}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div>
            <div class="section-label">যোগাযোগের তথ্য</div>
            <div class="info-grid-box">
              <div class="info-grid">
                <div>
                  <div class="item-row">
                    <span class="item-label">মোবাইল</span>
                    <span class="item-val">: ${toBengaliDigits(application.mobile)}</span>
                  </div>
                </div>
                <div>
                  <div class="item-row">
                    <span class="item-label">ই-মেইল</span>
                    <span class="item-val">: ${application.email || "—"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Present Address -->
          <div>
            <div class="section-label">বর্তমান ঠিকানা</div>
            <div class="info-grid-box">
              ${addressBlockHtml(presentAddr)}
            </div>
          </div>

          <!-- Permanent Address -->
          <div>
            <div class="section-label-row">
              <div class="section-label">স্থায়ী ঠিকানা</div>
              ${application.sameAsPresent ? `<span class="same-as-badge">বর্তমান ঠিকানার অনুরূপ</span>` : ""}
            </div>
            <div class="info-grid-box">
              ${application.sameAsPresent ? addressBlockHtml(presentAddr) : addressBlockHtml(permanentAddr)}
            </div>
          </div>

          ${
            application.status === "REJECTED" && application.rejectionReason
              ? `<div class="callout reject">
                  <span class="callout-label">বাতিলের কারণ</span>
                  ${application.rejectionReason}
                </div>`
              : ""
          }

          ${
            application.commentsBn
              ? `<div class="callout">
                  <span class="callout-label">মন্তব্য</span>
                  ${application.commentsBn}
                </div>`
              : ""
          }

          <!-- Signatures Section -->
          <div class="signatures-box">
            <div class="sig-col">
              <div class="sig-line"></div>
              <span class="sig-role">আবেদনকারীর স্বাক্ষর</span>
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
            <div>আবেদনের তারিখ: ${appliedDateText}</div>
            <div>প্রস্তুতের তারিখ: ${printedDateText}</div>
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
        "Content-Disposition": `attachment; filename="citizen-application-${id}.pdf"`,
        "Cache-Control": "no-store, must-revalidate",
      },
    });
  } finally {
    await browser.close();
  }
}
