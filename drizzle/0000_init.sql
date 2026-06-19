CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"key_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "api_keys_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"org_id" text,
	"github_token" text,
	"github_owner" text,
	"github_repo" text,
	"github_access_token" text,
	"webhook_secret" text,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "integrations_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "meetings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"org_id" text,
	"project_id" text,
	"project_name" text NOT NULL,
	"meeting_id" text NOT NULL,
	"meeting_url" text,
	"platform" text NOT NULL,
	"transcript" text DEFAULT '',
	"specs_detected" integer DEFAULT 0,
	"status" text DEFAULT 'processing',
	"bot_id" text,
	"branch_name" text,
	"deploy_url" text,
	"file_path" text DEFAULT '',
	"date" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"org_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text,
	"ticket_id" text,
	"read" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" text NOT NULL,
	"org_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"org_id" text,
	"name" text NOT NULL,
	"repo" text NOT NULL,
	"deploy_url" text,
	"branch_base" text DEFAULT 'main',
	"agent_tier" text DEFAULT 'standard',
	"meetings" text DEFAULT '[]' NOT NULL,
	"spec_ids" text DEFAULT '[]' NOT NULL,
	"files" text DEFAULT '[]' NOT NULL,
	"context" text DEFAULT '',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "specs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"confidence" real NOT NULL,
	"meeting_id" text NOT NULL,
	"timestamp" text NOT NULL,
	"note" text,
	"project_id" text,
	"parent_spec_id" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "swarmnet_agents" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"name" text NOT NULL,
	"domain" text NOT NULL,
	"persona" text NOT NULL,
	"model" text DEFAULT 'llama-3.3-70b-versatile' NOT NULL,
	"trust_level" text DEFAULT 'medium' NOT NULL,
	"keywords" text[] DEFAULT '{}' NOT NULL,
	"file_patterns" text[] DEFAULT '{}' NOT NULL,
	"capabilities" text[] DEFAULT '{}' NOT NULL,
	"max_active_tickets" integer DEFAULT 1 NOT NULL,
	"is_custom" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "swarmnet_artifacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" text NOT NULL,
	"file_path" text NOT NULL,
	"content" text NOT NULL,
	"is_new" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "swarmnet_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"project_id" text,
	"ticket_id" text NOT NULL,
	"agent_id" text NOT NULL,
	"status" text DEFAULT 'claimed' NOT NULL,
	"branch_name" text,
	"base_commit_sha" text,
	"head_commit_sha" text,
	"pr_number" integer,
	"pr_url" text,
	"model_used" text,
	"prompt_tokens" integer DEFAULT 0,
	"completion_tokens" integer DEFAULT 0,
	"cost_usd" real DEFAULT 0,
	"started_at" timestamp with time zone DEFAULT now(),
	"completed_at" timestamp with time zone,
	"duration_seconds" integer,
	"files_modified" text[] DEFAULT '{}',
	"files_created" text[] DEFAULT '{}',
	"test_results" jsonb,
	"security_scan" jsonb,
	"error_message" text,
	"current_task" text,
	"steps" jsonb DEFAULT '[]',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ticket_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" text NOT NULL,
	"user_id" text NOT NULL,
	"action_type" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ticket_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" text NOT NULL,
	"project_id" text,
	"user_id" text NOT NULL,
	"filename" text NOT NULL,
	"file_url" text NOT NULL,
	"file_size" integer NOT NULL,
	"file_type" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ticket_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" text NOT NULL,
	"project_id" text,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ticket_dependencies" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"ticket_id" text NOT NULL,
	"depends_on_ticket_id" text NOT NULL,
	"dependency_type" text DEFAULT 'hard',
	"strength" text DEFAULT 'strong',
	"note" text,
	"ignore_count" integer DEFAULT 0,
	"escalated" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"org_id" text,
	"meeting_id" text,
	"project_id" text,
	"parent_id" text,
	"title" text NOT NULL,
	"description" text DEFAULT '',
	"status" text DEFAULT 'backlog',
	"assignee" text,
	"assignee_user_id" text,
	"dependency_ticket_id" text,
	"start_date" text,
	"due_date" text,
	"deadline_time" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"plan" text DEFAULT 'starter',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "swarmnet_artifacts" ADD CONSTRAINT "swarmnet_artifacts_run_id_swarmnet_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."swarmnet_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "meetings_org_id_idx" ON "meetings" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_org_id_idx" ON "notifications" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "notifications_read_idx" ON "notifications" USING btree ("read");--> statement-breakpoint
CREATE UNIQUE INDEX "project_user_unique" ON "project_members" USING btree ("project_id","user_id");--> statement-breakpoint
CREATE INDEX "swarmnet_agents_org_domain_idx" ON "swarmnet_agents" USING btree ("org_id","domain");--> statement-breakpoint
CREATE INDEX "swarmnet_artifacts_run_idx" ON "swarmnet_artifacts" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX "swarmnet_runs_org_status_idx" ON "swarmnet_runs" USING btree ("org_id","status");--> statement-breakpoint
CREATE INDEX "swarmnet_runs_ticket_idx" ON "swarmnet_runs" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "swarmnet_runs_agent_idx" ON "swarmnet_runs" USING btree ("agent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ticket_depends_on_unique" ON "ticket_dependencies" USING btree ("ticket_id","depends_on_ticket_id");--> statement-breakpoint
CREATE INDEX "tickets_meeting_id_idx" ON "tickets" USING btree ("meeting_id");--> statement-breakpoint
CREATE INDEX "tickets_project_id_idx" ON "tickets" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "tickets_org_id_idx" ON "tickets" USING btree ("org_id");