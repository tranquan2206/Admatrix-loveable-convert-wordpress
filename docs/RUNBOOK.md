# Runbook

## 1. Receive Lovable Source

Accepted inputs:

- A static export containing `index.html`.
- A built `dist` folder containing `index.html`.
- A raw Lovable React/TanStack/Cloudflare codebase, only after building it with its original toolchain.

If the input is raw source, build first. Do not feed raw TypeScript directly into WordPress.

## 2. Choose One Builder

Ask the user to choose exactly one:

- Flatsome
- Elementor
- Gutenberg

Do not combine Flatsome and Elementor for landing structure. This slows the site and creates CSS conflicts.

## 3. Put Input In Place

```powershell
mkdir input\<campaign-slug>
```

Put the built/static Lovable files under that folder.

## 4. Deploy Draft Page

Flatsome default:

```powershell
npm run deploy:page -- `
  --input "input\<campaign-slug>" `
  --slug "<campaign-slug>" `
  --title "<Campaign Title>" `
  --builder flatsome
```

Elementor:

```powershell
npm run deploy:page -- `
  --input "input\<campaign-slug>" `
  --slug "<campaign-slug>" `
  --title "<Campaign Title>" `
  --builder elementor
```

Gutenberg:

```powershell
npm run deploy:page -- `
  --input "input\<campaign-slug>" `
  --slug "<campaign-slug>" `
  --title "<Campaign Title>" `
  --builder gutenberg
```

## 5. Verify

Check:

- Page status is `draft`.
- Builder template is correct.
- Hero image loads.
- Static icons show.
- Animated SVG diagrams still animate.
- No `/src/` asset requests remain.
- Elementor is not loaded when builder is Flatsome.
- Flatsome wrapper top spacing is gone.
- Mobile view after closing Pancake chat and cookie banner.

## 6. Publish

Publish only after user approval.

## 7. Known WordPress URLs

- Site: `https://admatrix.vn`
- Admin login: `https://admatrix.vn/wp-login.php`
- MCP endpoint: `https://admatrix.vn/wp-json/mcp/mcp-adapter-default-server`
- REST pages endpoint: `https://admatrix.vn/wp-json/wp/v2/pages`
- REST media endpoint: `https://admatrix.vn/wp-json/wp/v2/media`

## 8. Live Proof From The First Real Test

The first real conversion used:

- Page ID: `33961`
- Live URL: `https://admatrix.vn/ai-agent-partner-hub-test/`
- Builder: Flatsome
- Template: `page-blank.php`

Issues found and fixed:

- WordPress stripped inline SVG.
- Static icon circles became blank.
- Animated diagrams lost color and motion after over-rasterization.
- Hero URL still pointed to `/src/assets/hero-visual.jpg`.
- Flatsome wrapper added top spacing.
