import "dotenv/config"
import { db } from "../../src/index"

async function main() {
  console.log("Fetching teacher plan...")

  const teacherPlan = await db.subscriptionPlan.findUnique({
    where: { name: "teacher" },
  })

  if (!teacherPlan) {
    console.error("Error: 'teacher' plan not found in database! Please run seed-subscriptions first.")
    process.exit(1)
  }

  console.log(`Found teacher plan (ID: ${teacherPlan.id}, DisplayName: ${teacherPlan.displayName})`)

  // Fetch all tenants
  const tenants = await db.tenant.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      creditBalance: true,
      subscription: {
        select: {
          id: true,
          planId: true,
          status: true,
          billingCycle: true,
          plan: {
            select: { name: true, displayName: true },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  console.log(`Found ${tenants.length} tenants in database.`)

  const now = new Date()
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59)
  const qbFeatures = (teacherPlan.features as any)?.questionPaperBuilder || {}
  const initialCredits = qbFeatures.creditsMonthly ?? 500

  let createdCount = 0
  let updatedCount = 0

  for (const tenant of tenants) {
    const existingSub = tenant.subscription

    if (!existingSub) {
      // 1. Create new subscription with teacher plan
      await db.$transaction(async (tx) => {
        const sub = await tx.subscription.create({
          data: {
            tenantId: tenant.id,
            planId: teacherPlan.id,
            status: "ACTIVE",
            billingCycle: "MONTHLY",
            pricePerMonth: teacherPlan.monthlyPriceBDT,
            pricePerYear: teacherPlan.yearlyPriceBDT,
            currentPeriodStart: now,
            currentPeriodEnd: endOfYear,
          },
        })

        // Give initial credit allocation
        const newBalance = (tenant.creditBalance || 0) + initialCredits
        await tx.tenant.update({
          where: { id: tenant.id },
          data: { creditBalance: newBalance },
        })

        await tx.creditTransaction.create({
          data: {
            tenantId: tenant.id,
            type: "SUBSCRIPTION_REFRESH",
            amount: initialCredits,
            balance: newBalance,
            description: `${teacherPlan.displayName} সাবস্ক্রিপশন বরাদ্দ বাবদ ${initialCredits} ক্রেডিট যোগ হয়েছে`,
            metadata: {
              planId: teacherPlan.id,
              planName: teacherPlan.name,
              billingCycle: "MONTHLY",
              creditsAdded: initialCredits,
            },
          },
        })

        await tx.subscriptionHistory.create({
          data: {
            subscriptionId: sub.id,
            event: "CREATED",
            toPlanId: teacherPlan.id,
            toStatus: "ACTIVE",
            reason: "Auto-assigned teacher plan via script",
          },
        })
      })

      console.log(`[CREATED] Assigned 'teacher' plan to tenant "${tenant.name}" (${tenant.slug})`)
      createdCount++
    } else {
      // 2. Update existing subscription to teacher plan
      await db.$transaction(async (tx) => {
        await tx.subscription.update({
          where: { id: existingSub.id },
          data: {
            planId: teacherPlan.id,
            pricePerMonth: teacherPlan.monthlyPriceBDT,
            pricePerYear: teacherPlan.yearlyPriceBDT,
            status: "ACTIVE",
          },
        })

        // Ensure tenant has at least initialCredits
        if ((tenant.creditBalance || 0) < initialCredits) {
          const creditsToAdd = initialCredits - (tenant.creditBalance || 0)
          const newBalance = initialCredits
          await tx.tenant.update({
            where: { id: tenant.id },
            data: { creditBalance: newBalance },
          })

          await tx.creditTransaction.create({
            data: {
              tenantId: tenant.id,
              type: "SUBSCRIPTION_REFRESH",
              amount: creditsToAdd,
              balance: newBalance,
              description: `${teacherPlan.displayName} সাবস্ক্রিপশন আপডেট বাবদ ${creditsToAdd} ক্রেডিট সমন্বয় করা হয়েছে`,
              metadata: {
                planId: teacherPlan.id,
                planName: teacherPlan.name,
                creditsAdded: creditsToAdd,
              },
            },
          })
        }

        await tx.subscriptionHistory.create({
          data: {
            subscriptionId: existingSub.id,
            event: "PLAN_CHANGED",
            fromPlanId: existingSub.planId,
            toPlanId: teacherPlan.id,
            reason: "Updated to teacher plan via script",
          },
        })
      })

      console.log(
        `[UPDATED] Tenant "${tenant.name}" (${tenant.slug}) updated from "${existingSub.plan?.displayName || existingSub.planId}" to 'teacher' plan`
      )
      updatedCount++
    }
  }

  console.log("\n=== SUMMARY ===")
  console.log(`Total Tenants Processed: ${tenants.length}`)
  console.log(`New Subscriptions Created: ${createdCount}`)
  console.log(`Subscriptions Updated: ${updatedCount}`)
}

main()
  .catch((e) => {
    console.error("Error assigning teacher plan:", e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
