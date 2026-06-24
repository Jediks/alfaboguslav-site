#!/usr/bin/env node
/**
 * Configure Supabase Auth URL settings via Management API.
 * Run: npm run supabase:auth-config
 *
 * Requires SUPABASE_ACCESS_TOKEN in .env.local
 * Create at: https://supabase.com/dashboard/account/tokens
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SITE_URL = "https://alfaboguslav.site";
const REDIRECT_URLS = [
  "http://localhost:3000/**",
  "https://alfaboguslav.site/**",
  "https://www.alfaboguslav.site/**",
  "https://*.vercel.app/**",
];

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
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    /* no .env.local */
  }
}

async function main() {
  loadEnvLocal();

  const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  const ref = process.env.SUPABASE_PROJECT_REF?.trim() ?? "priavzpomtzjfgkitqmv";

  if (!token) {
    console.error("Missing SUPABASE_ACCESS_TOKEN in .env.local");
    console.error("Create a token: https://supabase.com/dashboard/account/tokens");
    process.exit(1);
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const getRes = await fetch(
    `https://api.supabase.com/v1/projects/${ref}/config/auth`,
    { headers }
  );
  if (!getRes.ok) {
    console.error("Failed to read auth config:", getRes.status, await getRes.text());
    process.exit(1);
  }

  const current = await getRes.json();
  console.log("Current site_url:", current.site_url);
  console.log("Current uri_allow_list:", current.uri_allow_list);

  const patchRes = await fetch(
    `https://api.supabase.com/v1/projects/${ref}/config/auth`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        site_url: SITE_URL,
        uri_allow_list: REDIRECT_URLS.join(","),
      }),
    }
  );

  if (!patchRes.ok) {
    console.error("Failed to update auth config:", patchRes.status, await patchRes.text());
    process.exit(1);
  }

  const updated = await patchRes.json();
  console.log("\nUpdated site_url:", updated.site_url);
  console.log("Updated uri_allow_list:", updated.uri_allow_list);
  console.log("\nSupabase Auth URLs configured successfully.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
