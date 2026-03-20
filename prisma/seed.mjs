import "dotenv/config";

import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required for seeding.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const accounts = [
  {
    label: "Admin",
    email: process.env.SEED_ADMIN_EMAIL ?? "admin@freelance.local",
    password: process.env.SEED_ADMIN_PASSWORD ?? "Admin123!Secure",
    name: process.env.SEED_ADMIN_NAME ?? "Administrator",
    role: "ADMIN",
  },
  {
    label: "Freelancer",
    email: process.env.SEED_FREELANCER_EMAIL ?? "freelancer@freelance.local",
    password: process.env.SEED_FREELANCER_PASSWORD ?? "Freelancer123!Secure",
    name: process.env.SEED_FREELANCER_NAME ?? "Freelancer Demo",
    role: "FREELANCER",
  },
  {
    label: "Customer",
    email: process.env.SEED_CUSTOMER_EMAIL ?? "customer@freelance.local",
    password: process.env.SEED_CUSTOMER_PASSWORD ?? "Customer123!Secure",
    name: process.env.SEED_CUSTOMER_NAME ?? "Customer Demo",
    role: "CUSTOMER",
  },
];

async function upsertUser(user) {
  const hashedPassword = await bcrypt.hash(user.password, 10);

  const saved = await prisma.user.upsert({
    where: { email: user.email },
    update: {
      name: user.name,
      password: hashedPassword,
      role: user.role,
    },
    create: {
      email: user.email,
      name: user.name,
      password: hashedPassword,
      role: user.role,
    },
    select: { id: true, email: true, role: true },
  });

  await prisma.wallet.upsert({
    where: { userId: saved.id },
    update: {},
    create: {
      userId: saved.id,
      balance: 0,
    },
  });

  return saved;
}

async function main() {
  const seeded = [];

  for (const account of accounts) {
    const saved = await upsertUser(account);
    seeded.push({
      label: account.label,
      email: saved.email,
      password: account.password,
      role: saved.role,
    });
  }

  console.log("Seed completed.");
  for (const account of seeded) {
    console.log(`${account.label} (${account.role}): ${account.email} / ${account.password}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
