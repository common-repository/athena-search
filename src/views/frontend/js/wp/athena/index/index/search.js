jQuery(document).ready(function(jqAthena){
    /*Content Selector*/
    var contentId = search_obj.contentDivId;
    var athenaContent = jqAthena("#"+contentId);

    /*Sidebar Selector*/
    var sidebarId = search_obj.sidebarDivId;
    var athenaSidebar = jqAthena("#"+sidebarId);

    /*Athena Website Token*/
    var websiteToken = search_obj.websiteToken;

    /*Athena Api Url*/
    var athenaUrl = search_obj.athenaDashboardUrl;

    /*Athena Api for swatch options*/
    var swatchApiUrl = search_obj.swatchApiUrl;

    /*Api Product Analytics*/
    var productClickApiUrl = search_obj.productClickApiUrl;

    /*Product DOM Selector*/
    var domSelector = search_obj.domSelector;

    /*Cart DOM Selector*/
    var addToCartDomSelector = search_obj.addToCartDomSelector;

    /*Conversion Api Url*/
    var cartEventUrl = search_obj.cartEventUrl;

    var currentRequest = null;
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
        for(var i = 0; i < hashes.length; i++)
        {
            hash = hashes[i].split('=');
            url = url+ hash[0]+ '=' + hash[1]+ '&';
        }

        return url.slice(0,-1);
    }

    /*
        Function for price range(remove price param from url)
     */
    function removePriceUrl(url) {
        var hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++)
        {
            hash = hashes[i].split('=');
            if (hash[0] != 'price') {
                url = url+ hash[0]+ '=' + hash[1]+ '&';
            }
        }

        return url.slice(0,-1);
    }

    /*
        Event click on filters
     */
    athenaSidebar.on('click', '.filter a', function (event) {
        //Global vars
        window.pages_array = [];
        window.scrollStatus = true;

        jqAthena(".loading-mask").show();
        jqAthena("html, body").animate({scrollTop: 0}, 500);
        jqAthena("html").removeClass("filter-open");

        if (event.currentTarget.href) {
            url = event.currentTarget.href;
        } else if (event.target.href) {
            url = event.target.href;
        }

        getAjaxData();
        event.preventDefault();
    });
    athenaContent.on('click', '.toolbar a', function (event) {
        //Global vars
        window.pages_array = [];
        window.scrollStatus = true;

        jqAthena(".loading-mask").show();
        jqAthena("html, body").animate({scrollTop: 0}, 500);
        jqAthena("html").removeClass("filter-open");

        if (event.currentTarget.href) {
            url = event.currentTarget.href;
        } else if (event.target.href) {
            url = event.target.href;
        }

        getAjaxData();
        event.preventDefault();
    });

    /*
        Event change on toolbar
     */
    athenaContent.on('change', 'select', function (event) {
        jqAthena(".loading-mask").show();
        jqAthena("html, body").animate({scrollTop: 0}, 500);

        if (event.currentTarget.value) {
            url = event.currentTarget.value;
        } else if (event.target.value) {
            url = event.target.value;
        }

        getAjaxData();
        event.preventDefault();
    });

    /*
        Price Range Event
     */
    jqAthena(window).on('rangeFinished', function (e, data) {
        jqAthena(".loading-mask").show();
        jqAthena("html, body").animate({scrollTop: 0}, 500);
        jqAthena("html").removeClass("filter-open");

        var min = data.from.toFixed(2);
        var max = data.to.toFixed(2);

        url = location.origin+location.pathname+"?";
        url = removePriceUrl(url);
        url = url+'&price='+min+'-'+max;

        getAjaxData();
    });

    /*
        Event slide for price range
     */
    athenaSidebar.on('slide', '#price-range-slider', function (event, ui) {
        var min = ui.values[0];
        var max = ui.values[1];
        jqAthena("#min_price").val(min);
        jqAthena("#max_price").val(max);
        jqAthena("#show-price-range").html("Min: $"+min.toFixed(2)+"- Max: $"+max.toFixed(2));
    });

    /*
         Event slide stop for price range
     */
    athenaSidebar.on('slidestop', '#price-range-slider', function (event, ui) {
        jqAthena(".loading-mask").show();
        var min = ui.values[0];
        var max = ui.values[1];
        url = location.origin+location.pathname+"?";
        url = removePriceUrl(url);
        url = url+'&price='+min+'-'+max;

        getAjaxData();
    });

    /*
        Ajax call for new content from Athena Dashboard
     */
    function getAjaxData() {
        window.history.pushState("", "", url);

        var dashUrl = athenaUrl+'?';
        dashUrl = getUrlVars(dashUrl);

        jqAthena.ajax({
            type: 'GET',
            cache: true,
            data: {
                'token': websiteToken,
                'customer': getCookie('customer_email_cookie')
            },
            url: dashUrl,
            dataType: "json",
            success: function (data) {
                athenaContent.html(data.data.content);
                athenaSidebar.html(data.data.sidebar);
                athenaContent.show();
                athenaSidebar.show();
                preselect();
                jqAthena("body").removeClass('filter-active');
                jqAthena(".filter").removeClass('active');
                jqAthena(".loading-mask").hide();

                jqAthena(window).trigger('checkPrevPage');
            }
        });
    }
    /*
        Preselect products swatch
     */
    function preselect() {
        var products = jqAthena(".athena-swatch");
        var loader_image = jqAthena(".loader").find('img').attr('src');

        if (products.length) {
            products.each(function (index, element) {
                var product_id = element.getAttribute('product-id');

                var options = jqAthena(".swatch-opt-"+product_id).find('.swatch-attribute');
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

                if (opt.length) {
                    var inicial_img = jqAthena(".athena-product-image-"+product_id).attr('src');
                    jqAthena(".athena-product-image-"+product_id).attr('src', loader_image);
                    jqAthena.ajax({
                        type: 'GET',
                        cache: true,
                        data: {
                            'id': product_id,
                            'token': websiteToken,
                            'swatches_attribute': opt
                        },
                        url: swatchApiUrl,
                        dataType: "json",
                        error: function (request, error) {
                            console.log(request.responseText + ' - ' + request.status);
                            jqAthena(".athena-product-image-"+product_id).attr('src', inicial_img);
                        },
                        success: function (data) {
                            if (data.data.image != "") {
                                jqAthena(".athena-product-image-"+product_id).attr('src', data.data.image);
                            } else {
                                jqAthena(".athena-product-image-"+product_id).attr('src', inicial_img);
                            }
                        }
                    })
                }
            });
        }
    }

    /*
        Call function for getting content
     */
    getData();

    /*
        Show Filters for Mobile
     */
    athenaSidebar.on('click', '.filter-title strong', function () {
        if (this.getAttribute('aria-selected') === 'false') {
            jqAthena("body").addClass('filter-active');
            jqAthena(".filter").addClass('active');
            this.setAttribute('aria-selected', 'true');
        } else {
            jqAthena("body").removeClass('filter-active');
            jqAthena(".filter").removeClass('active');
            this.setAttribute('aria-selected', 'false');
        }
    });


    /*
        Select configurable product options
     */
    athenaContent.on('click', '.swatch-option', function () {
        var product_id = this.getAttribute('aria-product-id');
        var type = this.getAttribute('aria-type');
        jqAthena(".swatch-athena-" + type + "-"+product_id).removeClass('selected');

        var checked = this.getAttribute('aria-checked');
        var option_id = this.getAttribute('option-id');

        if (checked == 'false') {
            jqAthena(".swatch-athena-" + type + "-"+product_id).attr('aria-checked', 'false');
            this.setAttribute('aria-checked', 'true');
            this.classList.add('selected');
            jqAthena("#add-to-cart-athena-" + product_id + "-" + type).val(option_id);
            jqAthena("#add-to-wishlist-athena-" + product_id + "-" + type).val(option_id);
            jqAthena(".swatch-opt-" + product_id).find("." + type).attr('attribute-option', option_id);

            var options = jqAthena(".swatch-opt-" + product_id).find('.swatch-attribute');
            var opt = [];
            var x = 1;
            options.each(function (index, element) {
                option = element.getAttribute('attribute-option');
                if (option) {
                    opt.push(option);
                } else {
                    x = 0;
                }
            });

            var loader_image = jqAthena(".loader").find('img').attr('src');
            var inicial_img = jqAthena(".athena-product-image-" + product_id).attr('src');
            jqAthena(".athena-product-image-" + product_id).attr('src', loader_image);

            jqAthena.ajax({
                type: 'GET',
                cache: true,
                data: {
                    'id': product_id,
                    'token': websiteToken,
                    'swatches_attribute': opt
                },
                url: swatchApiUrl,
                dataType: "json",
                error: function (request, error) {
                    console.log(request.responseText + ' - ' + request.status);
                    jqAthena(".athena-product-image-"+product_id).attr('src', inicial_img);
                },
                success: function (data) {
                    if (data.data.image !== "") {
                        jqAthena(".athena-product-image-"+product_id).attr('src', data.data.image);
                    } else {
                        jqAthena(".athena-product-image-"+product_id).attr('src', inicial_img);
                    }
                }
            })

        } else {
            this.classList.remove('selected');
            jqAthena(".swatch-athena-" + type + "-" + product_id).attr('aria-checked', 'false');
            jqAthena("#add-to-cart-athena-" + product_id+"-" + type).val('');
            jqAthena("#add-to-wishlist-athena-" + product_id + "-" + type).val('');
            jqAthena(".swatch-opt-" + product_id).find("." + type).attr('attribute-option', '');
        }
    });

    /*
        Ajax call for new content from Athena Dashboard
     */
    function getData() {
        var url = athenaUrl+'?';
        url = getUrlVars(url);

        jqAthena.ajax({
            type: 'GET',
            cache: true,
            data: {
                'token': websiteToken,
                'customer': getCookie('customer_email_cookie'),
                'search': 1
            },
            url: url,
            dataType: "json",
            showLoader:true,
            error: function (request, error) {
                console.log(request.responseText+ ' - ' +request.status);
            },
            success: function (data) {
                if (typeof(data.data.url) != "undefined" && data.data.url !== null) {
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
                jqAthena(".columns").show();
                jqAthena(".loading-mask").hide();

                jqAthena(window).trigger('checkPrevPage');
            }
        });
    }

    athenaSidebar.on('click', '.filter-toggle .title', function () {
        jqAthena('html, body').toggleClass('noscroll');
        jqAthena('html').toggleClass('filter-open');
    });

    athenaSidebar.on('click', '.sidebar .close-atr-button', function () {
        jqAthena('html, body').removeClass('noscroll');
        jqAthena('html').removeClass('filter-open');
    });

    athenaSidebar.on('click', '.filter-options-item', function () {
        var arrow = this.children[0];
        var options = this.children[1];

        if (arrow.classList.contains('inactive')) {
            arrow.classList.remove("inactive");
            arrow.className = "active";
            options.style.display = "block";
        } else {
            arrow.classList.remove("active");
            arrow.className = "inactive";
            options.style.display = "none";
        }
    });

    /*
        Get Query from Url
     */
    function getQueryFromUrl() {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === 'q') {
                return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
    }

    /*
        Search History
    */
    function searchHistory(productId) {
        var date = Date.now() + 86400;
        var searchHistory = localStorage.getItem('athenaSearchHistory');
        if (searchHistory) {
            searchHistory = JSON.parse(searchHistory);
            if (searchHistory[productId] && searchHistory[productId]['token'] === websiteToken) {
                searchHistory[productId]['token'] = websiteToken;
                searchHistory[productId]['expiration'] = date;
                searchHistory[productId]['oid'] = productId;
                localStorage.setItem('athenaSearchHistory', JSON.stringify(searchHistory));
            } else {
                searchHistory[productId] = {};
                searchHistory[productId]['token'] = websiteToken;
                searchHistory[productId]['expiration'] = date;
                searchHistory[productId]['oid'] = productId;
                localStorage.setItem('athenaSearchHistory', JSON.stringify(searchHistory));
            }
        } else {
            const searchHistory = {};
            searchHistory[productId] = {};
            searchHistory[productId]['token'] = websiteToken;
            searchHistory[productId]['expiration'] = date;
            searchHistory[productId]['oid'] = productId;
            localStorage.setItem('athenaSearchHistory', JSON.stringify(searchHistory));
        }

        return date;
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
        Send Clicked Product to Athena
     */
    function productClick(e, type) {
        var currentTarget = e.currentTarget;
        var searchKeywords = "";

        if (typeof currentTarget.dataset.elementId != 'undefined') {
            var productId = currentTarget.dataset.elementId;
            searchKeywords = getQueryFromUrl() + ',';

            userToken();
            searchHistory(productId);

            currentRequest = jqAthena.ajax({
                type: 'GET',
                cache: true,
                data: {
                    'productId': productId,
                    'type': type,
                    'token': websiteToken,
                    'searchKeywords': searchKeywords,
                    'customer': getCookie('customer_email_cookie')
                },
                url: productClickApiUrl,
                dataType: "json",
                beforeSend: function () {
                    if (currentRequest != null) {
                        currentRequest.abort();
                    }
                },
                error: function (request, error) {
                    //
                },
                success: function (data) {
                    //
                }
            });
        }
    }

    /*
        Click on product in landing page
     */
    athenaContent.on('mousedown touchstart', domSelector, function (e) {
        if (e.target.tagName === "A" || e.target.closest("a")) {
            if (e.type === 'touchstart') {
                productClick(e, 'search');
            } else if (e.type === 'mousedown') {
                switch(e.which)
                {
                    case 1:
                        //left Click
                        productClick(e, 'search');
                        break;
                    case 2:
                        //middle Click
                        productClick(e, 'search');
                        break;
                }
            }
        }
    });

    /*
        Catch event add to cart
     */
    athenaContent.on('click', addToCartDomSelector, function (e) {
        var date = Date.now();
        var currentTarget = e.currentTarget;
        if (typeof currentTarget.dataset.elementId != 'undefined') {
            var productId = currentTarget.dataset.elementId;
            var valid = true;
            searchHistory(productId);

            //Validation
            var inputs = jqAthena(e.target).parents('form').find('input');
            inputs.each(function() {
                if(jqAthena(this).prop('required')) {
                    if (!this.value) {
                        valid = false;
                    }
                }
            });

            var history = localStorage.getItem('athenaSearchHistory');

            if (history) {
                history = JSON.parse(history);
                if (history[productId] && history[productId]['token'] === websiteToken && history[productId]['expiration'] > date && valid) {
                    //Successfully Added to cart
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