import test from "node:test";
import assert from "node:assert/strict";

import {
  buildStaticPromptGuidance,
  normalizeSettings,
  rewriteOutgoingContent,
  shouldRewrite,
} from "../src/readable-core.js";

test("adaptive mode rewrites long dense English output into readability sections", () => {
  const settings = normalizeSettings({ enabled: true, mode: "adaptive" });
  const input = [
    "This likely works, but before calling it done we should verify the output file, rerun the test, and confirm the configuration actually shipped.",
    "",
    "The main risk is that the summary sounds more confident than the available proof. There is still no direct evidence that the generated file exists in the expected path.",
    "",
    "If you act on this immediately, you could close the task too early and miss a regression.",
  ].join("\n");

  const result = rewriteOutgoingContent(input, settings);
  assert.equal(result.changed, true);
  assert.match(result.content, /## Overview/);
  assert.match(result.content, /## Key points/);
  assert.match(result.content, /\*\*Watch for:\*\*/);
  assert.match(result.content, /## Next step/);
  assert.match(result.content, /<details>/);
  assert.match(result.content, /<summary>Original output<\/summary>/);
});

test("zh profile uses Chinese labels", () => {
  const settings = normalizeSettings({ enabled: true, mode: "always", languageProfile: "zh" });
  const input = "这个方案看起来能做，但在说完成之前，需要先确认输出文件是否真的存在，并且重跑一次测试。还有一个风险是总结说得太满，证据还不够。";
  const result = rewriteOutgoingContent(input, settings);
  assert.match(result.content, /## 先看结论/);
  assert.match(result.content, /## 重点/);
  assert.match(result.content, /\*\*需要注意:\*\*/);
  assert.match(result.content, /原始输出/);
});

test("adaptive mode skips short already-readable content", () => {
  const settings = normalizeSettings({ enabled: true, mode: "adaptive" });
  const input = "## Summary\n\n- File exists\n- Tests pass\n- Ready to ship";
  assert.equal(shouldRewrite(input, settings), false);
});

test("buildStaticPromptGuidance adds readability instructions", () => {
  const settings = normalizeSettings({ enabled: true, languageProfile: "ar" });
  const guidance = buildStaticPromptGuidance(settings);
  assert.match(guidance, /Readable Output is enabled/);
  assert.match(guidance, /Preserve right-to-left readability/);
});

