import { defineConfig } from "@playwright/test";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";

const local = parseEnv(readFileSync(".env.local", "utf8"));
const database = process.env.UTIU_E2E_DB || `utiu_e2e_${randomBytes(8).toString("hex")}`;
if (!/^utiu_e2e_[a-f0-9]{16}$/.test(database)) throw new Error("Unsafe test database name");
// Each run gets a brand-new database; never test against application records.
process.env.UTIU_E2E_DB = database;
process.env.MONGODB_URI = local.MONGODB_URI;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 120000,
  expect: { timeout: 15000 },
  reporter: "list",
  use: { baseURL: "http://localhost:3100", channel: "chrome", headless: true, screenshot: "only-on-failure" },
  webServer: {
    command: "npm.cmd run start -- --port 3100",
    url: "http://localhost:3100",
    reuseExistingServer: false,
    timeout: 60000,
    env: {
      MONGODB_DB_NAME: database,
      AUTH_URL: "http://localhost:3100",
      AUTH_TRUST_HOST: "true",
      AUTH_SECRET: randomBytes(48).toString("base64url"),
    },
  },
});
