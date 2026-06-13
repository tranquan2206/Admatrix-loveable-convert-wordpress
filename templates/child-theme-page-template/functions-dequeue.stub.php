<?php
add_action('wp_enqueue_scripts', function () {
    if (is_page_template('page-templates/page-{{CAMPAIGN_SLUG}}.php')) {
        // Use only in clean mode. Remove or comment out in theme/builder mode.
        wp_dequeue_style('elementor-frontend');
        wp_dequeue_script('elementor-frontend');
        remove_action('wp_head', 'wp_custom_css_cb', 101);
        remove_action('wp_head', 'wp_custom_css_cb', 10);
    }
}, 999);
