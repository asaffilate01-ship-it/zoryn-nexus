import { access, readFile, readdir } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";

const requiredFiles = [
  "package.json",
  "bun.lock",
  "tsconfig.json",
  "supabase/config.toml",
  "scripts/audit-provider-safety-v2.mjs",
  "vitest.critical.config.ts",
  "playwright.ci.config.ts",
];

const errors = [];
for (const file of requiredFiles) {
  try {
    await access(join(process.cwd(), file), constants.R_OK);
  } catch {
    errors.push(`Missing required CI file: ${file}`);
  }
}

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const requiredScripts = [
  "build",
  "lint",
  "typecheck",
  "test:critical:coverage",
  "test:e2e:ci",
  "audit:provider-safety",
];

for (const script of requiredScripts) {
  if (!packageJson.scripts?.[script]) {
    errors.push(`Missing package script: ${script}`);
  }
}

try {
  const migrations = (await readdir("supabase/migrations"))
    .filter((name) => name.endsWith(".sql"))
    .sort();

  if (!migrations.length) {
    errors.push("No Supabase migrations found.");
  }

  const duplicatePrefixes = new Map();
  for (const migration of migrations) {
    const prefix = migration.split("_")[0];
    duplicatePrefixes.set(prefix, [...(duplicatePrefixes.get(prefix) ?? []), migration]);
  }

  for (const [prefix, files] of duplicatePrefixes) {
    if (files.length > 1) {
      errors.push(`Duplicate migration timestamp ${prefix}: ${files.join(", ")}`);
    }
  }
} catch {
  errors.push("Unable to read supabase/migrations.");
}

if (errors.length) {
  console.error("CI doctor found blocking issues:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("CI doctor passed.");
