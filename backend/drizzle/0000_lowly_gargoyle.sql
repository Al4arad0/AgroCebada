CREATE TABLE "observations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parcel_id" uuid NOT NULL,
	"date" timestamp NOT NULL,
	"variables" jsonb NOT NULL,
	"observed_yield" double precision,
	"yield_unit" text DEFAULT 't/ha' NOT NULL,
	"cycle" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parcels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"state" text NOT NULL,
	"municipality" text,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"area" double precision,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "predictions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parcel_id" uuid NOT NULL,
	"prediction_date" timestamp DEFAULT now() NOT NULL,
	"predicted_yield" double precision NOT NULL,
	"unit" text DEFAULT 't/ha' NOT NULL,
	"model_id" text NOT NULL,
	"model_version" text NOT NULL,
	"lower_bound" double precision,
	"upper_bound" double precision,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "observations" ADD CONSTRAINT "observations_parcel_id_parcels_id_fk" FOREIGN KEY ("parcel_id") REFERENCES "public"."parcels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_parcel_id_parcels_id_fk" FOREIGN KEY ("parcel_id") REFERENCES "public"."parcels"("id") ON DELETE cascade ON UPDATE no action;