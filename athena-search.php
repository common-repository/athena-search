<?php
/**
 * Plugin Name:       Athena Search
 * Plugin URI:        https://athena.syncitgroup.com/
 * Description:       Powerful & Smart Athena Search by Syncit Group. Customize your search experience through our feature-rich dashboard which offers you a detailed insight into top search terms, daily and monthly overviews, product promotion rules, and much more.
 *
 * Version:           1.0.7
 * Requires at least: 4.8
 * Author:            Syncit Group
 * Author URI:        https://www.syncitgroup.com
 * License:           GPL v3
 * License URI:       https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain:       athena-search
 * Domain Path:       https://www.syncitgroup.com
 */

// If this file is called directly, abort. //
if (!defined('WPINC')) {
    die;
} // end if

// Let's Initialize Everything
if (file_exists(plugin_dir_path(__FILE__) . 'athena-init.php')) {
    include_once plugin_dir_path(__FILE__) . 'athena-init.php';
}
