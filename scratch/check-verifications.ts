import { db } from "../packages/db/src/main";

async function check() {
  try {
    const verifications = await db.verification.findMany({
      orderBy: { createdAt: "desc" },
      take: 5
    });
    console.log("VERIFICATIONS IN DB:", verifications);
  } catch (error) {
    console.error("ERROR QUERYING VERIFICATIONS:", error);
  } finally {
    await db.$disconnect();
  }
}

check();
