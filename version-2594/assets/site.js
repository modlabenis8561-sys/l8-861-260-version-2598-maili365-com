(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        menu.classList.toggle('is-open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (slides.length > 1) {
      var active = 0;
      var showSlide = function (index) {
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === active);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === active);
        });
      };
      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          showSlide(index);
        });
      });
      window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('[data-search-input]');
        var keyword = input ? input.value.trim() : '';
        var target = form.getAttribute('data-search-target') || './all-movies.html';
        if (keyword) {
          window.location.href = target + '?q=' + encodeURIComponent(keyword);
        } else {
          window.location.href = target;
        }
      });
    });

    var movieCards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    var pageSearch = document.querySelector('[data-page-search]');
    var pageCategory = document.querySelector('[data-page-category]');
    var pageYear = document.querySelector('[data-page-year]');
    var applyFilter = function () {
      var keyword = pageSearch ? pageSearch.value.trim().toLowerCase() : '';
      var category = pageCategory ? pageCategory.value : '';
      var year = pageYear ? pageYear.value : '';
      movieCards.forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var genre = (card.getAttribute('data-genre') || '').toLowerCase();
        var cardCategory = card.getAttribute('data-category') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var matchedKeyword = !keyword || title.indexOf(keyword) !== -1 || genre.indexOf(keyword) !== -1;
        var matchedCategory = !category || cardCategory === category;
        var matchedYear = !year || cardYear === year;
        card.classList.toggle('is-hidden-card', !(matchedKeyword && matchedCategory && matchedYear));
      });
    };
    if (pageSearch || pageCategory || pageYear) {
      var params = new URLSearchParams(window.location.search);
      var preset = params.get('q') || '';
      if (pageSearch && preset) {
        pageSearch.value = preset;
      }
      [pageSearch, pageCategory, pageYear].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilter);
          control.addEventListener('change', applyFilter);
        }
      });
      applyFilter();
    }
  });

  window.initMoviePlayer = function (source) {
    var video = document.getElementById('moviePlayer');
    var overlay = document.getElementById('playOverlay');
    if (!video || !source) {
      return;
    }
    var hls = null;
    var attached = false;
    var attach = function () {
      if (attached) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      attached = true;
    };
    var play = function () {
      attach();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    };
    if (overlay) {
      overlay.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  };
})();
