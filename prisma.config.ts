import { defineConfig } from "prisma/config";
import { config } from "dotenv";

// Load environment variables from .env (local dev only)
config({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  engine: "classic",
});
