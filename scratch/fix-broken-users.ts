import { db } from "../packages/db/src/main";

const PHONE_EMAIL_DOMAIN = "phone.bec.local";

async function fix() {
  try {
    const brokenUsers = await db.user.findMany({
      where: {
        email: { endsWith: `@${PHONE_EMAIL_DOMAIN}` },
        phoneNumber: null
      }
    });

    console.log(`Found ${brokenUsers.length} broken user records.`);

    for (const user of brokenUsers) {
      if (!user.email) continue;
      const phone = user.email.replace(`@${PHONE_EMAIL_DOMAIN}`, "");
      console.log(`Fixing user: ${user.name} (${phone})...`);

      const role = await db.role.upsert({
        where: { name: "USER" },
        update: {},
        create: {
          name: "USER",
          description: "Default standard user role"
        }
      });

      await db.user.update({
        where: { id: user.id },
        data: {
          phoneNumber: phone,
          emailVerified: true,
          roles: {
            connect: { id: role.id }
          }
        }
      });

      console.log(`Successfully fixed user: ${user.name}`);
    }
  } catch (error) {
    console.error("ERROR FIXING BROKEN USERS:", error);
  } finally {
    await db.$disconnect();
  }
}

fix();
