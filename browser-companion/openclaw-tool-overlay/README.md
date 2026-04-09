# 看得清 Chrome Extension

This is the browser-side Chrome extension for OpenClaw Web, not a ClawHub plugin.

## What ships

- `content.js`: mounts the Tool Output overlay inside the real sidebar
- `popup.html`: quick controls for enabled/mode/density/current-tab status
- `options.html`: full settings page and privacy/runtime notes
- `background.js`: badge state + keyboard shortcut support
- `icons/`: packaged Chrome extension icons

## What it does

- watches the `Tool Output` sidebar in OpenClaw Web
- covers that sidebar with a readability-first layer
- keeps the raw output folded underneath when enabled
- follows panel width changes because the overlay is mounted inside the actual panel
- syncs settings across popup, options, and content script through local extension storage

## Why it exists

- the public OpenClaw plugin API can rewrite content
- the public web UI does not expose a direct plugin-side UI injection point for the Tool Output sidebar
- a Chrome extension is the closest honest path to the direct overlay interaction

## Load unpacked

1. Open `chrome://extensions/`
2. Turn on developer mode
3. Choose `Load unpacked`
4. Select:

```text
browser-companion/openclaw-tool-overlay
```

## Package zip

From the repo root:

```bash
npm run generate:browser-icons
npm run package:browser-extension
```

The packaged zip will be created in:

```text
dist/openclaw-tool-overlay-0.1.0.zip
```

## Current scope

- Targets `Tool Output` sidebars that use the upstream OpenClaw class names:
  - `.sidebar-panel`
  - `.sidebar-title`
  - `.sidebar-markdown`
- Runs on:
  - `https://*.openclaw.ai/*`
  - `http://localhost:*/*`
  - `http://127.0.0.1:*/*`

If you self-host OpenClaw on a different domain, update `manifest.json`.
