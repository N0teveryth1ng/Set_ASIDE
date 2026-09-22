// Seed: materializes one preset's default category set for a user.
// Requires a real DATABASE_URL (see .env.example) — the Supabase Postgres link.
// Usage: SEED_EMAIL="you@x.com" SEED_PRESET="Creator" npm run db:seed
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import type { PresetType } from "../lib/presets.ts";
import { getPreset } from "../lib/presets.ts";

async function main() {
  const email = process.env.SEED_EMAIL ?? "demo@set-aside.local";
  const presetName = (process.env.SEED_PRESET ?? "Creator") as PresetType;
  const preset = getPreset(presetName);

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { id: crypto.randomUUID(), email },
  });

  await prisma.settings.upsert({
    where: { userId: user.id },
    update: { activePreset: preset.preset },
    create: { userId: user.id, activePreset: preset.preset },
  });

  for (const category of preset.categories) {
    await prisma.category.upsert({
      where: { userId_name: { userId: user.id, name: category.name } },
      update: { type: category.type },
      create: { userId: user.id, name: category.name, type: category.type },
    });
  }

  console.log(
    `[seed] ${user.email} to preset ${preset.preset} (${preset.categories.length} categories)`,
  );
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});