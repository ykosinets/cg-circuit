var browsePageCurPage = 1;
var filtersData = {
  currentCategory: null,
  currentSubCategory: null,
  currentContentType: null,
  filters: null
};
var contentData = null;
var allContentData = null;
var originalFiltersData = null;
var maxFiltersSectionsOpen = 6;
var numShownFilter = 4;
var categoryId = "category_id";
var filtersTemplate;
var browseContentSelectedCourseId;

var searchString;
var activeFilters = {
  "category": null, "subcategory": null,
  "author": null, "price": null, "software": null, "level": null, "bundles": null, "exclusiveContent": null
};
var categoryFilter;
var subcategoryFilter;
var authorFilter;
var priceFilter;
var softwareFilter;
var levelFilter;
var paginationSettings;
var xStripeKey;
var firstTime = "yes";
//var planID=null;

var disableBundles = false;
var disableExclusiveContent = false;

$(document).ready(function () {
  filtersTemplate = $(".main-filter-list")[0].outerHTML;

  getData();

  // check if the URL has a search string to we minimiza the number of content
  // to show in the page
  searchString = GetQueryStringParams("search");

  if (searchString) {
    var lowerStr = searchString.toLowerCase();
    applySearchFilter(lowerStr);
  }
  $(".main-content").css("visibility", "visible");
  $("#loading-container").css("display", "none");

  $("#all-bundles-crum").click(function () {
    // var url = window.location.pathname;
    // var filename = url.substring(url.lastIndexOf('/')+1);
    // window.location.href = filename+'?bundles=yes';
    if (!disableBundles) {
      window.history.replaceState({}, '', '?bundles=yes');
      $('#all-categories-crum').text("All Content (Bundles Only)");
      getActiveFilters();
      filterData();
      lessonFilterCounter();
      populateContent();
      populateFilters();
      refreshPagination();
    }

    disableBundles = false;

    //$("#category-crumb a").html("Bundles only");
    //$(".breadcrumb .divider").first().show();


  });
  $("#exclusiveContent").click(function () {
    // var url = window.location.pathname;
    // var filename = url.substring(url.lastIndexOf('/')+1);
    // window.location.href = filename+'?bundles=yes';
    if (!disableExclusiveContent) {
      window.history.replaceState({}, '', '?exclusiveContent=yes');
      $('#all-categories-crum').text("All Content (Exclusive Content Only)");
      getActiveFilters();
      filterData();
      lessonFilterCounter();
      populateContent();
      populateFilters();
      refreshPagination();
    }

    disableExclusiveContent = false;

    //$("#category-crumb a").html("Bundles only");
    //$(".breadcrumb .divider").first().show();


  });
  $("#all-bundles-crum-delete").click(function () {
    disableBundles = true;
    $("#all-categories-crum").trigger("click");
  });
  $("#exclusiveContent-delete").click(function () {
    disableExclusiveContent = true;
    $("#all-categories-crum").trigger("click");
  });

  // var data = {
  // 	UserPoolId: COGNITO_USER_POOL_ID,
  // 	ClientId: COGNITO_USER_POOL_CLIENT_ID

  // };
  // var userPool = new AmazonCognitoIdentity.CognitoUserPool(data);
  // var cognitoUser = userPool.getCurrentUser();

  // try {
  // 	if (cognitoUser != null) {
  // 		cognitoUser.getSession(function(err, session) {
  // 			if (err) {
  // 				console.log(err.message);
  // 			}else{
  // 				console.log(session)
  // 			}
  // 			//passing dynamically the user pool id along with some constants
  // 			paramsCredentials.Logins[YOUR_USER_POOL_ID_IDP] = session.getIdToken().getJwtToken();


  // 		});
  // 	} else {
  // 		console.log("no cognito user")
  // 	}
  // } catch (e) {
  // 	console.log(e);

  // }
});

function GetQueryStringParams(sParam) {
  var sPageURL = window.location.search.substring(1);
  var sURLVariables = sPageURL.split('&');
  for (var i = 0; i < sURLVariables.length; i++) {
    var sParameterName = sURLVariables[i].split('=');
    if (sParameterName[0] == sParam) {
      return sParameterName[1];
    }
  }
}

function RemoveQueryStringParams(sParam) {
  var sPageURL = window.location.search.substring(1);
  var sURLVariables = sPageURL.split('&');
  var newQStringsList = [];
  var newQStrings = "?";
  for (var i = 0; i < sURLVariables.length; i++) {
    var sParameterName = sURLVariables[i].split('=');
    if (sParameterName[0] != sParam) {
      // make a string out of the query strings we need to keep
      newQStringsList.push(sURLVariables[i]);
    }
  }
  for (var i = 0; i < newQStringsList.length; i++) {
    newQStrings += newQStringsList[i];
    if (i != (newQStringsList.length - 1)) {
      newQStrings += "&";
    }

  }
  return newQStrings;
}

