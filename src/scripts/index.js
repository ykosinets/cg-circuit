import "../styles/style.scss";

//3rd party
import "./helpers/jquery"
import "bootstrap/js/src/util";
import "bootstrap/js/dist/collapse";
import "bootstrap/js/dist/dropdown";
import "bootstrap/js/dist/popover";

//custom
import "./helpers/vh";
import "./component/menu";
import Carousel from "./component/slider";
import ProductList from "./component/product";
import Filter from "./component/filter";
import Modal from "./component/modal";

//initializations
//sorts
let az = (a, b) => b.title.toLowerCase() > a.title.toLowerCase() ? -1 : a.title.toLowerCase() > b.title.toLowerCase() ? 1 : 0;
let za = (a, b) => a.title.toLowerCase() > b.title.toLowerCase() ? -1 : b.title.toLowerCase() > a.title.toLowerCase() ? 1 : 0;
let watched = (a, b) => b.watchedAmount - a.watchedAmount;
let rated = (a, b) => b.numStars - a.numStars;
let date_asc = (a, b) => b.publishDateTimestamp - a.publishDateTimestamp;
let date_desc = (a, b) => a.publishDateTimestamp - b.publishDateTimestamp;
let price_hl = (a, b) => b.purchasePrice - a.purchasePrice;
let price_lh = (a, b) => a.purchasePrice - b.purchasePrice;

//filters
let isInPriceRange = (product, price) => product.purchasePrice >= price[0] && product.purchasePrice <= price[1];
let isInArray = (arr, value) => arr.find(o => o.name.toLowerCase() === value);

let isFree = product => product.purchasePrice === 0;
let isPrice = (product, price) => !price ? true : (price === 'FREE' ? isFree(product) : typeof price === 'object' ? isInPriceRange(product, price) : false);
let isContentType = (product, type) => !type ? true : product.contentType && product.contentType.toLowerCase() === type.toLowerCase();
let isCategory = (product, category) => !category ? true : product.category && isInArray(product.category, category.toLowerCase());
let isAuthor = (product, author) => !author ? true : product.author && product.author.toLowerCase() === author.toLowerCase();
let isLevel = (product, level) => !level ? true : product.levelName && product.levelName.toLowerCase() === level.toLowerCase();
let isSoftware = (product, software) => !software ? true : product.software && isInArray(product.software, software.toLowerCase());
let isSearch = (product, request) => {
  let res = false;
  if (request) {
    if (product.searchTags) res = product.searchTags.toLowerCase().indexOf(request.toLowerCase()) > -1 || product.title.toLowerCase().indexOf(request.toLowerCase()) > -1 || product.author.toLowerCase().indexOf(request.toLowerCase()) > -1;
  }

  return res;
};

// init application
class App {
  constructor() {

    this.data = false;
    this.sorting = az;

    fetch('http://ykosinets.xyz/cg-circuit/static/data/response.php')
      .then(response => {
        return !response.ok ? new Error("HTTP error " + response.statusText) : response.json();
      })
      .then(json => {
        this.data = json;
        this.render();
      })
      .catch(function (error) {
        new Modal('alert', 'Internet connection problems!', error).show();
      });

    $('#sort').on('change', (e) => {
      switch (e.target.value) {
        case 'name_asc' :
          this.sorting = az;
          break;
        case 'name_desc' :
          this.sorting = za;
          break;
        case 'watched_asc' :
          this.sorting = watched;
          break;
        case 'rated_asc' :
          this.sorting = rated;
          break;
        case 'date_asc' :
          this.sorting = date_asc;
          break;
        case 'date_desc' :
          this.sorting = date_desc;
          break;
        case 'price_asc' :
          this.sorting = price_lh;
          break;
        case 'price_desc' :
          this.sorting = price_hl;
          break;
      }

      this.update();
    });

    $('.btn-count').on('click', (e) => {
      let $this = $(e.currentTarget);
      let productsList = document.querySelector('#product-list');

      productsList.dataset.count = e.currentTarget.dataset.count;
      $this.addClass('active').siblings('.btn-count').removeClass('active');
      this.update();
    });

    $(window).on('resize load', () => {
      let productsList = document.querySelector('#product-list');
      let width = $(window).width();

      $('.btn-count-6')[0].dataset.count = width > 1470 ? 6 : width > 992 ? 4 : width > 768 ? 3 : width > 575 ? 2 : 1;
      $('.btn-count-4')[0].dataset.count = width > 1470 ? 4 : width > 992 ? 3 : width > 768 ? 2 : 1;
      $('.btn-count-3')[0].dataset.count = width > 1470 ? 3 : width > 992 ? 2 : 1;

      let current = parseInt($('.btn-count.active')[0].dataset.count);
      productsList.dataset.count = current;
      if (this.productList) this.productList.perRow = current;
      this.update();
    });
  }

  getFiltersData() {
    let data = this.data[1].newFilters;
    // extract and format data
    let selectsData = {};
    let selectChildrens = [];

    data.forEach(filter => {
      if (filter.subfilters) {
        selectsData[filter.id] = [];

        filter.subfilters.forEach(subfilter => {
          if (subfilter.subcategories) {
            selectChildrens = [];

            subfilter.subcategories.forEach(subcategory => {
              selectChildrens.push({id: subcategory.id, text: subcategory.name})
            });

            selectsData[filter.id].push({text: subfilter.name, children: selectChildrens});
          } else {
            selectsData[filter.id].push(subfilter.name);
          }
        });
      }
    });

    return selectsData;
  }

  getProductData() {
    if (!this.data[0]) return false;

    let data = this.data[0].siteContent.sort(this.sorting);

    if (this.filters && Object.keys(this.filters.current).length) {
      data = data.filter((product) => {
        return isPrice(product, this.filters.current.price)
          && isContentType(product, this.filters.current.contenttype)
          && isCategory(product, this.filters.current.category)
          && isAuthor(product, this.filters.current.author)
          && isLevel(product, this.filters.current.level)
          && isSoftware(product, this.filters.current.software)
          && isSearch(product, this.filters.current.search)
      });
    }

    return data;
  }

  getSliderData() {
    return this.getProductData().sort(watched).slice(0, 10);
  }

  createCarousel() {
    this.carouselData = new Carousel(this.getSliderData());
  }

  createFilters() {
    this.filters = new Filter(this.getFiltersData());
  }

  createProductList() {
    this.productList = new ProductList(this.getProductData());
  }

  render() {
    this.createFilters(this.getFiltersData());
    this.createCarousel(this.getSliderData());
    this.createProductList(this.getProductData());
  }

  update() {
    let data = this.getProductData();
    if (!data) return false;

    this.productList.clear();
    this.productList.render(data, true);
    return data;
  }
}

window.app = new App();
