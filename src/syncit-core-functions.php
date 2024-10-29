<?php
/**
 * Summary syncit-core-functions.php
 *
 * Render core functions
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

use AthenaSearch\Controller\AttributesRestApiController;
use AthenaSearch\Controller\PagesRestApiController;
use AthenaSearch\Controller\PostsCategoriesRestApiController;
use AthenaSearch\Controller\PostsRestApiController;
use AthenaSearch\Controller\ProductCategoriesRestApiController;
use AthenaSearch\Controller\ProductsRestApiController;
use AthenaSearch\Controller\UpdateSettingsRestApiController;
use AthenaSearch\Controller\UpdateStyleRestApiController;
use AthenaSearch\Controller\PdfRestApiController;

require plugin_dir_path(__FILE__) .
    'Controller/PostsCategoriesRestApiController.php';
require plugin_dir_path(__FILE__) .
    'Controller/PostsRestApiController.php';
require plugin_dir_path(__FILE__) .
    'Controller/ProductCategoriesRestApiController.php';
require plugin_dir_path(__FILE__) .
    'Controller/AttributesRestApiController.php';
require plugin_dir_path(__FILE__) .
    'Controller/ProductsRestApiController.php';
require plugin_dir_path(__FILE__) .
    'Controller/PagesRestApiController.php';
require plugin_dir_path(__FILE__) .
    'Controller/UpdateStyleRestApiController.php';
require plugin_dir_path(__FILE__) .
    'Controller/UpdateSettingsRestApiController.php';
require plugin_dir_path(__FILE__) .
    'Controller/PdfRestApiController.php';
/*
****** Athena Search *****
*Core Functions
*/
// If this file is called directly, abort. //
if (!defined('WPINC')) {
    die;
} // end if

/**
 * Syncit Front End Ajax Scripts / Loads In WP Footer
 *
 * @return void
 */
function syncit_frontend_ajax_form_scripts()
{
    ?>
    <script type="text/javascript">
        jQuery(document).ready(function ($) {
            "use strict";
            // add basic front-end ajax page scripts here
            $('#syncit_athena_search').submit(function (event) {
                event.preventDefault();
                // Vars
                var myInputFieldValue = $('#myInputField').val();
                // Ajaxify the Form
                var data = {
                    'action': 'syncit_custom_plugin_frontend_ajax',
                    'myInputFieldValue': myInputFieldValue,
                };

                // since 2.8 ajaxurl is always defined in the
                // admin header and points to admin-ajax.php
                var ajaxurl = "<?php echo admin_url('admin-ajax.php');?>";
                $.post(ajaxurl, data, function (response) {
                    console.log(response);
                    if (response.Status == true) {
                        console.log(response.message);
                        $('#syncit_athena_search_wrap').html(response);

                    } else {
                        console.log(response.message);
                        $('#syncit_athena_search_wrap').html(response);
                    }
                });
            });
        }(jQuery));
    </script>
<?php }

/**
 * Add Action for Syncit Frontend Ajax Form Scripts
 */
add_action('wp_footer', 'syncit_frontend_ajax_form_scripts');

// create syncit plugin settings menu
//===============================================

// create syncit plugin settings menu
add_action('admin_menu', 'syncit_create_menu');

/**
 * Create Menu
 *
 * @return void
 */
function syncit_create_menu()
{
    //create new top-level menu
    add_menu_page(
        'Athena Search', 'Athena Search', 'administrator', 'syncit_options_slug',
        'settings_options_page', plugin_dir_url("../") . "athena-search/public/img/athena-logo.png"
    );

    //create submenu
    add_submenu_page(
        'syncit_options_slug', 'Configuration', 'Configuration', 'administrator',
        'syncit_options_slug', 'settings_options_page', 0
    );

    //create submenu
    add_submenu_page(
        'syncit_options_slug', 'About Us', 'About Us',
        'manage_options', 'athena-search-settings', 'aboutus_options_page', 1
    );

    //initialize options for our settings
    add_action('admin_init', 'register_syncit_options');
}

/**
 * Register Syncit settings
 *
 * @return void
 */
