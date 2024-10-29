/*-----------------------------
* Build Your Plugin JS / jQuery
-----------------------------*/
/*
*  Athena Search JS on PRODUCT
*
Jquery Ready!
*/
jQuery(document).ready(function (jqAthena) {
    "use strict";

    jqAthena(document).ready(function () {
        /*Dom Selector of Add to Cart button*/
        var addToCartDomSelector = product.addToCartDomSelector;
        var productId = product.productId;
        var websiteToken = product.websiteToken;
        var cartEventUrl = product.cartEventUrl;

        /*
            Get Cookie by key
         */
        function getCookie(key) {
            var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
            return keyValue ? keyValue[2] : null;
        }

        /*
            Get User Token
        */
        function userToken() {
            var token = getCookie("_athena");

            if (!token) {
                token = 'anonymous-'+Math.random().toString(36).substr(2, 9)+'-'+Math.random().toString(26).substr(2, 9);
                Cookies.set("_athena", token, { path: '/' });
            }

            return token;
        }

        /*
            Add selector on button "Add to Cart"
         */
        var searchHistory = localStorage.getItem('athenaSearchHistory');
        if (searchHistory) {
            searchHistory = JSON.parse(searchHistory);
            if (searchHistory[productId] && searchHistory[productId]['token'] === websiteToken) {
                jqAthena(addToCartDomSelector).attr("data-element-id", productId);
            }
        }

        /*
            Catch event add to cart
         */
        jqAthena(addToCartDomSelector).on('click', function (e) {
            var date = Date.now();
            var currentTarget = e.currentTarget;
            if (typeof currentTarget.dataset.elementId != 'undefined') {
                var history = localStorage.getItem('athenaSearchHistory');

                if (history) {
                    history = JSON.parse(history);
                    if (history[productId] && history[productId]['token'] === websiteToken && history[productId]['expiration'] > date) {
                        jqAthena.ajax({
                            type: 'POST',
                            data: {
                                'token': websiteToken,
                                'userToken': userToken(),
                                'oId': productId
                            },
                            url: cartEventUrl,
                            dataType: "json"
                        });
                    }
                }
            }
        });
    });
});