function getData() {
  getActiveFilters();

  var datastring = "category=" + activeFilters["category"] +
    "&subcategory=" + activeFilters["subcategory"] +
    "&author=" + activeFilters["author"] +
    "&price=" + activeFilters["price"] +
    "&software=" + activeFilters["software"] +
    "&level=" + activeFilters["level"] +
    "&bundles=" + activeFilters["bundles"] +
    "&contenttype=" + activeFilters["contenttype"] +
    "&firsttime=" + firstTime;
  var url;
  if ((window.location.pathname.indexOf(".html") > -1)) {
    url = "/modules/browsepage/js/browsepage-content.json";
  } else {
    url = "/modules/browsepage/php/filter.php";
  }

  var storageData = null;//JSON.parse(sessionStorage.getItem('browsepageData'));

  if (storageData !== null && Math.floor(Date.now() / 1000) < storageData.expireAt) {
    dataReady(storageData.data);
  } else {

// $.ajax({
// 	    type: 'GET',
// 	    async:true,
// 	    cache: false,
// 	    timeout: 10000,
// 	    dataType: 'json',
// 	    url: 'https://d3mbb2njwzde3x.cloudfront.net/browsepage/browsepage.json',

// 	    success: function(data, statusText){
// 			dataReady(data);
// 		}
// 	});

    $.ajax({
      type: 'POST',
      data: datastring,
      async: false,
      cache: false,
      timeout: 10000,
      dataType: 'json',
      url: url,

      success: function (data, statusText) {
        console.log(data);
        dataReady(data);
        var temp = {
          expireAt: Math.floor(Date.now() / 1000) + 5 * 60, // 5 minutes
          data: data
        };
        sessionStorage.setItem('browsepageData', JSON.stringify(temp));
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        alert(errorThrown);

      }

    });
  }

}

function dataReady(data) {
  originalFiltersData = data[1].newFilters.slice(0);
  filtersData.filters = [
    data[1].newFilters[5],
    data[1].newFilters[2],
    {id: "subcategory", title: "SubCategories", subfilters: null},
    data[1].newFilters[4],
    data[1].newFilters[0],
    data[1].newFilters[1],
    data[1].newFilters[3],

  ];
  contentData = data[0].siteContent;
  allContentData = data[0].siteContent.slice(0);

  filterData();
  lessonFilterCounter();
  populateContent();
  populateFilters();
  refreshPagination();
  firstTime = "no";
}

function setModalBindings() {
  var selectedId = browseContentSelectedCourseId;
  var bgImage = "";
  $("#content-info-modal .item.active #play-preview-" + selectedId).click(function () {
    $(this).parents(".course-banner").first().css("height", "auto");
    jwplayer("preview-player-" + selectedId).setup({
      file: $(this).attr("rel"),
      rtmp: {
        bufferlength: 0.3
      },
      aspectratio: "16:9",
      primary: "flash",
      width: "100%"
    });

    $("#content-info-modal .item.active #player-container-" + selectedId).fadeIn();

    jwplayer("preview-player-" + selectedId).onReady(function () {
      jwplayer("preview-player-" + selectedId).play();
    })

  });

  $("#content-info-modal .item.active #close-preview-" + selectedId).click(function () {
    unloadPreviewPlayer(this);
  });
}

// function unloadPreviewPlayer(itemObj){
// var item = $(itemObj);
// var selectedId = browseContentSelectedCourseId;
// $("#player-container-"+selectedId).fadeOut();
// jwplayer("preview-player-"+selectedId).onReady(function(){
// jwplayer("preview-player-"+selectedId).remove();
// });
// item.parents(".course-banner").first().css("height", "16vh");
// }

