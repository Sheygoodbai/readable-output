// This file is generated from shared/readable-engine.js.
// Run `npm run sync:demo-core` after updating the shared engine.
export const PLUGIN_ID = "readable-output";
export const DISPLAY_NAME = "看得清 Readable Output";

export const DEFAULT_SETTINGS = Object.freeze({
  enabled: false,
  mode: "adaptive",
  languageProfile: "auto",
  density: "balanced",
  collapseOriginal: true,
  closingCue: true,
  trackStats: true,
});

const LANGUAGE_PROFILES = Object.freeze(["auto", "en", "zh", "ja", "ko", "ar", "he"]);
const DENSITY_VALUES = Object.freeze(["compact", "balanced", "spacious"]);
const MODE_VALUES = Object.freeze(["adaptive", "always"]);
const MAX_KEY_POINTS = 4;
const MAX_ACTIONS = 3;

const LABELS = Object.freeze({
  en: {
    overview: "Overview",
    keyPoints: "Key points",
    watchFor: "Watch for",
    nextStep: "Next step",
    reminder: "Reminder",
    original: "Original output",
  },
  zh: {
    overview: "先看结论",
    keyPoints: "重点",
    watchFor: "需要注意",
    nextStep: "下一步",
    reminder: "提醒",
    original: "原始输出",
  },
  ja: {
    overview: "先に要点",
    keyPoints: "重要ポイント",
    watchFor: "注意",
    nextStep: "次にやること",
    reminder: "最後の確認",
    original: "元の出力",
  },
  ko: {
    overview: "먼저 결론",
    keyPoints: "핵심 포인트",
    watchFor: "주의할 점",
    nextStep: "다음 단계",
    reminder: "마지막 확인",
    original: "원본 출력",
  },
  ar: {
    overview: "الخلاصة",
    keyPoints: "النقاط الأساسية",
    watchFor: "تنبيه",
    nextStep: "الخطوة التالية",
    reminder: "تذكير أخير",
    original: "النص الأصلي",
  },
  he: {
    overview: "השורה התחתונה",
    keyPoints: "נקודות עיקריות",
    watchFor: "שים לב",
    nextStep: "הצעד הבא",
    reminder: "תזכורת",
    original: "הפלט המקורי",
  },
});

const REMINDERS = Object.freeze({
  en: "If the decision matters, expand the original wording before you act on the summary.",
  zh: "如果涉及交付、风险或承诺，请展开原文再确认一次。",
  ja: "判断や実行に移す前に、必要なら元の文面を開いて確認してください。",
  ko: "실행이나 결정을 내리기 전에는 필요하면 원문도 다시 펼쳐서 확인하세요.",
  ar: "إذا كان القرار مهمًا، فافتح الصياغة الأصلية قبل الاعتماد على هذا الملخص.",
  he: "אם ההחלטה חשובה, פתח את הניסוח המקורי לפני שאתה פועל לפי הסיכום.",
});

const ALERT_PATTERNS = Object.freeze({
  en: [/\bwarning\b/i, /\brisk\b/i, /\bimportant\b/i, /\bcaution\b/i, /\berror\b/i, /\bfail(?:ed|ure)?\b/i],
  zh: [/注意/u, /风险/u, /警告/u, /错误/u, /失败/u, /别直接/u],
  ja: [/注意/u, /警告/u, /リスク/u, /失敗/u, /エラー/u],
  ko: [/주의/u, /경고/u, /위험/u, /오류/u, /실패/u],
  ar: [/تنبيه/u, /تحذير/u, /خطر/u, /مهم/u, /خطأ/u, /فشل/u],
  he: [/אזהרה/u, /סיכון/u, /חשוב/u, /שגיאה/u, /כשל/u],
});

