# Flow C - Elementor MCP Legacy Bridge

## Purpose

Use Elementor MCP/EMCP to maintain or modify existing Elementor pages and to insert Lovable shortcodes into them.

## Positioning

This is not the main Lovable integration flow. It is a legacy bridge for existing Elementor pages.

## Use cases

- Audit Elementor page structure.
- Duplicate an old Elementor page into draft.
- Add `[lovable_app name="..."]` into a specific Elementor section.
- Generate draft Elementor landing pages.
- Identify heavy or outdated Elementor widgets.

## Rules

- Use staging first.
- Do not publish automatically.
- Use a dedicated MCP user if possible.
- Do not expose broad admin power to AI agents.
- Prefer adding Lovable shortcode rather than rebuilding complex Lovable apps as Elementor widgets.

## Example AI prompt

```text
You are connected to a staging WordPress site with Elementor MCP.
Find the Elementor page named "CRM Service Landing".
Duplicate it as a draft named "CRM Service Landing - Lovable Test".
Insert the shortcode [lovable_app name="roi-calculator"] after the hero section.
Do not publish. Return the edit URL and summary of changes.
```

## When not to use

- Do not use for complex React/Lovable apps.
- Do not use as default target for all new landing pages.
- Do not use on production before staging validation.