function populateContent(pageNum) {

  if (pageNum == undefined) {
    var pageQueryString = GetQueryStringParams("page");
    if (pageQueryString != undefined) {
      pageNum = parseInt(pageQueryString);
    } else {
      pageNum = 1;
    }
  }
  order = $('#sorting-options').val();
  switch (order) {
    case "alphabetical":
      contentData = contentData.sort(function (a, b) {
        return (a.title.toLowerCase() > b.title.toLowerCase()) ? 1 : ((b.title.toLowerCase() > a.title.toLowerCase()) ? -1 : 0);
      });
      break;
    case "alphabeticalReverse":
      contentData = contentData.sort(function (a, b) {
        return (a.title.toLowerCase() < b.title.toLowerCase()) ? 1 : ((b.title.toLowerCase() < a.title.toLowerCase()) ? -1 : 0);
      });
      break;
    case "mostWatched":
      contentData = contentData.sort(function (a, b) {
        return (a.title.toLowerCase() > b.title.toLowerCase()) ? 1 : ((b.title.toLowerCase() > a.title.toLowerCase()) ? -1 : 0);
      });
      contentData = contentData.sort(function (a, b) {
        return (a.watchedAmount < b.watchedAmount) ? 1 : ((b.watchedAmount < a.watchedAmount) ? -1 : 0);
      });
      break;
    case "bestRated":
      contentData = contentData.sort(function (a, b) {
        return (a.title.toLowerCase() > b.title.toLowerCase()) ? 1 : ((b.title.toLowerCase() > a.title.toLowerCase()) ? -1 : 0);
      });
      contentData = contentData.sort(function (a, b) {
        return (a.numStars < b.numStars) ? 1 : ((b.numStars < a.numStars) ? -1 : 0);
      });
      break;
    case "newest":
      contentData = contentData.sort(function (a, b) {
        return (a.title.toLowerCase() > b.title.toLowerCase()) ? 1 : ((b.title.toLowerCase() > a.title.toLowerCase()) ? -1 : 0);
      });
      contentData = contentData.sort(function (a, b) {
        return (a.publishDateTimestamp < b.publishDateTimestamp) ? 1 : ((b.publishDateTimestamp < a.publishDateTimestamp) ? -1 : 0);
      });
      break;
    case "oldest":
      contentData = contentData.sort(function (a, b) {
        return (a.title.toLowerCase() > b.title.toLowerCase()) ? 1 : ((b.title.toLowerCase() > a.title.toLowerCase()) ? -1 : 0);
      });
      contentData = contentData.sort(function (a, b) {
        return (a.publishDateTimestamp > b.publishDateTimestamp) ? 1 : ((b.publishDateTimestamp > a.publishDateTimestamp) ? -1 : 0);
      });
      break;
    case "priceHighFirst":
      contentData = contentData.sort(function (a, b) {
        return (a.title.toLowerCase() > b.title.toLowerCase()) ? 1 : ((b.title.toLowerCase() > a.title.toLowerCase()) ? -1 : 0);
      });
      contentData = contentData.sort(function (a, b) {
        return (a.purchasePrice < b.purchasePrice) ? 1 : ((b.purchasePrice < a.purchasePrice) ? -1 : 0);
      });
      break;
    case "priceLowFirst":
      contentData = contentData.sort(function (a, b) {
        return (a.title.toLowerCase() > b.title.toLowerCase()) ? 1 : ((b.title.toLowerCase() > a.title.toLowerCase()) ? -1 : 0);
      });
      contentData = contentData.sort(function (a, b) {
        return (a.purchasePrice > b.purchasePrice) ? 1 : ((b.purchasePrice > a.purchasePrice) ? -1 : 0);
      });
      break;
    default:
      contentData = contentData.sort(function (a, b) {
        return (a.title.toLowerCase() > b.title.toLowerCase()) ? 1 : ((b.title.toLowerCase() > a.title.toLowerCase()) ? -1 : 0);
      });
  }

  var tmp = "";

  var pageCount = 0;
  var visiblePages = 5;

  var containerW = $("#content-list").width();
  var itemsPerPage = containerW > 1440 ? 20 : 15;

  var pagesData = [];
  var pagesHtml = [];

  template = $("#thumbnail-template .content-item")[0].outerHTML;

  // divide the json by the number of tutorials we want to see per page
  var cData = contentData;
  while (cData.length) {
    pagesData.push(cData.splice(0, itemsPerPage));
  }
  contentData = contentData.concat.apply(contentData, pagesData);

  $.each(pagesData, function (a, pdata) {
    var thumbnails = "";
    $.each(pdata, function (index, content) {
      tmp = $(template);
      tmp.attr('id', content.id);
      var thumbImage = content.fullThumbnail;

      tmp.find(".cgcThumb-container").css('background-image', ("url(" + thumbImage + ")"));
      tmp.find(".content-title").html(content.title);

      if (content.authorImg) {
        tmp.find(".author-img").attr("src", content.authorImg);
      }

      tmp.find(".purchase-price-amount").html("$" + content.purchasePrice);

      tmp.find(".content-price").attr("onclick", xiduser > 0 ? content.buy : content.buyTemp);
      tmp.find(".content-buy-now").first().attr("onclick", content.buynow);
      tmp.find(".content-buy-now").show();

      tmp.find(".purchase-price-amount").addClass("label-info");
      tmp.find(".purchase-price-amount").removeClass("label-danger");
      tmp.find(".purchase-price-amount").attr("style", "");
      if (content.purchasePrice == "0") {
        tmp.find(".purchase-price-amount").html("FREE");
        tmp.find(".content-buy-now").hide();
        tmp.find(".content-price").html("<i class='fa fa-plus'></i> Add to my Library");
        tmp.find(".content-price").attr("onclick", content.buy);
      } else {
        if (content.purchasePrice != content.originalPrice) {
          tmp.find(".purchase-price-amount").html("$" + content.originalPrice);
          tmp.find(".purchase-price-amount").attr("style", "text-decoration: line-through");

          tmp.find(".purchase-price-discounted").html("$" + content.purchasePrice);
          tmp.find(".purchase-price-discounted").removeClass("hidden");
          if (content.itemType == "bundle") {
            tmp.find(".purchase-price-amount").html("$" + content.purchasePrice);
            tmp.find(".purchase-price-amount").attr("style", "");
            tmp.find(".purchase-price-amount").removeClass("label-info");
            tmp.find(".purchase-price-amount").addClass("label-danger");
            tmp.find(".purchase-price-discounted").addClass("hidden");
          }
        }
      }


      tmp.find(".author-name").html(content.author);

      // if the rentPrice value is null we will remove the tag for rent
      // price
      if (content.rentPrice != null && content.rentPrice != "0.00") {
        tmp.find(".rent-price-amount").html("$" + content.rentPrice);
        tmp.find(".rent-price").attr("onclick", content.buyrent);
        tmp.find(".rent-word").html("rent ");
        tmp.find(".rent-price").show();

      } else {
        // tmp.find(".rent-price").hide();
        if (content.buyunlisted != null) {
          tmp.find(".rent-price-amount").html("$" + content.priceunlisted);
          tmp.find(".rent-price").attr("onclick", content.buyunlisted);
          tmp.find(".rent-word").html("Unguided ");
          if (content.priceunlisted != content.originalPriceunlisted) {
            tmp.find(".rent-price").attr("style", "background-color:red;color:white;");
          }
          tmp.find(".rent-price").show();
        } else {
          tmp.find(".rent-price").hide();
        }
      }

      if (planID != null && planID != 'cgc-free') {
        //planID=content.planID;
        tmp.find(".buy-content-md>i").first().removeClass("fa-shopping-cart");
        tmp.find(".buy-content-md>i").first().removeClass("fa-plus-sign");
        tmp.find(".buy-content-md>i").first().addClass("fa-play-circle");
        tmp.find(".content-price-amount").first().text("Play the Course");
        tmp.find(".buy-content-md").first().attr("onclick", xiduser > 0 ? content.buy : content.buyTemp);
        tmp.find(".purchase-price-amount").html("");
        tmp.find(".purchase-price-discounted").html("");
        tmp.find(".purchase-price-discounted").addClass("hidden");
        tmp.find(".content-price>i").removeClass("fa-shopping-cart");
        tmp.find(".content-price>i").addClass("fa-play-circle");
        tmp.find(".content-price").attr("onclick", '');
        tmp.find(".content-price").remove();
        tmp.find(".rent-price").remove();
        tmp.find(".cgcThumb-container").unbind("click");
        tmp.find(".content-buy-now").first().attr("onclick", "");
        tmp.find(".content-buy-now").remove();

      }
      if (content.contentType == "workshop" || content.contentType == "mentorship") {
        tmp.find(".content-buy-now").hide();
        tmp.find(".content-price").hide();
        if (content.buyunlisted != null) {
          tmp.find(".rent-price-amount").html("$" + content.priceunlisted);
          tmp.find(".rent-price").attr("onclick", content.buyunlisted);
          tmp.find(".rent-word").html("Unguided ");
          tmp.find(".rent-price").show();
        } else {
          tmp.find(".rent-price").hide();
        }

      }
      tmp.find(".cgcThumb-container").attr("href", content.url);
      if (content.itemType == "bundle") {
        tmp.find(".purchase-price-amount").addClass('pull-left');
        tmp.find(".bundle-description").removeClass("hidden");
        tmp.find(".bundle-description").removeClass("pull-right");
        tmp.find(".savings").removeClass('hidden');
        tmp.find(".bundle-info").removeClass("hidden");
        tmp.find(".savings-percentage").html(content.discountPercentage);
        var courseTitles = "Bundle includes:<br/>";
        $.each(content.courses, function (index, course) {
          courseTitles += course.title + "<br/>";
        });
        tmp.find(".content-info").attr("title", courseTitles);
        tmp.find(".tools-bg").hide();
        //tmp.find(".content-price").attr("onclick", content.buy);
        // tmp.find(".cgcThumb-container").css("cursor", "default");
      } else {
        tmp.find(".bundle-description").removeClass("hidden").removeClass("bundle-description").addClass('content-type ' + content.contentType + ' pull-right');
        tmp.find(".savings-percentage").html('');
        tmp.find(".savings").addClass('hidden');
        tmp.find(".discount-description").html(content.contentType);
        tmp.find(".purchase-price-amount").addClass('pull-left');
      }

      tmp.find(".loading-icon-cont").remove();
      thumbnails += tmp[0].outerHTML;

    });
    pagesHtml.push(thumbnails);
  });

  $('#content-list').html(pagesHtml[0]);

  pageCount = pagesHtml.length;
  if (pageCount < visiblePages) {
    visiblePages = pageCount;
  }
  // get page from URL
  // pageQS = parseInt(GetQueryStringParams('page'));
  pageQS = pageNum;
  if (pageQS && pageQS <= pagesHtml.length) {
    $("#content-list").html(pagesHtml[pageQS - 1]);

  }
  if (!pageQS) {
    pageQS = 1;
  }

  paginationSettings = {
    totalPages: pageCount,
    startPage: pageQS,
    visiblePages: visiblePages,
    onPageClick: function (event, page) {
      changePage(page);
    }
  };

  $("#browse-pagination").twbsPagination(paginationSettings);
  $("#browse-pagination").show();

  if (planID == null) {
    /*
		 * $(".cgcThumb-container").click(function(){ var contentId =
		 * $(this).parents(".content-item").first().attr("id");
		 *
		 * browseContentSelectedCourseId = contentId;
		 *
		 * $(("#courses-details-modal-container #content-info-modal
		 * .modal-body .item#md"+contentId)).addClass("active");
		 * $("#content-info-modal").modal("show"); });
		 */
  }

  $('.content-info').tooltip({html: true, "placement": "top"});
}

