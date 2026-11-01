import { resolve } from "node:path";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../packages/db/generated/main/client.js";

const WORKSPACE_ROOT = resolve(import.meta.dirname, "..");
config({ path: resolve(WORKSPACE_ROOT, ".env") });
config();

const connectionString = process.env.MAIN_DATABASE_URL || process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString: connectionString! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const cqs = await prisma.cq.findMany({
    where: {
      NOT: {
        reference: {
          equals: [],
        },
      },
    },
    select: {
      id: true,
      reference: true,
      questionA: true,
      chapter: {
        select: {
          nameBn: true,
        },
      },
    },
  });

  const matchingCqs = cqs.filter((cq) =>
    cq.reference.some((r) => r.trim().startsWith("অনন্য প্রশ্ন"))
  );

  console.log(`Found ${matchingCqs.length} CQ(s) with reference starting with "অনন্য প্রশ্ন":\n`);

  let updatedCount = 0;
  for (const cq of matchingCqs) {
    const originalRefs = cq.reference;
    const cleanedRefs = originalRefs.filter((r) => !r.trim().startsWith("অনন্য প্রশ্ন"));

    console.log(`[CQ ${cq.id}] (${cq.chapter?.nameBn}):`);
    console.log(`  Before: ${JSON.stringify(originalRefs)}`);
    console.log(`  After:  ${JSON.stringify(cleanedRefs)}`);

    await prisma.cq.update({
      where: { id: cq.id },
      data: {
        reference: cleanedRefs,
      },
    });
    updatedCount++;
  }

  console.log(`\n✅ Successfully updated ${updatedCount} CQ(s).`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
