import { defineConfig } from "prisma/config";
import { config } from "dotenv";

// Load environment variables from .env (local dev only)
config({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: process.env.POSTGRES_PRISMA_URL || "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  },
});
