$.fn.extend({
  animateCss: function(animationName, callback) {
    var animationEnd = (function(el) {
      var animations = {
        animation: 'animationend',
        OAnimation: 'oAnimationEnd',
        MozAnimation: 'mozAnimationEnd',
        WebkitAnimation: 'webkitAnimationEnd',
      };

      for (var t in animations) {
        if (el.style[t] !== undefined) {
          return animations[t];
        }
      }
    })(document.createElement('div'));

    this.addClass('animated ' + animationName).one(animationEnd, function() {
      $(this).removeClass('animated ' + animationName);

      if (typeof callback === 'function') callback();
    });

    return this;
  },
});

$().ready(() => {
  $('#btn-register-page').on('click', () => {
    $('html').addClass('overflow-x-hidden')
    $('.signin-card').animateCss('zoomOut', () => {
      $('.signin-card').addClass('d-none')
      $('.register-card').removeClass('d-none')
      $('.register-card').animateCss('zoomIn', () => {
        $('html').removeClass('overflow-x-hidden')
      })
    })
  })

  $('#btn-signin-page').on('click', () => {
    $('html').addClass('overflow-x-hidden')
    $('.register-card').animateCss('zoomOut', () => {
      $('.register-card').addClass('d-none')
      $('.signin-card').removeClass('d-none')
      $('.signin-card').animateCss('zoomIn', () => {
        $('html').removeClass('overflow-x-hidden')
      })
    })
  })
});