import "dotenv/config";
import { db } from "../packages/db/src/main";

async function main() {
  try {
    console.log("Looking up tenant with slug 'mandori'...");
    const tenant = await db.tenant.findUnique({
      where: { slug: "mandori" },
    });

    if (!tenant) {
      console.error("Tenant 'mandori' not found in database.");
      return;
    }

    console.log(`Found tenant: ${tenant.name} (${tenant.id}). Updating slug to 'mand'...`);

    const updatedTenant = await db.tenant.update({
      where: { id: tenant.id },
      data: {
        slug: "mand",
      },
    });

    console.log("Successfully updated tenant slug:", updatedTenant);
  } catch (error) {
    console.error("Error updating tenant slug:", error);
  } finally {
    await db.$disconnect();
  }
}

main();
