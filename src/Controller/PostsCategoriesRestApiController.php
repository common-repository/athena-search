<?php
/**
 * Summary PostsCategoriesRestApiController.php
 *
 * Rest API Controller for Posts Categories
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
 * Class PostsCategoriesRestApiController
 *
 * @category  Class
 * @package   AthenaSearch
 * @author    Zeljko Ivanovic <zeljko@syncitgroup.com>
 * @copyright 2023 Syncit Group
 * @license   http://www.gnu.org/licenses/old-licenses/gpl-3.0.html gpl-3.0
 * @link      http://athena.syncitgroup.com
 * @since     1.0.0
 */
class PostsCategoriesRestApiController extends WP_REST_Controller
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
     * Object of Athena Main Class
     *
     * @var AthenaSearchMain
     */
    private $_athenaMainObj;

    /**
     * PostsCategoriesRestApiController constructor.
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
        $path = '/(getPostsCategories)';

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
        }

        return true;
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

        // since wordpress 4.5.0
        //taxonomy is category, set unlimited number of posts
        $productCategories = get_categories();

        if (empty($productCategories)) {
            return new WP_Error(
                'empty_post_categories',
                'There are no post categories for this route.',
                array('status' => 404)
            );
        }

        //loop through categories
        foreach ($productCategories as $singleCategory) {
            //get term of category id
            $term_id = get_term_by(
                'slug',
                $singleCategory->slug,
                $singleCategory->taxonomy
            )->term_id;

            //get thumbnail id
            $thumbnailId = get_term_meta($term_id, 'thumbnail_id', true);
            //get image by thumbnail id
            $image = wp_get_attachment_url($thumbnailId);
            if ($image == false) {
                $image = null;
            }

            //get parent name by id
            $parentName = get_the_category_by_ID($singleCategory->parent);
            if (isset($parentName->errors)) {
                $parentName = '';
            } else {
                $parentName = get_the_category_by_ID($singleCategory->parent);
            }

            $categoryPath = "";
            //get category url
            $categoryUrl = get_category_link($singleCategory->term_id);
            $siteUrl = site_url() . "/category/";
            //replace site url with empty
            $replacedString = str_replace($siteUrl, "", $categoryUrl);
            //explode by /
            $categoryPathExploded = explode("/", $replacedString);
            //append >
            foreach ($categoryPathExploded as $singlePath) {
                if ($singlePath != "") {
                    $singlePath = str_replace("-", " ", $singlePath);
                    $categoryPath .= ucfirst($singlePath) . " > ";
                }
            }
            //remove last >
            $categoryPath = rtrim($categoryPath, " >");
            //form array of category
            $helpArray = [
                "id" => $singleCategory->term_id,
                "parent_id" => $singleCategory->parent,
                "parent_name" => $parentName,
                "level" => count($categoryPathExploded) - 2,
                "name" => $singleCategory->name,
                "image" => $image,
                "url" => get_category_link($singleCategory->term_id),
                "path" => $categoryPath,
                "category_size" => $singleCategory->count
            ];

            array_push($returnArray, $helpArray);
        }

        //if empty return error
        if (empty($returnArray)) {
            return new WP_Error(
                'empty_post_categories',
                'There are no post categories for this route.',
                array('status' => 404)
            );
        }

        //add wp_post_categories wrapper
        $array = [
            "wp_post_categories" => $returnArray
        ];

        return new WP_REST_Response($array, 200);
    }
}