<?php
/**
 * Summary AthenaSearchMain.php
 *
 * Description. Main class for Athena SEarch plugin
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

namespace AthenaSearch;

use WP_Error;

if (!defined('ABSPATH')) {
    die('Invalid request.');
}

/**
 * Class AthenaSearchMain
 *
 * @category  Class
 * @package   Athena-search
 * @author    Zeljko Ivanovic <zeljko@syncitgroup.com>
 * @copyright 2023 Syncit Group
 * @license   http://www.gnu.org/licenses/old-licenses/gpl-3.0.html gpl-3.0
 * @link      http://athena.syncitgroup.com
 * @since     1.0.0
 */
class AthenaSearchMain
{
    const TEXT_DOMAIN = 'athena_search';
    const POST_TYPE_ATHENA_SEARCH = 'athena_search';
    const PLUGIN_VERSION = '1.0.0';
    public static  $plugin_url;
    public $athenasearch;

    /**
     * AthenaSearchMain constructor.
     */
    public function __construct()
    {
        self::$plugin_url = plugin_dir_url(dirname(__FILE__));

        add_action('wp_enqueue_scripts', array($this, 'enqueueScriptsStyles'));
    }

    /**
     * Get athena dashboard url from settings
     *
     * @return string|null
     */
    public function getAthenaDashboardUrl(
    ) {
        $syncitOptions = get_option("syncit_options");
        if (isset($syncitOptions) && !empty($syncitOptions)) {
            return $syncitOptions["syncit_field_athena_dashboard_url"];
        } else {
            return null;
        }
    }

    /**
     * Get dashboard website token from settings
     *
     * @return string|null
     */
    public function getDashboardWebsiteToken(
    ) {
        $syncitOptions = get_option("syncit_options");
        if (isset($syncitOptions) && !empty($syncitOptions)) {
            return $syncitOptions["syncit_field_dash_website_token"];
        } else {
            return null;
        }
    }

    /**
     * Get content div from settings
     *
     * @return string|null
     */
    public function getContentDiv(
    ) {
        $syncitOptions = get_option("syncit_options");
        if (isset($syncitOptions) && !empty($syncitOptions)) {
            return $syncitOptions["syncit_field_content_divid"];
        } else {
            return null;
        }
    }

    /**
     * Get sidebar id from settings
     *
     * @return string|null
     */
    public function getSidebarId(
    ) {
        $syncitOptions = get_option("syncit_options");
        if (isset($syncitOptions) && !empty($syncitOptions)) {
            return $syncitOptions["syncit_field_refinement_divid"];
        } else {
            return null;
        }
    }

    /**
     * Get dom selector from settings
     *
     * @return string|null
     */
    public function getDomSelector(
    ) {
        $syncitOptions = get_option("syncit_options");
        if (isset($syncitOptions) && !empty($syncitOptions)) {
            return $syncitOptions["syncit_field_dom_selector"];
        } else {
            return null;
        }
    }

    /**
     * Get dom selector from settings
     *
     * @return string|null
     */
    public function getAddToCartDomSelector(
    ) {
        $syncitOptions = get_option("syncit_options");
        if (isset($syncitOptions) && !empty($syncitOptions)) {
            return $syncitOptions["syncit_field_addtocart_dom_selector"];
        } else {
            return null;
        }
    }

    /**
     * Get Access Token
     *
     * @return string|null
     */
    public function getAccessToken(
    ) {
        $syncitOptions = get_option("syncit_options");
        if (isset($syncitOptions) && !empty($syncitOptions)) {
            return $syncitOptions["syncit_field_access_token"];
        } else {
            return null;
        }
    }


    /**
     * Get Infinite Scroll Status
     *
     * @return string|null
     */
    public function getInfiniteScrollStatus(
    ) {
        $syncitOptions = get_option("syncit_options");
        if (isset($syncitOptions) && !empty($syncitOptions)) {
            return $syncitOptions["syncit_field_infinite_scroll"];
        } else {
            return null;
        }
    }

    /**
     * Get Conversion Cart Event Url
     *
     * @return string|null
     */
    public function getConversionCartEventUrl(
    ) {
        $syncitOptions = get_option("syncit_options");
        if (isset($syncitOptions) && !empty($syncitOptions)) {
            return $syncitOptions["syncit_field_athena_dashboard_url"] . "api/v1/conversion/cart";
        } else {
            return null;
        }
    }

