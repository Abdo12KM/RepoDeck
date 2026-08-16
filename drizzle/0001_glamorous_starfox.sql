CREATE TABLE "github_repository_caches" (
	"owner" text NOT NULL,
	"repo" text NOT NULL,
	"ref" text NOT NULL,
	"tree" jsonb NOT NULL,
	"cached_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "github_repository_caches_owner_repo_ref_pk" PRIMARY KEY("owner","repo","ref")
);
--> statement-breakpoint
CREATE TABLE "github_repository_files" (
	"owner" text NOT NULL,
	"repo" text NOT NULL,
	"ref" text NOT NULL,
	"path" text NOT NULL,
	"sha" text NOT NULL,
	"content" text NOT NULL,
	"size" integer NOT NULL,
	"is_binary" boolean DEFAULT false NOT NULL,
	"download_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "github_repository_files_owner_repo_ref_path_pk" PRIMARY KEY("owner","repo","ref","path")
);
