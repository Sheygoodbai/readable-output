import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const sourcePath = path.join(repoRoot, "shared", "readable-engine.js");
const targetPath = path.join(repoRoot, "docs", "demo", "readable-engine.js");

const banner = [
  "// This file is generated from shared/readable-engine.js.",
  "// Run `npm run sync:demo-core` after updating the shared engine.",
  "",
].join("\n");

const source = await readFile(sourcePath, "utf8");
const nextOutput = `${banner}${source}`;

if (process.argv.includes("--check")) {
  let current = "";
  try {
    current = await readFile(targetPath, "utf8");
  } catch (error) {
    if (error && error.code !== "ENOENT") {
      throw error;
    }
  }
  if (current !== nextOutput) {
    console.error("docs/demo/readable-engine.js is out of sync with shared/readable-engine.js");
    process.exitCode = 1;
  }
} else {
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, nextOutput, "utf8");
  console.log(`Synced ${path.relative(repoRoot, targetPath)}`);
}
