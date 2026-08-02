import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const root = process.cwd();
const allowedExtensions = new Set([".ts", ".tsx", ".js", ".mjs", ".json"]);
const ignored = new Set(["node_modules", ".git", "dist", ".output", "coverage"]);
const browserSecretPatterns = [
  /VITE_SWAN_/,
  /VITE_ADYEN_/,
  /VITE_SUPABASE_SERVICE_ROLE/,
  /NEXT_PUBLIC_SWAN_/,
  /NEXT_PUBLIC_ADYEN_/,
];
const regulatedLocalStatePatterns = [
  /localStorage\.(setItem|getItem)\([^)]*(account|balance|transfer|card|payment|settlement)/i,
  /sessionStorage\.(setItem|getItem)\([^)]*(account|balance|transfer|card|payment|settlement)/i,
];

const violations = [];

async function walk(dir) {
  for (const name of await readdir(dir)) {
    if (ignored.has(name)) continue;
    const path = join(dir, name);
    const info = await stat(path);
    if (info.isDirectory()) {
      await walk(path);
      continue;
    }
    if (!allowedExtensions.has(extname(path))) continue;

    const content = await readFile(path, "utf8");
    for (const pattern of browserSecretPatterns) {
      if (pattern.test(content)) {
        violations.push(
          `${relative(root, path)}: browser-exposed provider secret pattern ${pattern}`,
        );
      }
    }
    for (const pattern of regulatedLocalStatePatterns) {
      if (pattern.test(content)) {
        violations.push(
          `${relative(root, path)}: regulated/payment state stored in browser storage`,
        );
      }
    }
  }
}

await walk(join(root, "src"));

if (violations.length) {
  console.error("Provider safety audit failed:");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log("Provider safety audit passed.");