const ACTION_PATTERNS = Object.freeze({
  en: [/\bshould\b/i, /\bneed to\b/i, /\bnext\b/i, /\bverify\b/i, /\bcheck\b/i, /\brerun\b/i],
  zh: [/应该/u, /需要/u, /下一步/u, /先/u, /检查/u, /确认/u, /重跑/u, /验证/u],
  ja: [/次に/u, /必要/u, /確認/u, /再実行/u, /検証/u, /まず/u],
  ko: [/다음/u, /필요/u, /확인/u, /다시/u, /검증/u, /먼저/u],
  ar: [/يجب/u, /يلزم/u, /الخطوة التالية/u, /تحقق/u, /أعد/u, /راجع/u],
  he: [/צריך/u, /השלב הבא/u, /בדוק/u, /אמת/u, /הפעל שוב/u],
});

const ACTION_PHRASE_PATTERNS = Object.freeze({
  en: [/\b(?:verify|check|rerun|confirm)\b[^,.;]*/gi],
  zh: [/(?:验证|确认|检查|重跑)[^，。；]*/gu],
  ja: [/(?:確認|再実行|検証)[^。；、]*/gu],
  ko: [/(?:확인|다시 실행|검증)[^.;,]*/gu],
  ar: [/(?:تحقق|راجع|أعد تشغيل)[^،.؛]*/gu],
  he: [/(?:בדוק|אמת|הפעל שוב)[^,.]*/gu],
});

const CJK_PROFILE_SET = new Set(["zh", "ja", "ko"]);
const RTL_PROFILE_SET = new Set(["ar", "he"]);

export function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeBoolean(value, fallback) {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeEnum(value, allowed, fallback) {
  return typeof value === "string" && allowed.includes(value) ? value : fallback;
}

export function normalizeSettings(value) {
  const source = isRecord(value) ? value : {};
  return {
    enabled: normalizeBoolean(source.enabled, DEFAULT_SETTINGS.enabled),
    mode: normalizeEnum(source.mode, MODE_VALUES, DEFAULT_SETTINGS.mode),
    languageProfile: normalizeEnum(
      source.languageProfile,
      LANGUAGE_PROFILES,
      DEFAULT_SETTINGS.languageProfile,
    ),
    density: normalizeEnum(source.density, DENSITY_VALUES, DEFAULT_SETTINGS.density),
    collapseOriginal: normalizeBoolean(
      source.collapseOriginal,
      DEFAULT_SETTINGS.collapseOriginal,
    ),
    closingCue: normalizeBoolean(source.closingCue, DEFAULT_SETTINGS.closingCue),
    trackStats: normalizeBoolean(source.trackStats, DEFAULT_SETTINGS.trackStats),
  };
}

export function extractText(value) {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((entry) => extractText(entry)).filter(Boolean).join("\n");
  }
  if (!isRecord(value)) {
    return "";
  }
  if (Array.isArray(value.content)) {
    return value.content.map((entry) => extractText(entry)).filter(Boolean).join("\n");
  }
  const chunks = [];
  for (const [key, nested] of Object.entries(value)) {
    if (key === "role" || key === "type" || key === "id" || key === "usage") {
      continue;
    }
    const extracted = extractText(nested);
    if (extracted) {
      chunks.push(extracted);
    }
  }
  return chunks.join("\n");
}

export function extractLatestUserMessageText(messages) {
  if (!Array.isArray(messages)) {
    return "";
  }
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (!isRecord(message) || message.role !== "user") {
      continue;
    }
    return extractText(message).trim();
  }
  return "";
}

export function resolveLanguageProfile(text, settings) {
  if (settings.languageProfile && settings.languageProfile !== "auto") {
    return settings.languageProfile;
  }
  const sample = typeof text === "string" ? text : "";
  if (/[\u0590-\u05FF]/u.test(sample)) {
    return "he";
  }
  if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/u.test(sample)) {
    return "ar";
  }
  if (/[\u3040-\u30FF]/u.test(sample)) {
    return "ja";
  }
  if (/[\uAC00-\uD7AF]/u.test(sample)) {
    return "ko";
  }
  if (/[\u3400-\u9FFF]/u.test(sample)) {
    return "zh";
  }
  return "en";
}

