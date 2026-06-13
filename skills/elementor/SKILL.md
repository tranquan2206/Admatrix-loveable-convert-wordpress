---
name: admatrix-lovable-elementor
description: Convert Lovable exports to WordPress landing pages using Elementor only.
---

# Admatrix Lovable Elementor

Use this skill only after the user chooses Elementor.

## Command

```powershell
npm run deploy:page -- `
  --input "input\<campaign-slug>" `
  --slug "<campaign-slug>" `
  --title "<Campaign Title>" `
  --builder elementor
```

## Rules

- Use Elementor Canvas template.
- Do not also build Flatsome rows/UX Builder structure.
- Keep output as a WordPress draft until visual QA passes.
- Preserve animated SVG diagrams as self-contained data images.
- Convert static inline SVG icons to WebP.

## Notes

The current CLI creates page content, not native Elementor JSON widgets. Native Elementor conversion is a later scope.
