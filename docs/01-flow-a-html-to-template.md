# Flow A - Lovable/HTML Static Export â†’ WordPress Child Theme Page Template

## Purpose

Convert a Lovable-generated or static HTML landing page into a native WordPress Page Template in a child theme.

## Best use cases

- B2B service landing pages
- Course landing pages
- Webinar pages
- Campaign pages
- SEO-important pages
- Static or semi-static pages with manageable interactions

## Input

```text
input/<campaign>/index.html
input/<campaign>/<assets-folder>/
```

Optional:

- Manually copied popup/modal HTML
- Screenshots of hidden modal steps
- Notes on form fields
- Desired SEO title/meta

## Output

```text
child-theme/
â”œâ”€â”€ assets/<campaign>/
â”‚   â”œâ”€â”€ styles.css
â”‚   â”œâ”€â”€ custom.js
â”‚   â”œâ”€â”€ images/
â”‚   â””â”€â”€ fonts/
â”œâ”€â”€ template-parts/<campaign>/
â”‚   â”œâ”€â”€ header.php
â”‚   â”œâ”€â”€ hero.php
â”‚   â”œâ”€â”€ problem.php
â”‚   â”œâ”€â”€ benefits.php
â”‚   â”œâ”€â”€ schedule.php
â”‚   â”œâ”€â”€ faq.php
â”‚   â”œâ”€â”€ register-popup.php
â”‚   â””â”€â”€ footer.php
â””â”€â”€ page-templates/page-<campaign>.php
```

## Required conversion steps

1. Create campaign scaffold.
2. Copy assets into `assets/<campaign>/`.
3. Split HTML into template parts.
4. Rewrite asset paths to WordPress functions.
5. Repair interactions in `custom.js`.
6. Generate CF7 form template if `form_mode=cf7`.
7. Generate CF7 email HTML.
8. Add tracking events through `dataLayer`.
9. Generate RankMath SEO recommendation.
10. QA on staging.

## Asset path rewriting example

From:

```html
<img src="images/logo.png" alt="Logo">
```

To:

```php
<img src="<?php echo esc_url(get_theme_file_uri('assets/bootcamp-hr-ai/images/logo.png')); ?>" alt="Logo">
```

## Enqueue recommendation

Prefer conditional enqueue in child theme `functions.php` instead of direct `<link>` and `<script>` tags.

```php
add_action('wp_enqueue_scripts', function () {
    if (is_page_template('page-templates/page-bootcamp-hr-ai.php')) {
        wp_enqueue_style(
            'bootcamp-hr-ai',
            get_theme_file_uri('assets/bootcamp-hr-ai/styles.css'),
            [],
            '1.0.0'
        );

        wp_enqueue_script(
            'bootcamp-hr-ai',
            get_theme_file_uri('assets/bootcamp-hr-ai/custom.js'),
            [],
            '1.0.0',
            true
        );
    }
}, 20);
```

## Dequeue conflicts

Only dequeue on the specific landing template.

```php
add_action('wp_enqueue_scripts', function () {
    if (is_page_template('page-templates/page-bootcamp-hr-ai.php')) {
        wp_dequeue_style('elementor-frontend');
        wp_dequeue_script('elementor-frontend');
        remove_action('wp_head', 'wp_custom_css_cb', 101);
        remove_action('wp_head', 'wp_custom_css_cb', 10);
    }
}, 999);
```

## CF7 mode

If `form_mode=cf7`, create:

- CF7 form markup
- CF7 HTML email template
- Hidden fields for campaign/UTM/calculation
- CSS fixes for CF7 wrappers
- JS to fill hidden fields

## Tracking mode

Always push neutral events:

```javascript
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: 'lovable_form_submit_success',
  campaign: 'bootcamp-hr-ai',
  form_type: 'cf7'
});
```

## QA checklist

- Assets load correctly.
- Popup/modal works.
- Accordion works.
- Mobile menu works.
- CF7 validation works.
- CFDB7 saves submission.
- PixelYourSite/GTM receives event.
- RankMath metadata is set.
- No layout break from Elementor/Flatsome/global CSS.
- Mobile/tablet/desktop checked.