function register_syncit_options()
{

    // register a new setting for "syncit" page
    register_setting('syncit', 'syncit_options', 'validation_callback');

    // register a new section in the "syncit" page
    add_settings_section(
        'syncit_section_developers',
        __('Please enter proper credentials in order to work.', 'syncit'), 'syncit_section_developers_cb', 'syncit'
    );

    // register a new field Athena Dashboard Url
    // in the "syncit_section_developers" section, inside the "syncit" page
    add_settings_field(
        'syncit_field_athena_dashboard_url', // as of WP 4.6 this value is used only internally
        // use $args' label_for to populate the id inside the callback
        __('Athena Dashboard Url', 'syncit'), 'syncit_field_athena_dashboard_url_cb', 'syncit', 'syncit_section_developers',
        [
            'label_for' => 'syncit_field_athena_dashboard_url',
            'class' => 'syncit_row',
            'syncit_custom_data' => 'athena-dashboard-url',
        ]
    );

    // register a new field Dashboard Website Token
    // in the "syncit_section_developers" section, inside the "syncit" page
    add_settings_field(
        'syncit_field_dash_website_token', // as of WP 4.6 this value is used only internally
        // use $args' label_for to populate the id inside the callback
        __('Dashboard website token', 'syncit'), 'syncit_field_dash_website_token_cb', 'syncit', 'syncit_section_developers',
        [
            'label_for' => 'syncit_field_dash_website_token',
            'class' => 'syncit_row',
            'syncit_custom_data' => 'dash-website-token',
        ]
    );

    // register a new field Access Token
    // in the "syncit_section_developers" section, inside the "syncit" page
    add_settings_field(
        'syncit_field_access_token', // as of WP 4.6 this value is used only internally
        // use $args' label_for to populate the id inside the callback
        __('Access Token', 'syncit'), 'syncit_field_access_token_cb', 'syncit', 'syncit_section_developers',
        [
            'label_for' => 'syncit_field_access_token',
            'class' => 'syncit_row',
            'syncit_custom_data' => 'syncit-access-token',
        ]
    );

    // register a new field Selected Layout
    // in the "syncit_section_developers" section, inside the "syncit" page
    add_settings_field(
        'syncit_field_selected_layout', // as of WP 4.6 this value is used only internally
        // use $args' label_for to populate the id inside the callback
        __('', 'syncit'), 'syncit_field_selected_layout_cb', 'syncit', 'syncit_section_developers',
        [
            'label_for' => 'syncit_field_selected_layout',
            'class' => 'syncit_row',
            'syncit_custom_data' => 'syncit-selected-layout',
        ]
    );

    // register a new field Content Div Id
    // in the "syncit_section_developers" section, inside the "syncit" page
    add_settings_field(
        'syncit_field_content_divid', // as of WP 4.6 this value is used only internally
        // use $args' label_for to populate the id inside the callback
        __('', 'syncit'), 'syncit_field_content_divid_cb', 'syncit', 'syncit_section_developers',
        [
            'label_for' => 'syncit_field_content_divid',
            'class' => 'syncit_row',
            'syncit_custom_data' => 'syncit-content-divid',
        ]
    );

    // register a new field Refinement div Id
    // in the "syncit_section_developers" section, inside the "syncit" page
    add_settings_field(
        'syncit_field_refinement_divid', // as of WP 4.6 this value is used only internally
        // use $args' label_for to populate the id inside the callback
        __('', 'syncit'), 'syncit_field_refinement_divid_cb', 'syncit', 'syncit_section_developers',
        [
            'label_for' => 'syncit_field_refinement_divid',
            'class' => 'syncit_row',
            'syncit_custom_data' => 'syncit-refinement-divid',
        ]
    );

    // register a new field Infinite Scroll
    // in the "syncit_section_developers" section, inside the "syncit" page
    add_settings_field(
        'syncit_field_infinite_scroll', // as of WP 4.6 this value is used only internally
        // use $args' label_for to populate the id inside the callback
        __('', 'syncit'), 'syncit_field_infinite_scroll_cb', 'syncit', 'syncit_section_developers',
        [
            'label_for' => 'syncit_field_infinite_scroll',
            'class' => 'syncit_row',
            'syncit_custom_data' => 'syncit-infinite-scroll',
        ]
    );

    // register a new field DOM Selector
    // in the "syncit_section_developers" section, inside the "syncit" page
    add_settings_field(
        'syncit_field_dom_selector', // as of WP 4.6 this value is used only internally
        // use $args' label_for to populate the id inside the callback
        __('', 'syncit'), 'syncit_field_dom_selector_cb', 'syncit', 'syncit_section_developers',
        [
            'label_for' => 'syncit_field_dom_selector',
            'class' => 'syncit_row',
            'syncit_custom_data' => 'syncit-dom-selector',
        ]
    );

    // register a new field Add to Cart DOM Selector
    // in the "syncit_section_developers" section, inside the "syncit" page
    add_settings_field(
        'syncit_field_addtocart_dom_selector', // as of WP 4.6 this value is used only internally
        // use $args' label_for to populate the id inside the callback
        __('', 'syncit'), 'syncit_field_addtocart_dom_selector_cb', 'syncit', 'syncit_section_developers',
        [
            'label_for' => 'syncit_field_addtocart_dom_selector',
            'class' => 'syncit_row',
            'syncit_custom_data' => 'syncit-addtocart-dom-selector',
        ]
    );

    // register a new field Grid List input
    // in the "syncit_section_developers" section, inside the "syncit" page
    add_settings_field(
        'syncit_field_grid_list', // as of WP 4.6 this value is used only internally
        // use $args' label_for to populate the id inside the callback
        __('', 'syncit'), 'syncit_field_grid_list_cb', 'syncit', 'syncit_section_developers',
        [
            'label_for' => 'syncit_field_grid_list',
            'class' => 'syncit_row',
            'syncit_custom_data' => 'syncit-grid-list',
        ]
    );

    //register settings for options homepage
    register_setting('syncit-settings-group', 'options_homepage');
}

