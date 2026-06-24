#!/usr/bin/env node
/**
 * Apply all Supabase migrations via direct Postgres connection.
 * Run: npm run supabase:migrate
 */
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const { Client } = pg;

function loadEnvLocal() {
  try {
    const raw = readFileSync(join(__dirname, "../.env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i === -1) continue;
      const key = t.slice(0, i).trim();
      const val = t.slice(i + 1).trim();
      process.env[key] = val;
    }
  } catch {
    /* no .env.local */
  }
}

function connectionAttempts() {
  const password = process.env.SUPABASE_DB_PASSWORD;
  const ref = process.env.SUPABASE_PROJECT_REF ?? "priavzpomtzjfgkitqmv";
  if (!password) return [];

  const poolerHosts = [
    "aws-0-eu-west-1.pooler.supabase.com",
    "aws-1-eu-central-1.pooler.supabase.com",
    "aws-0-eu-central-1.pooler.supabase.com",
  ];

  return poolerHosts.map((host) => ({
    user: `postgres.${ref}`,
    password,
    host,
    port: 5432,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
  }));
}

async function main() {
  loadEnvLocal();

  const attempts = connectionAttempts();
  if (attempts.length === 0) {
    console.error("Missing SUPABASE_DB_PASSWORD in .env.local");
    process.exit(1);
  }

  let client;
  let lastErr;
  for (const config of attempts) {
    const attempt = new Client(config);
    try {
      console.log(`Connecting via ${config.host}…`);
      await attempt.connect();
      client = attempt;
      lastErr = null;
      break;
    } catch (err) {
      lastErr = err;
      await attempt.end().catch(() => {});
      console.log(`  ↳ ${err.message}`);
    }
  }
  if (!client) throw lastErr;

  const migrationsDir = join(__dirname, "../supabase/migrations");
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  await client.query(`
    create table if not exists public._app_migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    );
  `);

  for (const file of files) {
    const { rows } = await client.query(
      "select 1 from public._app_migrations where filename = $1",
      [file]
    );
    if (rows.length > 0) {
      console.log(`⏭  ${file} (already applied)`);
      continue;
    }

    const sql = readFileSync(join(migrationsDir, file), "utf8");
    console.log(`▶  ${file}…`);
    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query(
        "insert into public._app_migrations (filename) values ($1)",
        [file]
      );
      await client.query("COMMIT");
      console.log(`✓  ${file}`);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    }
  }

  const { rows: products } = await client.query(
    "select count(*)::int as n from public.products"
  );
  console.log(`\nDone. Products in DB: ${products[0]?.n ?? 0}`);
  await client.end();
}

main().catch((err) => {
  console.error("Migration failed:", err.message ?? err);
  process.exit(1);
});
