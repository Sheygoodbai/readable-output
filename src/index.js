import {
  buildStaticPromptGuidance,
  buildTurnPromptGuidance,
  cloneConfig,
  collectAssistantTexts,
  createRecentlyRewrittenCache,
  DEFAULT_SETTINGS,
  DISPLAY_NAME,
  ensurePluginConfigEntry,
  extractLatestUserMessageText,
  formatHelp,
  formatStatus,
  normalizeSettings,
  rewriteAssistantMessage,
  rewriteOutgoingContent,
} from "./readable-core.js";

export default function register(api) {
  let liveOverrides = normalizeSettings(api?.pluginConfig);
  const recentlyRewritten = createRecentlyRewrittenCache();
  const stats = {
    messagesLayered: 0,
    sectionsAdded: 0,
    charsAdded: 0,
    lastProvider: "",
    lastModel: "",
    lastOutputTokens: Number.NaN,
  };

  function currentSettings() {
    return normalizeSettings(liveOverrides || DEFAULT_SETTINGS);
  }

  function formatCommandAck(settings) {
    return [
      `${DISPLAY_NAME} is ${settings.enabled ? "on" : "off"}.`,
      `Mode: ${settings.mode}`,
      `Language profile: ${settings.languageProfile}`,
      `Density: ${settings.density}`,
    ].join("\n");
  }

  function recordRewrite(result) {
    const settings = currentSettings();
    if (!settings.trackStats || !result?.changed) {
      return;
    }
    stats.messagesLayered += 1;
    stats.sectionsAdded += result.sectionsAdded || 0;
    stats.charsAdded += result.charsAdded || 0;
  }

  async function persistOverrides(nextOverrides) {
    const loadedConfig = await api.runtime.config.loadConfig();
    const nextConfig = cloneConfig(loadedConfig);
    const target = ensurePluginConfigEntry(nextConfig);
    Object.assign(target, nextOverrides);
    await api.runtime.config.writeConfigFile(nextConfig);
    liveOverrides = normalizeSettings(target);
    return liveOverrides;
  }

  api.registerCommand({
    name: "readable",
    description: "Turn 看得清 Readable Output on/off or switch layout profile",
    acceptsArgs: true,
    async handler(ctx) {
      const args = typeof ctx.args === "string" ? ctx.args.trim().toLowerCase() : "";
      if (!args || args === "help") {
        return { text: formatHelp() };
      }
      if (args === "status") {
        return { text: formatStatus(currentSettings(), stats) };
      }
      if (args === "on") {
        const settings = await persistOverrides({ enabled: true });
        return { text: formatCommandAck(settings) };
      }
      if (args === "off") {
        const settings = await persistOverrides({ enabled: false });
        return { text: formatCommandAck(settings) };
      }
      if (args === "adaptive" || args === "always") {
        const settings = await persistOverrides({ enabled: true, mode: args });
        return { text: formatCommandAck(settings) };
      }
      if (["auto", "en", "zh", "ja", "ko", "ar", "he"].includes(args)) {
        const settings = await persistOverrides({ enabled: true, languageProfile: args });
        return { text: formatCommandAck(settings) };
      }
      if (["compact", "balanced", "spacious"].includes(args)) {
        const settings = await persistOverrides({ enabled: true, density: args });
        return { text: formatCommandAck(settings) };
      }
      return { text: formatHelp() };
    },
  });

  api.on(
    "before_prompt_build",
    (event) => {
      const settings = currentSettings();
      if (!settings.enabled) {
        return undefined;
      }
      const latestUserText = extractLatestUserMessageText(event?.messages);
      return {
        prependSystemContext: buildStaticPromptGuidance(settings),
        prependContext: buildTurnPromptGuidance(latestUserText, settings),
      };
    },
    { priority: 74 },
  );

  api.on(
    "llm_output",
    (event) => {
      stats.lastProvider = event?.provider || "";
      stats.lastModel = event?.model || "";
      stats.lastOutputTokens =
        typeof event?.usage?.output === "number" ? event.usage.output : Number.NaN;
    },
    { priority: 20 },
  );

  api.on(
    "before_message_write",
    (event) => {
      const settings = currentSettings();
      if (!settings.enabled) {
        return undefined;
      }
      const rewritten = rewriteAssistantMessage(event?.message, settings);
      if (!rewritten.changed) {
        return undefined;
      }
      for (const text of collectAssistantTexts(rewritten.message)) {
        recentlyRewritten.remember(text);
      }
      recordRewrite(rewritten);
      return { message: rewritten.message };
    },
    { priority: 70 },
  );

  api.on(
    "message_sending",
    (event) => {
      const settings = currentSettings();
      if (!settings.enabled || typeof event?.content !== "string") {
        return undefined;
      }
      if (recentlyRewritten.has(event.content)) {
        return undefined;
      }
      const rewritten = rewriteOutgoingContent(event.content, settings);
      if (!rewritten.changed) {
        return undefined;
      }
      recentlyRewritten.remember(rewritten.content);
      recordRewrite(rewritten);
      return { content: rewritten.content };
    },
    { priority: 70 },
  );
}

