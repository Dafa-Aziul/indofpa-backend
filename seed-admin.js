import bcrypt from "bcrypt";
import prisma from "./src/config/prisma.js";

async function main() {
  const hash = await bcrypt.hash("admin123", 10);

  await prisma.user.create({
    data: {
      nama: "Admin IndoFPA",
      email: "admin@gmail.com",
      password: hash,
    },
  });

  console.log("Admin created successfully!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
