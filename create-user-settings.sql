-- Create user_settings table based on the schema
CREATE TABLE IF NOT EXISTS "user_settings" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL UNIQUE,
  "defaultAiModel" VARCHAR(255) DEFAULT 'openai',
  "openaiApiKey" VARCHAR(255),
  "googleApiKey" VARCHAR(255),
  "groqApiKey" VARCHAR(255),
  CONSTRAINT fk_user FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);