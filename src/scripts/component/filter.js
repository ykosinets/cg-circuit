import 'select2';
import wNumb from "wnumb";
import noUiSlider from 'nouislider';

export default class Filter {
  constructor(data) {
    this.current = {};
    this.slider = {};
    this.data = data;
    this.filterBadgeWrapper = document.querySelector('.filter-result ul');
    this.filterControlWrapper = document.querySelector('.filter-form');
    this.render(app.getFiltersData(data));

    $('.filter-form select.select2').on('change', e => {
      let el = e.target;

      if (el.value !== 'all') {
        this.addBreadcrumb({
          [el.id]: {
            name: el.options[el.selectedIndex].text,
            value: $(el).val().toLowerCase()
          }
        }, el.id);
      } else {
        this.removeBreadcrumb(el.id);
      }
    });

    $('input#search').on('keyup', e => {
      let el = e.target;
      if (el.value.length > 2) {
        this.addBreadcrumb({search: {name: 'Search', value: el.value.toLowerCase()}}, 'search');
      } else {
        this.removeBreadcrumb(el.id);
      }
    });

    $('.btn#price').on('click', e => {
      e.preventDefault();
      let el = e.target;
      let isActive = el.classList.contains('active');

      if (isActive) {
        this.removeBreadcrumb(el.id);
        el.classList.remove('active');
      } else {
        this.addBreadcrumb({price: {name: 'Free', value: 'free'}}, 'price');
        el.classList.add('active');
      }

      this.filterControlWrapper.querySelector('#range-wrapper').classList[!isActive ? 'add' : 'remove']('inactive');
    });

    this.slider.on('set', val => {
      val = [parseInt(val[0].substring(0, val[0].length - 2)), parseInt(val[1].substring(0, val[1].length - 2))];
      this.addBreadcrumb({price: {name: 'Range', value: val}}, 'price');
      this.getBreadcrumbControl('price').classList.remove('active');
      document.querySelector('#range-wrapper').classList.remove('inactive');
    });

    $('.btn#clear').on('click', e => {
      e.preventDefault();
      this.clear();
    });
  }

  getCurrentBreadcrumbsList() {
    return this.current;
  }

  getBreadcrumbBadge(key) {
    return this.filterBadgeWrapper.querySelector(`[data-key="${key}"]`);
  }

  getBreadcrumbControl(key) {
    return this.filterControlWrapper.querySelector('#' + key);
  }

  addBreadcrumb(key, type) {
    let item = key[type];
    let isRangeSlider = item.name.toLowerCase() === 'range';
    let isSearch = item.name.toLowerCase() === 'search';
    let text = isRangeSlider ? '$' + item.value[0] + ' - $' + item.value[1] : isSearch ? item.value : item.name;

    if (Object.keys(this.current).length && !!this.current[type]) {
      // update existed if already in breadcrumbs
      let crumb = this.getBreadcrumbBadge(type);
      crumb.childNodes[0].nodeValue = text;
    } else {
      // create new if not in breadcrumbs
      let crumb = document.createElement('li');
      crumb.dataset.key = type.toLowerCase();
      crumb.dataset.id = item.value;
      crumb.innerHTML = `${text}<span class=\"remove\"></span>`;
      crumb.querySelector('.remove').addEventListener('click', (e) => {
        this.removeBreadcrumb(type);
      }, false);
      this.filterBadgeWrapper.prepend(crumb);
    }

    this.current[type] = {
      name: item.name,
      value: item.value,
      type: type
    };

    this.show();
    app.update();
  }

  removeBreadcrumb(key) {
    if (!this.current[key]) return;

    // set controls to default state
    let control = this.getBreadcrumbControl(key);

    switch (key) {
      case 'price':
        this.slider.reset();
        break;
      case 'search':
        if (control.value.length > 2) control.value = '';
        break;
      default:
        $(control).val('all');
        $(control).select2().trigger('change.select2');
        break;
    }

    // remove badge and cleanup array
    let badge = this.getBreadcrumbBadge(key);
    badge.remove();
    delete this.current[key];

    if (!Object.keys(this.getCurrentBreadcrumbsList()).length) {
      this.hide();
      this.updateCounter('');
    }

    app.update();
  }

  clear() {
    Object.keys(this.getCurrentBreadcrumbsList()).forEach(key => {
      this.removeBreadcrumb(key);
    });

    this.hide();
  }

  hide() {
    $(this.filterBadgeWrapper).hide();
  }

  show() {
    $(this.filterBadgeWrapper).show();
  }

  updateCounter(count) {
    $('.btn#clear span').text(count)
  }

  render(data) {
    // init range slider
    let max = app.getProductData().reduce((prev, current) => (prev.purchasePrice > current.purchasePrice) ? prev : current).purchasePrice;

    $('.range-max').text(max + '$');

    let range = document.querySelector('.range');
    this.slider = noUiSlider.create(range, {
      start: [1, max],
      connect: [false, true, false],
      range: {
        'min': 1,
        'max': max
      },
      step: 1,
      tooltips: [true, true],
      format: wNumb({
        decimals: 0,
        suffix: ' $'
      }),
    });

    // init select2
    $('#sort').select2({
      placeholder: "Show All",
      minimumResultsForSearch: -1,
      dir: "rtl",
      dropdownAutoWidth: true,
      dropdownParent: $('#sort-parent')
    });

    $('#contenttype').select2({
      placeholder: "Show All",
      dropdownAutoWidth: true,
      minimumResultsForSearch: -1,
      data: data.contenttype
    });

    $('#category').select2({
      placeholder: "Show All",
      dropdownAutoWidth: true,
      data: data.category
    });

    $('#author').select2({
      placeholder: "Show All",
      dropdownAutoWidth: true,
      data: data.author
    });

    $('#level').select2({
      placeholder: "Show All",
      dropdownAutoWidth: true,
      minimumResultsForSearch: -1,
      data: data.level
    });

    $('#software').select2({
      placeholder: "Show All",
      data: data.software
    });
  }
}
