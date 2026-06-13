<?php
/**
 * Plugin Name: Lovable WP Suite
 * Description: Embeds Lovable app builds into WordPress via shortcode and optional REST endpoints.
 * Version: 0.1.0
 */

defined('ABSPATH') || exit;

define('LOVABLE_WP_SUITE_PATH', plugin_dir_path(__FILE__));
define('LOVABLE_WP_SUITE_URL', plugin_dir_url(__FILE__));

require_once LOVABLE_WP_SUITE_PATH . 'includes/class-shortcodes.php';

add_action('plugins_loaded', function () {
    Lovable_WP_Suite_Shortcodes::init();
});
