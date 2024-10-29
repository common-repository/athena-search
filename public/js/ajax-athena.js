/*-----------------------------
* Build Your Plugin JS / jQuery
-----------------------------*/
/*
*  Athena Search JS
*
Jquery Ready!
*/
jQuery(document).ready(function ($) {
    "use strict";

    var mainContent = $("#maincontent");
    var athenaContent = $("#athena-maincontent");
    var athenaSidebar = $("#athena-sidebar");
    var url = '';

    /*
        Get Cookie by key
     */
    function getCookie(key) {
        var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
        return keyValue ? keyValue[2] : null;
    }

    /*
        Get All Params from Url
     */
    function getUrlVars(url) {
        var hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            url = url + hash[0] + '=' + hash[1] + '&';
        }

        return url.slice(0, -1);
    }

    /*
        Function for price range(remove price param from url)
     */
    function removePriceUrl(url) {
        var hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            if (hash[0] != 'price') {
                url = url + hash[0] + '=' + hash[1] + '&';
            }
        }

        return url.slice(0, -1);
    }

    /*
        Event click on filters
     */
    mainContent.on('click', '.filter a, .toolbar a', function (event) {
        $(".loading-mask").show();
        $("html, body").animate({scrollTop: 0}, 500);

        if (event.currentTarget.href) {
            url = event.currentTarget.href;
        } else if (event.target.href) {
            url = event.target.href;
        }

        getData();
        event.preventDefault();
    });

    /*
        Event change on toolbar
     */
    mainContent.on('change', 'select', function (event) {
        $(".loading-mask").show();
        $("html, body").animate({scrollTop: 0}, 500);

        if (event.currentTarget.value) {
            url = event.currentTarget.value;
        } else if (event.target.value) {
            url = event.target.value;
        }

        getData();
        event.preventDefault();
    });

    /*
        Event slide for price range
     */
    mainContent.on('slide', '#slider-range', function (event, ui) {
        var min = ui.values[0];
        var max = ui.values[1];
        $("#min_price").val(min);
        $("#max_price").val(max);
        $("#show-price-range").html("Min: $" + min.toFixed(2) + "- Max: $" + max.toFixed(2));
    });

    /*
         Event slide stop for price range
     */
    mainContent.on('slidestop', '#slider-range', function (event, ui) {
        $(".loading-mask").show();
        var min = ui.values[0];
        var max = ui.values[1];
        url = location.origin + location.pathname + "?";
        url = removePriceUrl(url);
        url = url + '&price=' + min + '-' + max;

        getData();
    });

    /*
        Ajax call for new content from Athena Dashboard
     */
    function getData() {
        var dash_website_token = $("#dash_website_token").val();
        var dash_website_url = $("#website_search_url").val();
        window.history.pushState("", "", url);

        var dash_url = dash_website_url + '?';
        dash_url = getUrlVars(dash_url);

        $.ajax({
            type: 'POST',
            cache: false,
            data: {
                'token': dash_website_token,
                'user_agent': navigator.userAgent,
                'customer': getCookie('customer_email_cookie')
            },
            url: dash_url,
            dataType: "json",
            success: function (data) {
                athenaContent.html(data.data.content);
                athenaSidebar.html(data.data.sidebar);
                athenaContent.show();
                athenaSidebar.show();
                preselect();
                $("body").removeClass('filter-active');
                $(".filter").removeClass('active');
                $(".loading-mask").hide();
            }
        });
    }

    /*
        Preselect products swatch
     */
    function preselect() {
        var products = $(".athena-swatch");
        var loader_image = $(".loader").find('img').attr('src');

        if (products.length) {
            products.each(function (index, element) {
                var product_id = element.getAttribute('product-id');

                var options = $(".swatch-opt-" + product_id).find('.swatch-attribute');
                var opt = [];
                var x = 1;
                options.each(function (index, element) {
                    var option = element.getAttribute('attribute-option');
                    if (option) {
                        opt.push(option);
                    } else {
                        x = 0;
                    }
                });

                var url = $("#swatches_image_dashboard_url").val();
                var dash_website_token = $("#dash_website_token").val();

                if (opt.length) {
                    var inicial_img = $(".athena-product-image-" + product_id).attr('src');
                    $(".athena-product-image-" + product_id).attr('src', loader_image);
                    $.ajax({
                        type: 'POST',
                        cache: true,
                        data: {
                            'id': product_id,
                            'token': dash_website_token,
                            'swatches_attribute': opt
                        },
                        url: url,
                        dataType: "json",
                        error: function (request, error) {
                            console.log(request.responseText + ' - ' + request.status);
                            $(".athena-product-image-" + product_id).attr('src', inicial_img);
                        },
                        success: function (data) {
                            if (data.data.image != "") {
                                $(".athena-product-image-" + product_id).attr('src', data.data.image);
                            } else {
                                $(".athena-product-image-" + product_id).attr('src', inicial_img);
                            }
                        }
                    })
                }
            });
        }
    }
});