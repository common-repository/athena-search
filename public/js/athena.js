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
        Remove all message from landing page
     */
    setTimeout(function () {
        $("#maincontent .messages").hide();
    }, 10000);

    /*
        Call function for getting content
     */
    getData();

    /*
        Show Filters for Mobile
     */
    mainContent.on('click', '.filter-title strong', function () {
        if (this.getAttribute('aria-selected') == 'false') {
            $("body").addClass('filter-active');
            $(".filter").addClass('active');
            this.setAttribute('aria-selected', 'true');
        } else {
            $("body").removeClass('filter-active');
            $(".filter").removeClass('active');
            this.setAttribute('aria-selected', 'false');
        }
    });

    /*
        Select configurable product options
     */
    mainContent.on('click', '.swatch-option', function () {
        var product_id = this.getAttribute('aria-product-id');
        var type = this.getAttribute('aria-type');
        $(".swatch-athena-" + type + "-" + product_id).removeClass('selected');

        var checked = this.getAttribute('aria-checked');
        var option_id = this.getAttribute('option-id');

        if (checked == 'false') {
            $(".swatch-athena-" + type + "-" + product_id).attr('aria-checked', 'false');
            this.setAttribute('aria-checked', 'true');
            this.classList.add('selected');
            $("#add-to-cart-athena-" + product_id + "-" + type).val(option_id);
            $("#add-to-wishlist-athena-" + product_id + "-" + type).val(option_id);
            $(".swatch-opt-" + product_id).find("." + type).attr('attribute-option', option_id);

            var options = $(".swatch-opt-" + product_id).find('.swatch-attribute');
            var opt = [];
            var x = 1;
            options.each(function (index, element) {
                option = element.getAttribute('attribute-option');
                if (option) {
                    opt.push(option);
                } else {
                    x = 0;
                }
            })

            var url = $("#swatches_image_dashboard_url").val();
            var dash_website_token = $("#dash_website_token").val();
            var loader_image = $(".loader").find('img').attr('src');
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

        } else {
            this.classList.remove('selected');
            $(".swatch-athena-" + type + "-" + product_id).attr('aria-checked', 'false');
            $("#add-to-cart-athena-" + product_id + "-" + type).val('');
            $("#add-to-wishlist-athena-" + product_id + "-" + type).val('');
            $(".swatch-opt-" + product_id).find("." + type).attr('attribute-option', '');
        }
    });

    /*
        Ajax call for new content from Athena Dashboard
     */
    function getData() {
        var dash_website_token = $("#dash_website_token").val();
        var dash_website_url = $("#website_search_url").val();
        var url = dash_website_url + '?';
        url = getUrlVars(url);

        $.ajax({
            type: 'POST',
            cache: false,
            data: {
                'token': dash_website_token,
                'user_agent': navigator.userAgent,
                'customer': getCookie('customer_email_cookie'),
                'search': 1
            },
            url: url,
            dataType: "json",
            showLoader: true,
            error: function (request, error) {
                console.log(request.responseText + ' - ' + request.status);
            },
            success: function (data) {
                if (typeof (data.data.url) != "undefined" && data.data.url !== null) {
                    window.location.href = data.data.url;
                    return false;
                }
                athenaContent.hide();
                athenaSidebar.hide();
                athenaContent.html(data.data.content);
                athenaSidebar.html(data.data.sidebar);
                athenaContent.show();
                athenaSidebar.show();
                preselect();
                $(".columns").show();
                $(".loading-mask").hide();

                var uenc = $("#athena_refer_url_encode").val();
                $(".uenc-athena").val(uenc + ',,');
            }
        });
    }

    /*
        Show Error if customer not select all required fields for configurable products
     */
    mainContent.on('submit', 'form', function (e) {
        var role = e.target.getAttribute('data-role');
        var flag = 0;
        var product_id = e.target.getAttribute('data-product-id');

        if (role == "tocart-form") {
            var child_elements = e.currentTarget.childNodes;

            child_elements.forEach(function (element) {
                if (typeof (element.classList) != "undefined" && element.classList[0] == "swatch-input") {
                    if (element.value == "") {
                        $(".swatch-opt-" + product_id).find('.' + element.getAttribute('data-option-type')).find(".athena-required-error").show();
                        flag = 1;
                    } else {
                        $(".swatch-opt-" + product_id).find('.' + element.getAttribute('data-option-type')).find(".athena-required-error").hide();
                    }
                }
            });
        }

        if (flag == 1) {
            return false;
        }
    });

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

                    $(".swatch-athena-")

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