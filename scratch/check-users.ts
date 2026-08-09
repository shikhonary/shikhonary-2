import { db } from "../packages/db/src/main";

async function check() {
  try {
    const users = await db.user.findMany({
      include: { roles: true },
      orderBy: { createdAt: "desc" },
      take: 5
    });
    console.log("USERS IN DB:", users);
  } catch (error) {
    console.error("ERROR QUERYING USERS:", error);
  } finally {
    await db.$disconnect();
  }
}

check();
