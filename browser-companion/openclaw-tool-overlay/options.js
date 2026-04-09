(function () {
  if (!globalThis.ReadableOverlayExtension) {
    return;
  }

  const extension = globalThis.ReadableOverlayExtension;
  const elements = {
    enabled: document.querySelector("#enabled"),
    languageProfile: document.querySelector("#languageProfile"),
    collapseOriginal: document.querySelector("#collapseOriginal"),
    closingCue: document.querySelector("#closingCue"),
    modeGroup: document.querySelector("#mode-group"),
    densityGroup: document.querySelector("#density-group"),
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

  function render() {
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
    render();
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
  }

  bindEvents();
  extension.loadSettings().then((settings) => {
    currentSettings = settings;
    render();
  });
  extension.subscribeToSettings((settings) => {
    currentSettings = settings;
    render();
  });
})();