function changePage(pageNum) {

  // add the page number in the URL

  var url = window.location.pathname;
  var filename = url.substring(url.lastIndexOf('/') + 1);

  // remove the page number is there is one
  var otherParams = RemoveQueryStringParams("page");

  window.history.replaceState({}, '', filename + otherParams + "&page=" + pageNum);
  populateContent(pageNum);
}

function updateContent() {
  // after the page has finished loading all the data with low res images, we
  // run this
  // function that updates the thumbnails with high-res images
  $.each(contentData, function (index, content) {
    var currentThumb = $("#content-list #" + content.id);
    currentThumb.find(" .cgcThumb-container").first().css('background-image', ("url(" + content.fullThumbnail + ")"));
    if (content.authorImg) {
      currentThumb.find(".author-img").attr("src", content.authorImg);
    }
  });
}

function setBreadCrums(activeFilters) {
  // set the all Content
  $("#all-bundles-crum-delete").addClass("hidden");
  $("#exclusiveContent-delete").addClass("hidden");
  if (filtersData.currentCategory) {
    $("#category-crumb a").html(filtersData.currentCategory);
    $(".breadcrumb .divider").first().show();
  } else {
    $("#category-crumb a").empty();
    $(".breadcrumb .divider").first().hide();
  }


  if (filtersData.currentSubCategory) {
    $("#current-subcategory").html(filtersData.currentSubCategory);
    $("#current-subcategory").removeClass('hidden');

  } else {
    $("#current-subcategory").html("");
    $("#current-subcategory").addClass('hidden');
  }

  if (filtersData.currentContentType) {
    $("#category-crumb a").html(filtersData.currentContentType);
    $(".breadcrumb .divider").first().show();
  }
  if (activeFilters.bundles == "yes") {
    $("#all-bundles-crum-delete").removeClass("hidden")
    $('#all-categories-crum').text("All Content (Bundles Only)");
  }
  if (activeFilters.exclusiveContent == "yes") {
    $("#exclusiveContent-delete").removeClass("hidden")
    $('#all-categories-crum').text("All Content (Exclusive Content Only)");
  }
  $("#all-categories-crum").click(function () {
    // var url = window.location.pathname;
    // var filename = url.substring(url.lastIndexOf('/')+1);
    // window.location.href = filename;
    // clearFilterFromType(["category", "subcategory"]);
    // applySearchFilter("");
    $('#all-categories-crum').text("All Content");
    window.history.replaceState({}, '', '?');
    getActiveFilters();
    filterData();
    lessonFilterCounter();
    populateContent();
    populateFilters();
    refreshPagination();


  });


  $("#category-crumb a").click(function () {
    clearFilterFromType(["subcategory"]);
  });
}

