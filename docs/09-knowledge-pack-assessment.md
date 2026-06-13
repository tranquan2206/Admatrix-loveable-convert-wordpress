# Knowledge Pack Assessment

Assessment date: 2026-06-12

## Verdict

The pack has a sound product direction but arrived as a knowledge scaffold, not a working MVP.
Flow A is the correct first implementation. Flow B and MCP should wait until a real static
landing conversion has passed staging QA.

## What is correct

- Keep WordPress as the publishing, SEO, form, tracking, and content system.
- Use a child-theme Page Template for static, SEO-important landing pages.
- Use a shortcode plugin later for interactive app builds.
- Reuse CF7, CFDB7, RankMath, PixelYourSite, Flatsome, and Elementor selectively.
- Load theme assets through WordPress enqueue APIs.
- Keep AI output draft-only and staging-first.
- Position WordPress MCP Adapter as a later automation layer, not the MVP core.

## Material gaps found

1. The original scripts did not convert a page. They only created empty files and rewrote one
   narrow `images/...` pattern.
2. CSS asset rewriting attempted to insert PHP into `.css`; PHP is not evaluated in static CSS.
3. The QA command was a placeholder and always reported success-like output.
4. The project had no end-to-end example or automated test.
5. The Bash-only campaign command was inconvenient for the Windows workspace.
6. Several Vietnamese files in the supplied ZIP contain mojibake. They remain reference material
   and should be repaired separately if they become operational docs.
7. Automatic section splitting was specified without a reliable parser or acceptance criteria.
8. The sample public REST lead endpoint had no authentication, anti-spam, rate limiting, or
   production delivery behavior. It was removed from the plugin scaffold and is excluded from
   the first flow.
9. Dequeuing Elementor/theme/global CSS by guessed handles is site-specific and unsafe as a
   default. It must be decided after staging inspection.
10. "Lovable code" was underspecified. Static HTML or a built `dist` can be converted; raw
    React/TypeScript source requires the original build toolchain first.

## Implemented MVP boundary

The current CLI accepts:

- A folder containing `index.html`, CSS, JavaScript, images, and fonts; or
- A direct path to an HTML file whose local assets are inside the same folder tree.

It produces:

- One WordPress Page Template.
- One body template part.
- Copied local assets.
- Conditional WordPress enqueue code.
- A RankMath draft.
- Installation instructions.
- A machine-readable conversion report and structural QA result.

It intentionally does not:

- Publish to WordPress.
- Guess CF7 forms.
- Rewrite application business logic.
- Compile raw Lovable React/TypeScript source.
- Automatically dequeue site assets.
- Claim visual equivalence without staging QA.

## Recommended next gate

Use one real Lovable static export. Compare source and WordPress staging at desktop and mobile
sizes. Only after that should the project add CF7 generation or raw Lovable build support.

## Official references checked

- WordPress Theme Handbook: Including Assets
  - https://developer.wordpress.org/themes/core-concepts/including-assets/
- WordPress Theme Handbook: Child Themes
  - https://developer.wordpress.org/themes/advanced-topics/child-themes/
- WordPress MCP Adapter
  - https://github.com/WordPress/mcp-adapter/
- Elementor CLI documentation
  - https://developers.elementor.com/docs/cli/
