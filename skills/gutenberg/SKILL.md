---
name: admatrix-lovable-gutenberg
description: Convert Lovable exports to WordPress landing pages using Gutenberg/default WordPress page flow.
---

# Admatrix Lovable Gutenberg

Use this skill only after the user chooses Gutenberg.

## Command

```powershell
npm run deploy:page -- `
  --input "input\<campaign-slug>" `
  --slug "<campaign-slug>" `
  --title "<Campaign Title>" `
  --builder gutenberg
```

## Rules

- Use the default WordPress page template unless explicitly overridden.
- Keep the content self-contained.
- Prefer core blocks only when the Lovable layout is simple enough.
- Preserve animated SVG diagrams as self-contained data images.
- Convert static inline SVG icons to WebP.
- Create draft first.

## QA

- Confirm theme header/footer behavior matches expectation.
- Confirm Gutenberg does not inject unexpected block spacing.
- Confirm no Elementor or Flatsome-specific structure is mixed in unless user explicitly changes builder choice.
