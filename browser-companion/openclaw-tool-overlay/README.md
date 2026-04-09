# 看得清 Overlay Companion

This is a browser-side companion for OpenClaw Web, not a ClawHub plugin.

What it does:

- watches the `Tool Output` sidebar in OpenClaw Web
- covers the sidebar with a readability-first layer
- keeps the raw output folded underneath when enabled
- adapts automatically to the sidebar size because the overlay is mounted inside the real panel

Why it exists:

- the public OpenClaw plugin API can rewrite content
- the public web UI does not currently expose a plugin-side UI injection point for the Tool Output sidebar
- a browser companion is the closest honest path to the direct overlay interaction

## Load unpacked

1. Open your Chromium browser extension page.
2. Turn on developer mode.
3. Load this folder as an unpacked extension:

```text
browser-companion/openclaw-tool-overlay
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
