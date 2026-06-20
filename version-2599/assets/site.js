(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function basePath() {
    return document.body.getAttribute("data-base") || "";
  }

  function bindMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function bindSearchForms() {
    var forms = document.querySelectorAll("[data-search-form]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : "";
        if (!query) {
          event.preventDefault();
          return;
        }
        event.preventDefault();
        window.location.href = basePath() + "search.html?q=" + encodeURIComponent(query);
      });
    });
  }

  function bindHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    show(0);
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function bindLocalFilter() {
    var input = document.querySelector("[data-local-filter]");
    var year = document.querySelector("[data-year-filter]");
    var type = document.querySelector("[data-type-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    if (!cards.length || (!input && !year && !type)) {
      return;
    }
    function match(card) {
      var q = input ? input.value.trim().toLowerCase() : "";
      var y = year ? year.value : "";
      var t = type ? type.value : "";
      var text = [
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags")
      ].join(" ").toLowerCase();
      var okText = !q || text.indexOf(q) !== -1;
      var okYear = !y || card.getAttribute("data-year") === y;
      var okType = !t || card.getAttribute("data-type") === t;
      return okText && okYear && okType;
    }
    function run() {
      cards.forEach(function (card) {
        card.style.display = match(card) ? "" : "none";
      });
    }
    [input, year, type].forEach(function (item) {
      if (item) {
        item.addEventListener("input", run);
        item.addEventListener("change", run);
      }
    });
  }

  function renderSearch() {
    var target = document.querySelector("[data-search-results]");
    if (!target || !window.MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim().toLowerCase();
    var title = document.querySelector("[data-search-title]");
    if (title) {
      title.textContent = query ? "搜索结果：" + params.get("q") : "搜索影片";
    }
    if (!query) {
      target.innerHTML = '<div class="empty-state">输入影片名、地区、类型或标签即可搜索片库内容。</div>';
      return;
    }
    var results = window.MOVIES.filter(function (movie) {
      return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(" ").toLowerCase().indexOf(query) !== -1;
    }).slice(0, 240);
    if (!results.length) {
      target.innerHTML = '<div class="empty-state">没有找到相关作品。</div>';
      return;
    }
    target.innerHTML = results.map(function (movie) {
      return '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-year="' + escapeHtml(movie.year) + '" data-region="' + escapeHtml(movie.region) + '" data-type="' + escapeHtml(movie.type) + '" data-genre="' + escapeHtml(movie.genre) + '" data-tags="' + escapeHtml(movie.tags) + '">' +
        '<a class="poster-wrap" href="' + escapeHtml(movie.url) + '">' +
        '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="year-badge">' + escapeHtml(movie.year) + '</span><span class="play-badge">立即观看</span></a>' +
        '<div class="movie-card-body"><h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
        '<p>' + escapeHtml(movie.oneLine) + '</p><div class="movie-meta-row"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div></div></article>';
    }).join("");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  window.setupPlayer = function (streamUrl) {
    var video = document.querySelector("[data-player-video]");
    var cover = document.querySelector("[data-player-cover]");
    var button = document.querySelector("[data-player-button]");
    if (!video || !streamUrl) {
      return;
    }
    var started = false;
    function start() {
      if (started) {
        video.play().catch(function () {});
        return;
      }
      started = true;
      if (cover) {
        cover.classList.add("is-hidden");
      }
      video.setAttribute("controls", "controls");
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = streamUrl;
        video.addEventListener("loadedmetadata", function () {
          video.play().catch(function () {});
        }, { once: true });
        video.load();
      }
    }
    if (button) {
      button.addEventListener("click", start);
    }
    if (cover) {
      cover.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (!started) {
        start();
      }
    });
  };

  ready(function () {
    bindMobileMenu();
    bindSearchForms();
    bindHero();
    bindLocalFilter();
    renderSearch();
  });
})();
