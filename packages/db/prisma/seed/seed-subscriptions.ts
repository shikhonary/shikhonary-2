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
      description: "Basic starter plan for small schools",
      monthlyPriceBDT: 0,
      yearlyPriceBDT: 0,
      defaultStudentLimit: 200,
      defaultTeacherLimit: 5,
      defaultExamLimit: 100,
      defaultStorageLimit: 100,
      defaultCreditLimit: 10,
      canCreateExams: true,
      canCollectFees: false,
      canUseLms: false,
      canManageAttendance: false,
      canManageLibrary: false,
      canManageTransport: false,
      canSendSms: false,
      canUseCustomDomain: false,
      canUseAiFeatures: false,
      canExportReports: true,
    },
  })

  const standardPlan = await prisma.subscriptionPlan.upsert({
    where: { name: "standard" },
    update: {},
    create: {
      name: "standard",
      displayName: "Standard Plan",
      description: "Comprehensive package for active schools",
      monthlyPriceBDT: 1200,
      yearlyPriceBDT: 12000,
      defaultStudentLimit: 1000,
      defaultTeacherLimit: 30,
      defaultExamLimit: 2000,
      defaultStorageLimit: 1000,
      defaultCreditLimit: 30,
      canCreateExams: true,
      canCollectFees: true,
      canUseLms: true,
      canManageAttendance: true,
      canManageLibrary: false,
      canManageTransport: false,
      canSendSms: true,
      canUseCustomDomain: false,
      canUseAiFeatures: false,
      canExportReports: true,
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
      defaultStudentLimit: 50000,
      defaultTeacherLimit: 100,
      defaultExamLimit: 20000,
      defaultStorageLimit: 10000,
      defaultCreditLimit: 100,
      canCreateExams: true,
      canCollectFees: true,
      canUseLms: true,
      canManageAttendance: true,
      canManageLibrary: true,
      canManageTransport: true,
      canSendSms: true,
      canUseCustomDomain: true,
      canUseAiFeatures: true,
      canExportReports: true,
    },
  })

  console.log("Seeding Institutions (Tenants)...")

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
      eiin: "107845",
      board: "Dhaka",
      address: "Savar, Dhaka",
    },
    create: {
      slug: "savar-up",
      name: "Savar High School",
      nameBn: "সাভার উচ্চ বিদ্যালয়",
      type: "SCHOOL",
      ...savarGeo,
      principalName: "Md. Rahim Uddin",
      principalSignature: "https://example.com/signatures/savar-sec.png",
      vicePrincipalName: "Vice Principal Savar",
      vicePrincipalSignature: "https://example.com/signatures/savar-chair.png",
      email: "info@savar.uphub.gov.bd",
      phone: "+880 1700-000001",
      isActive: true,
      eiin: "107845",
      board: "Dhaka",
      address: "Savar, Dhaka",
    },
  })

  const dhamraiTenant = await prisma.tenant.upsert({
    where: { slug: "dhamrai-up" },
    update: {
      ...dhamraiGeo,
      eiin: "107932",
      board: "Dhaka",
      address: "Dhamrai, Dhaka",
    },
    create: {
      slug: "dhamrai-up",
      name: "Dhamrai Model School",
      nameBn: "ধামরাই মডেল স্কুল",
      type: "SCHOOL",
      ...dhamraiGeo,
      principalName: "Abul Kalam",
      principalSignature: "https://example.com/signatures/dhamrai-sec.png",
      vicePrincipalName: "Vice Principal Dhamrai",
      vicePrincipalSignature: "https://example.com/signatures/dhamrai-chair.png",
      email: "info@dhamrai.uphub.gov.bd",
      phone: "+880 1700-000002",
      isActive: true,
      eiin: "107932",
      board: "Dhaka",
      address: "Dhamrai, Dhaka",
    },
  })

  const gazipurTenant = await prisma.tenant.upsert({
    where: { slug: "gazipur-up" },
    update: {
      ...gazipurGeo,
      eiin: "109012",
      board: "Dhaka",
      address: "Gazipur, Dhaka",
    },
    create: {
      slug: "gazipur-up",
      name: "Gazipur College & Academy",
      nameBn: "গাজীপুর কলেজ ও একাডেমি",
      type: "SCHOOL",
      ...gazipurGeo,
      principalName: "Fazlul Haque",
      principalSignature: "https://example.com/signatures/gazipur-sec.png",
      vicePrincipalName: "Vice Principal Gazipur",
      vicePrincipalSignature: "https://example.com/signatures/gazipur-chair.png",
      email: "info@gazipur.uphub.gov.bd",
      phone: "+880 1700-000003",
      isActive: true,
      eiin: "109012",
      board: "Dhaka",
      address: "Gazipur, Dhaka",
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
