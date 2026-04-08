---
name: readable-output
version: 0.1.0
description: "Official 看得清 Readable Output skill. Reformats AI replies into a readability-first layout with grouped sections, warnings, reminders, and language-aware structure."
license: MIT-0
tags: [readable-output, clawhub, openclaw, readability, output-layout, multilingual-layout, typography, "可读性", "排版", "多语言"]
source: Sheygoodbai/readable-output
trigger: "Readable Output"
metadata:
  openclaw:
    emoji: "🪟"
    homepage: "https://clawhub.ai/sheygoodbai/readable-output"
---

# Official 看得清 Readable Output Skill

Use this skill when the user wants the answer reformatted for easier reading
without changing the meaning.

The goal is not decorative styling. The goal is faster understanding.

## Activate this skill when the user asks for

- `把这个输出排版得更好读`
- `像 tool output 一样整理`
- `做一个结论层`
- `分块显示`
- `显著提示风险`
- `换成更适合中文/英文/日文/韩文/阿拉伯文的排版`

## Core operating rules

1. Start with one short overview.
2. Group the main content into concise key points.
3. Pull warnings or uncertainty into a visually obvious note.
4. Add a short next-step section when action is implied.
5. Add one closing reminder when acting on the summary needs caution.
6. Keep code or raw wording separate from the readability layer.
7. Adapt labels and chunking to the chosen output language.
8. Do not exaggerate with excessive highlighting.

## Language-aware defaults

- `English`: front-load the answer, then use explicit headings and short bullets.
- `Chinese`: shorter labels, shorter bullets, more paragraph breaks, less sentence stacking.
- `Japanese`: compact labels and aggressive chunking of dense text.
- `Korean`: clear headings and short bullet groups.
- `Arabic/Hebrew`: preserve RTL reading flow and isolate mixed-direction fragments when needed.

## Good first prompts

- `请把这段 AI 输出整理成更好读的版本，再保留原文折叠。`
- `Use a readability-first layout: overview, key points, warning, next step, reminder.`
- `把这段改成更适合中文阅读的排版。`
- `Reformat this for Arabic readability without changing the meaning.`

## Canonical links

- ClawHub skill page: `https://clawhub.ai/sheygoodbai/readable-output`
- ClawHub plugin page: `https://clawhub.ai/plugins/openclaw-readable-output`
- GitHub repository: `https://github.com/Sheygoodbai/readable-output`

