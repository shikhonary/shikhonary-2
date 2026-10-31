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
  const chs = await prisma.academicChapter.findMany({
    where: { subjectId: "cmtr3l0go0002p4tyy1czaex0" },
    orderBy: { position: "asc" },
    take: 5
  });
  console.log("Sample chapters:", JSON.stringify(chs, null, 2));

  // Also check if subject "বাংলা ১ম পত্র" for Nine/Ten has academicYearId
  const subj = await prisma.academicSubject.findUnique({
    where: { id: "cmvwfj8h30002twejxun6c8eg" },
    include: {
      chapters: true
    }
  });
  console.log("Subject 9-10 Bangla 1st:", subj);
}

check().catch(console.error).finally(() => prisma.$disconnect());
