(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var toggle = $('.nav-toggle');
  var nav = $('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var slides = $all('.hero-slide');
  var dots = $all('.hero-dot');
  if (slides.length > 1) {
    var index = 0;
    var activate = function (next) {
      slides[index].classList.remove('is-active');
      if (dots[index]) {
        dots[index].classList.remove('is-active');
      }
      index = next;
      slides[index].classList.add('is-active');
      if (dots[index]) {
        dots[index].classList.add('is-active');
      }
    };
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        activate(dotIndex);
      });
    });
    window.setInterval(function () {
      activate((index + 1) % slides.length);
    }, 5200);
  }

  var filterForm = $('[data-filter-form]');
  if (filterForm) {
    var cards = $all('.filter-card');
    var q = $('#q');
    var type = $('#typeFilter');
    var year = $('#yearFilter');
    var genre = $('#genreFilter');
    var result = $('[data-result-count]');

    var normalize = function (value) {
      return String(value || '').toLowerCase().trim();
    };

    var apply = function () {
      var qv = normalize(q && q.value);
      var tv = normalize(type && type.value);
      var yv = normalize(year && year.value);
      var gv = normalize(genre && genre.value);
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var ok = true;
        if (qv && text.indexOf(qv) === -1) {
          ok = false;
        }
        if (tv && normalize(card.getAttribute('data-type')) !== tv) {
          ok = false;
        }
        if (yv && normalize(card.getAttribute('data-year')) !== yv) {
          ok = false;
        }
        if (gv && normalize(card.getAttribute('data-genre')).indexOf(gv) === -1) {
          ok = false;
        }
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });
      if (result) {
        result.textContent = visible + ' 部影片';
      }
    };

    [q, type, year, genre].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  }
})();