export function buildStaticPromptGuidance(settings) {
  const profile = resolveLanguageProfile("", settings);
  const lines = [
    "Readable Output is enabled for this conversation.",
    "Prefer a readability-first structure: short overview, grouped key points, one explicit warning if needed, one clear next step, and one short closing reminder.",
    "Use markdown hierarchy and white space instead of long dense paragraphs.",
    "Keep code, raw logs, and literal output separate from the summary layer.",
    "Do not change the meaning of the user's content just to make it look polished.",
  ];

  if (profile === "auto") {
    lines.push("Adapt labels and chunking to the reply language automatically.");
  } else {
    lines.push(...languageSpecificGuidance(profile));
  }

  return lines.join("\n");
}

export function buildTurnPromptGuidance(latestUserText, settings) {
  const profile = resolveLanguageProfile(latestUserText || "", settings);
  return languageSpecificGuidance(profile).join("\n");
}

function languageSpecificGuidance(profile) {
  if (CJK_PROFILE_SET.has(profile)) {
    return [
      "Use short section labels and shorter bullet items.",
      "Split dense paragraphs aggressively; one idea per bullet is better than a wall of text.",
      "Keep warning labels visually obvious and avoid burying the conclusion deep in the paragraph.",
    ];
  }
  if (RTL_PROFILE_SET.has(profile)) {
    return [
      "Preserve right-to-left readability.",
      "Keep code, URLs, numbers, and mixed-direction fragments on separate lines when that improves reading flow.",
      "Use short labels and avoid over-nesting.",
    ];
  }
  return [
    "Front-load the answer.",
    "Keep paragraphs short and use explicit section labels for warnings or next steps.",
    "Use restrained emphasis; too much highlighting reduces scan value.",
  ];
}

