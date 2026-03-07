import "dotenv/config";

import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import Database from "better-sqlite3";

function resolveSqlitePath(databaseUrl) {
  if (!databaseUrl || !databaseUrl.startsWith("file:")) {
    throw new Error(
      "DATABASE_URL must be SQLite and start with 'file:' for this seed script.",
    );
  }

  const raw = databaseUrl.slice("file:".length).split("?")[0];
  if (!raw) {
    throw new Error("DATABASE_URL points to an empty SQLite file path.");
  }

  return path.isAbsolute(raw) ? raw : path.resolve(process.cwd(), raw);
}

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@freelance.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!Secure";
  const adminName = process.env.SEED_ADMIN_NAME ?? "Administrator";

  const dbPath = resolveSqlitePath(process.env.DATABASE_URL);
  const db = new Database(dbPath);

  try {
    const hasUserTable = db
      .prepare(
        "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'User'",
      )
      .get();

    if (!hasUserTable) {
      throw new Error(
        'Table "User" is missing. Run migrations before seeding the database.',
      );
    }

    const hasWalletTable = db
      .prepare(
        "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'Wallet'",
      )
      .get();

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    let adminId = "";

    const tx = db.transaction(() => {
      const existing = db
        .prepare('SELECT "id" FROM "User" WHERE "email" = ?')
        .get(adminEmail);

      if (existing) {
        adminId = existing.id;
        db.prepare(
          'UPDATE "User" SET "name" = ?, "password" = ?, "role" = ? WHERE "id" = ?',
        ).run(adminName, hashedPassword, "ADMIN", adminId);
      } else {
        adminId = randomUUID();
        db.prepare(
          'INSERT INTO "User" ("id", "name", "email", "password", "role") VALUES (?, ?, ?, ?, ?)',
        ).run(adminId, adminName, adminEmail, hashedPassword, "ADMIN");
      }

      if (hasWalletTable) {
        const walletExists = db
          .prepare('SELECT 1 FROM "Wallet" WHERE "userId" = ?')
          .get(adminId);

        if (!walletExists) {
          db.prepare(
            'INSERT INTO "Wallet" ("id", "userId", "balance") VALUES (?, ?, ?)',
          ).run(randomUUID(), adminId, 0);
        }
      }
    });

    tx();

    console.log("Seed completed.");
    console.log(`Admin email: ${adminEmail}`);
    console.log(`Admin password: ${adminPassword}`);
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
