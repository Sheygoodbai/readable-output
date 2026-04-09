(function () {
  if (!globalThis.ReadableEngine || !globalThis.ReadableOverlayExtension) {
    return;
  }

  const {
    readabilityScore,
    resolveLanguageProfile,
    rewriteOutgoingContent,
  } = globalThis.ReadableEngine;
  const {
    DEFAULT_SETTINGS,
    DENSITY_OPTIONS,
    MODE_OPTIONS,
    cloneSettings,
    loadSettings,
    matchesSupportedUrl,
    nextValue,
    saveSettings,
    subscribeToSettings,
  } = globalThis.ReadableOverlayExtension;

  const OVERLAY_ROOT_CLASS = "readable-tool-overlay";
  const LANGUAGE_LABELS = Object.freeze({
    auto: "Auto",
    en: "EN",
    zh: "中文",
    ja: "日本語",
    ko: "한국어",
    ar: "AR",
    he: "HE",
  });

  const state = {
    settings: cloneSettings(DEFAULT_SETTINGS),
    panelObserver: null,
    resizeObserver: null,
    pageObserver: null,
    settingsUnsubscribe: null,
    activePanel: null,
    currentSourceText: "",
    lastProfile: "auto",
    lastRewriteChanged: false,
    rafId: 0,
  };

  function isVisible(element) {
    if (!(element instanceof HTMLElement) || !element.isConnected) {
      return false;
    }
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function findActiveSidebarPanel() {
    const panels = Array.from(document.querySelectorAll(".sidebar-panel"));
    return (
      panels.find((panel) => {
        const title = panel.querySelector(".sidebar-title");
        return isVisible(panel) && title && /tool output/i.test(title.textContent || "");
      }) || null
    );
  }

  function getSourceNode(panel) {
    return panel.querySelector(".sidebar-markdown") || panel.querySelector(".sidebar-content");
  }

  function extractPanelText(panel) {
    const node = getSourceNode(panel);
    if (!(node instanceof HTMLElement)) {
      return "";
    }
    return node.innerText.replace(/\u00A0/g, " ").trim();
  }

  function ensureOverlayRoot(panel) {
    let root = panel.querySelector(`:scope > .${OVERLAY_ROOT_CLASS}`);
    if (root instanceof HTMLElement) {
      return root;
    }
    root = document.createElement("div");
    root.className = OVERLAY_ROOT_CLASS;
    root.addEventListener("click", handleOverlayClick);
    panel.classList.add("readable-overlay-host");
    panel.appendChild(root);
    return root;
  }

  function setCompactClass(root, panel) {
    const compact = panel.getBoundingClientRect().width < 320;
    root.classList.toggle("readable-tool-overlay--compact", compact);
  }

  function parseDetails(markdown) {
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

  function escapeHtml(text) {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function renderParagraphs(text) {
    return text
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => `<p>${escapeHtml(line)}</p>`)
      .join("");
  }

  function parseBlocks(markdown) {
    return markdown
      .split(/\n{2,}(?=(?:## |>))/)
      .map((block) => block.trim())
      .filter(Boolean);
  }

  function renderBlock(block, index) {
    if (block.startsWith("## ")) {
      const lines = block.split("\n");
      const title = lines[0].replace(/^##\s+/, "").trim();
      const body = lines.slice(1).join("\n").trim();
      const bodyLines = body.split("\n").map((line) => line.trim()).filter(Boolean);
      const listItems = bodyLines
        .filter((line) => line.startsWith("- "))
        .map((line) => line.replace(/^- /, "").trim());
      if (listItems.length > 0 && listItems.length === bodyLines.length) {
        return [
          `<section class="readable-tool-overlay__section" style="--readable-index:${index}">`,
          `<div class="readable-tool-overlay__section-label">${escapeHtml(title)}</div>`,
          `<ul class="readable-tool-overlay__list">`,
          listItems.map((item) => `<li>${escapeHtml(item)}</li>`).join(""),
          `</ul>`,
          `</section>`,
        ].join("");
      }
      return [
        `<section class="readable-tool-overlay__section" style="--readable-index:${index}">`,
        `<div class="readable-tool-overlay__section-label">${escapeHtml(title)}</div>`,
        `<div class="readable-tool-overlay__section-copy">${renderParagraphs(body)}</div>`,
        `</section>`,
      ].join("");
    }

    if (block.startsWith(">")) {
      const line = block.replace(/^>\s*/, "").trim();
      const match = line.match(/^\*\*(.+?):\*\*\s*([\s\S]+)$/);
      const title = match ? match[1].trim() : "Note";
      const body = match ? match[2].trim() : line;
      return [
        `<section class="readable-tool-overlay__callout" style="--readable-index:${index}">`,
        `<div class="readable-tool-overlay__callout-label">${escapeHtml(title)}</div>`,
        renderParagraphs(body),
        `</section>`,
      ].join("");
    }

    return [
      `<section class="readable-tool-overlay__empty" style="--readable-index:${index}">`,
      renderParagraphs(block),
      `</section>`,
    ].join("");
  }

  function renderOverlayContent(sourceText) {
    const result = rewriteOutgoingContent(sourceText, state.settings);
    const profile = result.profile || resolveLanguageProfile(sourceText, state.settings);
    const details = parseDetails(result.content);
    const blocks = parseBlocks(details.withoutDetails);
    const rawScore = readabilityScore(sourceText, state.settings);
    const hint = result.changed
      ? "先看结论、重点和下一步，再决定要不要展开原始输出。"
      : state.settings.mode === "always"
        ? "当前内容原本就比较清晰，这一层主要帮你固定阅读结构。"
        : "这一段本身已经比较清楚，所以 adaptive 模式没有强行重写。";

    const sectionsHtml = blocks.length
      ? blocks.map((block, index) => renderBlock(block, index)).join("")
      : [
          `<section class="readable-tool-overlay__empty" style="--readable-index:0">`,
          `<p>${escapeHtml(sourceText)}</p>`,
          `</section>`,
        ].join("");

    const detailsHtml =
      details.summary && state.settings.collapseOriginal
        ? [
            `<details class="readable-tool-overlay__details">`,
            `<summary>${escapeHtml(details.summary)}</summary>`,
            `<div class="readable-tool-overlay__details-body">`,
            `<pre>${escapeHtml(details.body)}</pre>`,
            `</div>`,
            `</details>`,
          ].join("")
        : "";

    state.lastProfile = profile;
    state.lastRewriteChanged = Boolean(result.changed);

    return [
      `<div class="readable-tool-overlay__hint">${escapeHtml(hint)}</div>`,
      `<div class="readable-tool-overlay__metric-row">`,
      `<div class="readable-tool-overlay__metric"><span class="readable-tool-overlay__metric-label">Input density</span><strong>${rawScore}</strong></div>`,
      `<div class="readable-tool-overlay__metric"><span class="readable-tool-overlay__metric-label">Sections added</span><strong>${result.sectionsAdded || 0}</strong></div>`,
      `<div class="readable-tool-overlay__metric"><span class="readable-tool-overlay__metric-label">Chars added</span><strong>+${result.charsAdded || 0}</strong></div>`,
      `</div>`,
      sectionsHtml,
      detailsHtml,
      `<div class="readable-tool-overlay__badge-row">`,
      `<span class="readable-tool-overlay__badge">Profile ${escapeHtml(LANGUAGE_LABELS[profile] || profile)}</span>`,
      `<span class="readable-tool-overlay__badge">${result.changed ? "Rewritten" : "Already readable"}</span>`,
      `</div>`,
    ].join("");
  }

  function renderPassiveShell(root) {
    root.classList.add("readable-tool-overlay--passive");
    root.innerHTML = [
      `<div class="readable-tool-overlay__surface">`,
      `<div class="readable-tool-overlay__header">`,
      `<div class="readable-tool-overlay__title-stack">`,
      `<div class="readable-tool-overlay__eyebrow">Readable Overlay</div>`,
      `<div class="readable-tool-overlay__title">Overlay is off for this tool window</div>`,
      `</div>`,
      `<div class="readable-tool-overlay__actions">`,
      `<button class="readable-tool-overlay__chip readable-tool-overlay__chip--accent" data-action="toggle-enabled">Turn on</button>`,
      `</div>`,
      `</div>`,
      `</div>`,
    ].join("");
  }

  function renderActiveShell(root, panel, sourceText) {
    root.classList.remove("readable-tool-overlay--passive");
    setCompactClass(root, panel);
    root.innerHTML = [
      `<div class="readable-tool-overlay__surface">`,
      `<div class="readable-tool-overlay__header">`,
      `<div class="readable-tool-overlay__title-stack">`,
      `<div class="readable-tool-overlay__eyebrow">Readable Overlay</div>`,
      `<div class="readable-tool-overlay__title">看得清 Tool Output Layer</div>`,
      `</div>`,
      `<div class="readable-tool-overlay__actions">`,
      `<button class="readable-tool-overlay__chip" data-action="cycle-mode">Mode ${escapeHtml(state.settings.mode)}</button>`,
      `<button class="readable-tool-overlay__chip" data-action="cycle-density">Density ${escapeHtml(state.settings.density)}</button>`,
      `<button class="readable-tool-overlay__chip" data-action="toggle-original">${state.settings.collapseOriginal ? "Original on" : "Original off"}</button>`,
      `<button class="readable-tool-overlay__chip" data-action="toggle-enabled">Overlay on</button>`,
      `<button class="readable-tool-overlay__chip readable-tool-overlay__chip--close" data-action="close-sidebar" aria-label="Close">×</button>`,
      `</div>`,
      `</div>`,
      `<div class="readable-tool-overlay__body">${renderOverlayContent(sourceText)}</div>`,
      `</div>`,
    ].join("");
  }

  function renderPanel(panel) {
    const root = ensureOverlayRoot(panel);
    const sourceText = extractPanelText(panel);
    state.currentSourceText = sourceText;
    if (!sourceText) {
      root.remove();
      return;
    }
    if (!state.settings.enabled) {
      renderPassiveShell(root);
      return;
    }
    renderActiveShell(root, panel, sourceText);
  }

  function detachOverlay() {
    disconnectPanelObserver();
    state.activePanel = null;
    document.querySelectorAll(`.${OVERLAY_ROOT_CLASS}`).forEach((node) => node.remove());
  }

  function scheduleRender() {
    if (state.rafId) {
      return;
    }
    state.rafId = window.requestAnimationFrame(() => {
      state.rafId = 0;
      attachToCurrentPanel();
    });
  }

  function disconnectPanelObserver() {
    if (state.panelObserver) {
      state.panelObserver.disconnect();
      state.panelObserver = null;
    }
    if (state.resizeObserver) {
      state.resizeObserver.disconnect();
      state.resizeObserver = null;
    }
  }

  function observePanel(panel) {
    disconnectPanelObserver();
    const observer = new MutationObserver(() => {
      const nextText = extractPanelText(panel);
      if (nextText !== state.currentSourceText) {
        renderPanel(panel);
      }
    });
    observer.observe(panel, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
    });
    state.panelObserver = observer;

    const resizeObserver = new ResizeObserver(() => {
      renderPanel(panel);
    });
    resizeObserver.observe(panel);
    state.resizeObserver = resizeObserver;
  }

  function attachToCurrentPanel() {
    const panel = findActiveSidebarPanel();
    if (!panel) {
      disconnectPanelObserver();
      state.activePanel = null;
      return;
    }
    if (state.activePanel !== panel) {
      state.activePanel = panel;
      observePanel(panel);
    }
    renderPanel(panel);
  }

  async function applySettingsUpdate(partial) {
    state.settings = await saveSettings(partial);
    scheduleRender();
    return state.settings;
  }

  async function handleAction(action) {
    if (action === "toggle-enabled") {
      await applySettingsUpdate({ enabled: !state.settings.enabled });
      return;
    }
    if (action === "cycle-density") {
      await applySettingsUpdate({
        density: nextValue(state.settings.density, DENSITY_OPTIONS),
      });
      return;
    }
    if (action === "cycle-mode") {
      await applySettingsUpdate({
        mode: nextValue(state.settings.mode, MODE_OPTIONS),
      });
      return;
    }
    if (action === "toggle-original") {
      await applySettingsUpdate({
        collapseOriginal: !state.settings.collapseOriginal,
      });
      return;
    }
    if (action === "close-sidebar") {
      const button = state.activePanel?.querySelector(".sidebar-header .btn");
      if (button instanceof HTMLElement) {
        button.click();
      }
    }
  }

  function handleOverlayClick(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const actionTarget = target.closest("[data-action]");
    if (!(actionTarget instanceof HTMLElement)) {
      return;
    }
    void handleAction(actionTarget.dataset.action || "");
  }

  function buildPageStatus() {
    return {
      supportedPage: matchesSupportedUrl(location.href),
      toolSidebarDetected: Boolean(findActiveSidebarPanel()),
      overlayMounted: Boolean(document.querySelector(`.${OVERLAY_ROOT_CLASS}`)),
      enabled: state.settings.enabled,
      mode: state.settings.mode,
      density: state.settings.density,
      collapseOriginal: state.settings.collapseOriginal,
      closingCue: state.settings.closingCue,
      currentSourceLength: state.currentSourceText.length,
      currentProfile: state.lastProfile,
      rewritten: state.lastRewriteChanged,
      url: location.href,
    };
  }

  function startObservers() {
    if (typeof chrome !== "undefined" && chrome.runtime?.id) {
      document.documentElement.dataset.readableOverlayExtensionId = chrome.runtime.id;
    }
    state.pageObserver = new MutationObserver(() => {
      scheduleRender();
    });
    state.pageObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
    });
    window.addEventListener("resize", scheduleRender, { passive: true });
    state.settingsUnsubscribe = subscribeToSettings((nextSettings) => {
      state.settings = nextSettings;
      scheduleRender();
    });

    if (
      typeof chrome !== "undefined" &&
      chrome.runtime &&
      chrome.runtime.onMessage &&
      typeof chrome.runtime.onMessage.addListener === "function"
    ) {
      chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
        if (message?.type === "readable-overlay:get-status") {
          sendResponse(buildPageStatus());
          return false;
        }
        if (message?.type === "readable-overlay:apply-settings") {
          void applySettingsUpdate(message.payload || {}).then((nextSettings) => {
            sendResponse({ ok: true, settings: nextSettings });
          });
          return true;
        }
        return false;
      });
    }

    scheduleRender();
  }

  loadSettings().then((loaded) => {
    state.settings = loaded;
    startObservers();
  });

  window.addEventListener("pagehide", () => {
    delete document.documentElement.dataset.readableOverlayExtensionId;
    if (state.settingsUnsubscribe) {
      state.settingsUnsubscribe();
      state.settingsUnsubscribe = null;
    }
    if (state.pageObserver) {
      state.pageObserver.disconnect();
      state.pageObserver = null;
    }
    detachOverlay();
  });
})();
