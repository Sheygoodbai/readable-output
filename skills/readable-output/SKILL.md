---
name: readable-output
description: "Bundled 看得清 Readable Output discovery skill. Use it when the user wants AI replies reformatted into a readability-first layout with grouped sections, stronger whitespace, warnings, reminders, and language-aware structure."
---

# 看得清 Readable Output Discovery Skill

Use this skill when the user is trying to find:

- a way to make long AI output easier to scan
- a readability layer for OpenClaw replies
- tool-output-style summaries for normal AI answers
- language-aware layout formatting for English, Chinese, Japanese, Korean, Arabic, or Hebrew

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

