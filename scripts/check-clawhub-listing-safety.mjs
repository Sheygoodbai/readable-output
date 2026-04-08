#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mode = process.argv.includes("--mode-package") ? "package" : "skill";

const failures = [];
const notes = [];

if (mode === "skill") {
  const skillFile = path.join(rootDir, "clawhub", "readable-output-skill", "SKILL.md");
  const text = fs.readFileSync(skillFile, "utf8");
  const description = text.match(/^description:\s*"([\s\S]*?)"\s*$/m)?.[1] || "";
  const tagsLine = text.match(/^tags:\s*\[(.*)\]\s*$/m)?.[1] || "";
  const tags = splitInlineList(tagsLine);
  checkLength("Skill description", description.length, 220);
  checkCount("Skill tag count", tags.length, 12);
  checkDuplicates("Skill tags", tags);
} else {
  const packageFile = path.join(rootDir, "package.json");
  const manifestFile = path.join(rootDir, "openclaw.plugin.json");
  const pkg = JSON.parse(fs.readFileSync(packageFile, "utf8"));
  const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
  checkLength("Package description", String(pkg.description || "").length, 240);
  checkCount("Package keyword count", Array.isArray(pkg.keywords) ? pkg.keywords.length : 0, 24);
  checkLength("Plugin description", String(manifest.description || "").length, 240);
}

for (const note of notes) {
  console.log(note);
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(failure);
  }
  process.exit(1);
}

function splitInlineList(input) {
  const items = [];
  let current = "";
  let inQuotes = false;
  for (const char of input) {
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      pushCurrent(items, current);
      current = "";
      continue;
    }
    current += char;
  }
  pushCurrent(items, current);
  return items;
}

function pushCurrent(items, value) {
  const trimmed = value.trim();
  if (trimmed) {
    items.push(trimmed);
  }
}

function checkLength(label, actual, limit) {
  if (actual > limit) {
    failures.push(`[listing-safety] ${label} too long: ${actual} > ${limit}`);
    return;
  }
  notes.push(`[listing-safety] ${label}: ${actual}/${limit}`);
}

function checkCount(label, actual, limit) {
  if (actual > limit) {
    failures.push(`[listing-safety] ${label} too high: ${actual} > ${limit}`);
    return;
  }
  notes.push(`[listing-safety] ${label}: ${actual}/${limit}`);
}

function checkDuplicates(label, values) {
  const seen = new Set();
  const dupes = [];
  for (const value of values) {
    const normalized = value
      .normalize("NFKC")
      .toLowerCase()
      .replace(/["'`]/g, "")
      .replace(/[\-_/.:]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!normalized) {
      continue;
    }
    if (seen.has(normalized)) {
      dupes.push(value);
      continue;
    }
    seen.add(normalized);
  }
  if (dupes.length > 0) {
    failures.push(`[listing-safety] ${label} contain duplicates: ${dupes.join(", ")}`);
    return;
  }
  notes.push(`[listing-safety] ${label}: clean`);
}

