<?php
add_action('wp_enqueue_scripts', function () {
    if (is_page_template('page-templates/page-{{CAMPAIGN_SLUG}}.php')) {
        wp_enqueue_style(
            '{{CAMPAIGN_SLUG}}-landing',
            get_theme_file_uri('assets/{{CAMPAIGN_SLUG}}/styles.css'),
            [],
            '{{VERSION}}'
        );

        wp_enqueue_script(
            '{{CAMPAIGN_SLUG}}-landing',
            get_theme_file_uri('assets/{{CAMPAIGN_SLUG}}/custom.js'),
            [],
            '{{VERSION}}',
            true
        );
    }
}, 20);
