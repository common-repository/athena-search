<?php
/**
 * Summary athena-init.php
 *
 * Description. core init of main functions
 *
 * php version 7.0
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
*This file initializes all SYNCIT Core components
*/
// If this file is called directly, abort. //
if (!defined('WPINC')) {
    die;
} // end if
// Define Our Constants
define('ASWP_SYNCIT_CORE_INC', dirname(__FILE__) . '/src/');
define('ASWP_SYNCIT_CORE_IMG', plugins_url('public/img/', __FILE__));
define('ASWP_SYNCIT_CSS', plugins_url('public/css/', __FILE__));
define('ASWP_SYNCIT_JS', plugins_url('public/js/', __FILE__));
/*
*  Register Css
*/
function aswp_syncit_register_css()
{
    wp_enqueue_script('jquery');

    wp_enqueue_style(
        'syncit-core', ASWP_SYNCIT_CSS . 'syncit-core.css', null, time(), 'all'
    );
    wp_enqueue_style(
        'autocomplete', ASWP_SYNCIT_CSS . 'autocomplete.css', null, time(), 'all'
    );
    wp_enqueue_style(
        'wp-oweride', ASWP_SYNCIT_CSS . 'src.css', null, time(), 'all'
    );
    wp_enqueue_style(
        'search-css', ASWP_SYNCIT_CSS . 'search.css', null, time(), 'all'
    );
}
add_action('wp_enqueue_scripts', 'aswp_syncit_register_css');

add_action('admin_enqueue_scripts', 'aswp_syncit_admin_css');
/**
 * Register hook for admin css
 *
 * @param $syncitHook
 */
function aswp_syncit_admin_css($syncitHook)
{
    wp_enqueue_style('boot_css', plugins_url('public/css/syncit-core.css', __FILE__));
}

/*
*  Register JS/Jquery Ready
*/
function aswp_syncit_register_core_js()
{
    include_once( ABSPATH . 'wp-admin/includes/plugin.php' );
    //create athena search main object
    $athenaObj = new \AthenaSearch\AthenaSearchMain();
    $websiteToken = $athenaObj->getDashboardWebsiteToken();
    $landingPageUrl = $athenaObj->getLandingPageUrl();
    $formUrl = $athenaObj->getFormUrl();
    $autocompleteUrl = $athenaObj->getAutocompleteUrl();
    $firstClickUrl = $athenaObj->getFirstClickUrl();
    $searchTabsUrl = $athenaObj->getSearchTabsUrl();
    $productClickUrl = $athenaObj->getProductClickApiUrl();
    $autocompleteLayout = $athenaObj->getAutocompleteLayout();
    $domSelector = $athenaObj->getDomSelector();

    /* search suggestion data - start */
    $dataToSend["token"] = $websiteToken;

    $suggestionTermsResponse = $athenaObj->getSearchSuggestionTerms($dataToSend["token"]);
    // If Response is not false
    if ($suggestionTermsResponse) {

        $suggestionData = json_decode($suggestionTermsResponse["body"]);

        $enabledDisabled = $suggestionData->enabled_disabled ?? "off";
        $placeholderText = $suggestionData->placeholder_text ?? "";
        $rotationSeconds = $suggestionData->rotation_in_seconds ?? "3";
        $keepKeyword = $suggestionData->keep_keyword ?? "1";
        $delayAtStart = $suggestionData->delay_at_start ?? "0";
        $arraySuggestions = [];
        $suggestionKeywords = $suggestionData->suggestions_keywords ?? null;
        if (!is_null($suggestionKeywords)) {
            foreach ($suggestionData->suggestions_keywords as $suggestion) {
                array_push($arraySuggestions, $suggestion->content);
            }
        }
        /* search suggestion data - end */

        //autocomplete data that we will pass
        $autocompleteData = array(
            'websiteToken' => $websiteToken,
            'landingPageUrl' => $landingPageUrl,
            'formUrl' => $formUrl,
            'autocompleteUrl' => $autocompleteUrl,
            'firstClickUrl' => $firstClickUrl,
            'searchTabsUrl' => $searchTabsUrl,
            'productClickUrl' => $productClickUrl,
            'autocompleteLayout' => $autocompleteLayout,
            'domSelector' => $domSelector,
            'enabledDisabled' => $enabledDisabled,
            'placeholderText' => $placeholderText,
            'rotationSeconds' => $rotationSeconds,
            'keepKeyword' => $keepKeyword,
            'delayAtStart' => $delayAtStart,
            'arraySuggestions' => $arraySuggestions,
            'suggestionData' => $suggestionData
        );

        //if woocommerce enabled
        if (in_array('woocommerce/woocommerce.php', apply_filters('active_plugins', get_option('active_plugins')))) {

            //if on product page
            if (is_product()) {
                //get product
                $product = wc_get_product();
                //data to be passed in product.js
                $dataToBeSent = array(
                    'addToCartDomSelector' => $athenaObj->getAddToCartDomSelector(),
                    'productId' => $product->get_id(),
                    'websiteToken' => $websiteToken,
                    'cartEventUrl' => $athenaObj->getConversionCartEventUrl()
                );
                //load product.js on single product page woocommerce
                wp_enqueue_script(
                    'product', ASWP_SYNCIT_JS . 'woo/product.js', 'jquery', time(), true
                );

                wp_localize_script('product', 'product', $dataToBeSent);
            }
            //load autocomplete.js with data to pass for woocommerce
            wp_enqueue_script(
                'autocomplete', ASWP_SYNCIT_JS . 'woo/default/autocomplete.js', 'jquery', time(), true
            );
            //localize script to pass autocomplete data
            wp_localize_script('autocomplete', 'autocomplete', $autocompleteData);
        } else {
            //load autocomplete.js with data to pass
            wp_enqueue_script(
                'autocomplete', ASWP_SYNCIT_JS . 'wp/default/autocomplete.js', 'jquery', time(), true
            );
            //localize script to pass autocomplete data
            wp_localize_script('autocomplete', 'autocomplete', $autocompleteData);
        }
    }

    // Register Core Plugin JS
    wp_enqueue_script(
        'syncit-core', ASWP_SYNCIT_JS . 'syncit-core.js', 'jquery', time(), true
    );

}
add_action('wp_enqueue_scripts', 'aswp_syncit_register_core_js');

