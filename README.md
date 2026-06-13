# Admatrix Lovable Convert WordPress

Internal Admatrix workflow for converting Lovable exports into WordPress landing pages.

The repository exists so Admatrix team members can clone one shared workflow, run the converter locally, and create WordPress draft pages without copying instructions from chat.

The project supports three builder lanes:

- `flatsome`: use WordPress Page + Flatsome `page-blank.php`.
- `elementor`: use Elementor Canvas only when the user chooses Elementor.
- `gutenberg`: use default WordPress page/block flow for simple pages.

Do not mix Flatsome and Elementor on the same landing page.

## Current Default

For `admatrix.vn`, the safest default is:

```powershell
npm run deploy:page -- `
  --input "input/<campaign>" `
  --slug "<campaign-slug>" `
  --title "<Campaign Title>" `
  --builder flatsome
```

This creates a WordPress draft page, uploads media, inlines CSS, preserves animated diagrams, and assigns the Flatsome blank page template.

## GitHub Flow

1. Put each Lovable export or built `dist` into `input/<campaign>` locally.
2. Choose exactly one builder lane: Flatsome, Elementor, or Gutenberg.
3. Run the converter/deployer to create a WordPress draft page.
4. Review staging output and QA checklist.
5. Commit improvements to this repo only after they are reusable for future campaigns.

The small files under `wordpress-plugin/lovable-wp-suite/apps/example-app/` are only placeholders proving the shortcode plugin structure. They are not a campaign output and should be replaced by real app builds when Flow B is used.

## Install

```powershell
npm install
npm test
```

Node.js 20+ is required.

## Required WordPress Credential

Use a WordPress Application Password. Do not commit it.

Default local path used by the CLI:

```text
F:\Agent_Home\00_Raw_Assets\credentials\wordpress-admatrix-mcp.json
```

Expected shape:

```json
{
  "api_url": "https://admatrix.vn/wp-json",
  "username": "admin",
  "application_password": "xxxx xxxx xxxx xxxx xxxx xxxx"
}
```

## Main Docs

- [Runbook](docs/RUNBOOK.md)
- [Pitfalls](docs/PITFALLS.md)
- [GitHub Setup](docs/GITHUB_SETUP.md)
- [Direct Page Deployment](docs/10-direct-page-deployment.md)
- [QA Checklist](docs/05-qa-checklist.md)

## Codex Skills

Builder-specific agent instructions live in:

```text
skills/flatsome/SKILL.md
skills/elementor/SKILL.md
skills/gutenberg/SKILL.md
```

The rule is simple: ask the user to choose one builder first, then use only that skill.

## Safety Rules

- Create drafts by default. Publish only after explicit approval.
- Never commit WordPress credentials, GitHub tokens, `.env`, `input/`, `output/`, or `node_modules/`.
- Do not use MCP `wsp/update-page` for full landing content unless style preservation has been tested on a throwaway draft.
- For complex animated SVG charts, preserve as self-contained SVG data images. For static icons, rasterize to WebP.
- For Flatsome, remove theme wrapper spacing with page-scoped CSS.