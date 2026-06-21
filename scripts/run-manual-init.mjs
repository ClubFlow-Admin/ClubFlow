import { existsSync, readFileSync } from "node:fs";
import pg from "pg";

function loadLocalEnv() {
  if (!existsSync(".env")) return;

  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^"|"$/g, "");
  }
}

loadLocalEnv();

const { Client } = pg;
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to initialize the database.");
}

const sql = readFileSync("prisma/manual-init.sql", "utf8");
const client = new Client({ connectionString: databaseUrl });

await client.connect();
try {
  await client.query(sql);
  console.log("Manual database init completed.");
} finally {
  await client.end();
}
