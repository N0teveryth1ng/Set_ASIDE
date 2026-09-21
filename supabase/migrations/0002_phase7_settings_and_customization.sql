-- Set-Aside — Phase 7: Settings & customization
-- Category: hidden (removed from breakdown/totals but rows stay linked) and
-- sortOrder (transaction dropdown / management ordering). Settings: cards —
-- ordered, visible subset of the Overview dashboard sections.
-- Applied against the live project with: npx prisma db execute --file supabase/migrations/0002_phase7_settings_and_customization.sql

ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "hidden" boolean NOT NULL DEFAULT false;
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "sortOrder" integer NOT NULL DEFAULT 0;
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "cards" jsonb NOT NULL DEFAULT '["hero","money","tax","breakdown","trend"]'::jsonb;

CREATE INDEX IF NOT EXISTS "Category_userId_sortOrder_idx" ON "Category" ("userId", "sortOrder");