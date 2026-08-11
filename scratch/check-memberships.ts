import "dotenv/config";
import { db } from "../packages/db/src/main";

async function main() {
  try {
    const email = "mrdracademic@gmail.com";
    const user = await db.user.findUnique({
      where: { email },
      include: {
        memberships: {
          include: {
            tenant: true,
          },
        },
      },
    });

    if (!user) {
      console.error(`User with email "${email}" not found.`);
      return;
    }

    console.log(`User memberships for ${email}:`, JSON.stringify(user.memberships, null, 2));

    // Also let's find the tenant with slug "mand"
    const tenant = await db.tenant.findUnique({
      where: { slug: "mand" },
    });
    console.log("Tenant 'mand' in DB:", tenant);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await db.$disconnect();
  }
}

main();
