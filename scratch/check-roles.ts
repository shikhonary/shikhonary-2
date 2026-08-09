import { db } from "../packages/db/src/main";

async function check() {
  try {
    const roles = await db.role.findMany();
    console.log("ROLES IN DB:", roles);
  } catch (error) {
    console.error("ERROR QUERYING ROLES:", error);
  } finally {
    await db.$disconnect();
  }
}

check();
