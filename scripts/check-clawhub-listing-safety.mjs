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
  checkForbiddenClaims("Skill listing", text);
  checkCanonicalLink("Skill listing", text, "https://clawhub.ai/plugins/%40sheygoodbai%2Fopenclaw-readable-output");
} else {
  const packageFile = path.join(rootDir, "package.json");
  const manifestFile = path.join(rootDir, "openclaw.plugin.json");
  const pkg = JSON.parse(fs.readFileSync(packageFile, "utf8"));
  const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
  checkLength("Package description", String(pkg.description || "").length, 240);
  checkCount("Package keyword count", Array.isArray(pkg.keywords) ? pkg.keywords.length : 0, 24);
  checkLength("Plugin description", String(manifest.description || "").length, 240);
  checkForbiddenClaims("Package description", String(pkg.description || ""));
  checkForbiddenClaims("Plugin description", String(manifest.description || ""));
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

function checkForbiddenClaims(label, text) {
  const checks = [
    {
      name: "local database access claim",
      pattern: /读取用户本地数据库|read(?:s|ing)? user local databases?|access(?:es|ing)? user local databases?/i,
    },
    {
      name: "silent upload claim",
      pattern: /后台上传聊天内容|silent(?:ly)? upload(?:s|ing)? (?:chat|conversation) content|upload(?:s|ing)? local chat content/i,
    },
    {
      name: "fake traction claim",
      pattern: /刷安装|刷下载|刷好评|fake installs?|fake reviews?/i,
    },
    {
      name: "official endorsement claim",
      pattern: /官方推荐|officially endorsed|guaranteed staff pick|staff pick guaranteed/i,
    },
    {
      name: "review bypass claim",
      pattern: /绕过审核|bypass(?:ing)? review|avoid detection/i,
    },
  ];

  for (const check of checks) {
    if (check.pattern.test(text)) {
      failures.push(`[listing-safety] ${label} contains forbidden ${check.name}`);
    }
  }
}

function checkCanonicalLink(label, text, url) {
  if (!text.includes(url)) {
    failures.push(`[listing-safety] ${label} is missing canonical link: ${url}`);
    return;
  }
  notes.push(`[listing-safety] ${label}: canonical link present`);
}