    /**
     * Get Full dashboard url
     *
     * @return string|null
     */
    public function getAthenaDashboardFullUrl(
    ) {
        $syncitOptions = get_option("syncit_options");
        if (isset($syncitOptions) && !empty($syncitOptions)) {
            return $syncitOptions["syncit_field_athena_dashboard_url"] . "api/v1/search";
        } else {
            return null;
        }
    }

    /**
     * Get dashboard url for order place request
     *
     * @return string|null
     */
    public function getDashboardUrlPlaceOrderRequest(
    ) {
        $syncitOptions = get_option("syncit_options");
        if (isset($syncitOptions) && !empty($syncitOptions)) {
            return $syncitOptions["syncit_field_athena_dashboard_url"] . "api/v1/conversion/order";
        } else {
            return null;
        }
    }

    /**
     * Get swatch api url
     *
     * @return string|null
     */
    public function getSwatchApiUrl(
    ) {
        $syncitOptions = get_option("syncit_options");
        if (isset($syncitOptions) && !empty($syncitOptions)) {
            return $syncitOptions["syncit_field_athena_dashboard_url"] . "api/v1/swatches";
        } else {
            return null;
        }
    }

    /**
     * Get product click api url
     *
     * @return string|null
     */
    public function getProductClickApiUrl(
    ) {
        $syncitOptions = get_option("syncit_options");
        if (isset($syncitOptions) && !empty($syncitOptions)) {
            return $syncitOptions["syncit_field_athena_dashboard_url"] . "api/v1/product-click";
        } else {
            return null;
        }
    }

    /**
     * Get autocomplete layout
     *
     * @return string|null
     */
    public function getAutocompleteLayout(
    ) {
        $syncitOptions = get_option("syncit_options");
        $gridlist = $syncitOptions["syncit_field_grid_list"];

        if($gridlist == "1") {
            return "athena-list";
        } else {
            return "athena-grid";
        }
    }

    /**
     * Get product click api url
     *
     * @return string|null
     */
    public function getCartEventUrl(
    ) {
        $syncitOptions = get_option("syncit_options");
        if (isset($syncitOptions) && !empty($syncitOptions)) {
            return $syncitOptions["syncit_field_athena_dashboard_url"] . "api/v1/conversion/cart";
        } else {
            return null;
        }
    }

    /**
     * Get autocomplete url
     *
     * @return string|null
     */
    public function getAutocompleteUrl(
    ) {
        $syncitOptions = get_option("syncit_options");
        if (isset($syncitOptions) && !empty($syncitOptions)) {
            return $syncitOptions["syncit_field_athena_dashboard_url"] . "api/v1/autocomplete";
        } else {
            return null;
        }
    }

    /**
     * Get first click url
     *
     * @return string|null
     */
    public function getFirstClickUrl(
    ) {
        $syncitOptions = get_option("syncit_options");
        if (isset($syncitOptions) && !empty($syncitOptions)) {
            return $syncitOptions["syncit_field_athena_dashboard_url"] . "api/v1/autocomplete/first-click";
        } else {
            return null;
        }
    }


    /**
     * Get search tabs url
     *
     * @return string|null
     */
    public function getSearchTabsUrl()
    {
        $syncitOptions = get_option("syncit_options");
        if (isset($syncitOptions) && !empty($syncitOptions)) {
            return $syncitOptions["syncit_field_athena_dashboard_url"] . "api/v1/search-tabs";
        } else {
            return null;
        }
    }

    /**
     * Get landing page url
     *
     * @return string|null
     */
    public function getLandingPageUrl(
    ) {
        return get_site_url() . "/search/athena?q=";
    }

    /**
     * Get form url
     *
     * @return string|null
     */
    public function getFormUrl(
    ) {
        return get_site_url() . "search/athena";
    }

    /**
     * Get Authorization keys that are sent with ouath 2.0 or in param
     *
     * @param \WP_REST_Request $request Request
     *
     * @return bool
     */
    public function getKeyAuth($request) {
        //global wpdb
        global $wpdb;
        //control var
        $controlVar = false;
        //get table name
        $table_name = $wpdb->prefix . 'woocommerce_api_keys';
        //hash key from request
        if(is_null($request["oauth_consumer_key"])) {
            // get authorization parameter
            $authorizationParam = $this->getParamAuth($request);
            //explode to remove Word before key
            $key = explode(" " , $authorizationParam);
            $key = end($key);
            //hash key
            $key = wc_api_hash($key);
        } else {
            $key = wc_api_hash($request["oauth_consumer_key"]);
        }
        //get table where rest keys are stored
        $results = $wpdb->get_results( "SELECT * FROM ".$table_name);

        //loop through results
        foreach($results as $result) {
            //check for consumer key in database amd check permissions, if it is read return true
            if($result->consumer_key == $key && ($result->permissions == "read" || $result->permissions == "read_write")){
                $controlVar = true;
                break;
            } else {
                $controlVar = false;
            }
        }

        //return var
        return $controlVar;
    }