/**
 * Render settings page content
 *
 * @return void
 */
function settings_options_page()
{

    // check user capabilities
    if (!current_user_can('manage_options')) {
        return;
    }

    // add error/update messages
    // check if the user have submitted the settings
    // wordpress will add the "settings-updated" $_GET parameter to the url
    if (isset($_GET['settings-updated'])) {
        // add settings saved message with the class of "updated"
        $athenaObj = new \AthenaSearch\AthenaSearchMain();
        $websiteToken = $athenaObj->getDashboardWebsiteToken();
        $suggestionTermsResponse = $athenaObj->getSearchSuggestionTerms($websiteToken);
        // Check if the response exists and if it contains a host
        if ($suggestionTermsResponse && isset($suggestionTermsResponse['headers']->getAll()['host'])) {
            add_settings_error('syncit_messages', 'syncit_message', $suggestionTermsResponse["response"]["code"]. " "
                .$suggestionTermsResponse["response"]["message"], 'success');
        } else {
            add_settings_error('syncit_messages', 'syncit_message', __('Connection not established', 'syncit'));
        }
        add_settings_error('syncit_messages', 'syncit_message', __('Settings Saved', 'syncit'), 'info');
    }

    // show error/update messages
    settings_errors('syncit_messages');
    ?>
    <div class="wrap">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        <form action="options.php" method="post">
            <?php
            // output security fields for the registered setting "syncit"
            settings_fields('syncit');
            // output setting sections and their fields
            // (sections are registered for "syncit", each field is registered to a specific section)
            do_settings_sections('syncit');
            // output save settings button
            submit_button('Save Settings');
            ?>
        </form>
    </div>
    <?php
}

/**
 * Developers section cb
 *
 * @param array $args Info section for developers
 *
 * @return void
 */
function syncit_section_developers_cb($args)
{
    ?>
    <!--    <p id="--><?php //echo esc_attr( $args['id'] );
    ?><!--">--><?php //esc_html_e( 'Test message.', 'syncit' );
    ?><!--</p>-->
    <?php
}

/**
 * Athena Dashboard input url cb
 *
 * @param array $args Render input dashboard url
 *
 * @return void
 */
function syncit_field_athena_dashboard_url_cb($args)
{
    // get the value of the setting we've registered with register_setting()
    $options = get_option('syncit_options');
    // output the field
    ?>
    <label for="<?php echo esc_attr($args['label_for']); ?>"></label>
    <input
            id="<?php echo esc_attr($args['label_for']); ?>"
            data-custom="<?php echo esc_attr($args['syncit_custom_data']); ?>"
            name="syncit_options[<?php echo esc_attr($args['label_for']); ?>]"
            value="<?php echo $options[$args['label_for']] ?? 0; ?>" style="width:320px"/>
    <?php
}


