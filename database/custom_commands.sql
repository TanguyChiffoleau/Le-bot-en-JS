CREATE TABLE "Custom commands"(
	"id" SERIAL PRIMARY KEY,
	"name" TEXT UNIQUE NOT NULL,

	"text" TEXT NOT NULL,
	"author_id" TEXT NOT NULL,
	"created_at" TIMESTAMP NOT NULL,
	"last_modified_at" TIMESTAMP NULL,
	"last_modified_by" TIMESTAMP NULL,
	"uses" INTEGER NOT NULL DEFAULT 0,
	"categories" TEXT[] NULL,
	"aliases" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]
);
