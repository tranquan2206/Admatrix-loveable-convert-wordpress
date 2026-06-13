# MCP Roadmap

## Preferred MCP path

Use WordPress/mcp-adapter for future Abilities-based automation.
Treat Automattic/wordpress-mcp as historical/reference because the direction has moved toward mcp-adapter.

## Elementor MCP / EMCP role

Use EMCP only for Elementor legacy bridge:

- Audit old Elementor pages.
- Duplicate drafts.
- Insert Lovable shortcode.
- Create draft pages.

## Future Abilities for lovable-wp-suite

Potential abilities:

```text
lovable/list-apps
lovable/get-app-info
lovable/check-app-health
lovable/create-page-draft
lovable/attach-app-shortcode
lovable/list-pages-using-app
lovable/get-tracking-summary
lovable/get-cf7-form-map
```

## Safety

- Read-only first.
- Draft-only mutations.
- No auto-publish.
- Dedicated user/token.
- Staging first.
