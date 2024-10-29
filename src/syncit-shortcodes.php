<?php
/**
 * Summary syncit-shortcodes.php
 *
 * Render shortcodes if they are needed
 *
 * php version 7.1
 *
 * @category  AthenaSearch
 * @package   Athena-search
 * @author    Zeljko Ivanovic <zeljko@syncitgroup.com>
 * @copyright 2023 Syncit Group
 * @license   http://www.gnu.org/licenses/old-licenses/gpl-3.0.html gpl-3.0
 *
 * @link  http://athena.syncitgroup.com
 * @since 1.0.7
 */

/*
****** Athena Search *****
*Shortcodes
*/
// If this file is called directly, abort. //
if (!defined('WPINC')) {
    die;
} // end if

/**
 * Display Anywhere Shortcode: [syncit_athena_search]
 *
 * @param array $atts    Attributes
 * @param null  $content Content
 *
 * @return string
 */
function syncit_athena_search_display($atts, $content = null)
{
    extract(
        shortcode_atts(
            array(
                'el_class' => '',
                'el_id' => '',
            ), $atts
        )
    );

    $out = '';
    $out .= '<div id="syncit_athena_search_wrap" class="syncit-form-wrap">';
    $out .= '<strong>Athena Search Shortcode Test!</strong>';
    // Form Ends
    $out .= '</div><!-- syncit_athena_search_wrap -->';
    return $out;
}

/**
 * Add action for shortcode
 */
add_action('init', 'syncit_register_shortcodes');

/**
 * Register All Shorcodes At Once
 *
 * @return void
 */
function syncit_register_shortcodes()
{
    // Registered Shortcodes
    add_shortcode('syncit_athena_search', 'syncit_athena_search_display');
}

;
