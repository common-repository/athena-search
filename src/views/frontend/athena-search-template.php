<?php
/**
 * Summary athena-search-template.php
 *
 * File responsible for rendering search template
 *
 * @link http://athena.syncitgroup.com
 *
 * @package athena-search
 * @subpackage src/views/frontend/
 * @author Zeljko Ivanovic <zeljko@syncitgroup.com>
 * @copyright Copyright (c) 2020, Syncit Group
 * @license http://www.gnu.org/licenses/old-licenses/gpl-3.0.html
 * @since 1.0.0
 */
?>
<?php
get_header();

//initiate object
$athenaObj = new \AthenaSearch\AthenaSearchMain();
//prepare needed data that are required:
$athenaDashboardUrl = $athenaObj->getAthenaDashboardFullUrl();
$athenaWebsiteToken = $athenaObj->getDashboardWebsiteToken();
$contentDivId = $athenaObj->getContentDiv();
$sidebarDivId = $athenaObj->getSidebarId();
$swatchApiUrl = $athenaObj->getSwatchApiUrl();
$productClickApiUrl = $athenaObj->getProductClickApiUrl();
$domSelector = $athenaObj->getDomSelector();
$addToCartDomSelector = $athenaObj->getAddToCartDomSelector();
$cartEventUrl = $athenaObj->getCartEventUrl();
$infiniteScrollStatus = $athenaObj->getInfiniteScrollStatus();

if($infiniteScrollStatus == "1") {
    //prepare data for infinite scroll
    $dataInfiniteScroll = array(
        'athenaDashboardUrl' => $athenaDashboardUrl,
        'contentDivId' => $contentDivId,
        'websiteToken' => $athenaWebsiteToken
    );

    //if woocommerce enabled
    if ( in_array( 'woocommerce/woocommerce.php', apply_filters( 'active_plugins', get_option( 'active_plugins' ) ) ) ) {
        wp_enqueue_script(
            'infinite-scroll', plugins_url('js/woo/athena/index/index/infinite-scroll.js', __FILE__), 'jquery', time(), true
        );
        //pass data through php to JS
        wp_localize_script('infinite-scroll', 'infinite_scroll', $dataInfiniteScroll);
    } else {
        wp_enqueue_script(
            'infinite-scroll', plugins_url('js/wp/athena/index/index/infinite-scroll.js', __FILE__), 'jquery', time(), true
        );
        //pass data through php to JS
        wp_localize_script('infinite-scroll', 'infinite_scroll', $dataInfiniteScroll);
    }
}
//prepare data for search:
$dataSearch = array(
    'contentDivId' => $contentDivId,
    'sidebarDivId' => $sidebarDivId,
    'websiteToken' => $athenaWebsiteToken,
    'athenaDashboardUrl' => $athenaDashboardUrl,
    'swatchApiUrl' => $swatchApiUrl,
    'productClickApiUrl' => $productClickApiUrl,
    'domSelector' => $domSelector,
    'addToCartDomSelector' => $addToCartDomSelector,
    'cartEventUrl' => $cartEventUrl,
);

//if woocommerce enabled
if ( in_array( 'woocommerce/woocommerce.php', apply_filters( 'active_plugins', get_option( 'active_plugins' ) ) ) ) {
    wp_enqueue_script(
        'search', plugins_url('js/woo/athena/index/index/search.js', __FILE__), 'jquery', time(), true
    );
    //pass data through php to JS
    wp_localize_script('search', 'search_obj', $dataSearch);

    wp_enqueue_script(
        'price-range', plugins_url('js/woo/athena/index/index/ion.rangeSlider.min.js', __FILE__), 'jquery', time(), true
    );
} else {
    wp_enqueue_script(
        'search', plugins_url('js/wp/athena/index/index/search.js', __FILE__), 'jquery', time(), true
    );
    //pass data through php to JS
    wp_localize_script('search', 'search_obj', $dataSearch);
}

?>
    <div id="maincontent">
        <header class="woocommerce-products-header">
            <h1 class="woocommerce-products-header__title page-title">Search results</h1>
        </header>
        <div class="column main">
            <div id="athena-maincontent" style="display: block;">
                <div class="athena-main">

                </div>
            </div>

            <div class="sidebar sidebar-main">
                <div id="athena-sidebar" style="display: block;">

                </div>
            </div>
        </div>
    </div>
<?php
get_footer();
?>