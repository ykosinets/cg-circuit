export default class ProductList {
  constructor(data) {
    this.gridElement = document.querySelector('#product-list');
    this.perRow = parseInt($('.btn-count.active').data('count'));
    this.rowsCount = 0;
    this.data = data;
    this.length = 0;
    this.flag = true;
    this.border = 100;
    this.currentBlockSize = this.border;

    data = app.getProductData().slice(this.getOffset(), this.perRow + this.getOffset());
    let scrollIndicator = document.querySelector('.btn-loading');

    $(scrollIndicator).on('click', (e) => {
      e.preventDefault();
      $(e.target).addClass('hidden');
      this.currentBlockSize += this.border;
      data = this.data.slice(this.getOffset(), this.perRow + this.getOffset());
      this.render(data);
    });

    //Infinite Scroll
    $(window).on("scroll", () => {
      this.loadMore();
    });

    this.loadMore();
  }

  loadMore() {
    let data = app.getProductData().slice(this.getOffset(), this.perRow + this.getOffset());
    let scrollIndicator = document.querySelector('.btn-loading');
    let scrollHeight = $(document).height();
    let scrollPos = $(window).height() + $(window).scrollTop();

    if (this.rowsCount - 1 <= 0) {
      this.rowsCount = 5;
      if(this.data) {
        data = this.data.slice(0, this.getOffset());
      }
      this.render(data);
    }

    if ((this.getOffset() - this.perRow) < this.currentBlockSize) {
      $(scrollIndicator).addClass('hidden');

      if ((scrollIndicator.offsetTop >= scrollPos) / scrollHeight === 0) {
        if (!this.data) return;

        data = this.data.slice(this.getOffset(), this.perRow + this.getOffset());
        this.render(data);
      }

      scrollIndicator.innerHTML = 'Loading...';
    } else {
      scrollIndicator.innerHTML = 'Continue to load';
      $(scrollIndicator).removeClass('hidden');
    }
  }

  getOffset() {
    return (this.rowsCount - 1) * this.perRow;
  }

  clear(data) {
    this.gridElement.innerHTML = '';
    this.perRow = parseInt($('.btn-count.active').data('count'));
    this.rowsCount = 0;
    this.data = data;
    this.currentBlockSize = this.border;
  }

  render(data, flag) {
    if (!data.length) return;

    if (flag) {
      this.clear(data);
      this.render(this.data.slice(this.getOffset(), this.perRow + this.getOffset()));
      this.length = 0;
    } else {
      // create and append products
      data.map((productData) => {
        let product = new Product(productData).create();
        this.gridElement.append(product);
        this.length++;
      });
    }

    this.rowsCount++;
  }
}

class Product {
  constructor(data) {
    this.data = data;
  }

  create() {
    let data = this.data;
    let productElement = document.createElement('div');
    let bundle = {discount: data.discountPercentage};
    let price = {current: data.purchasePrice, full: data.originalPrice};
    let author = {name: data.author, url: data.authorProfileUrl, avatar: data.authorImg};

    let isBundle = data.itemType === 'bundle' || data.contentType === 'bundle';
    let isFree = data.purchasePrice === 0;
    let isDiscount = !!data.discountPercentage;
    let isSame = price.current === price.full;

    let product = {
      title: data.title,
      url: data.url,
      buy: data.buy,
      buynow: data.buynow,
      thumbnail: data.fullThumbnail,
      type: data.itemType,
      contenttype: data.contentType,
      price: price,
      author: author,
      info: {},
      courses: ''
    };

    if (data.courses) {
      product.courses = `<ul class='product-bundle-list'>`;
      data.courses.forEach(el => {
        product.courses += `<li>${el.title}</li>`;
      });
      product.courses += `</ul>`;
    }

    product.author.template = `<a href="${author.url}" class="author"><img class="author-avatar" src="${author.avatar}" alt="avatar"><span class="author-name">${author.name}</span></a>`;

    product.info.icon = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11"><path fill-rule="evenodd" d="M767.5,960a5.5,5.5,0,1,1,5.5-5.5A5.516,5.516,0,0,1,767.5,960Zm0.55-8.25h-1.1v1.1h1.1v-1.1Zm0,2.2h-1.1v3.3h1.1v-3.3Z" transform="translate(-762 -949)"/></svg>`;

    product.price.template = `<div class="price">
            <span class="price-current text-${isFree ? 'success' : 'primary'}">${isFree ? 'Free' : '$' + price.current}</span>
            ${!isFree && !isSame && !isBundle ? `<span class="price-full">$${price.full}</span><span class="sale-badge text-danger">${bundle.discount} OFF</span>` : ''}
            
            ${isBundle ? `<span class="additional-link" data-toggle="popover" data-trigger="hover" data-html="true" data-content="${product.courses}">${product.contenttype} ${product.info.icon}</span>` : `<span class="additional-link">${product.contenttype}</span>`}
      </div>`;

    product.template = `<div class="card">
          <a href="${product.url}" class="card-header">
            <img src="${product.thumbnail}" class="card-img-top" alt="">      
            ${isBundle && !isFree ? `<span class="badge badge-danger">Bundle ${bundle.discount} Savings</span>` : ''} 
          </a>
      
          <div class="card-body">
            ${author.template}
      
            <a href="${product.url}" class="card-title">${product.title}</a>
      
            ${price.template}
          </div>
      
          <div class="card-footer">
            <div class="btn-list">
              ${isFree ? `<a href="javascript:void(0)" class="btn btn-outline-primary">Add to Library</a>` : `<a href="javascript:void(0)" onclick="${product.buy}" class="btn btn-warning">Add to Cart</a><a href="javascript:void(0)" onclick="${product.buynow}" class="btn btn-primary">Quick Buy</a>`}
            </div>
          </div>
        </div>`;

    productElement.className = 'card-wrapper';
    productElement.innerHTML = product.template;

    // init bundle courses popover
    $(function () {
      $('[data-toggle="popover"]').popover()
    });

    return productElement;
  }
}
