  CREATE TABLE IF NOT EXISTS "workspaces" (
	"id" serial NOT NULL,
	"name" varchar(1024) NOT NULL UNIQUE,
  "db_name" varchar(1024) NOT NULL UNIQUE,
	CONSTRAINT workspaces_pk PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);

  CREATE TABLE IF NOT EXISTS "ws_slackbot" (
	"id" serial NOT NULL,
	"text" varchar(1024) NOT NULL,
  "username" varchar(1024) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
	CONSTRAINT ws_slackbot_pk PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);

INSERT INTO workspaces (id, name, db_name) VALUES (0, 'slack-bot', 'ws_slackbot') ON CONFLICT (id) DO UPDATE 
SET id = 0;