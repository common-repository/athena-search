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
 * Class PagesRestApiController
 *
 * @category  Class
 * @package   AthenaSearch
 * @author    Zeljko Ivanovic <zeljko@syncitgroup.com>
 * @copyright 2023 Syncit Group
 * @license   http://www.gnu.org/licenses/old-licenses/gpl-3.0.html gpl-3.0
 * @link      http://athena.syncitgroup.com
 * @since     1.0.0
 */
class PagesRestApiController extends WP_REST_Controller
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
     * PagesRestApiController constructor.
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
        $path = '/(getPages)';

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

        $pageNum = $request["page"] ?? 1;
        //set unlimited number of posts
        //offset is page number - 1 * 10, because offset is how many elements in array from start to skip
        $args = array(
            'sort_order' => 'asc',
            'sort_column' => 'post_title',
            'hierarchical' => 1,
            'exclude' => '',
            'include' => '',
            'meta_key' => '',
            'meta_value' => '',
            'authors' => '',
            'child_of' => 0,
            'parent' => -1,
            'exclude_tree' => '',
            'number' => 10,
            'offset' => ($pageNum-1)*10,
            'post_type' => 'page',
            'post_status' => 'publish'
        );
        $pages = get_pages($args); // get all pages based on supplied args

        if (empty($pages)) {
            return new WP_Error(
                'empty_posts',
                'There are no pages for this route',
                array('status' => 404)
            );
        } else {
            foreach ($pages as $singlePage) {
                //get user data
                $userData = get_userdata($singlePage->post_author);
                //get author
                $userMeta = get_user_meta($userData->ID);
                if(isset($userMeta["first_name"][0]) && $userMeta["first_name"][0] != '') {
                    $firstName = $userMeta["first_name"][0];
                } else {
                    $firstName = '';
                }
                if(isset($userMeta["last_name"][0]) && $userMeta["last_name"][0] != '') {
                    $lastName = $userMeta["last_name"][0];
                } else {
                    $lastName = '';
                }
                if( $firstName == '' && $lastName == '') {
                    $author = $userData->user_nicename;
                } else {
                    $author = $firstName . " " . $lastName;
                }

                //get page featured image
                $backgroundImage = ( has_post_thumbnail($singlePage->ID) ? wp_get_attachment_image_src( get_post_thumbnail_id($singlePage->ID), 'large' ) : '' );

                //help array to return data
                $helpArray = [
                    "id" => $singlePage->ID,
                    "author" => $author,
                    "post_date" => $singlePage->post_date,
                    "post_date_gmt" => $singlePage->post_date_gmt,
                    "title" => $singlePage->post_title,
                    "content" => $singlePage->post_content,
                    "post_status" => $singlePage->post_status,
                    "link" =>  site_url() . "/?page_id=" . $singlePage->ID,
                    "image" => $backgroundImage
                ];

                array_push($returnArray, $helpArray);
            }
        }

        //if empty or null return message
        if (empty($returnArray)) {
            return new WP_Error(
                'empty_posts',
                'There are no pages for this route.',
                array('status' => 404)
            );
        }

        //add wp_posts wrapper
        $array = [
            "wp_pages" => $returnArray
        ];

        return new WP_REST_Response($array, 200);
    }
}