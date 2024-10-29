<?php
/**
 * Summary PostsRestApiController.php
 *
 * Rest API Controller for Posts
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

use WP_Error;
use WP_REST_Controller;
use WP_REST_Response;

if (!defined('ABSPATH')) {
    die('Invalid request.');
}

/**
 * Class PostsRestApiController
 *
 * @category  Class
 * @package   AthenaSearch
 * @author    Zeljko Ivanovic <zeljko@syncitgroup.com>
 * @copyright 2023 Syncit Group
 * @license   http://www.gnu.org/licenses/old-licenses/gpl-3.0.html gpl-3.0
 * @link      http://athena.syncitgroup.com
 * @since     1.0.0
 */
class PostsRestApiController extends WP_REST_Controller
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
     * PostsRestApiController constructor.
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
        $path = '/(getPosts)';

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

        //set number of posts
        $args = [
            'numberposts' => 100,
            'paged' => $request["page"]
        ];

        //get posts based on args
        $posts = get_posts($args);

        if (empty($posts)) {
            return new WP_Error(
                'empty_posts',
                'There are no posts for this route.',
                array('status' => 404)
            );
        } else {
            foreach ($posts as $singlePost) {
                $authorArray = [];
                //get Posts Categories which they are assigned to
                $postCategories = wp_get_post_categories(
                    $singlePost->ID,
                    $args = array()
                );
                //get Posts Tags which they are assigned to
                $postTags = get_the_tags($singlePost->ID);
                $categoryArray = $tagsArray = [];
                //filter posts categories by value and
                // name and add it to an returning array
                foreach ($postCategories as $cat) {
                    $catName = get_the_category_by_ID($cat);
                    $categoryArray[$cat]["name"] = $catName;
                    $categoryArray[$cat]["url"] = get_category_link($cat);
                }
                //get tags of posts to be returned
                if ($postTags != false) {
                    foreach ($postTags as $singleTag) {
                        $tagsArray[$singleTag->term_id]["name"] = $singleTag->name;
                        $tagsArray[$singleTag->term_id]["url"] = get_tag_link($singleTag);
                    }
                } else {
                    $tagsArray = [];
                }

                // get user data id and name
                $userData = get_userdata($singlePost->post_author);

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

                $authorArray[$singlePost->post_author]["nicename"] = $author;
                $authorArray[$singlePost->post_author]["url"] = get_author_posts_url($userData->ID, "");
                //get post image
                $imagePath = get_the_post_thumbnail_url($singlePost->ID);
                //desc
                $desc = $singlePost->post_content;
                //short desc
                $shortDesc = substr($desc, 0, 350);
                //help array to return data
                $helpArray = [
                    "id" => $singlePost->ID,
                    "title" => $singlePost->post_title,
                    "description" => $desc,
                    "short_description" => $shortDesc,
                    "image_path" => $imagePath,
                    "categories" => $categoryArray,
                    "tags" => $tagsArray,
                    "post_date" => $singlePost->post_date,
                    "post_modified" => $singlePost->post_modified,
                    "author" => $authorArray,
                    "post_status" => $singlePost->post_status,
                    "guid" => get_permalink($singlePost->ID),
                    "comment_count" => $singlePost->comment_count
                ];

                array_push($returnArray, $helpArray);
            }
        }

        //if empty or null return message
        if (empty($returnArray)) {
            return new WP_Error(
                'empty_posts',
                'There are no posts for this route.',
                array('status' => 404)
            );
        }

        //add wp_posts wrapper
        $array = [
            "wp_posts" => $returnArray
        ];

        //return posts array
        return new WP_REST_Response($array, 200);
    }
}