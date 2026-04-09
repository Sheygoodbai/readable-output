importScripts("readable-engine.global.js", "extension-state.js");

(function () {
  if (!globalThis.ReadableOverlayExtension || typeof chrome === "undefined") {
    return;
  }

  const { loadSettings, saveSettings } = globalThis.ReadableOverlayExtension;

  async function refreshBadge(settings) {
    const enabled = Boolean(settings?.enabled);
    await chrome.action.setBadgeText({ text: enabled ? "ON" : "OFF" });
    await chrome.action.setBadgeBackgroundColor({
      color: enabled ? "#2d66ff" : "#7f8792",
    });
    await chrome.action.setBadgeTextColor({ color: "#ffffff" });
  }

  async function ensureSettingsAndBadge() {
    const settings = await loadSettings();
    const next = await saveSettings(settings);
    await refreshBadge(next);
  }

  chrome.runtime.onInstalled.addListener(() => {
    void ensureSettingsAndBadge();
  });

  chrome.runtime.onStartup.addListener(() => {
    void ensureSettingsAndBadge();
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (
      areaName !== "local" ||
      !changes[globalThis.ReadableOverlayExtension.STORAGE_KEY]?.newValue
    ) {
      return;
    }
    void refreshBadge(changes[globalThis.ReadableOverlayExtension.STORAGE_KEY].newValue);
  });

  chrome.commands.onCommand.addListener((command) => {
    if (command !== "toggle-overlay") {
      return;
    }
    void loadSettings()
      .then((settings) => saveSettings({ enabled: !settings.enabled }))
      .then((settings) => refreshBadge(settings));
  });

  void ensureSettingsAndBadge();
})();