/**
 * Dashboard Website Token cb
 *
 * @param array $args Render Input website token
 *
 * @return void
 */
function syncit_field_dash_website_token_cb($args)
{
    // get the value of the setting we've registered with register_setting()
    $options = get_option('syncit_options');
    // output the field
    ?>
    <label for="<?php echo esc_attr($args['label_for']); ?>"></label>
    <input
            id="<?php echo esc_attr($args['label_for']); ?>"
            data-custom="<?php echo esc_attr($args['syncit_custom_data']); ?>"
            name="syncit_options[<?php echo esc_attr($args['label_for']); ?>]"
            value="<?php echo $options[$args['label_for']] ?? '' ?>" style="width:320px"/>
    <?php
}

/**
 * Access Token cb
 *
 * @param array $args Args to pass for fields
 *
 * @return void
 */
function syncit_field_access_token_cb($args)
{
    // get the value of the setting we've registered with register_setting()
    $options = get_option('syncit_options');
    // output the field
    ?>
    <label for="<?php echo esc_attr($args['label_for']); ?>"></label>
    <input
            id="<?php echo esc_attr($args['label_for']); ?>"
            data-custom="<?php echo esc_attr($args['syncit_custom_data']); ?>"
            name="syncit_options[<?php echo esc_attr($args['label_for']); ?>]"
            value="<?php echo $options[$args['label_for']] ?? '' ?>" style="width:320px"/>
    <?php
}

/**
 * Athena Grid List selector cb
 *
 * @param array $args Render input grid list seelctor
 *
 * @return void
 */
function syncit_field_grid_list_cb($args)
{
    // get the value of the setting we've registered with register_setting()
    $options = get_option('syncit_options');
    // output the field
    ?>
    <label for="<?php echo esc_attr($args['label_for']); ?>"></label>
    <input
            type="hidden"
            id="<?php echo esc_attr($args['label_for']); ?>"
            data-custom="<?php echo esc_attr($args['syncit_custom_data']); ?>"
            class="syncit-to-remove"
            name="syncit_options[<?php echo esc_attr($args['label_for']); ?>]"
            value="<?php echo $options[$args['label_for']] ?? '0'; ?>" style="width:320px"/>

    <?php
}

/**
 * Athena infinite scroll cb
 *
 * @param array $args Render infinite scroll input
 *
 * @return void
 */
function syncit_field_infinite_scroll_cb($args)
{
    // get the value of the setting we've registered with register_setting()
    $options = get_option('syncit_options');
    // output the field
    ?>
    <label for="<?php echo esc_attr($args['label_for']); ?>"></label>
    <input
            type="hidden"
            id="<?php echo esc_attr($args['label_for']); ?>"
            class="syncit-to-remove"
            data-custom="<?php echo esc_attr($args['syncit_custom_data']); ?>"
            name="syncit_options[<?php echo esc_attr($args['label_for']); ?>]"
            value="<?php echo $options[$args['label_for']] ?? '0'; ?>" style="width:320px"/>

    <?php
}

/**
 * Athena Refinement div id cb
 *
 * @param array $args Render input refinement div id
 *
 * @return void
 */
function syncit_field_refinement_divid_cb($args)
{
    // get the value of the setting we've registered with register_setting()
    $options = get_option('syncit_options');
    // output the field
    ?>
    <label for="<?php echo esc_attr($args['label_for']); ?>"></label>
    <input
            type="hidden"
            id="<?php echo esc_attr($args['label_for']); ?>"
            class="syncit-to-remove"
            data-custom="<?php echo esc_attr($args['syncit_custom_data']); ?>"
            name="syncit_options[<?php echo esc_attr($args['label_for']); ?>]"
            value="<?php echo $options[$args['label_for']] ?? '0'; ?>" style="width:320px"/>

    <?php
}

/**
 * Athena Content Div ID cb
 *
 * @param array $args Render input for Content Div ID
 *
 * @return void
 */
