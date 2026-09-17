-- Set-Aside — Row Level Security
-- Every table is scoped to its owning auth user (auth.uid() = the JWT `sub`).
-- Users can only ever touch their own rows; there are NO cross-user policies.
-- Applied against the live project with: npx prisma db execute --file supabase/migrations/0001_row_level_security.sql

-- Grants: the PostgREST roles must have table/type privileges for policies to be reachable.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT USAGE ON TYPE "CategoryType", "EntrySource", "Preset" TO anon, authenticated, service_role;

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Entry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Settings" ENABLE ROW LEVEL SECURITY;

-- ============================= "User" =============================
-- a user sees / mutates only their own auth row (id == JWT sub)
CREATE POLICY "user_select_own" ON "User"
  FOR SELECT TO authenticated, anon
  USING (auth.uid()::text = "id");

CREATE POLICY "user_insert_own" ON "User"
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = "id");

CREATE POLICY "user_update_own" ON "User"
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = "id")
  WITH CHECK (auth.uid()::text = "id");

CREATE POLICY "user_delete_own" ON "User"
  FOR DELETE TO authenticated
  USING (auth.uid()::text = "id");

-- =========================== "Category" ===========================
CREATE POLICY "category_select_own" ON "Category"
  FOR SELECT TO authenticated, anon
  USING (auth.uid()::text = "userId");

CREATE POLICY "category_insert_own" ON "Category"
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "category_update_own" ON "Category"
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "category_delete_own" ON "Category"
  FOR DELETE TO authenticated
  USING (auth.uid()::text = "userId");

-- =========================== "Entry" ==============================
CREATE POLICY "entry_select_own" ON "Entry"
  FOR SELECT TO authenticated, anon
  USING (auth.uid()::text = "userId");

CREATE POLICY "entry_insert_own" ON "Entry"
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "entry_update_own" ON "Entry"
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "entry_delete_own" ON "Entry"
  FOR DELETE TO authenticated
  USING (auth.uid()::text = "userId");

-- ========================== "Settings" ============================
CREATE POLICY "settings_select_own" ON "Settings"
  FOR SELECT TO authenticated, anon
  USING (auth.uid()::text = "userId");

CREATE POLICY "settings_insert_own" ON "Settings"
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "settings_update_own" ON "Settings"
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "settings_delete_own" ON "Settings"
  FOR DELETE TO authenticated
  USING (auth.uid()::text = "userId");