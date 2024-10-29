<?php
/**
 * Summary ProductsRestApiController.php
 *
 * Rest API Controller for Products
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
 * Class ProductsRestApiController
 *
 * @category  Class
 * @package   AthenaSearch
 * @author    Zeljko Ivanovic <zeljko@syncitgroup.com>
 * @copyright 2023 Syncit Group
 * @license   http://www.gnu.org/licenses/old-licenses/gpl-3.0.html gpl-3.0
 * @link      http://athena.syncitgroup.com
 * @since     1.0.0
 */
class ProductsRestApiController extends WP_REST_Controller
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
     * ProductsRestApiController constructor.
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
        $path = '/(getProducts)';

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
        //initiate help arrays
        $helpArray = $returnArray = $productArray = $productVariation = [];

        $intPage = (int) $request["page"];
        if ($intPage == "" || !is_int($intPage) || $intPage == 0) {
            $requestPage = 1;
        } else {
            $requestPage = $request["page"];
        }

        // An array of all published WC_Product Objects
        $products = wc_get_products(
            [
                'limit' => 200,
                'page' => $requestPage
            ]
        );
        //loop through products
        foreach ($products as $product) {

            //set arrays initially to empty
            $attributesArray = $attrOptions = $prodVarHelpArray = $gallery = [];

            //if product is variable
            if ($product->get_type() == "variable") {
                $productVariation = $product->get_available_variations();

                foreach ($productVariation as $keyVar => $singleVariation) {
                    //get attributes taxonomies
                    foreach ($singleVariation["attributes"] as $key => $singleVarAttr) {

                        //get attribute basic taxonomies
                        $attributeTaxonomies = wc_get_attribute_taxonomies();
                        $taxonomyTerms = [];
                        //loop through taxonomies and format it in readable format,
                        // return terms for all taxonomies ( attribute )
                        if ($attributeTaxonomies) {
                            foreach ($attributeTaxonomies as $tax) {
                                if (taxonomy_exists(
                                    wc_attribute_taxonomy_name($tax->attribute_name)
                                )
                                ) {
                                    $terms = get_terms(
                                        wc_attribute_taxonomy_name(
                                            $tax->attribute_name
                                        ),
                                        'orderby=name&hide_empty=0'
                                    );
                                    $taxonomyTerms[$tax->attribute_name] = $terms;

                                    //push terms to each taxonomy
                                    foreach ($terms as $term) {
                                        $termsArray = $term->to_array();

                                        //format array taxonomy => id & slug
                                        if ($singleVarAttr == $termsArray["slug"]) {
                                            $attrOptions[$termsArray["taxonomy"]]["id"] = $termsArray["term_id"];
                                            $attrOptions[$termsArray["taxonomy"]]["slug"] = $singleVarAttr;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    //add configurable options to help array
                    $singleVariation["configurable_options"] = $attrOptions;
                    $singleVariation["product_type"] = wc_get_product($singleVariation["variation_id"])->get_type();
                    //add variations to help array
                    $prodVarHelpArray[$singleVariation["variation_id"]] = $singleVariation;
                }
            }
            //get url of images by their ids
            foreach ($product->get_gallery_image_ids() as $imageKey => $singleImageId) {
                $imageUrl = wp_get_attachment_image_url($singleImageId, 'large');
                $gallery[$singleImageId] = $imageUrl;
            }
            $childProdArray = [];
            foreach ($product->get_data() as $key => $singleData) {
                //format gallery
                if ($key == "gallery_image_ids") {
                    //leave empty for now
                } //format json for children product for GROUPED parent
                if ($key == "children") {
                    //loop through children

                    foreach ($singleData as $childrenKey => $singleChild) {
                        //get child by id
                        $childProd = wc_get_product($singleChild);
                        if(isset($childProd) && !empty($childProd)) {
                            $childProdArray[$singleChild] = $childProd->get_data();

                            //get image url
                            $imageUrl = wp_get_attachment_image_url($childProd->get_image_id(), 'large');
                            //if image is set
                            if (!is_null($imageUrl) && $imageUrl != false) {
                                $childProdArray[$singleChild]["image"] = $imageUrl;
                            } else {
                                //if image is not set, set placeholder
                                $childProdArray[$singleChild]["image"] = wc_placeholder_img_src($size = '');
                            }
                            //set product url
                            $childProdArray[$singleChild]["link"] = get_permalink($childProd->get_id());
                            //product type
                            $childProdArray[$singleChild]["product_type"] = $childProd->get_type();
                            //get type of product
                            $childType = $childProd->get_type();

                            if ($childType == "variable") {
                                $childVars2 = $childProd->get_available_variations();
                                $newArray = [];
                                foreach ($childVars2 as $cv) {
                                    $newArray[$cv["variation_id"]] = $cv;
                                }

                                $childProdArray[$singleChild]["child_products"] = $newArray;
                            }
                        }
                    }

                }
                //format attributes
                if ($key == "attributes") {
                    foreach ($singleData as $keyInner => $dataInner) {
                        $attributesArray[$keyInner] = $dataInner->get_options();
                    }
                }
                if ($key != "gallery_image_ids" && $key != "children" && $key != "attributes") {
                    $productArray[$key] = $singleData;
                }

            }
            //product type
            $productArray["product_type"] = $product->get_type();
            //children product array
            $productArray["children"] = $childProdArray;
            //set gallery image ids with urls
            $productArray["gallery_image_ids"] = $gallery;
            //set attributes in format that we want
            $productArray["attributes"] = $attributesArray;
            //set child products -> variations
            $productArray["child_products"] = $prodVarHelpArray;
            //set main image url
            $imageUrl = wp_get_attachment_image_url(
                $product->get_image_id(),
                'large'
            );
            //if image is set
            if (!is_null($imageUrl) && $imageUrl != false) {
                $productArray["image"] = $imageUrl;
            } else {
                //if image is not set, set placeholder
                $productArray["image"] = wc_placeholder_img_src($size = '');
            }
            //set product url
            $productArray["link"] = get_permalink($product->get_id());

            array_push($helpArray, $productArray);
        }

        //if empty return error
        if (empty($helpArray)) {
            return new WP_Error(
                'empty_products',
                'There are no products for this route.',
                array('status' => 404)
            );
        }

        //wrap it with wp_attributes
        $helpArray = [
            "wp_products" => $helpArray
        ];

        //return response products
        return new WP_REST_Response($helpArray, 200);
    }
}