function refreshPagination() {
  $(".pagination").data().twbsPagination.options.totalPages = paginationSettings.totalPages;
  $(".pagination").data().twbsPagination.options.visiblePages = paginationSettings.visiblePages;
  // $(".pagination").data('currentTotalPages', pageCount);
  $(".pagination").twbsPagination('destroy');
  $("#browse-pagination").twbsPagination("init", paginationSettings);
}

function IsNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function populateFilters() {
  var tmp = "";
  var filters = "";
  var template = filtersTemplate;
  var rendered = $(template);

  var contentTypeFilter = filtersData.filters.find(function (filter) {
    return filter.id === "contenttype";
  });
  var categoryTypeFilter = filtersData.filters.find(function (filter) {
    return filter.id === "category";
  });

  var contType = contentTypeFilter.subfilters.find(function (contentType) {
    return activeFilters["contenttype"] == contentType.id;
  });

  var cat = categoryTypeFilter.subfilters.find(function (category) {
    return activeFilters["category"] == category.id;
  });

  var subcat = cat ? cat.subcategories.find(function (subcategory) {
    return activeFilters["subcategory"] == subcategory.id;
  }) : null;

  filtersData.currentCategory = cat ? cat.name : null;
  filtersData.currentSubCategory = subcat ? subcat.name : null;
  filtersData.currentContentType = contType ? contType.name : null;

  $.each(filtersData.filters, function (index, filter) {
    if (!filtersData.currentCategory && filter.title.toLowerCase() == "subcategories") {
      return true; // skip the for loop so we don't add the
      // subcategories with te categories
    }
    tmp = $(template);
    tmp.find(".filter-title").html(filter.title);
    tmp.attr("id", filter.id.toLowerCase());
    tmp.find(".filter-main-collapse").attr("id", ('filter-' + index + '-main-collapse'));
    tmp.find(".secondary-filter-list").attr("id", ('more-filters-' + index));
    tmp.find(".more-filters").addClass(('mf-' + index));
    tmp.find(".more-filters").attr("href", ('#more-filters-' + index));

    // populate filters
    var singleFiltersList = "";
    var singleFilterMoreList = ""; // this is the list that will be
    // initially hidden

    if (filter.subfilters != null) {
      var c = 0;
      $.each(filter.subfilters, function (i, sub) {
        // get the list item and put it in memory so we can use it
        if (!sub.itemsAmount || sub.name == ' ') {
          return true;
        }
        if (filter.title.toLowerCase() == "categories" && activeFilters["category"] && activeFilters["category"] != sub.id) {
          return true;
        }
        if (filter.title.toLowerCase() == "subcategories" && activeFilters["subcategory"] && activeFilters["subcategory"] != sub.id) {
          return true;
        }

        var singleFilter = tmp.find(".single-filter").parent("li");
        singleFilter.find(".single-filter-name").html(sub.name);
        singleFilter.find(".single-filter-name").attr("id", sub.id);

        singleFilter.find(".filterAmount").html("(" + sub.itemsAmount + ")");

        if (c < numShownFilter) {
          singleFiltersList += singleFilter[0].outerHTML;
        } else {
          singleFilterMoreList += singleFilter[0].outerHTML;
        }
        c++;
      });
    }
    tmp.find(".single-filter").parent("li").remove();
    tmp.find(".filter-main-collapse").prepend(singleFiltersList);
    tmp.find(".secondary-filter-list").html(singleFilterMoreList);
    if (singleFilterMoreList === "") {
      tmp.find(".more-filters").remove();
    }
    if (index > maxFiltersSectionsOpen - 1) {
      // collapse the filters sections by default
      tmp.find(".filter-main-collapse").removeClass("in").addClass("out");
      tmp.find(".filters-main-collapse-btn i").removeClass("fa fa-minus").addClass("fa fa-plus");
    }
    // add it to the string that we are going to pupolate the page with
    filters += tmp[0].outerHTML;
  });
  rendered.html(filters);
  $('#filters-container').html(rendered[0].outerHTML);
  $('#compact-filter-container').html(rendered[0].outerHTML);

  // highlight the active filters
  for (var key in activeFilters) {
    if (activeFilters[key]) {
      highlightSeletedFilter(key, activeFilters[key]);
    }
  }

  $(".cgcThumb-container").error(function () {
    $(this).css("background-image", "url('/images/default-images/default-content-icon-500.png')");
  });

  setFiltersBinding();
  setBreadCrums(activeFilters);
}