function syncit_field_content_divid_cb($args)
{
    // get the value of the setting we've registered with register_setting()
    $options = get_option('syncit_options');
    // output the field
    ?>
    <label for="<?php echo esc_attr($args['label_for']); ?>"></label>
    <input
            type="hidden"
            id="<?php echo esc_attr($args['label_for']); ?>"
            class="syncit-to-remove"
            data-custom="<?php echo esc_attr($args['syncit_custom_data']); ?>"
            name="syncit_options[<?php echo esc_attr($args['label_for']); ?>]"
            value="<?php echo $options[$args['label_for']] ?? '0'; ?>" style="width:320px"/>

    <?php
}

/**
 * Dashboard Selected Layout cb
 *
 * @param array $args Render Input selected layout
 *
 * @return void
 */
function syncit_field_selected_layout_cb($args)
{
    // get the value of the setting we've registered with register_setting()
    $options = get_option('syncit_options');
    // output the field
    ?>
    <label for="<?php echo esc_attr($args['label_for']); ?>"></label>
    <input
            type="hidden"
            id="<?php echo esc_attr($args['label_for']); ?>"
            class="syncit-to-remove"
            data-custom="<?php echo esc_attr($args['syncit_custom_data']); ?>"
            name="syncit_options[<?php echo esc_attr($args['label_for']); ?>]"
            value="<?php echo $options[$args['label_for']] ?? '0'; ?>" style="width:320px"/>

    <?php
}

/**
 * Dom Selector cb
 *
 * @param array $args Args to pass for dom selector
 *
 * @return void
 */
function syncit_field_dom_selector_cb($args)
{
    // get the value of the setting we've registered with register_setting()
    $options = get_option('syncit_options');
    // output the field
    ?>
    <label for="<?php echo esc_attr($args['label_for']); ?>"></label>
    <input
            type="hidden"
            id="<?php echo esc_attr($args['label_for']); ?>"
            class="syncit-to-remove"
            data-custom="<?php echo esc_attr($args['syncit_custom_data']); ?>"
            name="syncit_options[<?php echo esc_attr($args['label_for']); ?>]"
            value="<?php echo $options[$args['label_for']] ?? '0' ?>" style="width:320px"/>

    <?php
}

/**
 * Add to Cart Dom Selector cb
 *
 * @param array $args Args to pass for dom selector
 *
 * @return void
 */
function syncit_field_addtocart_dom_selector_cb($args)
{
    // get the value of the setting we've registered with register_setting()
    $options = get_option('syncit_options');
    // output the field
    ?>
    <label for="<?php echo esc_attr($args['label_for']); ?>"></label>
    <input
            type="hidden"
            id="<?php echo esc_attr($args['label_for']); ?>"
            class="syncit-to-remove"
            data-custom="<?php echo esc_attr($args['syncit_custom_data']); ?>"
            name="syncit_options[<?php echo esc_attr($args['label_for']); ?>]"
            value="<?php echo $options[$args['label_for']] ?? '0' ?>" style="width:320px"/>

    <?php
}

/**
 * Field validation when submitting
 *
 * @param $input
 * @return array
 */
function validation_callback($input): array {
    $input['syncit_field_athena_dashboard_url'] = trim($input['syncit_field_athena_dashboard_url']);
    $input['syncit_field_dash_website_token'] = trim($input['syncit_field_dash_website_token']);
    $input['syncit_field_access_token'] = trim($input['syncit_field_access_token']);
    return $input;
}

/**
 * Render about us page content
 *
 * @return void
 */
function aboutus_options_page()
{
    load_template(dirname(__FILE__) . '/views/admin/aboutus-view.php');
}

/**
 * Override default search landing
 */
add_filter('template_include', 'syncit_athena_search_template');

/**
 * Render Syncit Custom search template
 *
 * @param Template $template Template to render
 *
 * @return string
 */
function syncit_athena_search_template($template)
{
    global $wp_query;
    if (!$wp_query->is_search)
        return $template;

    $html = '';

    //if preview param is set render preview template, if not set searh template
    if (isset($wp_query->query["preview"]) && $wp_query->query["preview"] == "true") {
        $html .= dirname(__FILE__) . '/views/frontend/athena-preview-template.php';
    } else {
        $html .= dirname(__FILE__) . '/views/frontend/athena-search-template.php';
    }

    return $html;
}

