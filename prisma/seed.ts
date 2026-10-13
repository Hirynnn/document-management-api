import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@example.com";
  const password = "[REDACTED_TEST_PASSWORD]";

  const existingAdmin = await prisma.user.findUnique({ where: { email } });

  if (existingAdmin) {
    console.log("✅ Admin user already exists.");
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      name: "Administrador",
      email,
      password: hashedPassword,
      role: "ADMIN",
      active: true,
    },
  });

  console.log(`✅ Admin created: ${admin.email}`);
  console.log(
    "⚠️ This temporary admin password is for development only and should be changed in production.",
  );
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
