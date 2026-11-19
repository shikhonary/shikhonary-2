import { resolve } from "node:path";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../packages/db/generated/main/client.js";

const WORKSPACE_ROOT = resolve(import.meta.dirname, "..");
config({ path: resolve(WORKSPACE_ROOT, ".env") });
config({ path: resolve(WORKSPACE_ROOT, "packages/db/.env") });
config();

const connectionString = process.env.MAIN_DATABASE_URL || process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString: connectionString! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const classes = await prisma.academicClass.findMany({
    where: {
      OR: [
        { nameEn: { in: ["Nine", "Ten"] } },
        { nameBn: { in: ["নবম", "দশম"] } },
      ],
    },
  });
  console.log("Classes:", classes.map((c) => ({ id: c.id, nameEn: c.nameEn, nameBn: c.nameBn })));

  const subjects = await prisma.academicSubject.findMany({
    where: {
      OR: [
        { nameEn: { contains: "Information", mode: "insensitive" } },
        { nameEn: { contains: "ICT", mode: "insensitive" } },
        { nameBn: { contains: "তথ্য" } },
        { nameBn: { contains: "যোগাযোগ" } },
        { nameBn: { contains: "আইসিটি" } },
      ],
    },
    include: {
      classSubjects: {
        include: {
          academicClass: true,
        },
      },
      chapters: {
        orderBy: { position: "asc" },
      },
    },
  });

  console.log("Subjects found:", JSON.stringify(subjects.map((s) => ({
    id: s.id,
    nameEn: s.nameEn,
    nameBn: s.nameBn,
    classes: s.classSubjects.map((cs) => cs.academicClass.nameEn),
    chapters: s.chapters.map((c) => ({ id: c.id, pos: c.position, nameBn: c.nameBn, nameEn: c.nameEn })),
  })), null, 2));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
