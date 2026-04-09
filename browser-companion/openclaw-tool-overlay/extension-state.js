(function () {
  if (!globalThis.ReadableEngine) {
    return;
  }

  const { normalizeSettings } = globalThis.ReadableEngine;
  const STORAGE_KEY = "readable-output:web-overlay";
  const DEFAULT_SETTINGS = normalizeSettings({
    enabled: true,
    mode: "adaptive",
    density: "balanced",
    languageProfile: "auto",
    collapseOriginal: true,
    closingCue: true,
    trackStats: false,
  });

  const LANGUAGE_OPTIONS = Object.freeze([
    { value: "auto", label: "Auto" },
    { value: "zh", label: "中文" },
    { value: "en", label: "English" },
    { value: "ja", label: "日本語" },
    { value: "ko", label: "한국어" },
    { value: "ar", label: "العربية" },
    { value: "he", label: "עברית" },
  ]);
  const MODE_OPTIONS = Object.freeze([
    { value: "adaptive", label: "Adaptive" },
    { value: "always", label: "Always" },
  ]);
  const DENSITY_OPTIONS = Object.freeze([
    { value: "compact", label: "Compact" },
    { value: "balanced", label: "Balanced" },
    { value: "spacious", label: "Spacious" },
  ]);

  function cloneSettings(value) {
    return normalizeSettings({ ...DEFAULT_SETTINGS, ...(value || {}) });
  }

  function storageAvailable() {
    return Boolean(
      typeof chrome !== "undefined" &&
        chrome.storage &&
        chrome.storage.local &&
        typeof chrome.storage.local.get === "function",
    );
  }

  async function loadSettings() {
    if (storageAvailable()) {
      try {
        const result = await chrome.storage.local.get([STORAGE_KEY]);
        return cloneSettings(result[STORAGE_KEY]);
      } catch {
        return cloneSettings();
      }
    }
    try {
      return cloneSettings(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"));
    } catch {
      return cloneSettings();
    }
  }

  async function writeSettings(nextSettings) {
    const serializable = {
      enabled: nextSettings.enabled,
      mode: nextSettings.mode,
      density: nextSettings.density,
      languageProfile: nextSettings.languageProfile,
      collapseOriginal: nextSettings.collapseOriginal,
      closingCue: nextSettings.closingCue,
      trackStats: false,
    };
    if (storageAvailable()) {
      await chrome.storage.local.set({ [STORAGE_KEY]: serializable });
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  }

  async function saveSettings(partial) {
    const current = await loadSettings();
    const next = cloneSettings({ ...current, ...(partial || {}) });
    await writeSettings(next);
    return next;
  }

  function subscribeToSettings(callback) {
    if (storageAvailable()) {
      const listener = (changes, areaName) => {
        if (areaName !== "local" || !changes[STORAGE_KEY]) {
          return;
        }
        callback(cloneSettings(changes[STORAGE_KEY].newValue));
      };
      chrome.storage.onChanged.addListener(listener);
      return () => chrome.storage.onChanged.removeListener(listener);
    }
    const listener = (event) => {
      if (event.key !== STORAGE_KEY) {
        return;
      }
      try {
        callback(cloneSettings(JSON.parse(event.newValue || "{}")));
      } catch {
        callback(cloneSettings());
      }
    };
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }

  function nextValue(currentValue, options) {
    const values = options.map((option) => option.value);
    const currentIndex = values.indexOf(currentValue);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % values.length;
    return values[nextIndex];
  }

  function matchesSupportedUrl(url) {
    if (typeof url !== "string" || !url) {
      return false;
    }
    return (
      /^https:\/\/(?:[^/]+\.)?openclaw\.ai\//i.test(url) ||
      /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?\//i.test(url)
    );
  }

  globalThis.ReadableOverlayExtension = Object.freeze({
    STORAGE_KEY,
    DEFAULT_SETTINGS,
    LANGUAGE_OPTIONS,
    MODE_OPTIONS,
    DENSITY_OPTIONS,
    cloneSettings,
    loadSettings,
    saveSettings,
    subscribeToSettings,
    nextValue,
    matchesSupportedUrl,
  });
})();
