# Research Basis

This project is built around stable readability factors that are strong enough
to operationalize without pretending that typography alone solves
understanding.

## Factors we intentionally use

- `Chunking`: summary first, then grouped points, then raw original output
- `White space`: more separation between sections, less paragraph walling
- `Visual hierarchy`: headings, bullets, and restrained callouts
- `Signaling`: warnings and next-step cues are pulled into explicit labels
- `Language-aware layout`: labels and chunking change with script direction and
  script density

## Factors we intentionally avoid overdoing

- per-word font-size tricks
- rainbow highlighting
- all-caps warning spam
- deep nesting

Reason:

Too much emphasis reduces the value of emphasis.

## Public source entry points

- W3C WCAG 2.1 visual presentation:
  `https://www.w3.org/WAI/WCAG21/Understanding/visual-presentation`
- W3C WCAG 2.1 text spacing:
  `https://www.w3.org/WAI/WCAG21/Understanding/text-spacing`
- W3C WCAG 2.1 contrast minimum:
  `https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum`
- W3C Chinese Layout Requirements:
  `https://www.w3.org/TR/clreq/`
- W3C Arabic Layout Requirements:
  `https://www.w3.org/TR/alreq/`
- W3C Japanese Layout Requirements:
  `https://www.w3.org/TR/jlreq/`

## Product-level interpretation

- We can safely improve structure, spacing, grouping, and signposting.
- We should not overclaim that changing type size on individual word roots is a
  generally supported comprehension win.
- In the current public OpenClaw plugin API, the most reliable route is to
  improve the markdown layer, not to pretend we own the host app's font engine.

