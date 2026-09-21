-- Set-Aside — Phase 8 Recurring entries
-- A Template is a monthly recurring amount the user can materialize into entries.
-- Generated entries are tagged source='recurring' with a templateId back-reference.
-- Idempotency rule: one generated entry per (templateId, calendar month), enforced
-- by the generate route skipping months that already have an entry for that template.
-- Applied against the live project with: npx prisma db execute --file supabase/migrations/0003_phase8_recurring_entries.sql

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

ALTER TYPE "EntrySource" ADD VALUE IF NOT EXISTS 'recurring';

CREATE TABLE "Template" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "amountCents" INTEGER NOT NULL CHECK ("amountCents" > 0),
  "dayOfMonth" INTEGER NOT NULL CHECK ("dayOfMonth" BETWEEN 1 AND 31),
  "startDate" DATE NOT NULL,
  "endDate" DATE,
  "note" TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  "categoryId" TEXT REFERENCES "Category"("id") ON DELETE SET NULL,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX "Template_userId_idx" ON "Template"("userId");
CREATE INDEX "Template_userId_active_idx" ON "Template"("userId", active);

ALTER TABLE "Entry" ADD COLUMN "templateId" TEXT REFERENCES "Template"("id") ON DELETE SET NULL;
CREATE INDEX "Entry_templateId_idx" ON "Entry"("templateId");

-- ========================== "Template" ===========================
ALTER TABLE "Template" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "template_select_own" ON "Template"
  FOR SELECT TO authenticated, anon
  USING (auth.uid()::text = "userId");

CREATE POLICY "template_insert_own" ON "Template"
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "template_update_own" ON "Template"
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "template_delete_own" ON "Template"
  FOR DELETE TO authenticated
  USING (auth.uid()::text = "userId");