// given a certain string, it will filter all the content we have without that
// string
function applySearchFilter(searchString) {
  searchString = decodeURI(searchString);
  // since we hide all elements when we can't find any content, we make sure
  // to show it
  $("#content-list li").show();
  $("#search-input").val(searchString);
  filteredContent = [];
  searchInput = $(this);
  str = searchString.toLowerCase();

  // change the url based on our search string
  var url = window.location.pathname;
  var filename = url.substring(url.lastIndexOf('/') + 1);

  // remove the search query string so we can redo it and place it at the end
  // of the URL
  var otherParams = RemoveQueryStringParams("search")

  window.history.replaceState({}, '', filename + otherParams + "&search=" + str);


  allContent = contentData;// let's make a copy of the data set, so we can
  // regenerate it
  if (str === "") {
    // if the search string is empty, we should populate all the content
    // back
    contentData = allContent;
    populateContent();
  } else {
    // search in the json object for the string
    $.each(contentData, function (index, content) {
      if (content.title.toLowerCase().search(str) != -1 || content.author.toLowerCase().search(str) != -1 || content.description.toLowerCase().search(str) != -1) {
        filteredContent.push(content);
      }
    });

    if (filteredContent.length > 0) {
      contentData = filteredContent;
      populateContent();
      refreshPagination();
      filteredContent = [];
      contentData = allContent;
    } else {
      $("#content-list li").hide();
    }
  }

}

function buynow($idlesson, $type, $version, $price) {
  xTot = 0;
  xCourses = [];
  xTot = $price;

  xtmpCourses = new Object();
  xtmpCourses['course'] = $idlesson;
  xtmpCourses['type'] = $type;
  xtmpCourses['version'] = $version;
  xtmpCourses['bundle'] = 0;


  xCourses[0] = xtmpCourses;
  if (xTot > 0) {

    xTotStripe = xTot.replace(".", "");
    SingleObject = {

      amount: xTotStripe,
      email: xmail
    }
    handler.open(SingleObject);
  } else {
    // subscribeworkshop($('#IDCourse').val(),$('#version').val(),'<URI>');
  }

}

function buybundlenow($idlessons, $type, $version, $price, $idbundle) {
  xTot = 0;
  xCourses = [];
  xTot = $price;

  var list = $idlessons.split(",");

  for (i = 0; i < list.length; i++) {

    xtmpCourses = new Object();
    xtmpCourses['course'] = list[i];
    xtmpCourses['type'] = $type;
    xtmpCourses['version'] = $version;
    xtmpCourses['bundle'] = $idbundle;


    xCourses[i] = xtmpCourses;

  }
  if (xTot > 0) {

    xTotStripe = xTot.replace(".", "");
    SingleObject = {

      amount: xTotStripe,
      email: xmail
    }
    handler.open(SingleObject);
  } else {
    // subscribeworkshop($('#IDCourse').val(),$('#version').val(),'<URI>');
  }

}

function stripeAfterPopupResult(data) {
  console.log("return data");
  console.log(data);
  $('#myModalLabel').html("Checkout");
  $('#idmessage').html(data.errormessages);
  $('#btn-dialog-save').remove();
  $('#genericModal').modal('show');
  if (xmail != "" && data.operationSuccess) {

  }


  if (data.PaymentExecuted == true) {
    textAnalytics = 'Browsepage Stripe';
    if (xiduser == 0) {
      textAnalytics = 'Browsepage Stripe Not Logged';
    }
    sendAnalytics(0, false, false, textAnalytics);
    $('#btn-dialog-close').click(function () {
      //window.location='/landing-checkout.php?VIC='+data.VIC+'&iduser='+data.iduser;
      window.location = '/payment.php?VIC=' + data.VIC + '&iduser=' + data.iduser + '&landing-checkout';
    });
  }
}

