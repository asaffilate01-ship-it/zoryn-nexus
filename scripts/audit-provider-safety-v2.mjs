import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const root = process.cwd();
const sourceRoot = join(root, "src");
const ignoredDirectories = new Set([
  "node_modules", ".git", "dist", ".output", "coverage", "fixtures", "__fixtures__",
]);
const ignoredFiles = [
  /routeTree\.gen\.ts$/,
  /supabase\/types\.ts$/,
  /\.test\.[jt]sx?$/,
  /\.spec\.[jt]sx?$/,
];
const allowedExtensions = new Set([".ts", ".tsx", ".js", ".mjs", ".json"]);

const secretPatterns = [
  /\bVITE_SWAN_[A-Z0-9_]+\b/,
  /\bVITE_ADYEN_[A-Z0-9_]+\b/,
  /\bVITE_SUPABASE_SERVICE_ROLE(?:_KEY)?\b/,
  /\bNEXT_PUBLIC_SWAN_[A-Z0-9_]+\b/,
  /\bNEXT_PUBLIC_ADYEN_[A-Z0-9_]+\b/,
];

const storagePattern =
  /(?:localStorage|sessionStorage)\.(?:setItem|getItem)\s*\(\s*["'`](?:[^"'`]*(?:account|balance|transfer|card|payment|settlement|iban)[^"'`]*)["'`]/i;

const violations = [];

async function walk(directory) {
  for (const name of await readdir(directory)) {
    if (ignoredDirectories.has(name)) continue;
    const filePath = join(directory, name);
    const fileStat = await stat(filePath);

    if (fileStat.isDirectory()) {
      await walk(filePath);
      continue;
    }

    const relativePath = relative(root, filePath).replaceAll("\\", "/");
    if (ignoredFiles.some((pattern) => pattern.test(relativePath))) continue;
    if (!allowedExtensions.has(extname(filePath))) continue;

    const source = await readFile(filePath, "utf8");

    for (const pattern of secretPatterns) {
      if (pattern.test(source)) {
        violations.push(`${relativePath}: browser-exposed provider secret variable`);
      }
    }

    if (storagePattern.test(source)) {
      violations.push(`${relativePath}: regulated/payment state stored in browser storage`);
    }
  }
}

await walk(sourceRoot);

if (violations.length) {
  console.error("Provider safety audit failed:");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log("Provider safety audit passed.");
