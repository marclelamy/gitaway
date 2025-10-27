CREATE TABLE "syncLog" (
	"id" text PRIMARY KEY NOT NULL,
	"user_repository_id" text,
	"commit_hash" text,
	"status" text NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "userRepository" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"github_repo_name" text NOT NULL,
	"gitlab_project_id" integer NOT NULL,
	"github_webhook_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "syncLog" ADD CONSTRAINT "syncLog_user_repository_id_userRepository_id_fk" FOREIGN KEY ("user_repository_id") REFERENCES "public"."userRepository"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userRepository" ADD CONSTRAINT "userRepository_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;