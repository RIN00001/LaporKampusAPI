import { PrismaClient, UserRole, DivisionType } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("staff123", 10);

  await prisma.user.upsert({
    where: { email: "ict.staff@uc.ac.id" },
    update: {},
    create: {
      name: "ICT Staff",
      email: "ict.staff@uc.ac.id",
      password,
      role: UserRole.STAFF,
      division: DivisionType.ICT,
    },
  });

  await prisma.user.upsert({
    where: { email: "pm.staff@uc.ac.id" },
    update: {},
    create: {
      name: "PM Staff",
      email: "pm.staff@uc.ac.id",
      password,
      role: UserRole.STAFF,
      division: DivisionType.PM,
    },
  });

  console.log("Seed complete: ICT and PM staff created.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 