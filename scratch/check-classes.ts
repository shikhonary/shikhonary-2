import { resolve } from "node:path";
import { config } from "dotenv";
config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), "packages/db/.env") });
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../packages/db/generated/main/client.ts";

const connectionString = process.env.MAIN_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("No database connection string!");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function check() {
  const classes = await prisma.academicClass.findMany({
    orderBy: { position: "asc" },
    select: { id: true, nameBn: true, nameEn: true, position: true }
  });
  console.log("CLASSES:", JSON.stringify(classes, null, 2));

  const subjects = await prisma.academicSubject.findMany({
    include: {
      classSubjects: {
        include: {
          academicClass: true
        }
      },
      chapters: {
        select: { id: true, nameBn: true, nameEn: true, position: true }
      }
    }
  });

  console.log("ALL SUBJECTS COUNT:", subjects.length);
  subjects.forEach(s => {
    const classNames = s.classSubjects.map(cs => cs.academicClass.nameEn).join(", ");
    console.log(`- Subject: [${s.id}] "${s.nameBn}" / "${s.nameEn}" (Classes: ${classNames}) - Chapters: ${s.chapters.length}`);
  });
}

check().catch(console.error).finally(() => prisma.$disconnect());
