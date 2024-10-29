<?php
/**
 * Summary AttributesRestApiController.php
 *
 * Rest API Controller for Product Attributes
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
 * @since 1.0.0
 */

namespace AthenaSearch\Controller;

use AthenaSearch\AthenaSearchMain;
use WP_Error;
use WP_REST_Controller;
use WP_REST_Response;

if (!defined('ABSPATH')) {
    die('Invalid request.');
}

/**
 * Class AttributesRestApiController
 *
 * @category  Class
 * @package   AthenaSearch
 * @author    Zeljko Ivanovic <zeljko@syncitgroup.com>
 * @copyright 2023 Syncit Group
 * @license   http://www.gnu.org/licenses/old-licenses/gpl-3.0.html gpl-3.0
 * @link      http://athena.syncitgroup.com
 * @since     1.0.0
 */
class AttributesRestApiController extends WP_REST_Controller
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
     * Main Object Athena Main Class
     *
     * @var AthenaSearchMain
     */
    private $_athenaMainObj;

    /**
     * AttributesRestApiController constructor.
     */
    public function __construct()
    {
        $this->_athenaMainObj = new AthenaSearchMain();
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
        $path = '/(getProductAttributes)';

        register_rest_route(
            $namespace, '/' . $path, [
                array(
                    'methods' => 'GET',
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

            return true;
        } else {
            return new WP_Error('wrong_route', 'There is no defined route.', array('status' => 404));
        }
    }

    /**
     * Return items when url is hit
     *
     * @param \WP_REST_Request $request Request
     *
     * @return WP_Error|WP_REST_Response
     */
    public function get_items($request)
    {
        //initiate help and reeturn arrays
        $helpArray = $returnArray = [];

        //get attribute basic taxonomies
        $attribute_taxonomies = wc_get_attribute_taxonomies();
        $taxonomy_terms = array();
        //loop through taxonomies and format it in readable format, return terms for all taxonomies ( attribute )
        if ($attribute_taxonomies) {
            foreach ($attribute_taxonomies as $tax) {
                if (taxonomy_exists(wc_attribute_taxonomy_name($tax->attribute_name))) {
                    $terms = get_terms(wc_attribute_taxonomy_name($tax->attribute_name), 'orderby=name&hide_empty=0');
                    $taxonomy_terms[$tax->attribute_name] = $terms;
                    $optionArray = [];
                    //push terms to each taxonomy
                    foreach ($terms as $term) {
                        //get image for attribute options (variations)
                        $attachment_id = absint(get_term_meta($term->term_id, "product_attribute_image", true));
                        $image = wp_get_attachment_image_src($attachment_id, 'large');
                        $termsArray = $term->to_array();
                        //get attribute image from id
                        $termsArray["image"] = wp_get_attachment_image_src($attachment_id, 'large')[0];
                        array_push($optionArray, $termsArray);
                    }
                    //format json to our needs
                    $helpArray = [
                        "id" => $tax->attribute_id,
                        "name" => $tax->attribute_name,
                        "code" => $tax->attribute_name,
                        "options" => $optionArray
                    ];
                }
                array_push($returnArray, $helpArray);
            }
        }

        //if empty return error
        if (empty($returnArray)) {
            return new WP_Error('empty_attribute_options', 'There are no attributes or options for this route.', array('status' => 404));
        }

        //wrap it with wp_attributes
        $array = [
            "wp_attributes" => $returnArray
        ];

        return new WP_REST_Response($array, 200);
    }
}