    /**
     * Get Authorization Parameter
     *
     * @param \WP_REST_Request $request Request
     * @return string
     */
    public function getParamAuth(\WP_REST_Request $request): string {
        // check that the request headers contain an authorization
        if(isset($request->get_headers()["authorization"])) {
            $authorizationParam = $request->get_headers()["authorization"][0];
        } elseif (function_exists('apache_request_headers')) {
            $authorizationParam = apache_request_headers()["Authorization"] ?? "";
        } else {
            $authorizationParam = $this->nginx_request_headers()["Authorization"] ?? "";
        }
        return $authorizationParam;
    }

    /**
     * Create nginx request headers
     *
     * @return array
     */
    public function nginx_request_headers(): array {
        $headers = [];
        foreach ($_SERVER as $name => $value)
        {
            if (substr($name, 0, 5) == 'HTTP_')
            {
                $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
            }
        }
        return $headers;
    }

    /**
     * Check if WooCommerce is activated
     */
    function isWoocommerceActivated() {
        include_once( ABSPATH . 'wp-admin/includes/plugin.php' );
        if ( in_array( 'woocommerce/woocommerce.php', apply_filters( 'active_plugins', get_option( 'active_plugins' ) ) ) ) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Get Athena Cookie
     */
    function getAthenaCookie() {
        if(isset($_COOKIE["_athena"])) {
            $cookieValue = $_COOKIE["_athena"];
        } else {
            $cookieValue = null;
        }
        return $cookieValue;
    }

    /**
     * Get Athena Dashboard Search Suggestions Url
     *
     * @return string|null
     */
    public function getAthenaDashboardSearchSuggestionsUrl() {
        $syncitOptions = get_option("syncit_options");
        if (isset($syncitOptions) && !empty($syncitOptions)) {
            return $syncitOptions["syncit_field_athena_dashboard_url"] . "api/v1/search-suggestions";
        } else {
            return null;
        }
    }

    /**
     * Send Data on Place Order to the Dashboard which is set from admin or with API
     *
     * @param $body
     * @return array|bool|WP_Error
     */
    function sendDataOnPlaceOrder($body) {
        //get dashboard url
        $endpoint = $this->getDashboardUrlPlaceOrderRequest();

        $body = wp_json_encode($body);
        //set body data to array
        $options = [
            'body'        => $body,
            'headers'     => [
                'Content-Type' => 'application/json',
                'Origin' => get_site_url(),
            ],
            'timeout'     => 600,
            'redirection' => 5,
            'blocking'    => true,
            'httpversion' => '1.0',
            'sslverify'   => false,
            'data_format' => 'body',
        ];

        //make a call with wp remote post
        $request = wp_remote_post( $endpoint, $options );
        //return response of request
        if(is_wp_error($request)) {
            return false;
        }
        //return response of request
        return $request;
    }

    /**
     * Send Data in order to retrieve Search Suggestions from the dashboard
     *
     * @param $websiteToken
     * @return array|bool|WP_Error
     */
    function getSearchSuggestionTerms($websiteToken) {
        //get dashboard url
        $endpoint = $this->getAthenaDashboardSearchSuggestionsUrl();

        $body = [
            'token' => $websiteToken
        ];

        $body = wp_json_encode($body);
        //set body data to array
        $options = [
            'body'        => $body,
            'headers'     => [
                'Content-Type' => 'application/json',
                'Origin' => get_site_url(),
            ],
            'timeout'     => 600,
            'redirection' => 5,
            'blocking'    => true,
            'httpversion' => '1.0',
            'sslverify'   => false,
            'data_format' => 'body',
        ];

        //make a call with wp remote post
        $request = wp_remote_post( $endpoint, $options );
        //return response of request
        if(is_wp_error($request)) {
            return false;
        }
        return $request;
    }
}