<?php
/**
 * Summary PagesRestApiController.php
 *
 * Rest API Controller for Posts
 *
 * php version 7.1
 *
 * @category  Class
 * @package   AthenaSearch
 * @author    Zeljko Ivanovic <zeljko@syncitgroup.com>
 * @copyright 2023 Syncit Group
 * @license   http://www.gnu.org/licenses/old-licenses/gpl-3.0.html gpl-3.0
 *
 * @link  http://athena.syncitgroup.com
 * @since 1.0.0
 */

namespace AthenaSearch\Controller;

use WP_Error;
use WP_REST_Controller;
use WP_REST_Response;

if (!defined('ABSPATH')) {
    die('Invalid request.');
}

/**
 * Class UpdateSettingsRestApiController
 *
 * @category  Class
 * @package   AthenaSearch
 * @author    Zeljko Ivanovic <zeljko@syncitgroup.com>
 * @copyright 2023 Syncit Group
 * @license   http://www.gnu.org/licenses/old-licenses/gpl-3.0.html gpl-3.0
 * @link      http://athena.syncitgroup.com
 * @since     1.0.0
 */
class UpdateSettingsRestApiController extends WP_REST_Controller
{
    /**
     * Text domain
     */
    const TEXT_DOMAIN = 'athena_search';
    /**
     * Post type athena search
     */
    const POST_TYPE_ATHENA_SEARCH = 'athena_search';
    /**
     * Plugin version
     */
    const PLUGIN_VERSION = '1.0.0';
    /**
     * Plugin url
     *
     * @var string
     */
    public static $plugin_url;
    /**
     * Obj of Main Class
     *
     * @var \AthenaSearch\AthenaSearchMain
     */
    private $_athenaMainObj;

    /**
     * UpdateSettingsRestApiController constructor.
     */
    public function __construct()
    {
        $this->_athenaMainObj = new \AthenaSearch\AthenaSearchMain();
        self::$plugin_url = plugin_dir_url(dirname(__FILE__));
    }

    /**
     * Register custom route
     *
     * @return void
     */
    public function register_routes()
    {
        $namespace = 'rest/v1';
        $path = '/(setSettings)';

        register_rest_route(
            $namespace, '/' . $path, [
                array(
                    'methods' => 'POST',
                    'callback' => array($this, 'get_items'),
                    'permission_callback' => array(
                        $this,
                        'get_items_permissions_check'
                    )
                ),
            ]
        );
    }

    /**
     * Get permissions of who can access
     *
     * @param \WP_REST_Request $request Request
     *
     * @return bool|WP_Error
     */
    public function get_items_permissions_check($request)
    {
        if($this->_athenaMainObj->isWoocommerceActivated()) {
            $authentication = $this->_athenaMainObj->getKeyAuth($request);

            if (!$authentication) {
                return new WP_Error('woocommerce_rest_cannot_view', __('Sorry, you cannot list resources.', 'woocommerce'), array('status' => rest_authorization_required_code()));
            }
        }

        return true;
    }

    /**
     * Update Admin Settings in DB from Rest Api
     *
     * @param \WP_REST_Request $request Request
     *
     * @return WP_Error|WP_REST_Response
     */
    public function get_items($request)
    {
        //retrieve saved options
        $savedOptions = get_option("syncit_options");
        //get response body in postman
        $response = json_decode($request->get_body());
        //get content for every field that is sent with api
        $syncitDashboardUrl          = $response->syncit_field_athena_dashboard_url;
        $syncitWebsiteToken          = $response->syncit_field_dash_website_token;
        $syncitAccessToken           = $response->syncit_field_access_token;
        $syncitSelectedLayout        = $response->syncit_field_selected_layout;
        $syncitContentDivId          = $response->syncit_field_content_divid;
        $syncitRefinementDivId       = $response->syncit_field_refinement_divid;
        $syncitInfiniteScroll        = $response->syncit_field_infinite_scroll;
        $syncitDomSelector           = $response->syncit_field_dom_selector;
        $syncitAddToCartDomSelector  = $response->syncit_field_addtocart_dom_selector;
        $syncitGridList              = $response->syncit_field_grid_list;

        //if content and path are empty
        if($request->get_body() == '' && !is_string($request->get_body())) {
            return new WP_Error(
                'empty_content_or_not_string',
                'Please make sure that content is JSON and not empty.',
                array('status' => 404)
            );
        }

        try {
            $message = "{'main-message': 'Settings are updated successfully.',";

            //check is is not empty or is not string - then skip

            if($syncitDashboardUrl != '' && is_string($syncitDashboardUrl)) {
                $savedOptions["syncit_field_athena_dashboard_url"] = $syncitDashboardUrl;
            } else {
                $message .= "'Dashboard Url': 'Skipped: empty or not string.',";
            }
            if($syncitWebsiteToken != '' && is_string($syncitWebsiteToken)) {
                $savedOptions["syncit_field_dash_website_token"] = $syncitWebsiteToken;
            } else {
                $message .= "'Website Token': 'Skipped: empty or not string.',";
            }
            if($syncitAccessToken != '' && is_string($syncitAccessToken)) {
                $savedOptions["syncit_field_access_token"] = $syncitAccessToken;
            } else {
                $message .= "'Access Token': 'Skipped: empty or not string.',";
            }
            if($syncitSelectedLayout != '' && is_string($syncitSelectedLayout)) {
                $savedOptions["syncit_field_selected_layout"] = $syncitSelectedLayout;
            } else {
                $message .= "'Selected Layout': 'Skipped: empty or not string.',";
            }
            if($syncitContentDivId != '' && is_string($syncitContentDivId)) {
                $savedOptions["syncit_field_content_divid"] = $syncitContentDivId;
            } else {
                $message .= "'Content Div ID': 'Skipped: empty or not string.',";
            }
            if($syncitRefinementDivId != '' && is_string($syncitRefinementDivId)) {
                $savedOptions["syncit_field_refinement_divid"] = $syncitRefinementDivId;
            } else {
                $message .= "'Refinement Div ID': 'Skipped: empty or not string.',";
            }
            if($syncitInfiniteScroll != '' && is_string($syncitInfiniteScroll)) {
                $savedOptions["syncit_field_infinite_scroll"] = $syncitInfiniteScroll;
            } else {
                $message .= "'Infinite Scroll': 'Skipped: empty or not string.',";
            }
            if($syncitDomSelector != '' && is_string($syncitDomSelector)) {
                $savedOptions["syncit_field_dom_selector"] = $syncitDomSelector;
            } else {
                $message .= "'DOM Selector': 'Skipped: empty or not string.',";
            }
            if($syncitAddToCartDomSelector != '' && is_string($syncitAddToCartDomSelector)) {
                $savedOptions["syncit_field_addtocart_dom_selector"] = $syncitAddToCartDomSelector;
            } else {
                $message .= "'Add to cart DOM Selector': 'Skipped: empty or not string.',";
            }
            if($syncitGridList != '' && is_string($syncitGridList)) {
                $savedOptions["syncit_field_grid_list"] = $syncitGridList;
            } else {
                $message .= "'Grid List': 'Skipped: empty or not string.',";
            }

            //update options
            $updateOptions = update_option('syncit_options', $savedOptions);
            if($updateOptions) {
                $message .= "'update_option function returns': 'TRUE',";
            } else {
                $message .= "'update_option function returns': 'FALSE'";
            }
            $message .= "}";

//            //return wp rest response
            return new WP_REST_Response($message, 200);

        } catch (\Exception $ex) {
            //return exception
            return new WP_Error(
                'Exception',
                $ex->getMessage(),
                array('status' => 404)
            );
        }
    }
}