# Pitfalls

## Do Not Mix Builders

A landing page should use one structure path:

- Flatsome, or
- Elementor, or
- Gutenberg.

Mixing Flatsome and Elementor increases CSS/JS payload and drags site performance down.

## MCP `update-page` Can Strip Style Tags

The WordPress MCP `wsp/update-page` ability is useful for simple edits, but it has previously stripped or damaged `<style>` content in full landing pages.

For full page deployment, prefer WordPress REST with Application Password.

Only use MCP full-content update after testing on a disposable draft.

## WordPress Sanitizes Inline SVG

Raw inline SVG can be stripped from page content.

Current approach:

- Static SVG icons: rasterize to WebP and upload to Media Library.
- Complex animated SVG diagrams/charts: embed as self-contained `data:image/svg+xml;base64,...` image with internal animation CSS.

## Animated SVG Must Not Be Rasterized

Rasterizing animated workflow/chart SVG makes the page visually flat:

- Lines become gray or black.
- Dots stop moving.
- Gradients may disappear.
- Chart trend line may lose color.

Use the hybrid SVG strategy instead.

## Flatsome Adds Wrapper Spacing

Flatsome can add top spacing through wrappers such as:

- `#main`
- `#content`
- `.page-wrapper`

For Flatsome landing pages, inject page-scoped CSS:

```css
body #main,
body #content,
body .page-wrapper {
  margin: 0 !important;
  padding: 0 !important;
}
```

When fixing an existing live page, scope to page ID when possible:

```css
body.page-id-33961 .page-wrapper {
  margin: 0 !important;
  padding: 0 !important;
}
```

## Remove Lovable Runtime Artifacts

Do not leave these in WordPress content:

- `<link rel="stylesheet" href="/src/...">`
- `<link rel="preload" href="/src/...">`
- `/@tanstack-start/...`
- local `/src/assets/...`

They generate 404s and can cause broken hero images.

## Global Site Widgets Are Not Landing Bugs

Pancake chat, Zalo/Messenger floating buttons, reCAPTCHA, and cookie banners are global site layers.

Do not hide them in the landing without explicit approval.