function filterData() {
  var data = allContentData.slice(0);
  var bundles = [];
  var exclusiveContent = [];
  var bundlesCourses = [];

  bundles = data.filter(function (course) {
    return course.itemType == "bundle";
  });
  exclusiveContent = data.filter(function (course) {
    return course.exclusiveContent == true;
  });

  bundles.forEach(function (bundle) {
    bundle.levelId = [];
    bundle.software = [];
    bundle.category = [];
    bundle.courses.forEach(function (c, i, a) {
      a[i]['authorId'] = bundle.authorId;
      a[i]['author'] = bundle.author;
      a[i]['purchasePrice'] = a[i]['price'];
      a[i]['bundleId'] = bundle.id;
      bundle.levelId = bundle.levelId ? bundle.levelId.concat(a[i]['levelId']) : [a[i]['levelId']];
      bundle.software = bundle.software ? bundle.software.concat(a[i]['software']) : a[i]['software'];
      bundle.category = bundle.category ? bundle.category.concat(a[i]['category']) : a[i]['category'];
    });
    //bundle.software = uniqueObjectsFromArrayByField(bundle.software, 'id');
    //bundle.category = uniqueObjectsFromArrayByField(bundle.category, 'id');
    bundlesCourses = bundlesCourses.concat(bundle.courses);
  });

  if (activeFilters['category']) {
    var categoryFilters = originalFiltersData.find(function (filter) {
      return filter.id === "category";
    });

    var categoryFilter = categoryFilters.subfilters.find(function (category) {
      return category.id == activeFilters['category'];
    });

    filtersData.filters[2].subfilters = categoryFilter.subcategories;// TODO filters[2]
  }

  if (activeFilters['category'] && !activeFilters['subcategory']) {
    //filtering courses by category
    var subcategoriesIds = categoryFilter.subcategories.reduce(function (ids, subfilter) {
      ids.push(subfilter.id);
      return ids;
    }, []);
    data = data.filter(function (course) {
      if (!course.category) return false;
      var courseSubcategoriesIds = course.category.reduce(function (ids, subcategory) {
        ids.push(subcategory.id);
        return ids;
      }, []);
      return courseSubcategoriesIds.some(function (id) {
        return subcategoriesIds.indexOf(id) > -1
      })
    });
    //filtering bundles by category
    var bundlesFilteredByCategory = [];

    bundles.forEach(function (bundle, i) {
      bundle.courses.forEach(function (course) {
        if (!course.category) return false;
        var courseSubcategoriesIds = course.category.reduce(function (ids, subcategory) {
          ids.push(subcategory.id);
          return ids;
        }, []);
        var res = courseSubcategoriesIds.some(function (id) {
          return subcategoriesIds.indexOf(id) > -1
        });

        if (res) bundlesFilteredByCategory.push(bundles[i]);

      });
    });
    data = data.concat(bundlesFilteredByCategory);
  }

  if (activeFilters['subcategory']) {
    data = data.filter(function (course) {
      if (!course.category) return false;

      return course.category.some(function (category) {
        return category.id == activeFilters['subcategory'];
      });
    });

    var bundlesFilteredBySubcategory = [];

    bundles.forEach(function (bundle, i) {
      bundle.courses.forEach(function (course) {
        if (!course.category) return false;

        var res = course.category.some(function (category) {
          return category.id == activeFilters['subcategory'];
        });

        if (res) bundlesFilteredBySubcategory.push(bundles[i]);

      });
    });
    data = data.concat(bundlesFilteredBySubcategory);
  }

  if (activeFilters["author"]) {
    data = data.filter(function (course) {
      return course.authorId == activeFilters["author"];
    });
  }

  if (activeFilters["software"]) {
    data = data.filter(function (course) {
      if (!course.software) return false;
      return course.software.some(function (software) {
        return software.id == activeFilters["software"];
      });
    });
    var bundlesFilteredBySoftware = [];
    bundlesFilteredBySoftware = bundles.filter(function (course) {
      if (!course.software) return false;
      return course.software.some(function (software) {
        return software.id == activeFilters["software"];
      });
    });
    data = data.concat(bundlesFilteredBySoftware);
  }

  if (activeFilters["level"]) {
    data = data.filter(function (course) {
      return course.levelId == activeFilters["level"];
    });
    var bundlesFilteredByLevel = [];
    bundlesFilteredByLevel = bundles.filter(function (course) {
      return course.levelId.some(function (level) {
        return level == activeFilters["level"];
      });
    });
    data = data.concat(bundlesFilteredByLevel);

  }

  if (activeFilters["price"]) {
    var priceFilter = function (course) {
      var price = Number.parseInt(course.purchasePrice);
      var result = false;
      switch (activeFilters["price"]) {
        case "1":
          result = price === 0;
          break;
        case "2":
          result = price > 0 && price < 30;
          break;
        case "3":
          result = price >= 30 && price < 60;
          break;
        case "4":
          result = price >= 60 && price < 100;
          break;
        case "5":
          result = price >= 100;
          break;
        default:
          result = false;
      }
      return result;
    };

    if (activeFilters["bundles"]) {
      var bundlesFilteredByPrice = bundles.filter(priceFilter);
      data = bundlesFilteredByPrice.reduce(function (courses, bundle) {
        return courses.concat(bundle.courses);
      }, []);
    } else {
      data = data.filter(priceFilter);
    }
  }

  if (activeFilters["contenttype"] > -1) {
    data = data.filter(function (course) {
      if (!course.contentType) return false;
      var type = course.contentType.toLowerCase();
      var result = false;
      switch (activeFilters["contenttype"]) {
        case "0":
          result = type === 'tutorial';
          break;
        case "2":
          result = type === 'workshop';
          break;
        case "4":
          result = type === 'html';
          break;
        case "7":
          result = type === 'video';
          break;
        default:
          result = false;
      }
      return result;
    });
  }

  if (activeFilters["bundles"]) {
    contentData = data.filter(function (item) {
      return item.itemType == 'bundle';
    });
  } else {
    contentData = data;
  }

  if (activeFilters["exclusiveContent"]) {
    contentData = data.filter(function (item) {
      return item.exclusiveContent == true;
    });
  } else {
    // contentData = data;
  }
  contentData = uniqueObjectsFromArrayByField(contentData, 'id');
}

function getActiveFilters() {
  activeFilters["contenttype"] = -1;
  activeFilters["category"] = GetQueryStringParams("category");
  if (!IsNumeric(activeFilters["category"])) {
    activeFilters["category"] = 0;
  }
  activeFilters["subcategory"] = GetQueryStringParams("subcategory");
  if (!IsNumeric(activeFilters["subcategory"])) {
    activeFilters["subcategory"] = 0;
  }
  activeFilters["author"] = GetQueryStringParams("author");
  if (!IsNumeric(activeFilters["author"])) {
    activeFilters["author"] = 0;
  }
  activeFilters["price"] = GetQueryStringParams("price");
  if (!IsNumeric(activeFilters["price"])) {
    activeFilters["price"] = 0;
  }
  activeFilters["software"] = GetQueryStringParams("software");
  if (!IsNumeric(activeFilters["software"])) {
    activeFilters["software"] = 0;
  }
  activeFilters["level"] = GetQueryStringParams("level");
  if (!IsNumeric(activeFilters["level"])) {
    activeFilters["level"] = 0;
  }
  activeFilters["bundles"] = GetQueryStringParams("bundles");
  activeFilters["contenttype"] = GetQueryStringParams("contenttype");
  if (!IsNumeric(activeFilters["contenttype"])) {
    activeFilters["contenttype"] = -1;
  }
  activeFilters["exclusiveContent"] = GetQueryStringParams("exclusiveContent");

}

