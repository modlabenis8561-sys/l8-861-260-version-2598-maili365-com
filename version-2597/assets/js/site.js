(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    if (!slides.length) {
      return;
    }
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-to]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function go(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        go(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        go(Number(dot.getAttribute("data-hero-to") || 0));
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        go(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        go(current + 1);
        restart();
      });
    }

    restart();
  }

  function setupLocalSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll(".js-card-search"));
    inputs.forEach(function (input) {
      var scope = input.closest("section") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      input.addEventListener("input", function () {
        var query = normalize(input.value);
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-tags")
          ].join(" "));
          card.classList.toggle("is-hidden-by-search", query && haystack.indexOf(query) === -1);
        });
      });
    });
  }

  function setupGlobalSearch() {
    var input = document.getElementById("globalSearch");
    var panel = document.getElementById("searchPanel");
    var movies = window.__MOVIES__ || [];
    if (!input || !panel || !movies.length) {
      return;
    }
    var root = document.body.getAttribute("data-root-path") || "";

    function closePanel() {
      panel.classList.remove("is-visible");
      panel.innerHTML = "";
    }

    input.addEventListener("input", function () {
      var query = normalize(input.value);
      if (!query) {
        closePanel();
        return;
      }
      var results = movies.filter(function (movie) {
        return normalize(movie.title + " " + movie.genre + " " + movie.tags + " " + movie.year + " " + movie.region).indexOf(query) !== -1;
      }).slice(0, 8);
      if (!results.length) {
        panel.innerHTML = '<div class="search-result"><strong>暂无匹配内容</strong><span>换个关键词继续搜索</span></div>';
        panel.classList.add("is-visible");
        return;
      }
      panel.innerHTML = results.map(function (movie) {
        return '<a class="search-result" href="' + root + movie.url + '"><strong>' + movie.title + '</strong><span>' + movie.year + ' · ' + movie.region + ' · ' + movie.genre + '</span></a>';
      }).join("");
      panel.classList.add("is-visible");
    });

    input.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closePanel();
      }
    });

    document.addEventListener("click", function (event) {
      if (!panel.contains(event.target) && event.target !== input) {
        closePanel();
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupLocalSearch();
    setupGlobalSearch();
  });
})();
