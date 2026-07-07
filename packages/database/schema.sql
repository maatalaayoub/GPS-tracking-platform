-- ============================================================
-- GPS Platform — full database schema
-- Paste this whole file into the Supabase SQL Editor and run it
-- to create all tables, enums, and indexes.
-- Safe to re-run (uses IF NOT EXISTS where possible).
-- ============================================================

-- ---------- Enums ----------
DO $$ BEGIN
  CREATE TYPE "device_status" AS ENUM ('active', 'inactive', 'maintenance');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "user_role" AS ENUM ('admin', 'manager', 'viewer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ---------- Users ----------
CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL,
  "full_name" text,
  "role" "user_role" DEFAULT 'viewer' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "users_email_unique" UNIQUE ("email")
);

-- ---------- Devices ----------
CREATE TABLE IF NOT EXISTS "devices" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "unique_id" text NOT NULL,
  "name" text NOT NULL,
  "protocol" text,
  "status" "device_status" DEFAULT 'active' NOT NULL,
  "owner_id" uuid REFERENCES "users" ("id") ON DELETE SET NULL,
  "last_seen_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "devices_unique_id_unique" UNIQUE ("unique_id")
);

-- ---------- Positions ----------
CREATE TABLE IF NOT EXISTS "positions" (
  "id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "device_id" uuid NOT NULL REFERENCES "devices" ("id") ON DELETE CASCADE,
  "latitude" double precision NOT NULL,
  "longitude" double precision NOT NULL,
  "altitude" double precision,
  "speed" double precision,
  "heading" double precision,
  "accuracy" double precision,
  "satellites" integer,
  "valid" boolean DEFAULT true NOT NULL,
  "protocol" text,
  "raw" jsonb,
  "device_time" timestamp with time zone,
  "server_time" timestamp with time zone DEFAULT now() NOT NULL
);

-- ---------- Indexes ----------
CREATE INDEX IF NOT EXISTS "devices_owner_idx"
  ON "devices" USING btree ("owner_id");

CREATE INDEX IF NOT EXISTS "positions_device_time_idx"
  ON "positions" USING btree ("device_id", "device_time");

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "devices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "positions" ENABLE ROW LEVEL SECURITY;

-- Helper: is the current user an admin or manager?
CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------- Users RLS ----------
-- Users can read their own row; admins/managers can read all.
DROP POLICY IF EXISTS "Users can read own profile" ON "users";
CREATE POLICY "Users can read own profile"
  ON "users"
  FOR SELECT
  USING (
    id = auth.uid()
    OR public.is_admin_or_manager()
  );

-- Only admins can update user roles.
DROP POLICY IF EXISTS "Admins can update users" ON "users";
CREATE POLICY "Admins can update users"
  ON "users"
  FOR UPDATE
  USING (public.is_admin_or_manager())
  WITH CHECK (public.is_admin_or_manager());

-- ---------- Devices RLS ----------
-- Owners can read/update/delete their own devices.
-- Admins/managers can read/manage all devices.
DROP POLICY IF EXISTS "Devices owner read" ON "devices";
CREATE POLICY "Devices owner read"
  ON "devices"
  FOR SELECT
  USING (
    owner_id = auth.uid()
    OR public.is_admin_or_manager()
  );

DROP POLICY IF EXISTS "Devices owner update" ON "devices";
CREATE POLICY "Devices owner update"
  ON "devices"
  FOR UPDATE
  USING (
    owner_id = auth.uid()
    OR public.is_admin_or_manager()
  )
  WITH CHECK (
    owner_id = auth.uid()
    OR public.is_admin_or_manager()
  );

DROP POLICY IF EXISTS "Devices owner delete" ON "devices";
CREATE POLICY "Devices owner delete"
  ON "devices"
  FOR DELETE
  USING (
    owner_id = auth.uid()
    OR public.is_admin_or_manager()
  );

-- Only admins/managers can insert devices directly.
DROP POLICY IF EXISTS "Admins can insert devices" ON "devices";
CREATE POLICY "Admins can insert devices"
  ON "devices"
  FOR INSERT
  WITH CHECK (public.is_admin_or_manager());

-- ---------- Positions RLS ----------
-- Users can read positions for devices they own.
-- Admins/managers can read all positions.
DROP POLICY IF EXISTS "Positions owner read" ON "positions";
CREATE POLICY "Positions owner read"
  ON "positions"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.devices
      WHERE devices.id = positions.device_id
        AND (
          devices.owner_id = auth.uid()
          OR public.is_admin_or_manager()
        )
    )
  );

-- Only service_role / authenticated admins can insert positions.
-- The TCP server uses service_role, so it bypasses RLS by default.
DROP POLICY IF EXISTS "Admins can insert positions" ON "positions";
CREATE POLICY "Admins can insert positions"
  ON "positions"
  FOR INSERT
  WITH CHECK (public.is_admin_or_manager());

-- ============================================================
-- Trigger: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_users_updated_at ON "users";
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON "users"
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_devices_updated_at ON "devices";
CREATE TRIGGER set_devices_updated_at
  BEFORE UPDATE ON "devices"
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
