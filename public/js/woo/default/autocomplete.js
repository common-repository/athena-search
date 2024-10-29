/*-----------------------------
* Athena Search JS / jQuery
-----------------------------*/
/*
*  Athena Search Autocomplete JS
*
Jquery Ready!
*/
jQuery(document).ready(function (jqAthena) {

    /*Athena Website Token*/
    var websiteToken = autocomplete.websiteToken;

    /*Athena Landing page url*/
    var landingPageUrl = autocomplete.landingPageUrl;

    /*Form Url*/
    var formUrl = autocomplete.formUrl;

    /*Api Autocomplete Url*/
    var athenaAutocompleteUrl = autocomplete.autocompleteUrl;

    /*Api First click Autocomplete Url*/
    var athenaAutocompleteFirstClickUrl = autocomplete.firstClickUrl;

    /*Api Product Analytics*/
    var productClickApiUrl = autocomplete.productClickUrl;

    /*Api Search Tabs */
    var searchTabsUrl = autocomplete.searchTabsUrl;

    /*Layout type*/
    var layoutType = autocomplete.autocompleteLayout;

    /*Product DOM Selector*/
    var domSelector = autocomplete.domSelector;

    /*Form Id selector*/
    var searchForm = jqAthena("#search_mini_form");

    /*
        Initial append required elements
    */
    searchForm.prop("action", formUrl);
    searchForm.append("<input type='hidden' id='currentFocus'>");
    searchForm.append("<input type='hidden' id='numRes'>");
    jqAthena("#search_autocomplete").removeClass();
    jqAthena("#search_autocomplete").addClass("athena-autocomplete athena-search-autocomplete");
    jqAthena("#athena_terms").after("<input type='hidden' id='currentFocus'><input type='hidden' id='numRes'>");
    jqAthena(".athena-autocomplete").after("<div id='athena-first-click' class='athena-first-click athena-search-autocomplete' style='display: none'></div>");
    jqAthena('.athena-search-autocomplete').addClass(layoutType);

    /* Search Suggestions - start */
    var enabledDisabled = autocomplete.enabledDisabled;
    var placeholderText = autocomplete.placeholderText;
    var rotationSeconds = autocomplete.rotationSeconds;
    var keepKeyword = autocomplete.keepKeyword;
    var delayAtStart = autocomplete.delayAtStart;
    var rotateElements = [];
    var suggestionData = autocomplete.suggestionData;
    var count = 0;

    var delayAtStartSeconds = parseInt(delayAtStart);
    if(isNaN(delayAtStartSeconds)) {
        delayAtStartSeconds = 0;
    }

    /* ========= */
    /* ========= START OF SEARCH SUGGESTIONS RETRIEVING, TYPING AND DELETING EFFECT ========== */
    // Current sentence being processed
    var _PART = 0;

    // Character number of the current sentence being processed
    var _PART_INDEX = 0;

    // Holds the handle returned from setInterval
    var _INTERVAL_VAL;

    // Element that holds the text
    var _ELEMENT = document.querySelector("#search");
    //check if placeholder is off/without text in dashboard
    if(placeholderText === "off") {
        placeholderText = "Search for...";
    }
    //delete cookie to prevent showing keyword on other page / refreshed
    eraseCookie("key pressed");
    //check if enabled or disabled
    if (enabledDisabled === "on") {
        if (placeholderText === "" || placeholderText === "off") {
            placeholderText = "Search for...";
        }

        //rotate seconds parse to int
        var rotateSeconds = parseInt(rotationSeconds);
        //keyword seconds parse to int
        var keepKeywordSeconds = parseInt(keepKeyword);
        //check if value is NaN
        if(isNaN(keepKeywordSeconds)) {
            keepKeywordSeconds = 1;
        }

        jqAthena("#search").attr("placeholder", placeholderText + " ").val();

        if(jqAthena(suggestionData.suggestions_keywords).length > 0) {
            //add it in array
            jqAthena(suggestionData.suggestions_keywords).each(function (index, value) {
                rotateElements.push(this.content);
            });

            var _CONTENT = rotateElements;

            //delay at start
            setTimeout(function() {
                // Start the typing effect on load
                _INTERVAL_VAL = setInterval(Type, 70);
            }, delayAtStartSeconds * 1000);

        }
    } else {
        jqAthena("#search").attr("placeholder", placeholderText + " ").val();
    }

    // Implements typing effect
    function Type() {
        //halt animation if there window/tab is out of focus
        if(document.hasFocus()) {
            var keywordsLength = jqAthena(_CONTENT).length;
            //var _PART = Math.floor(Math.random() * keywordsLength);

            var text = _CONTENT[_PART].substring(0, _PART_INDEX + 1);
            _ELEMENT.placeholder = placeholderText + " " + text;
            _PART_INDEX++;

            // If full sentence has been displayed then start to delete the sentence after some time
            if (text === _CONTENT[_PART]) {

                //here check cookie and put word in input
                var cookieRetrievedValue = getCookieCustom("key pressed");

                if (cookieRetrievedValue === "1") {
                    //stop effect
                    clearInterval(1);
                    //write word
                    _ELEMENT.value = _CONTENT[_PART];
                    //delete cookie
                    eraseCookie("key pressed");
                }

                clearInterval(_INTERVAL_VAL);
                setTimeout(function () {
                    _INTERVAL_VAL = setInterval(Delete, 50);
                }, keepKeywordSeconds * 1000);
            }
        } else {
            clearInterval(1);
        }
    }

    // Implements deleting effect
    function Delete() {
        var text =  _CONTENT[_PART].substring(0, _PART_INDEX - 1);
        _ELEMENT.placeholder = placeholderText + " " + text;
        _PART_INDEX--;

        // If sentence has been deleted then start to display the next sentence
        if(text === '') {
            //clear cookie
            eraseCookie("key pressed");

            clearInterval(_INTERVAL_VAL);

            // If last sentence then display the first one, else move to the next
            if (_PART == (_CONTENT.length - 1)) {
                _PART = 0;
            } else {
                _PART++;
            }
            _PART_INDEX = 0;

            // Start to display the next sentence after some time
            setTimeout(function() {
                _CONTENT = shuffleArray(_CONTENT);
                _INTERVAL_VAL = setInterval(Type, 70);
            }, rotateSeconds * 1000);
        }
    }

    /* Shuffle array */
    /* Randomize array in-place using Durstenfeld shuffle algorithm */
    function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    /* Arrow right enter autocomplete words */
    jqAthena(document).keydown(function(e){
        //only if value of element is empty, detect arrow key, space or enter respectively
        if (_ELEMENT.value === "") {
            if (e.which == 39 || e.which == 32 || e.which == 13) {
                if(e.which == 13) {
                    e.preventDefault();
                }
                executeEnteringSearch();
            }
        }
    });

    /* execute function for entering keyword */
    function executeEnteringSearch() {
        //check if input is empty
        var currentPlaceholder = jqAthena.trim(_ELEMENT.placeholder);
        var defaultPlaceholder = jqAthena.trim(placeholderText);
        var sumPlaceholder = placeholderText + " " + _CONTENT[_PART];

        eraseCookie("key pressed");

        if (currentPlaceholder === sumPlaceholder) {
            _ELEMENT.value = _CONTENT[_PART];
            //delete cookie
            eraseCookie("key pressed");
        }

        if (currentPlaceholder !== defaultPlaceholder) {
            setCookie("key pressed", "1", "1");
        } else {
            //delete cookie
            eraseCookie("key pressed");
        }
    }

    /* Set cookie */
    function setCookie(name,value,days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days*24*60*60*1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "")  + expires + "; path=/";
    }

    /* Get cookie custom */
    function getCookieCustom(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }

    /* Delete Cookie */
    function eraseCookie(name) {
        document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }

    /* ========= END OF SEARCH SUGGESTIONS RETRIEVING, TYPING AND DELETING EFFECT */
    /* ========== */

    /* Show Autocomplete */
    function showAutocompleteBox() {
        jqAthena(".athena-autocomplete").css({'display': 'block'});
        searchForm.addClass('arrow');
    }

    /*
        Hide Autocomplete
     */
    function hideAutocompleteBox() {
        jqAthena(".athena-autocomplete").css({'display': 'none'});
    }

    /*
        Show First Click Autocomplete
     */
    function showFirstClickAutocompleteBox() {
        jqAthena(".athena-first-click").css({'display': 'block'});
        searchForm.addClass('arrow');
    }

    /*
        Hide First Click Autocomplete
     */
    function hideFirstClickAutocompleteBox() {
        jqAthena(".athena-first-click").css({'display': 'none'});
    }

    /*
        Show "No Result" Section in Autocomplete
     */
    function showNoResult(value) {
        jqAthena(".athena-no-result").show();
        jqAthena("#athena-no-result-query").html('"' + value + '"');
    }

    /*
        Hide "No Result" Section in Autocomplete
     */
    function hideNoResult() {
        jqAthena(".athena-no-result").hide();
    }

    /*
        Main Search Function
    */
    var searchForClickProduct = '';
    var currentRequest = null;
    //Creating Section for Search Tabs
    jqAthena.ajax({
        type: 'POST',
        data: {'token': websiteToken},
        url: searchTabsUrl,
        cache: true,
        success: function (searchTabs) {
            if (searchTabs.data.length > 0) {
                jqAthena('<div class="athena-search-tabs"></div>').prependTo(".athena-autocomplete");
            }
            jqAthena.each(searchTabs.data, function (i, item) {
                if (!item.checked) {
                    jqAthena('<div class="athena-tab athena-tabs-'+item.value+' athena-tabs-category-'+item.category_id+'"><input type="radio" id="'+item.name+'" class="athena-tabs-radio athena-tabs-radio-'+item.value+'" value="'+item.value+'"><label for="'+item.name+'">'+item.name+'</label></div>').appendTo(".athena-search-tabs");
                } else {
                    if (item.value != 'all') {
                        var checkedArray = item.value.split("_");
                        jqAthena.each(checkedArray, function (i, item) {
                            var catId = i+1;
                            jqAthena('<input type="hidden" id="'+item.name+'" class="athena-categories-tabs" name="category'+catId+'" value="'+item+'">').appendTo(".athena-search-tabs");
                        });
                    }
                    jqAthena('<div class="athena-tab athena-tabs-'+item.value+' athena-tabs-category-'+item.category_id+'"><input type="radio" id="'+item.name+'" class="athena-tabs-radio athena-tabs-radio-'+item.value+'" value="'+item.value+'" checked><label for="'+item.name+'">'+item.name+'</label></div>').appendTo(".athena-search-tabs");
                    if(jqAthena('.athena-tabs-radio').prop('checked', true)){
                        jqAthena('<div class="active"></div>').appendTo('athena-tab');
                    }
                }
            });

            if (typeof(jqAthena(".athena-tabs-radio:checked").val()) != "undefined" && jqAthena(".athena-tabs-radio:checked").val() !== null) {
                //
            } else {
                jqAthena(".athena-tabs-radio-0").prop('checked', true);
            }
        }
    });

    jqAthena("html").on('change', '.athena-tabs-radio', function (e) {
        jqAthena(".athena-tabs-radio").prop('checked', false);
        jqAthena("."+this.classList[1]).prop('checked', true);
        jqAthena(".athena-categories-tabs").remove();
        var checked = jqAthena(".athena-tabs-radio:checked").val();
        if (checked != 'all') {
            var checkedArray = checked.split("_");
            jqAthena.each(checkedArray, function (i, item) {
                var catId = i+1;
                jqAthena('<input type="hidden" id="'+item.name+'" class="athena-categories-tabs" name="category'+catId+'" value="'+item+'">').appendTo(".athena-search-tabs");
            });
        }
        search();
    });


    //Creating Section Div in Autocomplete
    jqAthena('<div class="athena-wrapper athena-wrapper-ac"></div>').appendTo(".athena-autocomplete");
    jqAthena('<div class="athena-flex athena-flex-ac"></div>').appendTo(".athena-wrapper");
    //Creating Section Div in Autocomplete for First Click
    jqAthena('<div class="athena-no-result" >Sorry, no results for <span id="athena-no-result-query" ></span></div>').appendTo(".athena-first-click");
    jqAthena('<div class="athena-wrapper athena-wrapper-fc"></div>').appendTo(".athena-first-click");
    jqAthena('<div class="athena-flex athena-flex-fc"></div>').appendTo(".athena-wrapper-fc");

    /*
        Main search function for Autocomplete
     */
    function search() {
        currentFocus = -1;
        let val = jqAthena('#search').val();

        if (typeof (val) == "undefined" || val.length === 0) {
            if (jqAthena(".athena-flex-fc").html().length > 0) {
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

            var searchTab = jqAthena(".athena-tabs-radio:checked").val();

            currentRequest = jqAthena.ajax({
                type: 'GET',
                data: {'token': websiteToken, 'q': val, 'autocomplete_tab': searchTab},
                url: athenaAutocompleteUrl,
                cache: true,
                beforeSend: function () {
                    if (currentRequest != null) {
                        currentRequest.abort();
                    }
                },
                success: function (data) {
                    var i_none = 0;
                    var onlyProduct = 0;
                    jqAthena(".athena-flex-ac").empty();
                    jqAthena(".athena-ac-section-banner").remove();
                    jqAthena(".athena-banner-section-banner_top").remove();
                    jqAthena(".athena-banner-section-banner_bottom").remove();
                    jqAthena.each(data.data, function (i, item) {
                        var trackSelectorClass = '';
                        if (item.type === 'product') {
                            trackSelectorClass = 'athena-product-item';
                            if (!item.items) {
                                jqAthena('.athena-search-autocomplete:first-of-type').addClass('no-product-content')
                            } else {
                                jqAthena('.athena-search-autocomplete:first-of-type').removeClass('no-product-content')
                            }
                        }

                        if (item.items) {
                            i_none = 1;

                            if (item.type === 'product') {
                                if (onlyProduct != 2) {
                                    onlyProduct = 1;
                                }
                                if (layoutType == 'athena-grid') {
                                    jqAthena('<div class="athena bigg_col big-col-ac athena-ac-sec athena-ac-section-' + item.type + ' clearfix" id="' + item.type + '" data-order="' + i + '" style="order: ' + i + '"></div>').prependTo(".athena-flex-ac");
                                } else {
                                    jqAthena('<div class="athena bigg_col big-col-ac athena-ac-sec athena-ac-section-' + item.type + ' clearfix" id="' + item.type + '" data-order="' + i + '" style="order: ' + i + '"></div>').appendTo(".athena-flex-ac");
                                }
                                jqAthena('.athena-search-tabs, testing').clone(true).appendTo('.athena-ac-section-product');
                            } else {
                                if (item.items) {
                                    onlyProduct = 2;
                                }
                                jqAthena('<div class="athena small_col small-col-ac athena-ac-sec athena-ac-section-' + item.type + ' clearfix" id="' + item.type + '" data-order="' + i + '" style="order: ' + i + '"></div>').appendTo(".athena-flex-ac");
                            }
                            //Creating Title Div in Section
                            jqAthena('<div class="athena-ac-head" id="' + item.type + '"><h4>' + item.title + '</h4></div>').appendTo(".athena-ac-section-" + item.type);

                        }

                        //Banner on Top
                        if (item.type === 'banner_top' && item.position === 'top') {
                            if (item.banners) {
                                //Creating Section Div in Autocomplete
                                jqAthena('<div class="athena athena-ac-sec athena-ac-section-' + item.type + ' athena-banner-section-' + item.type + ' clearfix banner-top" id="' + item.type + '"></div>').prependTo(".athena-autocomplete");
                                jqAthena.each(item.banners, function (n, element) {
                                    //Add Html for Banner
                                    jqAthena(element.html).prependTo(".athena-banner-section-" + item.type);
                                });
                            }
                        }

                        //Create Elements Div in Section
                        jqAthena.each(item.items, function (n, element) {
                            var item_id_selector = item.type + element.id;

                            if (element.image) {
                                jqAthena('<a href="' + element.link + '" class="athena-ac-block athena-ac-block-' + item.type + ' ' + trackSelectorClass + '" data-element-id="' + element.id + '" > <div class="athena-ac-element athena-element-' + item.type + ' clearfix" id="' + item_id_selector + '" data-name="' + element.name + '" data-type="' + item.type + '" data-id="' + element.id + '" data-terms="' + searchForClickProduct + '" data-url="' + element.link + '"><div class="athena-el-1" id="' + item_id_selector + '"> <img class="athena-img athena-img-sec-' + item.type + '" src="' + element.image + '" alt="' + element.name + '"></div><div class="athena-el-2 athena-el-2-' + item_id_selector + '" id="' + item_id_selector + '"> <span class="athena-name athena-name-sec-' + item.type + '" title="' + element.name + '">' + element.highlightedName + '</span> </div></div></a>').appendTo(".athena-ac-section-" + item.type);

                                if (element.price_int_val > 0) {
                                    if (element.price && element.sale_price && element.fictional_price) {

                                        if (parseFloat(element.price) < parseFloat(element.fictional_price)) {
                                            jqAthena('<span class="athena-price"> ' + element.autocomplete_fictional_price + ' </span><span class="athena-sale-price"> ' + element.autocomplete_sale_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);
                                        } else {
                                            jqAthena('<span class="athena-price"> ' + element.autocomplete_price + ' </span><span class="athena-sale-price"> ' + element.autocomplete_sale_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);
                                        }

                                    } else if (element.price && element.sale_price && !element.fictional_price) {

                                        jqAthena('<span class="athena-price"> ' + element.autocomplete_price + ' </span><span class="athena-sale-price"> ' + element.autocomplete_sale_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);

                                    } else if (element.price && !element.sale_price && element.fictional_price) {

                                        if (parseFloat(element.price) < parseFloat(element.fictional_price)) {
                                            jqAthena('<span class="athena-price"> ' + element.autocomplete_fictional_price + ' </span><span class="athena-sale-price"> ' + element.autocomplete_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);
                                        }

                                    } else if (element.price && !element.sale_price && !element.fictional_price) {

                                        jqAthena('<span class="athena-price-only"> ' + element.autocomplete_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);

                                    }
                                }
                            } else {

                                if (item.type != 'popular') {
                                    jqAthena('<a href="' + element.link + '" class="athena-ac-block athena-ac-block-' + item.type + ' ' + trackSelectorClass + '" data-element-id="' + element.id + '" ><div class="athena athena-ac-element athena-element-' + item.type + '-no-image clearfix" id="' + item_id_selector + '" data-name="' + element.name + '" data-type="' + item.type + '" data-id="' + element.id + '" data-terms="' + searchForClickProduct + '" data-url="' + element.link + '"><div class="athena-el-2 athena-el-2-' + item_id_selector + '" id="' + item_id_selector + '"> <span class="athena-name athena-name-sec-' + item.type + '">' + element.highlightedName + '</span> </div> </div></a>').appendTo(".athena-ac-section-" + item.type);
                                } else {
                                    jqAthena('<a href="' + landingPageUrl + element.name_urlencoded + '" class="athena-ac-block athena-ac-block-' + item.type + ' ' + trackSelectorClass + '" data-element-id="' + element.id + '" ><div class="athena athena-ac-element athena-element-' + item.type + '-no-image clearfix" id="' + item_id_selector + '" data-name="' + element.name + '" data-type="' + item.type + '" data-id="' + element.id + '" data-terms="' + searchForClickProduct + '" data-url="' + element.link + '"><div class="athena-el-2 athena-el-2-' + item_id_selector + '" id="' + item_id_selector + '"> <span class="athena-name athena-name-sec-' + item.type + '">' + element.highlightedName + '</span> </div> </div></a>').appendTo(".athena-ac-section-" + item.type);
                                }
                                if (element.price_int_val > 0) {
                                    if (element.price && element.sale_price && element.fictional_price) {

                                        if (parseFloat(element.price) < parseFloat(element.fictional_price)) {
                                            jqAthena('<span class="athena-price"> ' + element.autocomplete_fictional_price + ' </span><span class="athena-sale-price"> ' + element.autocomplete_sale_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);
                                        } else {
                                            jqAthena('<span class="athena-price"> ' + element.autocomplete_price + ' </span><span class="athena-sale-price"> ' + element.autocomplete_sale_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);
                                        }

                                    } else if (element.price && element.sale_price && !element.fictional_price) {

                                        jqAthena('<span class="athena-price"> ' + element.autocomplete_price + ' </span><span class="athena-sale-price"> ' + element.autocomplete_sale_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);

                                    } else if (element.price && !element.sale_price && element.fictional_price) {

                                        if (parseFloat(element.price) < parseFloat(element.fictional_price)) {
                                            jqAthena('<span class="athena-price"> ' + element.autocomplete_fictional_price + ' </span><span class="athena-sale-price"> ' + element.autocomplete_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);
                                        }

                                    } else if (element.price && !element.sale_price && !element.fictional_price) {

                                        jqAthena('<span class="athena-price-only"> ' + element.autocomplete_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);

                                    }
                                }
                            }
                        });

                        //Banner on Bottom
                        if (item.type === 'banner_bottom' && item.position === 'bottom') {
                            if (item.banners) {
                                //Creating Section Div in Autocomplete
                                jqAthena('<div class="athena athena-ac-sec athena-ac-section-' + item.type + ' athena-banner-section-' + item.type + ' clearfix banner-bottom" id="' + item.type + '"></div>').appendTo(".athena-autocomplete");
                                jqAthena.each(item.banners, function (n, element) {
                                    //Add Html for Banner
                                    jqAthena(element.html).prependTo(".athena-banner-section-" + item.type);
                                });
                            }
                        }

                        if (item.type === 'tabsCount') {
                            jqAthena.each(item.counts, function (n, element) {
                                if (element.count === 0) {
                                    jqAthena(".athena-tabs-category-"+element.id).hide();
                                } else {
                                    jqAthena(".athena-tabs-category-"+element.id).show();
                                }
                            });
                        }

                        if (item === 'all') {
                            jqAthena(".athena-tabs-radio").prop('checked', false);
                            jqAthena(".athena-tabs-radio-all").prop('checked', true);
                            jqAthena(".athena-categories-tabs").remove();
                        }
                    });


                    var maximumData = null;
                    jqAthena('#search_autocomplete .athena-flex .athena').each(function () {
                        var valueData = jqAthena(this).attr('data-order');
                        maximumData = (valueData > maximumData) ? valueData : maximumData;
                    });
                    jqAthena('#search_autocomplete .athena-flex .athena').each(function () {
                        if (maximumData == jqAthena(this).attr('data-order')) {
                            jqAthena(this).removeClass('last-search-result')
                            jqAthena(this).addClass('last-search-result')
                        }
                    });

                    if (onlyProduct == 1) {
                        jqAthena('.athena-search-autocomplete:first-of-type').addClass('only-product');
                    } else {
                        jqAthena('.athena-search-autocomplete:first-of-type').removeClass('only-product')
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

                    jqAthena("#numRes").val(i_none);
                }
            });
        }
    }

    /*
        Delay Function
    */
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

    /*
        Event KeyUp
    */
    jqAthena('#search').keyup(delay(function (e) {
        if (e.keyCode == 13 || e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40) {
            if (e.keyCode == 13) {
                if (currentRequest != null) {
                    currentRequest.abort();
                }
                hideAutocompleteBox();
                hideFirstClickAutocompleteBox();
            }
            return false;
        }
        search();
    }, 100));

    /*
        Disable on Keyword Enter click on autocomplete items
     */
    jqAthena(window).keydown(function (e) {
        if (e.keyCode == 13) {
            jqAthena("#currentFocus").val(-1);
        }
    });

    /*
        Click on product in autocomplete
     */
    jqAthena("header").on('mousedown touchstart', domSelector, function (e) {
        if (e.type === 'touchstart') {
            productClick(e, 'autocomplete');
        } else if (e.type === 'mousedown') {
            switch (e.which) {
                case 1:
                    //left Click
                    productClick(e, 'autocomplete');
                    break;
                case 2:
                    //middle Click
                    productClick(e, 'autocomplete');
                    break;
            }
        }
    });

    /*
        Get Cookie by key
     */
    function getCookie(key) {
        var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
        return keyValue ? keyValue[2] : null;
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
            token = 'anonymous-' + Math.random().toString(36).substr(2, 9) + '-' + Math.random().toString(26).substr(2, 9);
            Cookies.set("_athena", token, {path: '/'});
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
            var productElement = jqAthena("#product" + productId);
            searchKeywords = "First Click,";

            userToken();
            searchHistory(productId);

            if (productElement.length) {
                searchKeywords = productElement[0].dataset.terms;
            }

            jqAthena.ajax({
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
        Function for first click
     */
    function firstClick() {
        currentFocus = -1;
        jqAthena.get(athenaAutocompleteFirstClickUrl, {
            'token': websiteToken
        }, function (data) {
            var i_none = 0;
            jqAthena(".athena-ac-sec").remove();

            jqAthena.each(data.data, function (i, item) {
                var trackSelectorClass = '';
                if (item.items) {
                    i_none = 1;
                    if (item.type === 'first-product') {
                        trackSelectorClass = 'athena-product-item';
                        jqAthena('<div class="athena bigg_col bigg-col-fc athena-ac-sec athena-ac-section-' + item.type + ' clearfix" id="' + item.type + '"></div>').appendTo(".athena-flex-fc");
                    } else {
                        jqAthena('<div class="athena small_col small-col-fc athena-ac-sec athena-ac-section-' + item.type + ' clearfix" id="' + item.type + '"></div>').appendTo(".athena-flex-fc");
                    }
                    //Creating Title Div in Section
                    jqAthena('<div class="athena-ac-head" id="' + item.type + '"><h4>' + item.title + '</h4></div>').appendTo(".athena-ac-section-" + item.type);

                }

                //Banner on Top
                if (item.type === 'banner_top' && item.position === 'top') {
                    if (item.banners) {
                        //Creating Section Div in Autocomplete
                        jqAthena('<div class="athena athena-ac-sec athena-ac-section-' + item.type + ' athena-fc-banner-section-' + item.type + ' clearfix banner-top" id="' + item.type + '"></div>').prependTo(".athena-first-click");
                        jqAthena.each(item.banners, function (n, element) {
                            //Add Html for Banner
                            jqAthena(element.html).prependTo(".athena-fc-banner-section-" + item.type);
                        });
                    }
                }

                //Create Elements Div in Section
                jqAthena.each(item.items, function (n, element) {
                    var item_id_selector = item.type + element.id;

                    if (element.image) {
                        jqAthena('<a href="' + element.link + '" class="athena-ac-block athena-ac-block-' + item.type + ' ' + trackSelectorClass + '" data-element-id="' + element.id + '" > <div class="athena-ac-element athena-element-' + item.type + ' clearfix" id="' + item_id_selector + '" data-name="' + element.name + '" data-type="' + item.type + '" data-id="' + element.id + '" data-terms="' + searchForClickProduct + '" data-url="' + element.link + '"><div class="athena-el-1" id="' + item_id_selector + '"> <img class="athena-img athena-img-sec-' + item.type + '" src="' + element.image + '" alt="' + element.name + '"></div><div class="athena-el-2 athena-el-2-' + item_id_selector + '" id="' + item_id_selector + '"> <span class="athena-name athena-name-sec-' + item.type + '" title="' + element.name + '">' + element.name + '</span> </div></div></div></a>').appendTo(".athena-ac-section-" + item.type);

                        if (element.price && element.sale_price && element.fictional_price) {

                            if (parseFloat(element.price) < parseFloat(element.fictional_price)) {
                                jqAthena('<span class="athena-price"> ' + element.autocomplete_fictional_price + ' </span><span class="athena-sale-price"> ' + element.autocomplete_sale_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);
                            } else {
                                jqAthena('<span class="athena-price"> ' + element.autocomplete_price + ' </span><span class="athena-sale-price"> ' + element.autocomplete_sale_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);
                            }

                        } else if (element.price && element.sale_price && !element.fictional_price) {

                            jqAthena('<span class="athena-price"> ' + element.autocomplete_price + ' </span><span class="athena-sale-price"> ' + element.autocomplete_sale_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);

                        } else if (element.price && !element.sale_price && element.fictional_price) {

                            if (parseFloat(element.price) < parseFloat(element.fictional_price)) {
                                jqAthena('<span class="athena-price"> ' + element.autocomplete_fictional_price + ' </span><span class="athena-sale-price"> ' + element.autocomplete_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);
                            }

                        } else if (element.price && !element.sale_price && !element.fictional_price) {

                            jqAthena('<span class="athena-price-only"> ' + element.autocomplete_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);

                        }
                    } else {
                        if (item.type != 'first-popular') {
                            jqAthena('<a href="' + element.link + '" class="athena-ac-block athena-ac-block-' + item.type + ' ' + trackSelectorClass + '" data-element-id="' + element.id + '" > <div class="athena athena-ac-element athena-element-' + item.type + '-no-image clearfix" id="' + item_id_selector + '" data-name="' + element.name + '" data-type="' + item.type + '" data-id="' + element.id + '" data-terms="' + searchForClickProduct + '" data-url="' + element.link + '"><div class="athena-el-2 athena-el-2-' + item_id_selector + '" id="' + item_id_selector + '"> <span class="athena-name athena-name-sec-' + item.type + '">' + element.name + '</span> </div> </div></a>').appendTo(".athena-ac-section-" + item.type);
                        } else {
                            jqAthena('<a href="' + landingPageUrl + element.name_urlencoded + '" class="athena-ac-block athena-ac-block-' + item.type + ' ' + trackSelectorClass + '" data-element-id="' + element.id + '" > <div class="athena athena-ac-element athena-element-' + item.type + '-no-image clearfix" id="' + item_id_selector + '" data-name="' + element.name + '" data-type="' + item.type + '" data-id="' + element.id + '" data-terms="' + searchForClickProduct + '" data-url="' + element.link + '"><div class="athena-el-2 athena-el-2-' + item_id_selector + '" id="' + item_id_selector + '"> <span class="athena-name athena-name-sec-' + item.type + '">' + element.name + '</span> </div> </div></a>').appendTo(".athena-ac-section-" + item.type);
                        }


                        if (element.price && element.sale_price && element.fictional_price) {

                            if (parseFloat(element.price) < parseFloat(element.fictional_price)) {
                                jqAthena('<span class="athena-price"> ' + element.autocomplete_fictional_price + ' </span><span class="athena-sale-price"> ' + element.autocomplete_sale_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);
                            } else {
                                jqAthena('<span class="athena-price"> ' + element.autocomplete_price + ' </span><span class="athena-sale-price"> ' + element.autocomplete_sale_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);
                            }

                        } else if (element.price && element.sale_price && !element.fictional_price) {

                            jqAthena('<span class="athena-price"> ' + element.autocomplete_price + ' </span><span class="athena-sale-price"> ' + element.autocomplete_sale_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);

                        } else if (element.price && !element.sale_price && element.fictional_price) {

                            if (parseFloat(element.price) < parseFloat(element.fictional_price)) {
                                jqAthena('<span class="athena-price"> ' + element.autocomplete_fictional_price + ' </span><span class="athena-sale-price"> ' + element.autocomplete_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);
                            }

                        } else if (element.price && !element.sale_price && !element.fictional_price) {

                            jqAthena('<span class="athena-price-only"> ' + element.autocomplete_price + ' </span>').appendTo(".athena-el-2-" + item_id_selector);

                        }
                    }
                });

                //Banner on Bottom
                if (item.type === 'banner_bottom' && item.position === 'bottom') {
                    if (item.banners) {
                        //Creating Section Div in Autocomplete
                        jqAthena('<div class="athena athena-ac-sec athena-ac-section-' + item.type + ' athena-fc-banner-section-' + item.type + ' clearfix banner-bottom" id="' + item.type + '"></div>').appendTo(".athena-first-click");
                        jqAthena.each(item.banners, function (n, element) {
                            //Add Html for Banner
                            jqAthena(element.html).prependTo(".athena-fc-banner-section-" + item.type);
                        });
                    }
                }
            });

            jqAthena("#numRes").val(i_none);
            if (i_none === 1) {
                showFirstClickAutocompleteBox();
                hideNoResult();
            } else {
                hideFirstClickAutocompleteBox();
                searchForm.removeClass('arrow');
            }
            hideAutocompleteBox();
        });
    }

    /*
        Disable button after submit search form
     */
    jqAthena('#search_mini_form').submit(function (e) {

        var val1 = jqAthena('#search').val();
        let currentFocus = jqAthena("#currentFocus").val();

        if (val1.trim() == "" && parseInt(currentFocus) == -1) {
            e.preventDefault();
        } else {
            jqAthena(".action-search").prop('disabled', true);
        }

        if (currentRequest != null) {
            currentRequest.abort();
        }
        hideAutocompleteBox();
        hideFirstClickAutocompleteBox();

        if (currentFocus != "-1") {

            /*If the ENTER key is pressed*/
            let array = jqAthena(".athena-ac-element");
            let element_id = array[currentFocus].id;
            let id_selector = jqAthena("#" + element_id);

            if (id_selector.data("type")) {

                jqAthena(".athena-search-autocomplete").css({'display': 'none'});

                let id = id_selector.data("id");
                let terms = id_selector.data("terms");
                let type = id_selector.data("type");
                let url = id_selector.data("url");

                jqAthena("#athena_id").val(id);
                jqAthena("#athena_terms").val(terms);
                jqAthena("#athena_url").val(url);

                jqAthena("#athena_type").val(type);
            }

            let select_val = id_selector.children("input").val();
            jqAthena("#search").val(select_val);

            if (id_selector.data("type") == 'popular' || id_selector.data("type") == 'first-popular') {
                jqAthena("#search").val(id_selector.data("name"));
            }

        }
    });

    /*
        Event OnClick
    */
    jqAthena(document).on('click vclick', function (event) {
        let tar = event.target.id;
        let tarClass = event.target.classList[0];
        let tagName = event.target.tagName;
        let event_type = event.type;
        let tarParentClass = event.target.parentElement.classList[0];

        let val = jqAthena('#search').val();
        let res = jqAthena("#numRes").val();
        //Current Focus
        currentFocus = -1;
        jqAthena(".syncit-autocomplete-focus").removeClass('syncit-autocomplete-focus');

        if (tar === 'search' || tar === 'search_autocomplete' || tar === 'athena-first-click' || tarClass === 'athena' || tarClass === 'action-search' || tarClass === 'pe-7s-search' || tagName === 'H4' || event_type === 'touchmove' || tarParentClass === 'athena-autocomplete' || tarParentClass === 'athena-tab') {
            jqAthena(".search-form").addClass('overlay');
            if (val.trim() === "") {
                if (jqAthena(".athena-flex-fc").html().length > 0) {
                    showFirstClickAutocompleteBox()
                    hideAutocompleteBox();
                } else {
                    firstClick();
                }
            } else if (res == "0") {
                jqAthena(".search-close").addClass("active");
                jqAthena(".search-form").addClass("active");
                jqAthena("#search").focus();
                hideAutocompleteBox();
                showFirstClickAutocompleteBox();
            } else {
                jqAthena(".search-close").addClass("active");
                jqAthena(".search-form").addClass("active");
                showAutocompleteBox();
                jqAthena("#search").focus();
                hideFirstClickAutocompleteBox();
                showAutocompleteBox();
            }
        } else {
            jqAthena(".search-close").removeClass("active");
            jqAthena(".search-form").removeClass("active overlay");
            hideAutocompleteBox();
            hideFirstClickAutocompleteBox();
            searchForm.removeClass('arrow');
            jqAthena("html, body").removeClass('noscroll');
        }
    });

    jqAthena(document).mouseup(function (event) {
        if (event.target === jqAthena('html')[0] && event.clientX >= document.documentElement.offsetWidth) {
            if (window.innerWidth >= 992) {
                hideAutocompleteBox();
                hideFirstClickAutocompleteBox();
                searchForm.removeClass('arrow');
                jqAthena(".search-form").removeClass("overlay");
            }
        }
    });

    jqAthena(document).on("touchstart", ".athena-wrapper", function () {
        jqAthena("#search").blur();
    });
    jqAthena(document).on("touchmove", function () {
        // let val = jqAthena('#search').val();
        if (!jqAthena('.athena-autocomplete').is(':visible') && !jqAthena('.athena-first-click').is(':visible')) {
            jqAthena(".search-close").removeClass("active");
            jqAthena(".search-form").removeClass("active overlay");
            hideAutocompleteBox();
            hideFirstClickAutocompleteBox();
            searchForm.removeClass('arrow');
            jqAthena("html, body").removeClass('noscroll');
            jqAthena("#search").blur();
        }
    });

    /*
        Clear Search
     */
    jqAthena("#search").val("");

    /*
        Search Focus
     */
    let inp = jqAthena("#search");
    let currentFocus = -1;

    inp.on("keydown", function (e) {
        let keyCode = e.keyCode;
        let total_num_search = jqAthena(".athena-ac-element").length;

        jqAthena(".syncit-autocomplete-focus").removeClass('syncit-autocomplete-focus');

        if (keyCode == 40) {
            /*If the arrow DOWN key is pressed*/

            currentFocus++;
            if (currentFocus === total_num_search) {
                currentFocus = 0;
            }

            let array = jqAthena(".athena-ac-element");
            let element_id = array[currentFocus].id;

            let id_selector = jqAthena("#" + element_id);

            id_selector.addClass('syncit-autocomplete-focus');

        } else if (keyCode == 38) {
            /*If the arrow UP key is pressed*/

            let array = jqAthena(".athena-ac-element");
            currentFocus--;

            if (currentFocus < 0) {
                currentFocus = total_num_search - 1;
            }

            let element_id = array[currentFocus].id;
            let id_selector = jqAthena("#" + element_id);
            id_selector.addClass('syncit-autocomplete-focus');
        } else if (keyCode == 37) {

            currentFocus = -1;
            jqAthena("#currentFocus").val(currentFocus);
        } else if (keyCode == 39) {

            currentFocus = -1;
            jqAthena("#currentFocus").val(currentFocus);
        } else {
            jqAthena("#athena_type").val('search');
        }

        jqAthena("#currentFocus").val(currentFocus);
    });

    /*
        Mouseover Focus
     */
    jqAthena(".block-search,.site-search").on('vclick', function (e) {
        let element_class = e.target.classList[1];
        let element_class_0 = e.target.classList[0];
        let tagName = e.target.tagName;
        var href = '';

        if (element_class == 'athena-ac-element' || element_class == 'athena-element-first-product') {

            if (typeof e.target.closest("a") != 'undefined') {
                href = e.target.closest("a").href;
            }
            if (href != '') {
                window.location.href = href;
            }
            return false;
        }

        if (element_class_0 == 'athena-img' || element_class_0 == 'athena-name' || element_class_0 == 'athena-price-only' || element_class_0 == 'athena-price' || element_class_0 == 'athena-sale-price') {
            if (typeof e.target.closest("a") != 'undefined') {
                href = e.target.closest("a").href;
            }
            if (href != '') {
                window.location.href = href;
            }
            return false;
        }

        if (element_class_0 == 'athena-highlight' || element_class_0 == 'highlightSearchFont') {
            if (typeof e.target.closest("a") != 'undefined') {
                href = e.target.closest("a").href;
            }
            if (href != '') {
                window.location.href = href;
            }
            return false;
        }


        if (element_class != 'athena-ac-element' && tagName != 'B' && tagName != 'SPAN' && element_class_0 != 'athena-img' && element_class_0 != 'athena-el-2' && element_class_0 != 'athena-sale-price' && element_class_0 != 'athena-name' && element_class_0 != 'athena-highlight') {
            jqAthena(".syncit-autocomplete-focus").removeClass('syncit-autocomplete-focus');
            jqAthena("#athena_type").val('search');
            currentFocus = -1;
        }
    });

    jqAthena(".header-toggles").on('click', function (e) {
        if (jqAthena(".athena-flex-fc").html().length > 0) {
            setTimeout(function() {
                showFirstClickAutocompleteBox();
                hideNoResult();
                hideAutocompleteBox();
            }, 250);
        } else {
            firstClick();
        }
    });

    jqAthena('.block-search,.site-search').mouseleave(function () {
        currentFocus = -1;
        jqAthena("#currentFocus").val(currentFocus);
        jqAthena(".syncit-autocomplete-focus").removeClass('syncit-autocomplete-focus');
    });
});