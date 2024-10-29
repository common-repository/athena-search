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
 * Class UpdateStyleRestApiController
 *
 * @category  Class
 * @package   AthenaSearch
 * @author    Zeljko Ivanovic <zeljko@syncitgroup.com>
 * @copyright 2023 Syncit Group
 * @license   http://www.gnu.org/licenses/old-licenses/gpl-3.0.html gpl-3.0
 * @link      http://athena.syncitgroup.com
 * @since     1.0.0
 */
class UpdateStyleRestApiController extends WP_REST_Controller
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
     * UpdateStyleRestApiController constructor.
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
        $path = '/(setStyle)';

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
     * Return items when url is hit
     *
     * @param \WP_REST_Request $request Request
     *
     * @return WP_Error|WP_REST_Response
     */
    public function get_items($request)
    {
        //get response body in postman
        $response = json_decode($request->get_body());
        //get path, styles.css
        $path = $response->path;
        //get css content of file
        $content = $response->content;

        //if content and path are empty
        if($content == '' || $path == '') {
            return new WP_Error(
                'empty_path_or_content',
                'Please make sure that content and path are not empty.',
                array('status' => 404)
            );
        }

        //if path, filename doesn't have valid extension , example css
        if(!strpos($path, ".css")) {
            return new WP_Error(
                'wrong_path',
                'Wrong path of file. Example: styles.css',
                array('status' => 404)
            );
        }

        //get file path
        $file = WP_CONTENT_DIR . "/plugins/athena-search/public/css/" . $path;

        try {
            //if file exists open and write in there, if not create it then write to file
            if (!file_exists($file)) {
                $open = fopen($file, "w");
                $write = fputs($open, $content);
                fclose($open);
            } else {
                $open = fopen($file, "w");
                $write = fputs($open, $content);
                fclose($open);
            }

            //return wp rest response
            return new WP_REST_Response("File is updated successfuly. " . $file, 200);

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