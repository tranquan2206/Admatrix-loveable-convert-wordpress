# AI Agent Prompts for Codex / Claude Code

## Prompt 1 - Build the MVP repository

```text
You are a senior WordPress engineer. Build the MVP repo `lovable-to-wp-converter`.

The repo must support three flows:
1. Flow A: Lovable/static HTML export to WordPress child theme Page Template.
2. Flow B: Lovable app build to WordPress shortcode plugin.
3. Flow C: Elementor MCP legacy bridge for existing Elementor pages.

The existing WordPress stack must be reused:
- Flatsome / child theme
- Elementor
- RankMath SEO
- PixelYourSite
- Contact Form 7
- CFDB7

Do not remove or bypass these plugins. Reuse them in a controlled way.

Implement:
- docs
- templates
- scripts
- `lovable-wp-suite` plugin scaffold
- CF7 form/email templates
- tracking snippets through dataLayer
- RankMath SEO helper output
- QA checklist

Safety:
- No production publishing.
- No hard-coded secrets.
- Staging first.
- Keep code readable and commented.
```

## Prompt 2 - Convert a specific landing page

```text
You are converting a Lovable/static HTML landing page into a WordPress child theme page template.

Input:
- campaign_slug: <CAMPAIGN_SLUG>
- source_html: ./input/<CAMPAIGN_SLUG>/index.html
- assets_folder: ./input/<CAMPAIGN_SLUG>/assets
- form_mode: cf7
- compat_mode: clean
- theme: Flatsome child theme
- plugins: Elementor, RankMath, PixelYourSite, CF7, CFDB7

Tasks:
1. Create page template `page-<CAMPAIGN_SLUG>.php`.
2. Split HTML into template parts.
3. Copy assets into `assets/<CAMPAIGN_SLUG>/`.
4. Rewrite asset paths to `get_theme_file_uri()`.
5. Repair accordion/modal/mobile menu interactions in `custom.js`.
6. Generate CF7 form template if form exists.
7. Generate CF7 HTML email template.
8. Add hidden fields for campaign and UTM data.
9. Add dataLayer events for PixelYourSite/GTM.
10. Generate RankMath SEO recommendation file.
11. Generate QA checklist.

Rules:
- Do not publish.
- Do not change Vietnamese content unless asked.
- Do not invent Tailwind classes not present in exported CSS.
- Do not hard-code production domain or secrets.
```

## Prompt 3 - Package Lovable app into shortcode plugin

```text
You are packaging a Lovable app build into the `lovable-wp-suite` WordPress plugin.

Input:
- app_name: <APP_NAME>
- build_dir: ./dist
- shortcode: [lovable_app name="<APP_NAME>"]

Tasks:
1. Copy JS/CSS/assets into `wordpress-plugin/lovable-wp-suite/apps/<APP_NAME>/`.
2. Create `manifest.json`.
3. Ensure app has a scoped root container.
4. Ensure shortcode conditionally loads assets only when used.
5. Ensure shortcode works in normal page, Elementor shortcode widget, and Flatsome UX Builder.
6. Add dataLayer events if needed.
7. Add QA notes.

Rules:
- No global CSS if avoidable.
- No secrets in frontend.
- No production publishing.
```

## Prompt 4 - Elementor MCP legacy bridge

```text
You are connected to a staging WordPress site through Elementor MCP/EMCP.

Task:
Find the Elementor page named <PAGE_NAME>.
Duplicate it as a draft named <PAGE_NAME> - Lovable Test.
Insert shortcode [lovable_app name="<APP_NAME>"] after the hero section or after the first CTA section.
Do not publish.
Return the draft URL, edit URL, and summary of changes.
```

## Prompt 5 - QA review

```text
You are reviewing a generated WordPress landing page.
Check for:
- Missing assets
- Broken image paths
- Broken accordion/modal/mobile menu
- CF7 layout break
- Missing hidden fields
- Missing dataLayer events
- RankMath SEO checklist
- Elementor/Flatsome CSS conflicts
- Console errors
- Mobile layout issues
Return a prioritized bug list and exact files to edit.
```
