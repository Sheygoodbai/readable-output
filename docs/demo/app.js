import {
  normalizeSettings,
  readabilityScore,
  resolveLanguageProfile,
  rewriteOutgoingContent,
} from "./readable-engine.js";

const SAMPLE_TEXT = {
  zh: [
    "从执行层面看，这个方案并不是不能落地，但它目前的最大问题不是实现，而是你很容易被一段看起来很完整的总结误导，以为事情已经闭环了。",
    "",
    "实际情况是，我们还没有验证输出文件是否真的存在，也没有确认配置是否已经随部署发布，更没有重跑集成测试来排除回归风险。如果现在直接回复‘已经完成’，后面很可能要返工。",
    "",
    "建议先补证据链：检查产物路径，重跑测试，再确认配置变更是否生效。",
  ].join("\n"),
  en: [
    "At a high level this looks reasonable, but the language is more confident than the evidence. We still have not verified the generated artifact, confirmed the config shipped, or rerun the integration suite after the last change.",
    "",
    "If someone skims this reply, they may assume the task is done and close it too early. The safer next move is to verify the file path, rerun the test, and confirm the deployment really contains the new setting.",
  ].join("\n"),
  mixed: [
    "The migration probably works, but there are two traps: first, the summary sounds production-ready before proof exists; second, the code block below still references the old env key.",
    "",
    "```bash",
    "APP_RUNTIME_MODE=legacy",
    "npm run deploy -- --force",
    "```",
    "",
    "Before shipping, verify the generated file, check the env key, and rerun the deployment smoke test.",
  ].join("\n"),
};

const PROFILE_LABELS = {
  auto: "自动",
  en: "English",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
  ar: "العربية",
  he: "עברית",
};

const sourceInput = document.querySelector("#source-input");
const languageSelect = document.querySelector("#language-profile");
const renderButton = document.querySelector("#render-button");
const copyButton = document.querySelector("#copy-button");
const resetButton = document.querySelector("#reset-button");
const originalToggle = document.querySelector("#toggle-original");
const reminderToggle = document.querySelector("#toggle-reminder");
const rewriteState = document.querySelector("#rewrite-state");
const profileState = document.querySelector("#profile-state");
const rawScore = document.querySelector("#raw-score");
const sectionsAdded = document.querySelector("#sections-added");
const charsAdded = document.querySelector("#chars-added");
const previewNote = document.querySelector("#preview-note");
const renderedOutput = document.querySelector("#rendered-output");
const rawOutput = document.querySelector("#raw-output");

const state = {
  mode: "adaptive",
  density: "balanced",
};

let lastRenderedMarkdown = "";

