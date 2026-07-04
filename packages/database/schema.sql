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
