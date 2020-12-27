CREATE TABLE custom_commands (
	"id" SERIAL PRIMARY KEY,
	"name" TEXT UNIQUE NOT NULL,

	"content" TEXT NOT NULL,
	"author_id" TEXT NOT NULL,
	"created_at" TIMESTAMP NOT NULL,
	"last_modified_at" TIMESTAMP NULL,
	"last_modified_by" TIMESTAMP NULL,
	"uses" INTEGER NOT NULL DEFAULT 0,
	"categories" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
	"aliases" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]
);
