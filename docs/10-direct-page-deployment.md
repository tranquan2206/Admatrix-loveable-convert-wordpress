# Direct Page Deployment

This is the preferred Admatrix MVP flow.

## Why

Copying a new PHP/CSS/JS bundle into Flatsome Child for every landing page creates an unnecessary
hosting dependency. Admatrix already has:

- WordPress Application Password authentication.
- WordPress REST API media and page endpoints.
- Flatsome `page-blank.php` for a landing page that still uses the site theme.

The converter can therefore upload assets and create a self-contained Page draft directly.

## Flow

1. Export static HTML or build Lovable to `dist`.
2. Put it under `input/<campaign>/`.
3. Ask the user to choose exactly one builder: Flatsome, Elementor, or Gutenberg.
4. Run `npm run deploy:page` with `--builder`.
5. The deployer uploads local images/fonts/media to the Media Library.
6. It rasterizes static SVG icons to WebP and embeds animated SVG diagrams with their animation CSS.
7. It rewrites asset URLs, inlines local CSS and JavaScript, and creates a Page draft.
8. It assigns the template for the selected builder.
9. Review desktop/mobile behavior and publish manually.

```powershell
npm run deploy:page -- `
  --input "<built-dist>" `
  --slug "<landing-slug>" `
  --title "<landing-title>" `
  --builder flatsome
```

Builder templates:

- `flatsome`: `page-blank.php`
- `elementor`: `elementor_canvas`
- `gutenberg`: default WordPress page template

## Boundary

- Draft only.
- No automatic publishing.
- External CDN dependencies remain external and are reported.
- Raw React/TypeScript must be built first.
- Never combine Flatsome and Elementor structure in the same landing page.
- Large or complex React apps should later use the persistent `lovable-wp-suite` plugin flow.
