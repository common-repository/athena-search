jQuery(document).ready(function(jqAthena){
    'use strict';
    /*Content Selector*/

    var contentId = infinite_scroll.contentDivId;
    var athenaContent = jqAthena("#"+contentId);

    /*Athena Website Token*/
    var websiteToken = infinite_scroll.websiteToken;

    /*Athena Api Url*/
    var athenaUrl = infinite_scroll.athenaDashboardUrl;

    window.scrollStatus = true;
    window.pages_array = [];
    var currentRequest = null;
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
    function getUrlVars(url, next_page_url)
    {
        if (typeof next_page_url !== 'undefined') {
            var hash;
            var hashes = next_page_url.slice(next_page_url.indexOf('?') + 1).split('&');
            for(var i = 0; i < hashes.length; i++)
            {
                hash = hashes[i].split('=');
                url = url+ hash[0]+ '=' + hash[1]+ '&';
            }

            return url.slice(0,-1);
        }
    }

    /*
        Get page number from Url
     */
    function pageFromUrl(url) {
        var name = 'page';
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(url);
        if (results == null) {
            return 1;
        }
        return decodeURI(results[1]) || 0;
    }

    /*
        Url array for infinity scroll
     */
    function addUrlToArray(url) {
        var f = 0;
        pages_array.filter(function (page) {
            if (page.page === pageFromUrl(url)) {
                page.href = url;
                f = 1;
            }
        });
        if (f === 0) {
            pages_array.push({
                'page': parseInt(pageFromUrl(url)),
                'href': url,
                'from': pages_array[pages_array.length - 1].to,
                'to': jqAthena(".post-item").last().offset().top
            });
        }
    }

    //This will sort your array
    function SortByPage(a, b) {
        return ((a.page < b.page) ? -1 : ((a.page > b.page) ? 1 : 0));
    }

    //Check Prev Page
    jqAthena(window).on('checkPrevPage', function () {
        jqAthena(".toolbar-amount").hide();
        var p = pageFromUrl(window.location.href);

        if (p > 1) {
            var prev_page_url = jqAthena(".pages .pages-item-previous a").attr("href");

            if (typeof prev_page_url !== 'undefined') {
                athenaContent.prepend('<div class="athena-load-prev"> <div class="ias-trigger ias-trigger-prev" style="text-align: center; cursor: pointer;"><a href="'+ prev_page_url +'" > Load previous items </a></div> </div>');
            }
        }

        if (pages_array.length === 0 && jqAthena(".post-item").length > 0) {
            pages_array.push({
                'page': parseInt(pageFromUrl(window.location.href)),
                'href': window.location.href,
                'from': 0,
                'to': jqAthena(".item.post.post-item").last().offset().top
            });
        }
    });

    //Click on show prev page
    athenaContent.on('click', '.athena-load-prev a', function (event) {
        var prev_page_url = '';
        var productItems = jqAthena(".post-items");

        //Remove prev a tag
        jqAthena(".athena-load-prev").remove();
        //Prepend Spinner
        athenaContent.prepend('<div class="athena-spinner"><div class="ajax-loading"><span class="scroll-ajax-button"><div class="athena-spinner-loader"></div></span></div></div>');

        //Global vars
        window.scrollStatus = true;
        jqAthena("html, body").animate({scrollTop: 0}, 500);

        if (event.currentTarget.href) {
            prev_page_url = event.currentTarget.href;
        } else if (event.target.href) {
            prev_page_url = event.target.href;
        }

        var dash_url = athenaUrl+'?';
        dash_url = getUrlVars(dash_url, prev_page_url);

        //Get Data from
        currentRequest = jqAthena.ajax({
            type: 'POST',
            cache: false,
            data: {
                'token': websiteToken,
                'customer': getCookie('customer_email_cookie')
            },
            url: dash_url,
            dataType: "json",
            beforeSend: function () {
                if (currentRequest != null) {
                    currentRequest.abort();
                }
            },
            success: function (data) {
                setTimeout(function() {
                    //Ajax data to html object
                    var htmlObject = document.createElement('div');
                    htmlObject.innerHTML = data.data.content;

                    //Append Product
                    var products = htmlObject.getElementsByClassName('post-items')[0].innerHTML;
                    productItems.prepend(products);

                    window.scrollStatus = true;
                    window.history.pushState("", "", prev_page_url);

                    //Prev Page
                    var prev_page = htmlObject.getElementsByClassName("pages-item-previous");

                    if (prev_page.length) {
                        jqAthena(".pages-item-previous").html(prev_page[0].innerHTML);
                    }

                    jqAthena(window).trigger('checkPrevPage');
                    //Remove spinner
                    jqAthena(".athena-spinner").remove();

                    //Page Scroller for changing url
                    var load_page = parseInt(pageFromUrl(prev_page_url));

                    pages_array.push({
                        'page': load_page,
                        'href': prev_page_url,
                        'from': 0,
                        'to': 0
                    });
                    pages_array.sort(SortByPage);

                    pages_array.forEach(function (page, index) {
                        page.from = page.to;

                        pages_array.filter(function (fil_page) {
                            if (fil_page.page === page.page + 1) {
                                page.to = fil_page.to;
                            }
                        });

                        if (index === pages_array.length - 1) {
                            page.to = jqAthena(".post-item").last().offset().top;
                        }
                    });

                    pages_array.sort(SortByPage);

                    jqAthena("html, body").animate({scrollTop: 0}, 500);
                }, 1000);
            }
        });

        event.preventDefault();
    });

    //For Desktop Scroll
    jqAthena(window).scroll(function() {
        //Params
        var distance = jqAthena(window).scrollTop() + jqAthena(window).height();
        var productItems = jqAthena(".post-items");
        var last_page = false;
        jqAthena(".pages").hide();
        jqAthena(".limiter").hide();

        pages_array.filter(function (page) {
            if (distance > page.from && distance < page.to) {
                window.history.pushState("", "", page.href);
            }
        });

        if(jqAthena(window).scrollTop() + jqAthena(window).height() > jqAthena(document).height() - 1600) {

            if (window.scrollStatus && jqAthena(".product-end").length === 0) {
                //Stop
                window.scrollStatus = false;
                var next_page_url = jqAthena(".pages .pages-item-next a").attr("href");

                if (typeof next_page_url === 'undefined') {
                    var element = '<div class="ias-noneleft product-end" style="text-align: center;clear: both"> You reached the end. </div>';
                    athenaContent.append(element);
                    jqAthena(".athena-spinner").remove();
                    window.scrollStatus = false;
                    last_page = true;
                }

                if (!last_page) {
                    var dash_url = athenaUrl+'?';
                    dash_url = getUrlVars(dash_url, next_page_url);

                    productItems.append('<div class="athena-spinner"><div class="ajax-loading"><span class="scroll-ajax-button"><div class="athena-spinner-loader"></div></span></div></div>');

                    //Get Data from
                    currentRequest = jqAthena.ajax({
                        type: 'POST',
                        cache: false,
                        data: {
                            'token': websiteToken,
                            'customer': getCookie('customer_email_cookie')
                        },
                        url: dash_url,
                        dataType: "json",
                        beforeSend: function () {
                            if (currentRequest != null) {
                                currentRequest.abort();
                            }
                        },
                        success: function (data) {
                            setTimeout(function() {
                                //Ajax data to html object
                                var htmlObject = document.createElement('div');
                                htmlObject.innerHTML = data.data.content;

                                //Append Product
                                var products = htmlObject.getElementsByClassName('post-items')[0].innerHTML;
                                productItems.append(products);

                                //Next Page
                                var next_page = htmlObject.getElementsByClassName("pages-item-next");

                                if (next_page.length) {
                                    jqAthena(".pages-item-next").html(next_page[0].innerHTML);

                                    addUrlToArray(next_page_url);

                                    window.scrollStatus = true;
                                } else {
                                    var element = '<div class="ias-noneleft product-end" style="text-align: center;clear: both"> You reached the end. </div>';
                                    athenaContent.append(element);

                                    addUrlToArray(next_page_url);

                                    window.scrollStatus = true;
                                }
                                jqAthena(".athena-spinner").remove();
                            }, 1000);
                        }
                    });
                }
            }
        }
    });

    //For Mobile Touchmove
    jqAthena(window).bind('touchmove', function() {
        //Params
        var distance = jqAthena(window).scrollTop() + jqAthena(window).height();
        var productItems = jqAthena(".post-items");
        var last_page = false;
        jqAthena(".pages").hide();
        jqAthena(".limiter").hide();

        pages_array.filter(function (page) {
            if (distance > page.from && distance < page.to) {
                window.history.pushState("", "", page.href);
            }
        });

        if(jqAthena(window).scrollTop() + jqAthena(window).height() > jqAthena(document).height() - 2200) {

            if (window.scrollStatus && jqAthena(".product-end").length === 0) {
                //Stop
                window.scrollStatus = false;
                var next_page_url = jqAthena(".pages .pages-item-next a").attr("href");

                if (typeof next_page_url === 'undefined') {
                    var element = '<div class="ias-noneleft product-end" style="text-align: center;clear: both"> You reached the end. </div>';
                    athenaContent.append(element);
                    jqAthena(".athena-spinner").remove();
                    window.scrollStatus = false;
                    last_page = true;
                }

                if (!last_page) {
                    var dash_url = athenaUrl+'?';
                    dash_url = getUrlVars(dash_url, next_page_url);

                    productItems.append('<div class="athena-spinner"><div class="ajax-loading"><span class="scroll-ajax-button"><div class="athena-spinner-loader"></div></span></div></div>');

                    //Get Data from
                    currentRequest = jqAthena.ajax({
                        type: 'POST',
                        cache: false,
                        data: {
                            'token': websiteToken,
                            'customer': getCookie('customer_email_cookie')
                        },
                        url: dash_url,
                        dataType: "json",
                        beforeSend: function () {
                            if (currentRequest != null) {
                                currentRequest.abort();
                            }
                        },
                        success: function (data) {
                            setTimeout(function() {
                                //Ajax data to html object
                                var htmlObject = document.createElement('div');
                                htmlObject.innerHTML = data.data.content;

                                //Append Product
                                var products = htmlObject.getElementsByClassName('post-items')[0].innerHTML;
                                productItems.append(products);

                                //Next Page
                                var next_page = htmlObject.getElementsByClassName("pages-item-next");

                                if (next_page.length) {
                                    jqAthena(".pages-item-next").html(next_page[0].innerHTML);

                                    addUrlToArray(next_page_url);

                                    window.scrollStatus = true;
                                } else {
                                    var element = '<div class="ias-noneleft product-end" style="text-align: center;clear: both"> You reached the end. </div>';
                                    athenaContent.append(element);

                                    addUrlToArray(next_page_url);

                                    window.scrollStatus = true;
                                }
                                jqAthena(".athena-spinner").remove();
                            }, 300);
                        }
                    });
                }
            }
        }
    });
});