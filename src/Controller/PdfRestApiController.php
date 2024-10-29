<?php
/**
 * Summary PdfRestApiController.php
 *
 * Rest API Controller for Pdf
 *
 * php version 7.4
 *
 * @category  AthenaSearch
 * @package   Athena-search
 * @author    Milan Cvetkovic <milan.cvetkovic@syncitgroup.com>
 * @copyright 2023 Syncit Group
 * @license   http://www.gnu.org/licenses/old-licenses/gpl-3.0.html gpl-3.0
 *
 * @link  http://athena.syncitgroup.com
 * @since 1.0.0
 */

namespace AthenaSearch\Controller;

use WP_Error;
use WP_Query;
use WP_REST_Controller;
use WP_REST_Response;

if (!defined('ABSPATH')) {
    die('Invalid request.');
}

/**
 * Class PdfRestApiController
 *
 * @category  Class
 * @package   AthenaSearch
 * @author    Milan Cvetkovic <milan.cvetkovic@syncitgroup.com>
 * @copyright 2021 Syncit Group
 * @license   http://www.gnu.org/licenses/old-licenses/gpl-3.0.html gpl-3.0
 * @link      http://athena.syncitgroup.com
 * @since     1.0.0
 */
class PdfRestApiController extends WP_REST_Controller
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
        $path = '/(getMediaPdf)';

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
        if ($this->_athenaMainObj->isWoocommerceActivated()) {
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
        $returnArray = [];

        $query_pdf_args = [
            'post_type' => 'attachment',
            'post_mime_type' => 'application/pdf',
            'post_status' => 'inherit',
            'posts_per_page' => -1
        ];
        $query_pdf = new WP_Query($query_pdf_args);

        //if empty or null return message
        if (empty($query_pdf)) {
            return new WP_Error(
                'empty_posts',
                'There are no posts for this route.',
                array('status' => 404)
            );
        } else {

            foreach ($query_pdf->posts as $singlePost) {
               
                $firstName = $lastName = '';

                // get user data id and name
                $userData = get_userdata($singlePost->post_author);

                //get author
                $userMeta = get_user_meta($userData->ID);
                if (isset($userMeta["first_name"][0]) && $userMeta["first_name"][0] ) {
                    $firstName = $userMeta["first_name"][0];
                }
                if (isset($userMeta["last_name"][0]) && $userMeta["last_name"][0] ) {
                    $lastName = $userMeta["last_name"][0];
                }
                if (!$firstName  && !$lastName ) {
                    $author = $userData->user_nicename;
                } else {
                    $author = $firstName . " " . $lastName;
                }


                $authorData = ["name" => $author,
                    "url" => get_author_posts_url($userData->ID, "")];
                //desc
                $desc = $singlePost->post_content;

                //data array to return data
                $data = [
                    "id" => $singlePost->ID,
                    "name" => $singlePost->post_name,
                    "url" => $singlePost->guid,
                    "post_date" => $singlePost->post_date,
                    "meta_description" => $desc,
                    "author" => $authorData

                ];
                array_push($returnArray, $data);
            }
        }

        //if empty or null return message
        if (empty($returnArray)) {
            return new WP_Error(
                'empty_posts',
                'There are no posts for this route !',
                array('status' => 404)
            );
        }

        //add wp_pdf wrapper
        $array = [
            "wp_pdf" => $returnArray
        ];

        //return posts array
        return new WP_REST_Response($array, 200);

    }
}