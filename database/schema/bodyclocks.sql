CREATE TABLE IF NOT EXISTS "bodyclocks" (
  "id" serial NOT NULL,
  "current_timezone" varchar(50) NOT NULL,
  "user_id" INTEGER,
  FOREIGN KEY(user_id) REFERENCES users(id)
)

