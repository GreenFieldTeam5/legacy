CREATE TABLE IF NOT EXISTS "bodyclocks" (
  "id" serial NOT NULL,
  "current_timezone" varchar(50) NOT NULL,
  "user_id" INTEGER,
  "keystroke_duration" INT,
  "milliseconds_after_midnight_local_time" INT,
  FOREIGN KEY(user_id) REFERENCES users(id)
)