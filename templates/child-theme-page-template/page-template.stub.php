<?php
/**
 * Template Name: Landing Page - {{CAMPAIGN_NAME}}
 */
defined('ABSPATH') || exit;
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php wp_head(); ?>
</head>
<body <?php body_class('{{CAMPAIGN_SLUG}}-landing'); ?>>
<?php
get_template_part('template-parts/{{CAMPAIGN_SLUG}}/header');
get_template_part('template-parts/{{CAMPAIGN_SLUG}}/hero');
get_template_part('template-parts/{{CAMPAIGN_SLUG}}/content');
get_template_part('template-parts/{{CAMPAIGN_SLUG}}/footer');
get_template_part('template-parts/{{CAMPAIGN_SLUG}}/register-popup');
wp_footer();
?>
</body>
</html>