/**
 * Syncit Search Form
 *
 * @param string $form Form for rendering
 *
 * @When we render Syncit Search form
 *
 * @return string
 */
function syncit_athena_search_form($form)
{
    $form = '';
    $syncitOptions = get_option("syncit_options");

    if (isset($syncitOptions) && !empty($syncitOptions)) {
        $form = '
        <style>
                #search {
                    min-width:350px;
                }
                .woocommerce-active .site-header .site-branding {
                    width: 50%;
                }
                .woocommerce-active .site-header .site-search {
                    width: 45%;
                }
                
        </style>
        <form role="search" method="get" id="searchform" class="searchform" action="' . home_url('/') . 'search/athena" >
            <div><label class="screen-reader-text" for="q">' . __('Search for:') . '</label>
                <input type="hidden" id="currentFocus" value="-1">
                <input type="hidden" id="numRes">
                <input type="search" value="' . get_search_query() . '" name="q" id="search" maxlength="128" class="search-field" autocomplete="off" placeholder=""/>
                <input type="submit" id="searchsubmit" value="' . esc_attr__('Search') . '" />
                <div id="search_autocomplete" class="athena-autocomplete athena-search-autocomplete"></div>
            </div>
        </form>';
    }
    return $form;
}

/**
 * Add filter to override default search
 */
add_filter('get_search_form', 'syncit_athena_search_form');

/**
 * Replace WooCommerce Search
 *
 * @return void|null
 */
function syncit_athena_replace_woocommerce_search()
{
    add_filter('get_product_search_form', 'syncit_athena_search_form');
}

//init action for replacing WooCommerce Search
add_action('init', 'syncit_athena_replace_woocommerce_search');

/**
 * Replace query param from s to q
 */
add_filter(
    'init',
    function () {
        global $wp;

        $wp->add_query_var('q');
        $wp->remove_query_var('s');
    }
);

/**
 * Replace query param from s to q
 */
add_filter(
    'request',
    function ($request) {
        if (isset($_REQUEST['q'])) {
            $request['s'] = sanitize_text_field($_REQUEST['q']);
        }

        return $request;
    }
);

/**
 * Init Syncit rest api controller for PRODUCT CATEGORIES
 */
add_action(
    'rest_api_init',
    function () {
        $restCategoryObj = new ProductCategoriesRestApiController();
        $restCategoryObj->register_routes();
    }
);

/**
 * Init Syncit rest api controller for POSTS
 */
add_action(
    'rest_api_init',
    function () {
        $restPostsObj = new PostsRestApiController();
        $restPostsObj->register_routes();
    }
);

/**
 * Init Syncit rest api controller for POST CATEGORIES
 */
add_action(
    'rest_api_init',
    function () {
        $restPostsObj = new PostsCategoriesRestApiController();
        $restPostsObj->register_routes();
    }
);

/**
 * Init Syncit rest api controller for ATTRIBUTES
 */
add_action(
    'rest_api_init',
    function () {
        $restPostsObj = new AttributesRestApiController();
        $restPostsObj->register_routes();
    }
);

/**
 * Init Syncit rest api controller for PRODUCTS
 */
add_action(
    'rest_api_init',
    function () {
        $restPostsObj = new ProductsRestApiController();
        $restPostsObj->register_routes();
    }
);

/**
 * Init Syncit rest api controller for PAGES
 */
add_action(
    'rest_api_init',
    function () {
        $restPostsObj = new PagesRestApiController();
        $restPostsObj->register_routes();
    }
);

/**
 * Init Syncit rest api controller for UPDATE STYLE
 */
add_action(
    'rest_api_init',
    function () {
        $restPostsObj = new UpdateStyleRestApiController();
        $restPostsObj->register_routes();
    }
);

/**
 * Init Syncit rest api controller for UPDATE SETTINGS
 */
add_action(
    'rest_api_init',
    function () {
        $restPostsObj = new UpdateSettingsRestApiController();
        $restPostsObj->register_routes();
    }
);

/**
 * Init Syncit rest api controller for UPDATE SETTINGS
 */
add_action(
    'rest_api_init',
    function () {
        $restPostsObj = new PdfRestApiController();
        $restPostsObj->register_routes();
    }
);