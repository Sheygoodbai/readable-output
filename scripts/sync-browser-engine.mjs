import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const sourcePath = path.join(repoRoot, "shared", "readable-engine.js");
const targetPath = path.join(
  repoRoot,
  "browser-companion",
  "openclaw-tool-overlay",
  "readable-engine.global.js",
);

const source = await readFile(sourcePath, "utf8");
const exportNames = Array.from(
  source.matchAll(/export\s+(?:const|function)\s+([A-Za-z0-9_]+)/g),
  (match) => match[1],
);
const transformed = source.replace(/^export\s+/gm, "");
const output = [
  "// This file is generated from shared/readable-engine.js.",
  "// Run `npm run sync:browser-core` after updating the shared engine.",
  "",
  "(function () {",
  transformed,
  "",
  "  globalThis.ReadableEngine = Object.freeze({",
  exportNames.map((name) => `    ${name},`).join("\n"),
  "  });",
  "})();",
  "",
].join("\n");

if (process.argv.includes("--check")) {
  let current = "";
  try {
    current = await readFile(targetPath, "utf8");
  } catch (error) {
    if (error && error.code !== "ENOENT") {
      throw error;
    }
  }
  if (current !== output) {
    console.error(
      "browser-companion/openclaw-tool-overlay/readable-engine.global.js is out of sync",
    );
    process.exitCode = 1;
  }
} else {
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, output, "utf8");
  console.log(`Synced ${path.relative(repoRoot, targetPath)}`);
}
