CREATE TABLE "Custom commands"(
	"id" SERIAL PRIMARY KEY,
	"name" TEXT UNIQUE NOT NULL,

	"text" TEXT NOT NULL,
	"author_id" TEXT NOT NULL,
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
	"last_modified_at" TIMESTAMP NULL,
	"last_modified_by" TIMESTAMP NULL,
	"uses" INTEGER NOT NULL DEFAULT 0,
	"categories" TEXT[] NULL,
	"tags" TEXT[] NULL
);
