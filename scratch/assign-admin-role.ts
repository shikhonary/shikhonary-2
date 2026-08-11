import "dotenv/config";
import { db } from "../packages/db/src/main";

async function main() {
  try {
    console.log("Ensuring ADMIN role exists...");
    const adminRole = await db.role.upsert({
      where: { name: "ADMIN" },
      update: {},
      create: {
        name: "ADMIN",
        description: "Administrator role",
      },
    });
    console.log("ADMIN role exists:", adminRole);

    const email = "mrdracademic@gmail.com";
    console.log(`Searching for user with email "${email}"...`);
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`User with email "${email}" was not found.`);
      return;
    }

    console.log(`Found user: ${user.name} (${user.id}). Associating with ADMIN role...`);

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        roles: {
          connect: { id: adminRole.id },
        },
      },
      include: {
        roles: true,
      },
    });

    console.log("Successfully assigned ADMIN role to user:", updatedUser);
  } catch (error) {
    console.error("Error running script:", error);
  } finally {
    await db.$disconnect();
  }
}

main();