function currentSettings() {
  return normalizeSettings({
    enabled: true,
    mode: state.mode,
    density: state.density,
    languageProfile: languageSelect.value,
    collapseOriginal: originalToggle.checked,
    closingCue: reminderToggle.checked,
  });
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function paragraphHtml(text) {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
}

function extractDetails(markdown) {
  const match = markdown.match(/<details>\s*<summary>(.*?)<\/summary>\s*([\s\S]*?)\s*<\/details>/m);
  if (!match) {
    return { summary: "", body: "", withoutDetails: markdown.trim() };
  }
  return {
    summary: match[1].trim(),
    body: match[2].trim(),
    withoutDetails: markdown.replace(match[0], "").trim(),
  };
}

function parseBlocks(markdown) {
  return markdown
    .split(/\n{2,}(?=(?:## |>))/)
    .map((block) => block.trim())
    .filter(Boolean);
}

function renderSectionBlock(block) {
  if (block.startsWith("## ")) {
    const lines = block.split("\n");
    const title = lines[0].replace(/^##\s+/, "").trim();
    const body = lines.slice(1).join("\n").trim();
    const listItems = body
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("- "))
      .map((line) => line.replace(/^- /, "").trim());
    if (listItems.length > 0 && listItems.length === body.split("\n").filter(Boolean).length) {
      return [
        `<section class="output-section">`,
        `<div class="section-label">${escapeHtml(title)}</div>`,
        `<ul class="section-list">`,
        listItems.map((item) => `<li>${escapeHtml(item)}</li>`).join(""),
        `</ul>`,
        `</section>`,
      ].join("");
    }
    return [
      `<section class="output-section">`,
      `<div class="section-label">${escapeHtml(title)}</div>`,
      `<div class="section-copy">${paragraphHtml(body)}</div>`,
      `</section>`,
    ].join("");
  }

  if (block.startsWith(">")) {
    const callout = block.replace(/^>\s*/, "").trim();
    const match = callout.match(/^\*\*(.+?):\*\*\s*([\s\S]+)$/);
    const title = match ? match[1].trim() : "提醒";
    const body = match ? match[2].trim() : callout;
    return [
      `<section class="output-callout">`,
      `<div class="callout-title">${escapeHtml(title)}</div>`,
      `<p>${escapeHtml(body)}</p>`,
      `</section>`,
    ].join("");
  }

  return `<section class="output-section"><div class="section-copy">${paragraphHtml(block)}</div></section>`;
}

function renderMarkdown(markdown, changed) {
  const details = extractDetails(markdown);
  const blocks = parseBlocks(details.withoutDetails);
  const blockHtml = blocks.map((block) => renderSectionBlock(block)).join("");
  const detailsHtml = details.summary
    ? [
        `<details class="original-details">`,
        `<summary>${escapeHtml(details.summary)}</summary>`,
        `<pre>${escapeHtml(details.body)}</pre>`,
        `</details>`,
      ].join("")
    : "";
  const stateCopy = changed
    ? "已生成更适合扫描的结构层。"
    : "这段内容本身已经比较清晰，adaptive 模式没有强行改写。";

  return [
    `<div class="preview-banner">${stateCopy}</div>`,
    blockHtml || `<section class="output-section"><div class="section-copy"><p>${escapeHtml(markdown)}</p></div></section>`,
    detailsHtml,
  ].join("");
}

function updateSegmentedButtons(group, value) {
  document.querySelectorAll(`.segmented[data-group="${group}"] .segmented-button`).forEach((button) => {
    button.classList.toggle("is-active", button.dataset.value === value);
  });
}

function renderPreview() {
  const input = sourceInput.value.trim();
  if (!input) {
    rewriteState.textContent = "等待输入";
    profileState.textContent = "语言未识别";
    rawScore.textContent = "0";
    sectionsAdded.textContent = "0";
    charsAdded.textContent = "0";
    previewNote.textContent = "粘贴一段长输出后，这里会生成更适合阅读的结构层。";
    renderedOutput.innerHTML = "";
    renderedOutput.classList.add("is-empty");
    rawOutput.textContent = "";
    lastRenderedMarkdown = "";
    return;
  }

  const settings = currentSettings();
  const result = rewriteOutgoingContent(input, settings);
  const inputScore = readabilityScore(input, settings);
  const profile = result.profile || resolveLanguageProfile(input, settings);

  rewriteState.textContent = result.changed ? "已改写" : "保持原样";
  rewriteState.classList.toggle("is-positive", result.changed);
  rewriteState.classList.toggle("is-neutral", !result.changed);
  profileState.textContent = `语言 ${PROFILE_LABELS[profile] || profile}`;
  rawScore.textContent = String(inputScore);
  sectionsAdded.textContent = String(result.sectionsAdded || 0);
  charsAdded.textContent = `+${result.charsAdded || 0}`;
  previewNote.textContent = result.changed
    ? "重点、风险、下一步已经被拆开。新增结构块越多，通常越适合先扫一遍再决定要不要展开原文。"
    : "当前文本已经比较可读；如果你想强制套壳，可以把策略切到 always。";

  renderedOutput.classList.remove("is-empty");
  renderedOutput.innerHTML = renderMarkdown(result.content, result.changed);
  rawOutput.textContent = result.content;
  lastRenderedMarkdown = result.content;
}

async function copyOutput() {
  if (!lastRenderedMarkdown) {
    copyButton.textContent = "先生成结果";
    window.setTimeout(() => {
      copyButton.textContent = "复制改写结果";
    }, 1200);
    return;
  }
  try {
    await navigator.clipboard.writeText(lastRenderedMarkdown);
    copyButton.textContent = "已复制";
  } catch {
    copyButton.textContent = "复制失败";
  }
  window.setTimeout(() => {
    copyButton.textContent = "复制改写结果";
  }, 1200);
}

function debounce(fn, delay) {
  let timeoutId = 0;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => fn(...args), delay);
  };
}

const debouncedRender = debounce(renderPreview, 180);

document.querySelectorAll(".sample-chip").forEach((button) => {
  button.addEventListener("click", () => {
    const sample = SAMPLE_TEXT[button.dataset.sample];
    if (!sample) {
      return;
    }
    sourceInput.value = sample;
    renderPreview();
  });
});

document.querySelectorAll('.segmented[data-group="mode"] .segmented-button').forEach((button) => {
  button.addEventListener("click", () => {
    state.mode = button.dataset.value;
    updateSegmentedButtons("mode", state.mode);
    renderPreview();
  });
});

document.querySelectorAll('.segmented[data-group="density"] .segmented-button').forEach((button) => {
  button.addEventListener("click", () => {
    state.density = button.dataset.value;
    updateSegmentedButtons("density", state.density);
    renderPreview();
  });
});

sourceInput.addEventListener("input", debouncedRender);
languageSelect.addEventListener("change", renderPreview);
originalToggle.addEventListener("change", renderPreview);
reminderToggle.addEventListener("change", renderPreview);
renderButton.addEventListener("click", renderPreview);
copyButton.addEventListener("click", copyOutput);
resetButton.addEventListener("click", () => {
  sourceInput.value = "";
  renderPreview();
});

sourceInput.value = SAMPLE_TEXT.zh;
renderPreview();
