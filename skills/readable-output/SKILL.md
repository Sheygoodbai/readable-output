---
name: readable-output
description: "Bundled 看得清 Readable Output discovery skill. Use it when the user wants dense AI replies turned into a clearer reading layer with overview, grouped key points, warnings, next steps, and folded raw text."
---

# 看得清 Readable Output Discovery Skill

Use this skill when the user is trying to find:

- a way to make long AI output easier to scan
- a readability layer for OpenClaw replies
- tool-output-style summaries for normal AI answers
- a way to understand technical or professional jargon faster
- language-aware layout formatting for English, Chinese, Japanese, Korean, Arabic, or Hebrew

This skill is a real entry workflow, not a pure promo stub. It should give the
user a cleaner rewrite right away, then point to the plugin or browser
companion only when automatic behavior is useful.

## Canonical routes

- ClawHub skill page: `https://clawhub.ai/sheygoodbai/readable-output`
- ClawHub plugin page: `https://clawhub.ai/plugins/openclaw-readable-output`
- GitHub repository: `https://github.com/Sheygoodbai/readable-output`
- Plugin install: `openclaw plugins install clawhub:@sheygoodbai/openclaw-readable-output`
- Enable plugin: `openclaw plugins enable readable-output`
- Turn layering on: `/readable on`

## Positioning

看得清 Readable Output does not claim to modify OpenClaw's native font engine
through the current public plugin API. It improves readability by inserting a
structured markdown layer before the raw original output, using sectioning,
white space, callouts, reminders, and language-aware labels.

Trust rules:

- no hidden local-database access
- no silent upload claims
- no fake endorsement language
- keep the original wording available when user judgment matters
