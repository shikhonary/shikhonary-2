import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../generated/main/client.js"

const connectionString = process.env.MAIN_DATABASE_URL || process.env.DATABASE_URL
if (!connectionString) {
  console.error("ERROR: MAIN_DATABASE_URL or DATABASE_URL is not set in environment variables.")
  process.exit(1)
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding Subscription Plans...")

  const freePlan = await prisma.subscriptionPlan.upsert({
    where: { name: "free" },
    update: {},
    create: {
      name: "free",
      displayName: "Free Tier",
      description: "Basic starter plan for small Union Porishods",
      monthlyPriceBDT: 0,
      yearlyPriceBDT: 0,
      defaultCitizenLimit: 500,
      defaultStaffLimit: 5,
      defaultCertificateLimit: 100,
      defaultStorageLimit: 100,
      canIssueCertificates: true,
      canCollectHoldingTax: false,
      canManageTradeLicense: false,
      canSendSms: false,
      canUseCustomDomain: false,
    },
  })

  const standardPlan = await prisma.subscriptionPlan.upsert({
    where: { name: "standard" },
    update: {},
    create: {
      name: "standard",
      displayName: "Standard Plan",
      description: "Comprehensive package for active Union Porishods",
      monthlyPriceBDT: 1200,
      yearlyPriceBDT: 12000,
      defaultCitizenLimit: 5000,
      defaultStaffLimit: 25,
      defaultCertificateLimit: 2000,
      defaultStorageLimit: 1000,
      canIssueCertificates: true,
      canCollectHoldingTax: true,
      canManageTradeLicense: true,
      canSendSms: true,
      canUseCustomDomain: false,
    },
  })

  const premiumPlan = await prisma.subscriptionPlan.upsert({
    where: { name: "premium" },
    update: {},
    create: {
      name: "premium",
      displayName: "Premium Enterprise",
      description: "Full suite with dedicated domain and unlimited operations",
      monthlyPriceBDT: 2500,
      yearlyPriceBDT: 25000,
      defaultCitizenLimit: 50000,
      defaultStaffLimit: 100,
      defaultCertificateLimit: 20000,
      defaultStorageLimit: 10000,
      canIssueCertificates: true,
      canCollectHoldingTax: true,
      canManageTradeLicense: true,
      canSendSms: true,
      canUseCustomDomain: true,
    },
  })

  console.log("Seeding Union Porishods (Tenants)...")

  const findGeoIds = async (geography: {
    division: string
    district: string
    upazila: string
    union: string
  }) => {
    const matched = await prisma.union.findFirst({
      where: {
        name: { equals: geography.union, mode: "insensitive" },
        upazila: {
          name: { equals: geography.upazila, mode: "insensitive" },
          district: {
            name: { equals: geography.district, mode: "insensitive" },
            division: {
              name: { equals: geography.division, mode: "insensitive" },
            },
          },
        },
      },
      select: {
        id: true,
        upazilaId: true,
        upazila: {
          select: {
            districtId: true,
            district: {
              select: {
                divisionId: true,
              },
            },
          },
        },
      },
    })
    return matched
      ? {
          unionId: matched.id,
          upazilaId: matched.upazilaId,
          districtId: matched.upazila.districtId,
          divisionId: matched.upazila.district.divisionId,
        }
      : {
          unionId: null,
          upazilaId: null,
          districtId: null,
          divisionId: null,
        }
  }

  const savarGeo = await findGeoIds({
    division: "Dhaka",
    district: "Dhaka",
    upazila: "Savar",
    union: "Savar Sadar",
  })

  const dhamraiGeo = await findGeoIds({
    division: "Dhaka",
    district: "Dhaka",
    upazila: "Dhamrai",
    union: "Dhamrai Sadar",
  })

  const gazipurGeo = await findGeoIds({
    division: "Dhaka",
    district: "Gazipur",
    upazila: "Gazipur Sadar",
    union: "Gazipur Sadar",
  })

  const savarTenant = await prisma.tenant.upsert({
    where: { slug: "savar-up" },
    update: {
      ...savarGeo,
      secretarySignature: "https://example.com/signatures/savar-sec.png",
      chairmanSignature: "https://example.com/signatures/savar-chair.png",
      facebookUrl: "https://facebook.com/savarup",
    },
    create: {
      slug: "savar-up",
      name: "Savar Union Porishod",
      nameBn: "সাভার ইউনিয়ন পরিষদ",
      type: "UNION_PORISHOD",
      ...savarGeo,
      secretaryName: "Md. Rahim Uddin",
      secretarySignature: "https://example.com/signatures/savar-sec.png",
      chairmanName: "Chairman Savar",
      chairmanSignature: "https://example.com/signatures/savar-chair.png",
      facebookUrl: "https://facebook.com/savarup",
      email: "info@savar.uphub.gov.bd",
      phone: "+880 1700-000001",
      isActive: true,
    },
  })

  const dhamraiTenant = await prisma.tenant.upsert({
    where: { slug: "dhamrai-up" },
    update: {
      ...dhamraiGeo,
      secretarySignature: "https://example.com/signatures/dhamrai-sec.png",
      chairmanSignature: "https://example.com/signatures/dhamrai-chair.png",
      facebookUrl: "https://facebook.com/dhamraiup",
    },
    create: {
      slug: "dhamrai-up",
      name: "Dhamrai Union Porishod",
      nameBn: "ধামরাই ইউনিয়ন পরিষদ",
      type: "UNION_PORISHOD",
      ...dhamraiGeo,
      secretaryName: "Abul Kalam",
      secretarySignature: "https://example.com/signatures/dhamrai-sec.png",
      chairmanName: "Chairman Dhamrai",
      chairmanSignature: "https://example.com/signatures/dhamrai-chair.png",
      facebookUrl: "https://facebook.com/dhamraiup",
      email: "info@dhamrai.uphub.gov.bd",
      phone: "+880 1700-000002",
      isActive: true,
    },
  })

  const gazipurTenant = await prisma.tenant.upsert({
    where: { slug: "gazipur-up" },
    update: {
      ...gazipurGeo,
      secretarySignature: "https://example.com/signatures/gazipur-sec.png",
      chairmanSignature: "https://example.com/signatures/gazipur-chair.png",
      facebookUrl: "https://facebook.com/gazipurup",
    },
    create: {
      slug: "gazipur-up",
      name: "Gazipur Union Porishod",
      nameBn: "গাজীপুর ইউনিয়ন পরিষদ",
      type: "UNION_PORISHOD",
      ...gazipurGeo,
      secretaryName: "Fazlul Haque",
      secretarySignature: "https://example.com/signatures/gazipur-sec.png",
      chairmanName: "Chairman Gazipur",
      chairmanSignature: "https://example.com/signatures/gazipur-chair.png",
      facebookUrl: "https://facebook.com/gazipurup",
      email: "info@gazipur.uphub.gov.bd",
      phone: "+880 1700-000003",
      isActive: true,
    },
  })

  console.log("Seeding Subscriptions linked to Tenants...")

  const tenantSubscriptions = [
    {
      tenantId: savarTenant.id,
      planId: freePlan.id,
      status: "ACTIVE",
      billingCycle: "YEARLY",
      pricePerMonth: 0,
      pricePerYear: 0,
      currentPeriodStart: new Date("2026-01-01"),
      currentPeriodEnd: new Date("2026-12-31"),
    },
    {
      tenantId: dhamraiTenant.id,
      planId: standardPlan.id,
      status: "ACTIVE",
      billingCycle: "YEARLY",
      pricePerMonth: 1200,
      pricePerYear: 12000,
      currentPeriodStart: new Date("2026-01-01"),
      currentPeriodEnd: new Date("2026-12-31"),
    },
    {
      tenantId: gazipurTenant.id,
      planId: premiumPlan.id,
      status: "ACTIVE",
      billingCycle: "YEARLY",
      pricePerMonth: 2500,
      pricePerYear: 25000,
      currentPeriodStart: new Date("2026-01-01"),
      currentPeriodEnd: new Date("2026-12-31"),
    },
  ]

  for (const sub of tenantSubscriptions) {
    await prisma.subscription.upsert({
      where: { tenantId: sub.tenantId },
      update: sub,
      create: sub,
    })
    console.log(`Seeded subscription for tenant ID ${sub.tenantId}`)
  }

  console.log("Successfully seeded plans, tenants and subscriptions into database.")
}

main()
  .catch((e) => {
    console.error("Error seeding subscriptions:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
