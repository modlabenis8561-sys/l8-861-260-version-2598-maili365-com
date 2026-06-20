(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var navToggle = qs('[data-nav-toggle]');
  var nav = qs('[data-site-nav]');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  qsa('[data-global-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = qs('input[name="q"]', form);
      var value = input ? input.value.trim() : '';
      var base = form.getAttribute('data-search-base') || 'search.html';
      if (value) {
        window.location.href = base + '?q=' + encodeURIComponent(value);
      } else {
        window.location.href = base;
      }
    });
  });

  qsa('[data-hero-carousel]').forEach(function (carousel) {
    var slides = qsa('.hero-slide', carousel);
    var dots = qsa('.hero-dot', carousel);
    var index = 0;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  });

  qsa('[data-card-filter]').forEach(function (input) {
    var cards = qsa('[data-movie-card]');
    input.addEventListener('input', function () {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '')).toLowerCase();
        card.style.display = !value || text.indexOf(value) !== -1 ? '' : 'none';
      });
    });
  });

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderSearch() {
    var root = qs('[data-search-results]');
    if (!root || !window.__MOVIE_SEARCH_DATA__) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = qs('[data-search-input]');
    if (input) {
      input.value = query;
    }

    var normalized = query.toLowerCase();
    var data = window.__MOVIE_SEARCH_DATA__;
    var results = normalized
      ? data.filter(function (item) {
          return [item.title, item.region, item.type, item.year, item.genre, item.tags, item.category]
            .join(' ')
            .toLowerCase()
            .indexOf(normalized) !== -1;
        })
      : data.slice(0, 80);

    if (!results.length) {
      root.innerHTML = '<div class="empty-state">未找到匹配影片，请尝试更换关键词。</div>';
      return;
    }

    root.innerHTML = '<div class="movie-grid">' + results.map(function (item) {
      return '<article class="movie-card">'
        + '<a class="movie-poster" href="' + escapeHtml(item.url) + '">'
        + '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">'
        + '<span class="play-chip">播放</span>'
        + '</a>'
        + '<div class="movie-card-body">'
        + '<a class="movie-title" href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a>'
        + '<div class="movie-meta-line"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>'
        + '<p>' + escapeHtml(item.desc) + '</p>'
        + '<div class="movie-tags"><span>' + escapeHtml(item.genre) + '</span><span>' + escapeHtml(item.category) + '</span></div>'
        + '</div>'
        + '</article>';
    }).join('') + '</div>';
  }

  renderSearch();
})();
