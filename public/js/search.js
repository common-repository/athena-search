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

    $("#athena_terms").after("<input type='hidden' id='currentFocus'><input type='hidden' id='numRes'>");
    $(".athena-autocomplete").after("<div id='athena-first-click' class='athena-first-click athena-search-autocomplete' style='display: none'></div>");
    var layoutType = $('#autocomplete_layout').val();
    $('.athena-search-autocomplete').addClass(layoutType);
    var baseUrl = $('#website_base_url').val();

    function insertAthenaLogoFirstClick() {
        // if ($('#athena-first-click .athena-logo').length == 0) {
        //     $('<div class="athena-logo"><a href="https://athena.syncitgroup.com/" target="_blank" title="Athena Search"><img src="' + baseUrl + 'pub/media/athena/autocomplete/img/athena-search-logo-blue.png" alt="athena"></a></div>').appendTo('#athena-first-click')
        // }
    }

    function insertAthenaLogoSearch() {
        // if ($('#search_autocomplete .athena-logo').length == 0) {
        //     $('<div class="athena-logo"><a href="https://athena.syncitgroup.com/" target="_blank" title="Athena Search"><img src="' + baseUrl + 'pub/media/athena/autocomplete/img/athena-search-logo-blue.png" alt="athena"></a></div>').appendTo('#search_autocomplete')
        // }
    }

    function showAutocompleteBox() {
        $(".athena-autocomplete").css({'display': 'block'});
        $("#search_mini_form").addClass('arrow');
    }

    function hideAutocompleteBox() {
        $(".athena-autocomplete").css({'display': 'none'});
    }

    function showFirstClickAutocompleteBox() {
        $(".athena-first-click").css({'display': 'block'});
        $("#search_mini_form").addClass('arrow');
    }

    function hideFirstClickAutocompleteBox() {
        $(".athena-first-click").css({'display': 'none'});
    }

    function showNoResult(value) {
        $(".athena-no-result").show();
        $("#athena-no-result-query").html('"' + value + '"');
    }

    function hideNoResult() {
        $(".athena-no-result").hide();
    }

    var searchForClickProduct = '';
    var currentRequest = null;
    $('<div class="athena-wrapper athena-wrapper-ac"></div>').appendTo(".athena-autocomplete");
    $('<div class="athena-flex athena-flex-ac"></div>').appendTo(".athena-wrapper");
    $('<div class="athena-no-result" >Sorry, no results for <span id="athena-no-result-query" ></span></div>').appendTo(".athena-first-click");
    $('<div class="athena-wrapper athena-wrapper-fc"></div>').appendTo(".athena-first-click");
    $('<div class="athena-flex athena-flex-fc"></div>').appendTo(".athena-wrapper-fc");

    function search(event) {
        currentFocus = -1;
        let form_input = $(event.target);
        let val = form_input.val();
        let form_input_scope = form_input.closest('#searchform');
        let athena_flex_ac = form_input.closest('#searchform').find('.athena-flex-ac');

        if (typeof (val) == "undefined" || val.length === 0) {
            if ($(".athena-flex-fc").html().length > 0) {
                showFirstClickAutocompleteBox();
                hideNoResult();
                hideAutocompleteBox();
                if (currentRequest != null) {
                    currentRequest.abort();
                }
            } else {
                firstClick();
            }
        } else {
            var res = val.replace('<>', '');
            searchForClickProduct += res + ',';
            var dash_url = $("#athena_dashboard_url").val();
            var dash_website_token = $("#dash_website_token").val();
            var website_base_url = $("#website_base_url").val() + "/search/athena?q=";
            currentRequest = $.ajax({
                type: 'POST',
                data: {'token': dash_website_token, 'q': val},
                url: dash_url,
                beforeSend: function () {
                    if (currentRequest != null) {
                        currentRequest.abort();
                    }
                },
                success: function (data) {
                    var i_none = 0;
                    var onlyProduct = 0;
                    $(athena_flex_ac).empty();
                    $(".athena-ac-section-banner").remove();
                    $.each(data.data, function (i, item) {
                        if (item.type === 'product') {
                            if (!item.items) {
                                $('.athena-search-autocomplete:first-of-type').addClass('no-product-content')
                            } else {
                                $('.athena-search-autocomplete:first-of-type').removeClass('no-product-content')
                            }
                        }
                        if (item.items) {
                            i_none = 1;
                            if (item.type === 'product') {
                                if (onlyProduct != 2) {
                                    onlyProduct = 1;
                                }
                                if (layoutType == 'athena-grid') {
                                    $('<div class="athena bigg_col big-col-ac athena-ac-sec athena-ac-section-' + item.type + ' clearfix" id="' + item.type + '" data-order="' + i + '" style="order: ' + i + '"></div>').prependTo(athena_flex_ac);
                                } else {
                                    $('<div class="athena bigg_col big-col-ac athena-ac-sec athena-ac-section-' + item.type + ' clearfix" id="' + item.type + '" data-order="' + i + '" style="order: ' + i + '"></div>').appendTo(athena_flex_ac);
                                }
                            } else {
                                if (item.items) {
                                    onlyProduct = 2;
                                }
                                $('<div class="athena small_col small-col-ac athena-ac-sec athena-ac-section-' + item.type + ' clearfix" id="' + item.type + '" data-order="' + i + '" style="order: ' + i + '"></div>').appendTo(athena_flex_ac);
                            }
                            $('<div class="athena-ac-head" id="' + item.type + '"><h4>' + item.title + '</h4></div>').appendTo(".athena-ac-section-" + item.type);
                        }
                        if (item.type === 'banner' && item.position === 'top') {
                            $('<div class="athena athena-ac-sec athena-ac-section-' + item.type + ' clearfix banner-top" id="' + item.type + '"></div>').prependTo(".athena-autocomplete");
                            $(item.html_content).prependTo(".athena-ac-section-" + item.type);
                        }
                        $.each(item.items, function (n, element) {
                            var item_id_selector = item.type + element.id;
                            if (element.image) {
                                $('<a href="' + element.link + '" class="athena-ac-block"> <div class="athena-ac-element athena-element-' + item.type + ' clearfix" id="' + item_id_selector + '" data-name="' + element.name + '" data-type="' + item.type + '" data-id="' + element.id + '" data-terms="' + searchForClickProduct + '" data-url="' + element.link + '"><div class="athena-el-1" id="' + item_id_selector + '"> <img class="athena-img athena-img-sec-' + item.type + '" src="' + element.image + '" alt="' + element.name + '"></div><div class="athena-el-2 athena-el-2-' + item_id_selector + '" id="' + item_id_selector + '"> <span class="athena-name athena-name-sec-' + item.type + '" title="' + element.name + '">' + element.highlightedName + '</span> </div></div></a>').appendTo(".athena-ac-section-" + item.type);
                                if (element.price_int_val > 0) {
                                    if (element.price && element.sale_price && element.fictional_price) {
                                        if (parseFloat(element.price) < parseFloat(element.fictional_price)) {
                                            $('<span class="athena-price"> ' + element.autocomplete_fictional_price + ' </span><span class="athena-sale-price"> ' + element.autocomplete_sale_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);
                                        } else {
                                            $('<span class="athena-price"> ' + element.autocomplete_price + ' </span><span class="athena-sale-price"> ' + element.autocomplete_sale_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);
                                        }
                                    } else if (element.price && element.sale_price && !element.fictional_price) {
                                        $('<span class="athena-price"> ' + element.autocomplete_price + ' </span><span class="athena-sale-price"> ' + element.autocomplete_sale_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);
                                    } else if (element.price && !element.sale_price && element.fictional_price) {
                                        if (parseFloat(element.price) < parseFloat(element.fictional_price)) {
                                            $('<span class="athena-price"> ' + element.autocomplete_fictional_price + ' </span><span class="athena-sale-price"> ' + element.autocomplete_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);
                                        }
                                    } else if (element.price && !element.sale_price && !element.fictional_price) {
                                        $('<span class="athena-price-only"> ' + element.autocomplete_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);
                                    }
                                }
                            } else {
                                if (item.type != 'popular') {
                                    $('<a href="' + element.link + '" class="athena-ac-block"><div class="athena athena-ac-element athena-element-' + item.type + '-no-image clearfix" id="' + item_id_selector + '" data-name="' + element.name + '" data-type="' + item.type + '" data-id="' + element.id + '" data-terms="' + searchForClickProduct + '" data-url="' + element.link + '"><div class="athena-el-2 athena-el-2-' + item_id_selector + '" id="' + item_id_selector + '"> <span class="athena-name athena-name-sec-' + item.type + '">' + element.highlightedName + '</span> </div> </div></a>').appendTo(".athena-ac-section-" + item.type);
                                } else {
                                    $('<a href="' + website_base_url + element.name + '" class="athena-ac-block"><div class="athena athena-ac-element athena-element-' + item.type + '-no-image clearfix" id="' + item_id_selector + '" data-name="' + element.name + '" data-type="' + item.type + '" data-id="' + element.id + '" data-terms="' + searchForClickProduct + '" data-url="' + element.link + '"><div class="athena-el-2 athena-el-2-' + item_id_selector + '" id="' + item_id_selector + '"> <span class="athena-name athena-name-sec-' + item.type + '">' + element.highlightedName + '</span> </div> </div></a>').appendTo(".athena-ac-section-" + item.type);
                                }
                                if (element.price_int_val > 0) {
                                    if (element.price && element.sale_price && element.fictional_price) {
                                        if (parseFloat(element.price) < parseFloat(element.fictional_price)) {
                                            $('<span class="athena-price"> ' + element.autocomplete_fictional_price + ' </span><span class="athena-sale-price"> ' + element.autocomplete_sale_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);
                                        } else {
                                            $('<span class="athena-price"> ' + element.autocomplete_price + ' </span><span class="athena-sale-price"> ' + element.autocomplete_sale_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);
                                        }
                                    } else if (element.price && element.sale_price && !element.fictional_price) {
                                        $('<span class="athena-price"> ' + element.autocomplete_price + ' </span><span class="athena-sale-price"> ' + element.autocomplete_sale_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);
                                    } else if (element.price && !element.sale_price && element.fictional_price) {
                                        if (parseFloat(element.price) < parseFloat(element.fictional_price)) {
                                            $('<span class="athena-price"> ' + element.autocomplete_fictional_price + ' </span><span class="athena-sale-price"> ' + element.autocomplete_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);
                                        }
                                    } else if (element.price && !element.sale_price && !element.fictional_price) {
                                        $('<span class="athena-price-only"> ' + element.autocomplete_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);
                                    }
                                }
                            }
                        });
                        if (item.type === 'banner' && item.position === 'bottom') {
                            $('<div class="athena athena-ac-sec athena-ac-section-' + item.type + ' clearfix banner-bottom" id="' + item.type + '"></div>').appendTo(".athena-autocomplete");
                            $(item.html_content).appendTo(".athena-ac-section-" + item.type);
                            $('#search_autocomplete .athena-logo').insertAfter('.banner-bottom')
                        }
                    });
                    var maximumData = null;
                    $('#search_autocomplete .athena-flex .athena').each(function () {
                        var valueData = $(this).attr('data-order');
                        maximumData = (valueData > maximumData) ? valueData : maximumData;
                    });
                    $('#search_autocomplete .athena-flex .athena').each(function () {
                        if (maximumData == $(this).attr('data-order')) {
                            $(this).removeClass('last-search-result')
                            $(this).addClass('last-search-result')
                        }
                    });
                    if (onlyProduct == 1) {
                        $('.athena-search-autocomplete:first-of-type').addClass('only-product');
                    } else {
                        $('.athena-search-autocomplete:first-of-type').removeClass('only-product')
                    }
                    if (i_none === 1) {
                        showAutocompleteBox();
                        hideFirstClickAutocompleteBox();
                        hideNoResult();
                    } else {
                        hideAutocompleteBox();
                        showFirstClickAutocompleteBox();
                        showNoResult(val);
                    }
                    $("#numRes").val(i_none);
                }
            });
            insertAthenaLogoSearch();
        }
    }

    function delay(callback, ms) {
        let timer = 0;
        return function () {
            let context = this, args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                callback.apply(context, args);
            }, ms || 0);
        };
    }

    $('.search-field').keyup(delay(function (event) {
        if (event.keyCode == 13 || event.keyCode == 37 || event.keyCode == 38 || event.keyCode == 39 || event.keyCode == 40) {
            if (event.keyCode == 13) {
                if (currentRequest != null) {
                    currentRequest.abort();
                }
                hideAutocompleteBox();
                hideFirstClickAutocompleteBox();
            }
            return false;
        }
        search(event);
    }, 100));
    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            $("#currentFocus").val(-1);
        }
    });

    function firstClick() {
        currentFocus = -1;
        var dash_url = $("#first_click_dashboard_url").val();
        var dash_website_token = $("#dash_website_token").val();
        var website_base_url = $("#website_base_url").val() + "/search/athena?q=";
        $.post(dash_url, {'token': dash_website_token}, function (data) {
            var i_none = 0;
            $(".athena-ac-sec").remove();
            $.each(data.data, function (i, item) {
                if (item.items) {
                    i_none = 1;
                    if (item.type === 'first-product') {
                        $('<div class="athena bigg_col bigg-col-fc athena-ac-sec athena-ac-section-' + item.type + ' clearfix" id="' + item.type + '"></div>').appendTo(".athena-flex-fc");
                    } else {
                        $('<div class="athena small_col small-col-fc athena-ac-sec athena-ac-section-' + item.type + ' clearfix" id="' + item.type + '"></div>').appendTo(".athena-flex-fc");
                    }
                    $('<div class="athena-ac-head" id="' + item.type + '"><h4>' + item.title + '</h4></div>').appendTo(".athena-ac-section-" + item.type);
                }
                $.each(item.items, function (n, element) {
                    var item_id_selector = item.type + element.id;
                    if (element.image) {
                        $('<a href="' + element.link + '" class="athena-ac-block"> <div class="athena-ac-element athena-element-' + item.type + ' clearfix" id="' + item_id_selector + '" data-name="' + element.name + '" data-type="' + item.type + '" data-id="' + element.id + '" data-terms="' + searchForClickProduct + '" data-url="' + element.link + '"><div class="athena-el-1" id="' + item_id_selector + '"> <img class="athena-img athena-img-sec-' + item.type + '" src="' + element.image + '" alt="' + element.name + '"></div><div class="athena-el-2 athena-el-2-' + item_id_selector + '" id="' + item_id_selector + '"> <span class="athena-name athena-name-sec-' + item.type + '" title="' + element.name + '">' + element.name + '</span> </div></div></div></a>').appendTo(".athena-ac-section-" + item.type);
                        if (element.price && element.sale_price && element.fictional_price) {
                            if (parseFloat(element.price) < parseFloat(element.fictional_price)) {
                                $('<span class="athena-price"> ' + element.autocomplete_fictional_price + ' </span><span class="athena-sale-price"> ' + element.autocomplete_sale_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);
                            } else {
                                $('<span class="athena-price"> ' + element.autocomplete_price + ' </span><span class="athena-sale-price"> ' + element.autocomplete_sale_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);
                            }
                        } else if (element.price && element.sale_price && !element.fictional_price) {
                            $('<span class="athena-price"> ' + element.autocomplete_price + ' </span><span class="athena-sale-price"> ' + element.autocomplete_sale_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);
                        } else if (element.price && !element.sale_price && element.fictional_price) {
                            if (parseFloat(element.price) < parseFloat(element.fictional_price)) {
                                $('<span class="athena-price"> ' + element.autocomplete_fictional_price + ' </span><span class="athena-sale-price"> ' + element.autocomplete_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);
                            }
                        } else if (element.price && !element.sale_price && !element.fictional_price) {
                            $('<span class="athena-price-only"> ' + element.autocomplete_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);
                        }
                    } else {
                        if (item.type != 'first-popular') {
                            $('<a href="' + element.link + '" class="athena-ac-block"> <div class="athena athena-ac-element athena-element-' + item.type + '-no-image clearfix" id="' + item_id_selector + '" data-name="' + element.name + '" data-type="' + item.type + '" data-id="' + element.id + '" data-terms="' + searchForClickProduct + '" data-url="' + element.link + '"><div class="athena-el-2 athena-el-2-' + item_id_selector + '" id="' + item_id_selector + '"> <span class="athena-name athena-name-sec-' + item.type + '">' + element.name + '</span> </div> </div></a>').appendTo(".athena-ac-section-" + item.type);
                        } else {
                            $('<a href="' + website_base_url + element.name + '" class="athena-ac-block"> <div class="athena athena-ac-element athena-element-' + item.type + '-no-image clearfix" id="' + item_id_selector + '" data-name="' + element.name + '" data-type="' + item.type + '" data-id="' + element.id + '" data-terms="' + searchForClickProduct + '" data-url="' + element.link + '"><div class="athena-el-2 athena-el-2-' + item_id_selector + '" id="' + item_id_selector + '"> <span class="athena-name athena-name-sec-' + item.type + '">' + element.name + '</span> </div> </div></a>').appendTo(".athena-ac-section-" + item.type);
                        }
                        if (element.price && element.sale_price && element.fictional_price) {
                            if (parseFloat(element.price) < parseFloat(element.fictional_price)) {
                                $('<span class="athena-price"> ' + element.autocomplete_fictional_price + ' </span><span class="athena-sale-price"> ' + element.autocomplete_sale_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);
                            } else {
                                $('<span class="athena-price"> ' + element.autocomplete_price + ' </span><span class="athena-sale-price"> ' + element.autocomplete_sale_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);
                            }
                        } else if (element.price && element.sale_price && !element.fictional_price) {
                            $('<span class="athena-price"> ' + element.autocomplete_price + ' </span><span class="athena-sale-price"> ' + element.autocomplete_sale_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);
                        } else if (element.price && !element.sale_price && element.fictional_price) {
                            if (parseFloat(element.price) < parseFloat(element.fictional_price)) {
                                $('<span class="athena-price"> ' + element.autocomplete_fictional_price + ' </span><span class="athena-sale-price"> ' + element.autocomplete_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);
                            }
                        } else if (element.price && !element.sale_price && !element.fictional_price) {
                            $('<span class="athena-price-only"> ' + element.autocomplete_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);
                        }
                    }
                });
            });
            $("#numRes").val(i_none);
            if (i_none === 1) {
                showFirstClickAutocompleteBox();
                hideNoResult();
            } else {
                hideFirstClickAutocompleteBox();
                $("#search_mini_form").removeClass('arrow');
            }
            hideAutocompleteBox();
        });
        insertAthenaLogoFirstClick();
    }

    $('#search_mini_form').submit(function (event) {
        var val1 = $('#search').val();
        let currentFocus = $("#currentFocus").val();
        if (val1.trim() == "" && parseInt(currentFocus) == -1) {
            event.preventDefault();
        } else {
            $(".action-search").prop('disabled', true);
        }
        if (currentRequest != null) {
            currentRequest.abort();
        }
        hideAutocompleteBox();
        hideFirstClickAutocompleteBox();
        if (currentFocus != "-1") {
            let array = $(".athena-ac-element");
            let element_id = array[currentFocus].id;
            let id_selector = $("#" + element_id);
            if (id_selector.data("type")) {
                $(".athena-search-autocomplete").css({'display': 'none'});
                let id = id_selector.data("id");
                let terms = id_selector.data("terms");
                let type = id_selector.data("type");
                let url = id_selector.data("url");
                $("#athena_id").val(id);
                $("#athena_terms").val(terms);
                $("#athena_url").val(url);
                $("#athena_type").val(type);
            }
            let select_val = id_selector.children("input").val();
            $("#search").val(select_val);
            if (id_selector.data("type") == 'popular' || id_selector.data("type") == 'first-popular') {
                $("#search").val(id_selector.data("name"));
            }
        }
    });
    
    
    $(".fa-search, .desktop-search-toggle, .mobile-search-toggle").on('click vclick', function (event) {

    
        let val = $('#search').val();
        let res = $("#numRes").val();
        currentFocus = -1;
        $(".syncit-autocomplete-focus").removeClass('syncit-autocomplete-focus');

        $(".search-form").addClass('overlay');
        if (val.trim() === "") {
            if ($(".athena-flex-fc").html().length > 0) {
                showFirstClickAutocompleteBox();
                hideAutocompleteBox();
            } else {
                firstClick();
            }
        } else if (res == "0") {
            $(".search-close").addClass("active");
            $(".search-form").addClass("active");
            $("#search").focus();
            hideAutocompleteBox();
            showFirstClickAutocompleteBox();
        } else {
            $(".search-close").addClass("active");
            $(".search-form").addClass("active");
            showAutocompleteBox();
            $("#search").focus();
            hideFirstClickAutocompleteBox();
            showAutocompleteBox();
        }

    });
    
    $(document).on('click vclick', function (event) {
        let tar = event.target.id;
        let tarClass = event.target.classList[0];
        let tagName = event.target.tagName;
        let event_type = event.type;
        let val = $('#search').val();
        let res = $("#numRes").val();
        currentFocus = -1;
        $(".syncit-autocomplete-focus").removeClass('syncit-autocomplete-focus');
        if (tar === 'search' || tar === 'search_autocomplete' || tar === 'athena-first-click' || tarClass === 'athena' || tarClass === 'action-search' || tarClass === 'pe-7s-search' || tagName === 'H4' || event_type === 'touchmove') {
            $(".search-form").addClass('overlay');
            if (val.trim() === "") {
                if ($(".athena-flex-fc").html().length > 0) {
                    showFirstClickAutocompleteBox()
                    hideAutocompleteBox();
                } else {
                    firstClick();
                }
            } else if (res == "0") {
                $(".search-close").addClass("active");
                $(".search-form").addClass("active");
                $("#search").focus();
                hideAutocompleteBox();
                showFirstClickAutocompleteBox();
            } else {
                $(".search-close").addClass("active");
                $(".search-form").addClass("active");
                showAutocompleteBox();
                $("#search").focus();
                hideFirstClickAutocompleteBox();
                showAutocompleteBox();
            }
        } else {
            $(".search-close").removeClass("active");
            $(".search-form").removeClass("active overlay");
            hideAutocompleteBox();
            hideFirstClickAutocompleteBox();
            $("#search_mini_form").removeClass('arrow');
            $("html, body").removeClass('noscroll');
        }
    });
    $(document).mouseup(function (event) {
        if (event.target === $('html')[0] && event.clientX >= document.documentElement.offsetWidth) {
            if (window.innerWidth >= 992) {
                hideAutocompleteBox();
                hideFirstClickAutocompleteBox();
                $("#search_mini_form").removeClass('arrow');
                $(".search-form").removeClass("overlay");
            }
        }
    });
    $(document).on("touchstart", ".athena-wrapper", function () {
        $("#search").blur();
    });
    $(document).on("touchmove", function () {
        if (!$('.athena-autocomplete').is(':visible') && !$('.athena-first-click').is(':visible')) {
            $(".search-close").removeClass("active");
            $(".search-form").removeClass("active overlay");
            hideAutocompleteBox();
            hideFirstClickAutocompleteBox();
            $("#search_mini_form").removeClass('arrow');
            $("html, body").removeClass('noscroll');
            $("#search").blur();
        }
    });
    $("#search").val("");
    let inp = $("#search");
    let currentFocus = -1;
    inp.on("keydown", function (event) {
        let keyCode = event.keyCode;
        let total_num_search = $(".athena-ac-element").length;
        $(".syncit-autocomplete-focus").removeClass('syncit-autocomplete-focus');
        if (keyCode == 40) {
            currentFocus++;
            if (currentFocus === total_num_search) {
                currentFocus = 0;
            }
            let array = $(".athena-ac-element");
            let element_id = array[currentFocus].id;
            let id_selector = $("#" + element_id);
            id_selector.addClass('syncit-autocomplete-focus');
        } else if (keyCode == 38) {
            let array = $(".athena-ac-element");
            currentFocus--;
            if (currentFocus < 0) {
                currentFocus = total_num_search - 1;
            }
            let element_id = array[currentFocus].id;
            let id_selector = $("#" + element_id);
            id_selector.addClass('syncit-autocomplete-focus');
        } else if (keyCode == 37) {
            currentFocus = -1;
            $("#currentFocus").val(currentFocus);
        } else if (keyCode == 39) {
            currentFocus = -1;
            $("#currentFocus").val(currentFocus);
        } else {
            $("#athena_type").val('search');
        }
        $("#currentFocus").val(currentFocus);
    });
    $(".block-search").on('vclick', function (event) {
        let element_class = event.target.classList[1];
        let element_class_0 = event.target.classList[0];
        let tagName = event.target.tagName;
        var href = '';
        if (element_class == 'athena-ac-element' || element_class == 'athena-element-first-product') {
            if (typeof event.target.closest("a") != 'undefined') {
                href = event.target.closest("a").href;
                // console.log(href);
            }
            if (href != '') {
                window.location.href = href;
            }
            return false;
        }
        if (element_class_0 == 'athena-img' || element_class_0 == 'athena-name' || element_class_0 == 'athena-price-only' || element_class_0 == 'athena-price' || element_class_0 == 'athena-sale-price') {
            if (typeof event.target.closest("a") != 'undefined') {
                href = event.target.closest("a").href;
                // console.log(href);
            }
            if (href != '') {
                window.location.href = href;
            }
            return false;
        }
        if (element_class_0 == 'athena-highlight' || element_class_0 == 'highlightSearchFont') {
            if (typeof event.target.closest("a") != 'undefined') {
                href = event.target.closest("a").href;
                // console.log(href);
            }
            if (href != '') {
                window.location.href = href;
            }
            return false;
        }
        if (element_class != 'athena-ac-element' && tagName != 'B' && tagName != 'SPAN' && element_class_0 != 'athena-img' && element_class_0 != 'athena-el-2' && element_class_0 != 'athena-sale-price' && element_class_0 != 'athena-name' && element_class_0 != 'athena-highlight') {
            $(".syncit-autocomplete-focus").removeClass('syncit-autocomplete-focus');
            $("#athena_type").val('search');
            currentFocus = -1;
        }
    });
    $('.block-search').mouseleave(function () {
        currentFocus = -1;
        $("#currentFocus").val(currentFocus);
        $(".syncit-autocomplete-focus").removeClass('syncit-autocomplete-focus');
    });
});