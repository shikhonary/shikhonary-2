import "dotenv/config"
import { db } from "../../src/index"

async function main() {
  await db.subscriptionPlan.updateMany({
    where: { name: { in: ["free", "standard", "premium"] } },
    data: { isActive: false },
  })
  const plans = await db.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { monthlyPriceBDT: "asc" },
  })
  console.log("=== ACTIVE SUBSCRIPTION PLANS IN DATABASE ===")
  console.log(JSON.stringify(plans, null, 2))
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
