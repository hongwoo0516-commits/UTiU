import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { parseEnv } from "node:util";

// This script only reads the reference file. It never writes to that project.
const destination = new URL("../.env.local", import.meta.url);
if (existsSync(destination)) {
  console.log(".env.local already exists; left unchanged.");
  process.exit(0);
}

const reference = process.argv[2];
const values = reference ? parseEnv(readFileSync(reference, "utf8")) : {};
const uri = values.MONGODB_URI || "mongodb://127.0.0.1:27017";
if (!/^mongodb(?:\+srv)?:\/\//.test(uri) || /[\r\n]/.test(uri)) {
  console.error("Invalid MONGODB_URI in reference file. No file was created.");
  process.exit(1);
}

writeFileSync(destination, [
  "# UTiU only. Do not commit this file.",
  `MONGODB_URI=${JSON.stringify(uri)}`,
  "MONGODB_DB_NAME=utiu",
  `AUTH_SECRET=${randomBytes(48).toString("base64url")}`,
  "AUTH_URL=http://localhost:3000",
  "AUTH_TRUST_HOST=true",
  "",
].join("\n"), { flag: "wx", mode: 0o600 });
console.log("Created .env.local with a separate utiu database and a new auth secret.");
