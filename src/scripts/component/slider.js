import 'slick-carousel/slick/slick';

export default class Carousel {
  constructor(data) {
    this.element = document.getElementById('slider');
    this.render(data);
  }

  render(data) {
    // create and append all slides | init slick
    data.forEach(product => {
      let image = product.banner;
      let link = product.url;
      let slide = new Slide(image, link).render();

      this.element.appendChild(slide);
    });

    // init slick
    let $slider = $(this.element);
    $slider
      .on('init', function () {
        $slider.removeClass('d-none');
      })
      .slick({
        dots: true,
        arrows: true,
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        focusOnSelect: true,
        initialSlide: 0,
        autoplaySpeed: 8000,
        autoplay: true,
        // adaptiveHeight: true,
        fade: $slider.hasClass('slider-fade'),
        speed: 1000,
        draggable: false,
        appendDots: $slider.parents('.slider-wrapper').find('.slider-dots') || '',
        prevArrow: $slider.parents('.slider-wrapper').find('.slick-prev') || '',
        nextArrow: $slider.parents('.slider-wrapper').find('.slick-next') || '',
        responsive: [
          {
            breakpoint: 768,
            settings: {
              autoplaySpeed: 6000,
              speed: 300,
              draggable: true
            }
          }
        ]
      });

    // additional controls
    $('.hide-carousel').on('click', () => {
      $slider.slick('slickPause');
    });
    $('.show-carousel').on('click', () => {
      $slider.slick('slickPlay');
    });
  }
}

class Slide {
  constructor(image, link) {
    this.link = link;
    this.image = image;
  }

  render() {
    let slideElement = document.createElement('div');
    slideElement.className = 'slider-item';
    slideElement.innerHTML = `<a href="${this.link}" style="background-image: url(${this.image})"><img src="${this.image}" alt="image"></a>`;
    return slideElement;
  }
}
