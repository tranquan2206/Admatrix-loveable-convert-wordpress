# Flow B - Lovable App Build â†’ WordPress Shortcode Plugin

## Purpose

Embed interactive Lovable-built modules inside WordPress using a dedicated plugin and shortcode.

## Best use cases

- ROI calculator
- Course selector
- Assessment quiz
- Multi-step form
- Pricing estimator
- Interactive dashboard
- Dynamic widgets

## Output plugin

```text
wp-content/plugins/lovable-wp-suite/
â”œâ”€â”€ lovable-wp-suite.php
â”œâ”€â”€ includes/
â”‚   â”œâ”€â”€ class-shortcodes.php
â”‚   â”œâ”€â”€ class-assets.php
â”‚   â”œâ”€â”€ class-cf7-bridge.php
â”‚   â”œâ”€â”€ class-tracking.php
â”‚   â””â”€â”€ class-admin.php
â””â”€â”€ apps/
    â””â”€â”€ roi-calculator/
        â”œâ”€â”€ manifest.json
        â”œâ”€â”€ app.js
        â””â”€â”€ app.css
```

## Shortcode

```text
[lovable_app name="roi-calculator"]
```

## Manifest example

```json
{
  "name": "roi-calculator",
  "version": "1.0.0",
  "entry_js": "app.js",
  "entry_css": "app.css",
  "mount_id": "lovable-root-roi-calculator",
  "uses_cf7": false,
  "tracking_events": [
    "lovable_app_view",
    "lovable_calculate",
    "lovable_form_submit_success"
  ]
}
```

## Required behavior

- Only load `app.js` and `app.css` on pages that contain the shortcode.
- The app root must be scoped:

```html
<div class="lovable-wp-app" data-app="roi-calculator">
  <div id="lovable-root-roi-calculator"></div>
</div>
```

- Avoid global CSS.
- Avoid hard-coded domains and secrets.
- Use dataLayer for tracking.
- Allow insertion into Elementor and Flatsome pages.

## Deferred REST endpoint

Do not ship a placeholder public lead endpoint. A future endpoint such as:

```text
POST /wp-json/lovable/v1/lead
```

must first define authentication or abuse controls, validation, rate limiting, consent,
delivery behavior, and observability. Prefer the existing CF7 flow until those requirements
are explicit.

## Elementor/Flatsome compatibility

Shortcode must work in:

- WordPress classic/block editor
- Elementor shortcode widget
- Flatsome UX Builder shortcode block
