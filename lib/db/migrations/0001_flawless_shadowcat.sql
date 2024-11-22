CREATE TYPE "public"."payment" AS ENUM('pending', 'in-progress', 'complete');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."timeBetweenPayments" AS ENUM('every-day', 'every-week', 'every-two-weeks', 'every-month');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "advisers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100),
	"last_name" varchar(100),
	"address" varchar(250),
	"phone" varchar(20),
	"dni_type" varchar(20),
	"dni" varchar(20),
	"status" "status" DEFAULT 'active',
	"comment" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100),
	"last_name" varchar(100),
	"address" varchar(250),
	"phone" varchar(20),
	"dni_type" varchar(20),
	"dni" varchar(20),
	"status" "status" DEFAULT 'active',
	"comment" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "credit_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"credit_id" integer,
	"status" "payment" DEFAULT 'pending',
	"nro" integer NOT NULL,
	"payment_date" timestamp NOT NULL,
	"date_paid" timestamp,
	"base_amount" numeric NOT NULL,
	"interest_amount" numeric NOT NULL,
	"total_interest" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "credits" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer,
	"adviser_id" integer,
	"status" "payment" DEFAULT 'pending',
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"credit_amount" numeric NOT NULL,
	"percentage" numeric NOT NULL,
	"quotas" integer NOT NULL,
	"base_amount" numeric NOT NULL,
	"interest_amount" numeric NOT NULL,
	"fee_amount" numeric NOT NULL,
	"total_interest" numeric NOT NULL,
	"total" numeric NOT NULL,
	"timeBetweenPayments" "timeBetweenPayments" DEFAULT 'every-week' NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "credit_payments" ADD CONSTRAINT "credit_payments_credit_id_credits_id_fk" FOREIGN KEY ("credit_id") REFERENCES "public"."credits"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "credits" ADD CONSTRAINT "credits_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "credits" ADD CONSTRAINT "credits_adviser_id_advisers_id_fk" FOREIGN KEY ("adviser_id") REFERENCES "public"."advisers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
