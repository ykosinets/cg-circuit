let $indexPageButtons = $('.toggle-button');
let $indexPageToggleButton = $('.toggle-button');
let $indexPageMenu = $('.navigation');
let $body = $('body');
let $window = $(window);
document.documentElement.style.setProperty('--scroll-y', '0');

if ($indexPageButtons.length) {
  $indexPageButtons.on('click', function () {
    $indexPageToggleButton.toggleClass('active');
    $indexPageMenu.toggleClass('active');
    $body.toggleClass('menu-open');
    if($body.hasClass('menu-open')){
      $body.css('top', '-' + document.documentElement.style.getPropertyValue('--scroll-y'));
    }else {
      window.scrollTo(0, parseInt($body.css('top') || '0') * -1);
      $body.css('top', 'auto');
    }
  });
  $window
    .on('scroll', function () {
      document.documentElement.style.setProperty('--scroll-y', `${window.scrollY}px`);
    })
}