export function readabilityScore(text, settings) {
  const sample = typeof text === "string" ? text : "";
  if (!sample.trim()) {
    return 0;
  }
  const profile = resolveLanguageProfile(sample, settings);
  const paragraphs = splitParagraphs(extractPlainText(sample));
  const longestParagraph = paragraphs.reduce((max, part) => Math.max(max, part.length), 0);
  const headingCount = countMatches(sample, /^#{1,3}\s+/gm);
  const bulletCount = countMatches(sample, /^\s*(?:[-*]|\d+\.)\s+/gm);
  let score = 0;
  if (sample.length > 350) {
    score += 1;
  }
  if (sample.length > 1100) {
    score += 2;
  }
  if (paragraphs.length >= 3) {
    score += 1;
  }
  if (sample.includes("```")) {
    score += 1;
  }
  if (longestParagraph > paragraphLimit(profile)) {
    score += 2;
  }
  if (!headingCount) {
    score += 1;
  }
  if (bulletCount < 2) {
    score += 1;
  }
  return score;
}

function paragraphLimit(profile) {
  if (CJK_PROFILE_SET.has(profile)) {
    return 120;
  }
  if (RTL_PROFILE_SET.has(profile)) {
    return 180;
  }
  return 220;
}

function countMatches(text, pattern) {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  const regex = new RegExp(pattern.source, flags);
  let count = 0;
  while (regex.exec(text)) {
    count += 1;
  }
  return count;
}

function alreadyStructuredEnough(text, settings) {
  const profile = resolveLanguageProfile(text, settings);
  const paragraphs = splitParagraphs(extractPlainText(text));
  const headingCount = countMatches(text, /^#{1,3}\s+/gm);
  const bulletCount = countMatches(text, /^\s*(?:[-*]|\d+\.)\s+/gm);
  const detailsCount = countMatches(text, /^<details>/gm);
  const longestParagraph = paragraphs.reduce((max, part) => Math.max(max, part.length), 0);
  return (
    headingCount >= 2 &&
    bulletCount >= 3 &&
    detailsCount >= 1 &&
    longestParagraph <= paragraphLimit(profile)
  );
}

export function shouldRewrite(text, settings) {
  if (typeof text !== "string" || !text.trim()) {
    return false;
  }
  if (settings.mode === "always") {
    return true;
  }
  if (alreadyStructuredEnough(text, settings)) {
    return false;
  }
  return readabilityScore(text, settings) >= 3;
}

function extractPlainText(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, "\n")
    .replace(/`[^`\n]+`/g, " ")
    .replace(/^<details>$/gm, "")
    .replace(/^<\/details>$/gm, "")
    .replace(/^<summary>.*<\/summary>$/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^#{1,6}\s+/gm, "")
    .trim();
}

function splitParagraphs(text) {
  return text
    .split(/\n{2,}/)
    .map((part) => cleanCandidate(part))
    .filter(Boolean);
}

function cleanCandidate(text) {
  return String(text || "")
    .replace(/\r\n?/g, "\n")
    .replace(/^\s*(?:[-*]|\d+\.)\s+/gm, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n+/g, " ")
    .trim();
}

function splitSentences(text, profile) {
  let normalized = cleanCandidate(text)
    .replace(/([。！？；])/gu, "$1\n")
    .replace(/([.!?;])\s+/g, "$1\n");
  if (CJK_PROFILE_SET.has(profile)) {
    normalized = normalized.replace(/([，、])/gu, "$1\n");
  }
  return normalized
    .split("\n")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => trimToLimit(part, sentenceLimit(profile)));
}

function sentenceLimit(profile) {
  if (CJK_PROFILE_SET.has(profile)) {
    return 44;
  }
  if (RTL_PROFILE_SET.has(profile)) {
    return 90;
  }
  return 110;
}

function trimToLimit(text, limit) {
  const trimmed = String(text || "").trim();
  if (trimmed.length <= limit) {
    return trimmed;
  }
  return `${trimmed.slice(0, Math.max(0, limit - 1)).trimEnd()}…`;
}

function dedupe(items) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    const normalized = item.toLowerCase();
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    result.push(item);
  }
  return result;
}

function extractBulletCandidates(text, profile) {
  const listCandidates = text
    .split("\n")
    .map((line) => line.match(/^\s*(?:[-*]|\d+\.)\s+(.*)$/)?.[1]?.trim() || "")
    .filter(Boolean)
    .map((line) => trimToLimit(cleanCandidate(line), sentenceLimit(profile)));
  if (listCandidates.length > 0) {
    return dedupe(listCandidates);
  }

  const paragraphs = splitParagraphs(extractPlainText(text));
  const sentences = [];
  for (const paragraph of paragraphs) {
    for (const sentence of splitSentences(paragraph, profile)) {
      if (sentence.length >= 10) {
        sentences.push(sentence);
      }
    }
  }
  return dedupe(sentences);
}

function firstMatchingSentences(text, profile, patterns, limit) {
  const sentences = extractBulletCandidates(text, profile);
  return sentences.filter((sentence) => patterns.some((pattern) => pattern.test(sentence))).slice(0, limit);
}

function buildOverview(text, profile) {
  const candidates = extractBulletCandidates(text, profile);
  if (candidates.length === 0) {
    return "";
  }
  if (CJK_PROFILE_SET.has(profile) && candidates[0].length < 12 && candidates[1]) {
    return trimToLimit(`${candidates[0]} ${candidates[1]}`.replace(/\s+/g, ""), sentenceLimit(profile));
  }
  return candidates[0];
}

function buildKeyPoints(text, profile) {
  const candidates = extractBulletCandidates(text, profile);
  return candidates.slice(1, 1 + MAX_KEY_POINTS);
}

function buildActions(text, profile) {
  const phrasePatterns = ACTION_PHRASE_PATTERNS[profile] || [];
  const phraseMatches = [];
  for (const pattern of phrasePatterns) {
    for (const match of text.matchAll(pattern)) {
      const value = trimToLimit(cleanCandidate(match[0]), sentenceLimit(profile));
      if (value) {
        phraseMatches.push(value.replace(/^还提到了下一步要/u, "").trim());
      }
    }
  }
  const dedupedPhrases = dedupe(phraseMatches).slice(0, MAX_ACTIONS);
  if (dedupedPhrases.length > 0) {
    return dedupedPhrases;
  }

  const actions = firstMatchingSentences(text, profile, ACTION_PATTERNS[profile], MAX_ACTIONS);
  if (actions.length > 0) {
    return actions;
  }
  const candidates = extractBulletCandidates(text, profile);
  return candidates.slice(-MAX_ACTIONS);
}

function buildAlerts(text, profile) {
  return firstMatchingSentences(text, profile, ALERT_PATTERNS[profile], 1);
}

function labelsFor(profile) {
  return LABELS[profile] || LABELS.en;
}

function blankLineCount(settings) {
  if (settings.density === "spacious") {
    return 2;
  }
  return 1;
}

function joinWithDensity(parts, settings) {
  const blocks = [];
  for (const part of parts) {
    const trimmed = String(part || "").trim();
    if (!trimmed) {
      continue;
    }
    blocks.push(trimmed);
  }
  return blocks.join("\n".repeat(blankLineCount(settings) + 1)).trim();
}

function indentOriginalBlock(text) {
  return text.trim();
}

function buildReadableMarkdown(text, settings) {
  const profile = resolveLanguageProfile(text, settings);
  const labels = labelsFor(profile);
  const overview = buildOverview(text, profile);
  if (!overview) {
    return { content: text, changed: false, sectionsAdded: 0, profile };
  }

  const normalizedOverview = overview.toLowerCase();
  const keyPoints = buildKeyPoints(text, profile).filter(
    (item) => item.toLowerCase() !== normalizedOverview,
  );
  const alerts = buildAlerts(text, profile).filter(
    (item) => item.toLowerCase() !== normalizedOverview,
  );
  const actions = buildActions(text, profile).filter(
    (item) => item.toLowerCase() !== normalizedOverview,
  );
  const sections = [];
  let sectionsAdded = 0;

  sections.push(`## ${labels.overview}\n\n${overview}`);
  sectionsAdded += 1;

  if (keyPoints.length > 0) {
    sections.push(
      `## ${labels.keyPoints}\n\n${keyPoints.map((item) => `- ${item}`).join("\n")}`,
    );
    sectionsAdded += 1;
  }

  if (alerts.length > 0) {
    sections.push(`> **${labels.watchFor}:** ${alerts[0]}`);
    sectionsAdded += 1;
  }

  if (actions.length > 0) {
    sections.push(
      `## ${labels.nextStep}\n\n${actions.map((item) => `- ${item}`).join("\n")}`,
    );
    sectionsAdded += 1;
  }

  if (settings.closingCue) {
    sections.push(`> **${labels.reminder}:** ${REMINDERS[profile]}`);
    sectionsAdded += 1;
  }

  if (settings.collapseOriginal) {
    sections.push(
      `<details>\n<summary>${labels.original}</summary>\n\n${indentOriginalBlock(text)}\n\n</details>`,
    );
    sectionsAdded += 1;
  }

  const content = joinWithDensity(sections, settings);
  return {
    content,
    changed: content !== text,
    sectionsAdded,
    profile,
  };
}

export function rewriteReadableOutput(text, settings) {
  if (!shouldRewrite(text, settings)) {
    return {
      content: text,
      changed: false,
      charsAdded: 0,
      sectionsAdded: 0,
      profile: resolveLanguageProfile(text, settings),
    };
  }
  const rewritten = buildReadableMarkdown(text, settings);
  return {
    ...rewritten,
    charsAdded: Math.max(0, rewritten.content.length - text.length),
  };
}

export function rewriteAssistantMessage(message, settings) {
  if (!isRecord(message) || message.role !== "assistant" || !Array.isArray(message.content)) {
    return { message, changed: false, charsAdded: 0, sectionsAdded: 0 };
  }
  let changed = false;
  let charsAdded = 0;
  let sectionsAdded = 0;
  const content = message.content.map((entry) => {
    if (!isRecord(entry) || entry.type !== "text" || typeof entry.text !== "string") {
      return entry;
    }
    const rewritten = rewriteReadableOutput(entry.text, settings);
    if (!rewritten.changed) {
      return entry;
    }
    changed = true;
    charsAdded += rewritten.charsAdded;
    sectionsAdded += rewritten.sectionsAdded;
    return { ...entry, text: rewritten.content };
  });
  if (!changed) {
    return { message, changed: false, charsAdded: 0, sectionsAdded: 0 };
  }
  return { message: { ...message, content }, changed: true, charsAdded, sectionsAdded };
}

export function rewriteOutgoingContent(text, settings) {
  return rewriteReadableOutput(text, settings);
}

export function collectAssistantTexts(message) {
  if (!isRecord(message) || message.role !== "assistant" || !Array.isArray(message.content)) {
    return [];
  }
  return message.content
    .filter((entry) => isRecord(entry) && entry.type === "text" && typeof entry.text === "string")
    .map((entry) => entry.text);
}

export function createRecentlyRewrittenCache(ttlMs = 60_000) {
  const cache = new Map();

  function prune(now = Date.now()) {
    for (const [key, expiresAt] of cache.entries()) {
      if (expiresAt <= now) {
        cache.delete(key);
      }
    }
  }

  return {
    remember(text) {
      if (typeof text !== "string" || !text) {
        return;
      }
      const now = Date.now();
      prune(now);
      cache.set(text, now + ttlMs);
    },
    has(text) {
      if (typeof text !== "string" || !text) {
        return false;
      }
      const now = Date.now();
      prune(now);
      return cache.has(text);
    },
  };
}

export function formatStatus(settings, stats) {
  return [
    `${DISPLAY_NAME}: ${settings.enabled ? "on" : "off"}`,
    `Mode: ${settings.mode}`,
    `Language profile: ${settings.languageProfile}`,
    `Density: ${settings.density}`,
    `Collapse original: ${settings.collapseOriginal ? "on" : "off"}`,
    `Closing reminder: ${settings.closingCue ? "on" : "off"}`,
    `Tracked rewrites this run: ${stats.messagesLayered}`,
    `Sections added locally: ${stats.sectionsAdded}`,
    `Characters added locally: ${stats.charsAdded}`,
    stats.lastModel ? `Last model: ${stats.lastProvider}/${stats.lastModel}` : "Last model: n/a",
    Number.isFinite(stats.lastOutputTokens)
      ? `Last raw output tokens: ${stats.lastOutputTokens}`
      : "Last raw output tokens: n/a",
  ].join("\n");
}

export function formatHelp() {
  return [
    `${DISPLAY_NAME} commands:`,
    "/readable on",
    "/readable off",
    "/readable adaptive",
    "/readable always",
    "/readable auto | en | zh | ja | ko | ar | he",
    "/readable compact | balanced | spacious",
    "/readable status",
    "/readable help",
  ].join("\n");
}

export function cloneConfig(config) {
  return structuredClone(isRecord(config) ? config : {});
}

export function ensurePluginConfigEntry(config) {
  config.plugins ??= {};
  config.plugins.entries ??= {};
  config.plugins.entries[PLUGIN_ID] ??= {};
  config.plugins.entries[PLUGIN_ID].config ??= {};
  return config.plugins.entries[PLUGIN_ID].config;
}
