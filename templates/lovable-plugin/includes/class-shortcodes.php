<?php
class Lovable_WP_Suite_Shortcodes {
    public static function init() {
        add_shortcode('lovable_app', [__CLASS__, 'render']);
    }

    public static function render($atts) {
        $atts = shortcode_atts([
            'name' => '',
        ], $atts, 'lovable_app');

        $name = sanitize_key($atts['name']);
        if (!$name) {
            return '<!-- Lovable app missing name -->';
        }

        $app_dir = LOVABLE_WP_SUITE_PATH . 'apps/' . $name . '/';
        $app_url = LOVABLE_WP_SUITE_URL . 'apps/' . $name . '/';
        $manifest_file = $app_dir . 'manifest.json';

        if (!file_exists($manifest_file)) {
            return '<!-- Lovable app manifest not found: ' . esc_html($name) . ' -->';
        }

        $manifest = json_decode(file_get_contents($manifest_file), true);
        if (!is_array($manifest)) {
            return '<!-- Lovable app manifest invalid: ' . esc_html($name) . ' -->';
        }

        $version = isset($manifest['version']) ? $manifest['version'] : '1.0.0';
        $mount_id = isset($manifest['mount_id']) ? sanitize_html_class($manifest['mount_id']) : 'lovable-root-' . $name;

        if (!empty($manifest['entry_css'])) {
            wp_enqueue_style('lovable-app-' . $name, $app_url . $manifest['entry_css'], [], $version);
        }

        if (!empty($manifest['entry_js'])) {
            wp_enqueue_script('lovable-app-' . $name, $app_url . $manifest['entry_js'], [], $version, true);
        }

        return '<div class="lovable-wp-app" data-app="' . esc_attr($name) . '"><div id="' . esc_attr($mount_id) . '"></div></div>';
    }
}