/**
 * Include admin scripts
 */
function aswp_syncit_load_admin_scripts(){
    wp_enqueue_media();
    wp_register_script('fontawesome-admin-script','https://use.fontawesome.com/releases/v5.12.0/js/all.js', array('jquery'), time(), false);
    wp_enqueue_script('fontawesome-admin-script');
}
add_action( 'admin_enqueue_scripts', 'aswp_syncit_load_admin_scripts' );

/*
*  Includes
*/
// Load the Core Functions
if (file_exists(ASWP_SYNCIT_CORE_INC . 'syncit-core-functions.php')) {
    include_once ASWP_SYNCIT_CORE_INC . 'syncit-core-functions.php';
}

// Load the Shortcodes
if (file_exists(ASWP_SYNCIT_CORE_INC . 'syncit-shortcodes.php')) {
    include_once ASWP_SYNCIT_CORE_INC . 'syncit-shortcodes.php';
}

//require Athena Search Main
require plugin_dir_path(__FILE__).'src/AthenaSearchMain.php';

add_action('woocommerce_thankyou', 'aswp_syncit_place_order', 10, 1);

/**
 * Event on place order , we will send data to dashboard with api call
 */
function aswp_syncit_place_order( $order_id )
{
    //create athena search main object
    $athenaObj = new \AthenaSearch\AthenaSearchMain();
    $websiteToken = $athenaObj->getDashboardWebsiteToken();
    $dataToSend = $itemsData = $orderData = [];

    if (!$order_id)
        return;

    // Allow code execution only once
    if (!get_post_meta($order_id, '_thankyou_action_done', true)) {
        // Get an instance of the WC_Order object
        $order = wc_get_order($order_id);

        // Get the order number
        $order_number = $order->get_order_number();

        $dataToSend["token"] = $websiteToken;
        $dataToSend["userToken"] = $athenaObj->getAthenaCookie();

        //get order data
        $orderData["quote_id"] = $order_number;
        $orderData["increment_id"] = $order_number;
        $orderData["status"] = $order->get_status();
        $orderData["order_currency_code"] = $order->get_currency();
        $orderData["base_grand_total"] = $order->get_total();
        $orderData["subtotal_price"] = $order->get_subtotal();
        $orderData["tax_price"] = $order->get_total_tax();
        $orderData["discount_price"] = $order->get_discount_total();
        $orderData["shipping_price"] = $order->get_shipping_total();

        // Loop through order items
        foreach ($order->get_items() as $item_id => $item) {
            $singleItem = [];
            // Get the product object
            $product = $item->get_product();

            //get data from product
            $singleItem["name"] = $product->get_name();
            $singleItem["id"] = $product->get_id();
            $singleItem["sku"] = $product->get_sku();
            $singleItem["type"] = $product->get_type();
            $singleItem["qty"] = $item->get_quantity();
            $singleItem["price_incl_tax"] = $product->get_price();
            $singleItem["row_total"] = $product->get_price() * $item->get_quantity();
            $singleItem["price_with_qty_incl_tax"] = $item->get_total();
            $singleItem["price"] = $product->get_price();

            array_push($itemsData, $singleItem);
        }
        $orderData["items"] = $itemsData;
        $dataToSend["order"] = $orderData;
        // send data to api call with place order request
        $athenaObj->sendDataOnPlaceOrder($dataToSend);
        // Flag the action as done (to avoid repetitions on reload for example)
        $order->update_meta_data('_thankyou_action_done', true);
        $order->save();
    }
}
