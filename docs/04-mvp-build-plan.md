# MVP Build Plan

## Sprint 1 - Repository scaffold and Flow A

Duration: 3-5 days.

Deliverables:

- Repository structure.
- Flow A docs.
- Campaign generator.
- Asset path rewriter MVP.
- Interaction snippets.
- QA checklist.

Acceptance criteria:

- Can create `page-<campaign>.php` scaffold.
- Can create `assets/<campaign>` and `template-parts/<campaign>`.
- Can rewrite common image paths to `get_theme_file_uri()`.
- Can produce a staging-ready template draft.

## Sprint 2 - CF7, CFDB7, PixelYourSite, RankMath helpers

Duration: 4-7 days.

Deliverables:

- CF7 form generator.
- CF7 HTML email generator.
- Hidden fields generator.
- CSS fixes for CF7 wrappers.
- dataLayer event snippets.
- RankMath SEO recommendation file.

Acceptance criteria:

- Staff can copy generated CF7 template into WordPress.
- CFDB7 can save submissions.
- PixelYourSite/GTM can catch dataLayer events.
- RankMath SEO recommendation can be copied into page settings.

## Sprint 3 - Lovable WP Suite shortcode plugin

Duration: 5-10 days.

Deliverables:

- `lovable-wp-suite` plugin.
- Shortcode `[lovable_app name="..."]`.
- App manifest system.
- Conditional asset enqueue.
- Admin page listing apps.
- REST/CF7 integration decision document; no public placeholder endpoint.

Acceptance criteria:

- Shortcode renders on normal pages.
- Shortcode renders inside Elementor.
- Shortcode renders inside Flatsome UX Builder.
- Assets only load when shortcode is present.

## Sprint 4 - MCP docs and prompts

Duration: 5-10 days.

Deliverables:

- Docs for WordPress MCP Adapter.
- Docs for Elementor MCP/EMCP.
- Prompt library for AI audit and shortcode insertion.
- Optional Abilities planning doc for later.

Acceptance criteria:

- AI agent can inspect staging Elementor page.
- AI agent can create a draft Elementor page.
- AI agent can insert Lovable shortcode into an Elementor draft.
- No automatic publishing.

## MVP v1 success definition

A human staff member can take one Lovable/static landing page and produce a working WordPress staging page using the repo, CF7, RankMath, PixelYourSite, and existing theme/plugin environment.

A developer can take one Lovable interactive app build and embed it in WordPress using `lovable-wp-suite`.
