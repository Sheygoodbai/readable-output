(function () {
  if (!globalThis.ReadableOverlayExtension || typeof chrome === "undefined") {
    return;
  }

  const extension = globalThis.ReadableOverlayExtension;
  const manifest = chrome.runtime.getManifest();
  const elements = {
    enabled: document.querySelector("#enabled"),
    languageProfile: document.querySelector("#languageProfile"),
    collapseOriginal: document.querySelector("#collapseOriginal"),
    closingCue: document.querySelector("#closingCue"),
    modeGroup: document.querySelector("#mode-group"),
    densityGroup: document.querySelector("#density-group"),
    pageStatusPill: document.querySelector("#page-status-pill"),
    pageStatusCopy: document.querySelector("#page-status-copy"),
    metricSidebar: document.querySelector("#metric-sidebar"),
    metricOverlay: document.querySelector("#metric-overlay"),
    metricProfile: document.querySelector("#metric-profile"),
    openOptions: document.querySelector("#open-options"),
    refreshStatus: document.querySelector("#refresh-status"),
  };

  let currentSettings = extension.cloneSettings(extension.DEFAULT_SETTINGS);

  function renderOptions(select, options, value) {
    select.innerHTML = options
      .map((option) => {
        const selected = option.value === value ? " selected" : "";
        return `<option value="${option.value}"${selected}>${option.label}</option>`;
      })
      .join("");
  }

  function renderSegmented(container, options, selectedValue) {
    container.innerHTML = options
      .map((option) => {
        const activeClass = option.value === selectedValue ? " is-active" : "";
        return `<button class="segmented__button${activeClass}" type="button" data-value="${option.value}">${option.label}</button>`;
      })
      .join("");
  }

  function renderSettings() {
    elements.enabled.checked = currentSettings.enabled;
    elements.collapseOriginal.checked = currentSettings.collapseOriginal;
    elements.closingCue.checked = currentSettings.closingCue;
    renderOptions(
      elements.languageProfile,
      extension.LANGUAGE_OPTIONS,
      currentSettings.languageProfile,
    );
    renderSegmented(elements.modeGroup, extension.MODE_OPTIONS, currentSettings.mode);
    renderSegmented(elements.densityGroup, extension.DENSITY_OPTIONS, currentSettings.density);
  }

  async function applySettings(partial) {
    currentSettings = await extension.saveSettings(partial);
    renderSettings();
  }

  async function getActiveTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0] || null;
  }

  function setStatusView(status) {
    elements.metricSidebar.textContent = status.toolSidebarDetected ? "Detected" : "Waiting";
    elements.metricOverlay.textContent = status.overlayMounted ? "Mounted" : "Idle";
    elements.metricProfile.textContent = status.currentProfile || "Auto";

    if (!status.supportedPage) {
      elements.pageStatusPill.textContent = "Unsupported page";
      elements.pageStatusPill.className = "status-pill status-pill--muted";
      elements.pageStatusCopy.textContent =
        "Open OpenClaw Web or a local fixture page to use this extension.";
      return;
    }

    if (status.toolSidebarDetected) {
      elements.pageStatusPill.textContent = status.overlayMounted
        ? "Tool Output detected"
        : "Sidebar detected";
      elements.pageStatusPill.className = "status-pill status-pill--good";
      elements.pageStatusCopy.textContent = status.overlayMounted
        ? `Overlay is live on this tab. Source length: ${status.currentSourceLength} chars.`
        : "The page is supported. Open a Tool Output sidebar to activate the overlay.";
      return;
    }

    elements.pageStatusPill.textContent = "Page ready";
    elements.pageStatusPill.className = "status-pill status-pill--muted";
    elements.pageStatusCopy.textContent =
      "This tab is supported, but no Tool Output sidebar is open right now.";
  }

  async function refreshTabStatus() {
    const activeTab = await getActiveTab();
    if (!activeTab?.id || !extension.matchesSupportedUrl(activeTab.url || "")) {
      setStatusView({
        supportedPage: false,
        toolSidebarDetected: false,
        overlayMounted: false,
        currentProfile: "Auto",
      });
      return;
    }

    try {
      const status = await chrome.tabs.sendMessage(activeTab.id, {
        type: "readable-overlay:get-status",
      });
      setStatusView(status || { supportedPage: true, toolSidebarDetected: false, overlayMounted: false });
    } catch {
      setStatusView({
        supportedPage: true,
        toolSidebarDetected: false,
        overlayMounted: false,
        currentProfile: "Auto",
      });
    }
  }

  function bindEvents() {
    elements.enabled.addEventListener("change", () => {
      void applySettings({ enabled: elements.enabled.checked });
    });
    elements.languageProfile.addEventListener("change", () => {
      void applySettings({ languageProfile: elements.languageProfile.value });
    });
    elements.collapseOriginal.addEventListener("change", () => {
      void applySettings({ collapseOriginal: elements.collapseOriginal.checked });
    });
    elements.closingCue.addEventListener("change", () => {
      void applySettings({ closingCue: elements.closingCue.checked });
    });
    elements.modeGroup.addEventListener("click", (event) => {
      const target = event.target.closest("[data-value]");
      if (!target) {
        return;
      }
      void applySettings({ mode: target.dataset.value });
    });
    elements.densityGroup.addEventListener("click", (event) => {
      const target = event.target.closest("[data-value]");
      if (!target) {
        return;
      }
      void applySettings({ density: target.dataset.value });
    });
    elements.openOptions.addEventListener("click", () => {
      chrome.runtime.openOptionsPage();
    });
    elements.refreshStatus.addEventListener("click", () => {
      void refreshTabStatus();
    });
  }

  document.title = `看得清 Overlay ${manifest.version}`;
  bindEvents();

  extension.loadSettings().then((settings) => {
    currentSettings = settings;
    renderSettings();
  });
  extension.subscribeToSettings((settings) => {
    currentSettings = settings;
    renderSettings();
  });
  void refreshTabStatus();
})();
