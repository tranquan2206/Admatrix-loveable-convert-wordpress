# Master Knowledge: Lovable â†’ WordPress Conversion System

## 1. Context

The user has an existing WordPress.org website and has long used:

- Flatsome / Flatsome Child Theme
- Elementor
- PixelYourSite
- RankMath SEO
- Contact Form 7
- CFDB7

The user also uses Lovable to create modern web UI. The business goal is to create a repeatable internal workflow for converting Lovable UI into WordPress output that staff can use, with help from Codex, Claude Code, or other AI coding agents.

The correct interpretation is: **reuse the old plugins where useful**, but do so in a controlled architecture. Do not misinterpret this as avoiding old plugins.

## 2. Architectural principle

Lovable is the UI production layer.
WordPress is the publishing, SEO, form, tracking, user, and content system.
The converter repo is the bridge.
Existing WordPress plugins are reused as operational components.

## 3. Three main flows

### Flow A: Static landing conversion

Lovable/HTML static export becomes a native WordPress child theme Page Template.

Use when:

- Page is mostly static.
- SEO matters.
- WordPress/RankMath should index content clearly.
- Page should be fast and independent from Elementor where needed.
- Existing CF7/CFDB7/PixelYourSite workflow should be reused.

Output:

- `assets/<campaign>/styles.css`
- `assets/<campaign>/custom.js`
- `assets/<campaign>/images/`
- `template-parts/<campaign>/*.php`
- `page-templates/page-<campaign>.php`

### Flow B: App module conversion

Lovable app build becomes an embeddable WordPress plugin app through shortcode/block.

Use when:

- There is complex interaction.
- There is React-like state.
- There is a calculator, quiz, course selector, dashboard, or multi-step flow.
- The app should be inserted into normal WordPress pages, Elementor pages, or Flatsome layouts.

Output:

- WordPress plugin `lovable-wp-suite`
- Shortcode `[lovable_app name="..."]`
- App manifest and conditional asset loading

### Flow C: Elementor MCP legacy bridge

Elementor MCP/EMCP is used only as a helper for existing Elementor pages.

Use when:

- Need to inspect or edit Elementor pages.
- Need to insert Lovable shortcode into an existing Elementor page.
- Need to create a draft Elementor page quickly.
- Need to audit old Elementor pages.

Do not use it as the default path for new Lovable modules.

## 4. MCP positioning

MCP is not the MVP center at first.

The MVP center is:

1. Conversion SOP
2. Scaffolding scripts
3. CF7/PixelYourSite/RankMath integration
4. Shortcode plugin
5. Human QA

MCP becomes useful later to expose safe abilities:

- List Lovable apps.
- Check app health.
- Create draft page.
- Attach shortcode.
- Audit Elementor pages.
- Check failed lead sync.

Use WordPress/mcp-adapter as the preferred future route. Automattic/wordpress-mcp should be treated as a reference/deprecated direction.

## 5. Existing plugin reuse policy

### Flatsome

Reuse as:

- Theme foundation.
- Header/footer if desired.
- Existing shop/page layout.
- Existing UX Builder pages.

Avoid forcing Lovable modules to become Flatsome components unless required.

### Elementor

Reuse as:

- Existing page system.
- Container for `[lovable_app]` shortcode.
- AI-assisted legacy page editing via Elementor MCP.

Avoid using Elementor as the default conversion target for complex Lovable apps.

### Contact Form 7

For MVP, CF7 is a supported default form mode because the team already uses it.

Use for:

- Landing page lead forms.
- Popup forms.
- Email notification templates.
- Hidden fields for campaign and UTM data.

Design extension point:

- `form_mode = cf7`
- `form_mode = rest`
- `form_mode = none`

### CFDB7

Reuse for submission backup when CF7 is used.

Do not treat CFDB7 as CRM.

### PixelYourSite

Reuse for tracking, but send neutral events using `window.dataLayer.push(...)`.
Do not call PixelYourSite internal functions directly.

### RankMath SEO

Reuse for SEO metadata, canonical, schema, sitemap, Open Graph.
MVP can generate a recommendation file for human copy/paste.
Later versions may update RankMath post meta through WP-CLI/REST.

## 6. Critical know-how from SOP

- Save static source as `Webpage, Complete` to capture HTML/assets.
- Hidden popups/modals often are not saved and must be copied manually from browser inspector or recreated from screenshots.
- Convert static image paths to `get_theme_file_uri(...)`.
- React/Radix/Vue accordions and popups can break after Save As; rewrite interactions in `custom.js`.
- CF7 wraps fields in `<p>` and `span.wpcf7-form-control-wrap`, which can break layout; include CSS fixes or disable autop if allowed.
- Dequeue Elementor/theme/global CSS only on landing templates where needed.
- Tailwind JIT classes cannot be invented after export unless they are present in CSS.

## 7. Compatibility modes

Use a config per campaign:

```json
{
  "campaign": "bootcamp-hr-ai",
  "compat_mode": "clean",
  "form_mode": "cf7",
  "use_flatsome_header": false,
  "use_elementor_container": false,
  "use_rankmath": true,
  "use_pixelyoursite": true
}
```

### clean

Independent landing page. Dequeue Elementor/theme assets if they conflict.

### theme

Keep Flatsome/theme header/footer and selected theme styles.

### builder

Landing/app is embedded into Elementor or Flatsome via shortcode.

## 8. Human review rules

- AI may generate draft code.
- AI may generate draft pages.
- AI must not publish production pages automatically.
- All output must pass staging QA.
