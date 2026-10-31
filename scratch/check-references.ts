import { resolve } from "node:path";
import { config } from "dotenv";
config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), "packages/db/.env") });
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../packages/db/generated/main/client.ts";

const connectionString = process.env.MAIN_DATABASE_URL || process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function check() {
  const mcqs = await prisma.mcq.findMany({
    where: { 
      NOT: { chapterId: "cmvwfqnp30000y0ejd96mhik5" },
    },
    take: 20,
    select: { id: true, reference: true }
  });
  const filtered = mcqs.filter(m => m.reference && m.reference.length > 0);
  console.log("Existing references from other chapters:", JSON.stringify(filtered, null, 2));
}

check().finally(() => prisma.$disconnect());
