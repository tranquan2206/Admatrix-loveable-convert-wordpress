---
name: admatrix-lovable-flatsome
description: Convert Lovable exports to WordPress landing pages using Flatsome only.
---

# Admatrix Lovable Flatsome

Use this skill only after the user chooses Flatsome.

## Command

```powershell
npm run deploy:page -- `
  --input "input\<campaign-slug>" `
  --slug "<campaign-slug>" `
  --title "<Campaign Title>" `
  --builder flatsome
```

## Rules

- Use `page-blank.php`.
- Do not load Elementor structure.
- Add Flatsome wrapper reset for `#main`, `#content`, and `.page-wrapper`.
- Preserve animated SVG diagrams as self-contained data images.
- Convert static inline SVG icons to WebP.
- Create draft first.

## QA

- Confirm Flatsome CSS loads.
- Confirm Elementor frontend CSS does not load.
- Confirm no top gap between menu and hero.
- Confirm no `/src/` URL remains.
- Confirm mobile after closing global chat/cookie overlays.
