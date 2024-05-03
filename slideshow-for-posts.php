<?php

/**
 * Plugin Name:       Slideshow For Posts
 * Description:       A WordPress plugin to provide users with a custom Gutenberg block that fetches the latest data using WP REST API from a WordPress site.
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            Baber Parweez
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       slideshow-for-posts
 *
 * @package           create-block
 */

if (!defined('ABSPATH')) {
	exit; // Exit if accessed directly.
}

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function slideshow_for_posts_slideshow_for_posts_block_init()
{
	register_block_type(__DIR__ . '/build');
}
add_action('init', 'slideshow_for_posts_slideshow_for_posts_block_init');
