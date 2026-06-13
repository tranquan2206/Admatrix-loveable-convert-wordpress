# Human SOP

## Scenario A - Convert static Lovable/HTML landing page

1. Create folder `input/<campaign>`.
2. Save Lovable/static page as `Webpage, Complete` into that folder.
3. Manually copy hidden popup/modal HTML if needed.
4. Run campaign scaffold.
5. Ask Codex/Claude to split HTML into template parts using prompt in `docs/07-ai-agent-prompts.md`.
6. Generate CF7 form and email template if page has form.
7. Copy generated output into child theme on staging.
8. Create WordPress page and select generated Page Template.
9. Configure RankMath SEO.
10. Test form, CFDB7, PixelYourSite tracking, mobile, and visual layout.
11. Only after QA, deploy to production.

## Scenario B - Embed Lovable interactive app

1. Sync Lovable project to GitHub.
2. Build production app.
3. Copy `app.js`, `app.css`, assets into `lovable-wp-suite/apps/<app-name>`.
4. Create `manifest.json`.
5. Install/update plugin on staging.
6. Insert shortcode `[lovable_app name="<app-name>"]` into WordPress, Elementor, or Flatsome page.
7. QA tracking, form, responsiveness, and console errors.
8. Deploy to production.

## Scenario C - Modify old Elementor page

1. Work on staging.
2. Connect Elementor MCP/EMCP.
3. Ask AI to duplicate the old page into draft.
4. Ask AI to insert Lovable shortcode or audit widgets.
5. Review manually.
6. Publish only after approval.