function lessonFilterCounter() {
  var contentTypeNumbers = {
    tutorial: 0,
    workshop: 0,
    html: 0,
    video: 0
  };
  var authorNumbers = {};
  var levelNumbers = {};
  var softwareNumbers = {};
  var subcategoryNumbers = {};
  var categoryNumbers = {};
  var priceNumbers = {
    1: 0, // free
    2: 0, // $30 and less
    3: 0, // $30 to $60
    4: 0, // $60 to $100
    5: 0  // $100 and more
  };
  var originalCategoryFilter = originalFiltersData.find(function (filter) {
    return filter.id === 'category';
  });

  $.each(contentData, function (i, course) {
    if (course.contentType) {
      contentTypeNumbers[course.contentType]++;
    }

    if (course.authorId) {
      authorNumbers[course.authorId] ? authorNumbers[course.authorId]++ : authorNumbers[course.authorId] = 1;
    }

    if (course.levelId) {
      if (Array.isArray(course.levelId)) {
        course.levelId.forEach(function (lvl) {
          levelNumbers[lvl] ? levelNumbers[lvl]++ : levelNumbers[lvl] = 1;
        });
      } else {
        levelNumbers[course.levelId] ? levelNumbers[course.levelId]++ : levelNumbers[course.levelId] = 1;
      }
    }

    if (course.software) {
      course.software.forEach(function (software) {
        softwareNumbers[software.id] ? softwareNumbers[software.id]++ : softwareNumbers[software.id] = 1;
      });
    }

    if (course.category) {
      var categoryCounted = [];
      course.category.forEach(function (category) {
        subcategoryNumbers[category.id] ? subcategoryNumbers[category.id]++ : subcategoryNumbers[category.id] = 1;
        originalCategoryFilter.subfilters.forEach(function (originalCategory) {
          originalCategory.subcategories.forEach(function (subcategory) {
            if (subcategory.id == category.id && !categoryCounted.find(function (id) {
              return id === originalCategory.id
            })) {
              categoryCounted.push(originalCategory.id);
              categoryNumbers[originalCategory.id] ? categoryNumbers[originalCategory.id]++ : categoryNumbers[originalCategory.id] = 1;
            }
          });
        });
      });
    }

    if (course.purchasePrice === 0) {
      priceNumbers[1]++;
    } else if (course.purchasePrice < 30) {
      priceNumbers[2]++;
    } else if (course.purchasePrice >= 30 && course.purchasePrice < 60) {
      priceNumbers[3]++;
    } else if (course.purchasePrice >= 60 && course.purchasePrice < 100) {
      priceNumbers[4]++;
    } else if (course.purchasePrice >= 100) {
      priceNumbers[5]++;
    }
  });


  var contentTypeFilter = filtersData.filters.find(function (filter) {
    return filter.id === "contenttype";
  });
  var authorFilter = filtersData.filters.find(function (filter) {
    return filter.id === "author";
  });
  var levelFilter = filtersData.filters.find(function (filter) {
    return filter.id === "level";
  });
  var softwareFilter = filtersData.filters.find(function (filter) {
    return filter.id === "software";
  });
  var priceFilter = filtersData.filters.find(function (filter) {
    return filter.id === "price";
  });
  var categoryFilter = filtersData.filters.find(function (filter) {
    return filter.id === "category";
  });
  var subcategoryFilter = filtersData.filters.find(function (filter) {
    return filter.id === "subcategory";
  });

  contentTypeFilter.subfilters.forEach(function (type, i, arr) {
    switch (type.id) {
      case 0:
        arr[i].itemsAmount = contentTypeNumbers.tutorial;
        break;
      case 2:
        arr[i].itemsAmount = contentTypeNumbers.workshop;
        break;
      case 4:
        arr[i].itemsAmount = contentTypeNumbers.html;
        break;
      case 7:
        arr[i].itemsAmount = contentTypeNumbers.video;
        break;
    }
  });

  authorFilter.subfilters.forEach(function (author, i, arr) {
    arr[i].itemsAmount = authorNumbers[author.id];
  });

  levelFilter.subfilters.forEach(function (level, i, arr) {
    arr[i].itemsAmount = levelNumbers[level.id];
  });

  softwareFilter.subfilters.forEach(function (software, i, arr) {
    arr[i].itemsAmount = softwareNumbers[software.id];
  });

  priceFilter.subfilters.forEach(function (price, i, arr) {
    arr[i].itemsAmount = priceNumbers[price.id];
  });

  categoryFilter.subfilters.forEach(function (category, i, arr) {
    arr[i].itemsAmount = categoryNumbers[category.id];
  });

  if (subcategoryFilter.subfilters) {
    subcategoryFilter.subfilters.forEach(function (subcategory, i, arr) {
      arr[i].itemsAmount = subcategoryNumbers[subcategory.id];
    });
  }

}

var xCourses = new Object();

var StripeObject = {
  key: xStripeKey,
  image: '/images/mobile-app-icon.png',
  name: 'CGCIRCUIT LLC',
  description: '',
  amount: 5000,
  allowRememberMe: true,
  email: '',
  panelLabel: '',
  currency: 'usd',
  opened: function () {

  },
  closed: '',
  token: function (token, args) {

    $messg = processToken(token, xTot, 2, 2, xCourses);

  },
  afterUrl: "",
  afterPopup: true,
  initUrl: "",
  initPopup: "",
  postPay: true
};

var handler = initializeStripe(StripeObject);

function uniqueObjectsFromArrayByField(array, field) {
  var flags = [], output = [];
  array.forEach(function (obj, i, arr) {
    if (flags.indexOf(obj[field]) > -1)
      return true;
    flags.push(obj[field]);
    output.push(obj);
  });
  return output;
}
