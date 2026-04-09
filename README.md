# 看得清 Readable Output

看得清 Readable Output is an OpenClaw plugin plus ClawHub skill for one
specific job: make long AI output easier to scan and safer to act on.

It adds a local readability layer before the answer reaches the user:

- a short overview
- grouped key points
- warning callouts
- next-step cues
- a closing reminder
- the original output folded underneath

Canonical pages:

- Skill: `https://clawhub.ai/sheygoodbai/readable-output`
- Plugin: `https://clawhub.ai/plugins/openclaw-readable-output`

## Web-first demo

If you do not have local OpenClaw, start with the browser demo shipped in this repo:

- local demo entry: `docs/demo/index.html`
- GitHub Pages-ready root: `docs/index.html`

The demo runs entirely in the browser and reuses the same readability engine as
the plugin. It exists as a low-friction trial path, but the main install CTA
still stays on the ClawHub plugin page so traffic does not fragment.

## Browser overlay companion

For OpenClaw Web users who want the most direct interaction, this repo now also
ships a browser-side companion:

- extension folder:
  `browser-companion/openclaw-tool-overlay`
- local harness:
  `browser-companion/openclaw-tool-overlay/fixture.html`
- Chrome popup:
  `browser-companion/openclaw-tool-overlay/popup.html`
- Chrome options page:
  `browser-companion/openclaw-tool-overlay/options.html`

What it does:

- watches the real `Tool Output` sidebar in OpenClaw Web
- mounts an overlay inside the actual sidebar panel
- follows panel size changes and narrow-width states locally
- keeps a local on/off switch and raw-output foldback
- ships a real Chrome extension shell with popup, options page, badge, and shortcut

What it is not:

- not a ClawHub plugin listing
- not a host-UI patch inside the public OpenClaw plugin API
- not a remote service that uploads tool output somewhere else

## What it does

- restructures long AI replies into a tool-output-style readability layer
- ships a no-install web demo for users who want to test the behavior first
- increases white space and grouping through markdown sections
- isolates warnings and next actions so they are not buried in dense paragraphs
- adapts labels and chunking to the user's chosen language profile
- keeps the original reply available in a collapsed block
- works locally without uploading local chat content to any plugin database

## What it does not do

- It does not directly control OpenClaw's native font family, theme colors, or CSS line-height through the current public plugin API.
- It does not claim research-backed support for per-word font-size tricks such as enlarging roots or random emphasis bursts.
- It does not read local databases or ship hidden telemetry.

Current plugin-API reality:

- `skill` and `MCP` routes can change structure and wording.
- a plugin can automatically add the readability layer
- changing the host app's actual typography chrome still requires a UI patch
- directly covering the web `Tool Output` sidebar requires a browser-side companion or a Control UI patch

Web-first reality:

- without local OpenClaw, the web demo is the closest honest substitute
- it cannot intercept host-side output automatically
- it can still prove whether the readability layer is useful before install

## Why this approach is evidence-aligned

This plugin follows stable readability guidance rather than aesthetic guesswork:

- W3C WCAG visual-presentation guidance favors restrained line width, non-justified text, and usable spacing.
- W3C text-spacing guidance shows users need line-height and paragraph spacing headroom.
- W3C contrast guidance supports high enough contrast for readable text.
- W3C international layout guidance shows script direction, line breaking, and punctuation handling differ across Arabic, Chinese, Japanese, Korean, and Latin-script text.

Public source entry points:

- `https://www.w3.org/WAI/WCAG21/Understanding/visual-presentation`
- `https://www.w3.org/WAI/WCAG21/Understanding/text-spacing`
- `https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum`
- `https://www.w3.org/TR/clreq/`
- `https://www.w3.org/TR/alreq/`
- `https://www.w3.org/TR/jlreq/`

## Install

```bash
openclaw plugins install clawhub:@sheygoodbai/openclaw-readable-output
openclaw plugins enable readable-output
```

Then turn it on:

```text
/readable on
```

If the plugin does not appear immediately in `openclaw plugins list`, restart
the gateway once after install or enable.

Standalone skill route:

```bash
clawhub install readable-output
openclaw skills install readable-output
```

No local OpenClaw yet:

- open `docs/demo/index.html` directly in a browser
- or publish the `docs/` folder with GitHub Pages

For OpenClaw Web users:

- load the unpacked browser companion from
  `browser-companion/openclaw-tool-overlay`
- it targets the web `Tool Output` sidebar directly

## Commands

- `/readable on`
- `/readable off`
- `/readable adaptive`
- `/readable always`
- `/readable auto`
- `/readable en`
- `/readable zh`
- `/readable ja`
- `/readable ko`
- `/readable ar`
- `/readable he`
- `/readable compact`
- `/readable balanced`
- `/readable spacious`
- `/readable status`
- `/readable help`

## Language profiles

- `auto`: detect from the active conversation
- `en`: Latin-script defaults with explicit headings and concise bullets
- `zh`: shorter section labels, denser chunk splitting, less sentence stacking
- `ja`: short labels, compact bullets, and aggressive paragraph splitting
- `ko`: clear headings, shorter bullets, and compact grouping
- `ar`: RTL-friendly labels and stronger separation of code, links, and numbers
- `he`: RTL-friendly labels and stronger separation of mixed-direction content

## Example

Input:

```text
This probably works, but there are a few caveats worth calling out. From a practical standpoint the main bottleneck is dependency drift, and before we say it is done we should verify the output file, rerun the test, and check whether the config change actually shipped.
```

Readable layer:

```md
## Overview
Before calling this done, verify the file, rerun the test, and confirm the config really shipped.

## Key points
- The current answer is mostly about caveats and verification.
- Dependency drift is the main bottleneck mentioned here.
- The safe path is to check proof, not just trust the summary.

> **Watch for:** The reply implies completion confidence before proof is shown.

## Next step
- Verify the output file.
- Rerun the test.
- Confirm the config change really shipped.

> **Reminder:** If the decision matters, expand the original wording before you act on the summary.

<details>
<summary>Original output</summary>

This probably works, but there are a few caveats worth calling out...

</details>
```

## Demo sync

The plugin and demo share one engine source:

- shared engine: `shared/readable-engine.js`
- plugin re-export: `src/readable-core.js`
- demo copy target: `docs/demo/readable-engine.js`

After editing the shared engine, sync the demo copy:

```bash
npm run sync:demo-core
```

Sync the browser companion bundle:

```bash
npm run sync:browser-core
```

Generate icons and package the Chrome extension:

```bash
npm run generate:browser-icons
npm run package:browser-extension
```
