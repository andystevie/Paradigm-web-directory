import { defineConfig, env } from "prisma/config";
import { config } from "dotenv";

// Load environment variables from .env
config({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("POSTGRES_PRISMA_URL"),
  },
});
