(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", nav.classList.contains("is-open"));
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-thumb]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        var active = slideIndex === index;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle("is-active", thumbIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });
    thumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        show(Number(thumb.getAttribute("data-hero-thumb")) || 0);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    show(0);
    restart();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function applySearch(scope, value, filterKey) {
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-search]"));
    var query = normalize(value);
    var activeFilter = filterKey || "all";
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute("data-search"));
      var key = card.getAttribute("data-filter-key") || "";
      var matchesQuery = !query || haystack.indexOf(query) !== -1;
      var matchesFilter = activeFilter === "all" || key === activeFilter;
      var isVisible = matchesQuery && matchesFilter;
      card.hidden = !isVisible;
      if (isVisible) {
        visible += 1;
      }
    });
    var empty = document.querySelector("[data-empty-state]");
    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  function setupSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    inputs.forEach(function (input) {
      var selector = input.getAttribute("data-target");
      var scope = selector ? document.querySelector(selector) : document;
      if (!scope) {
        return;
      }
      input.addEventListener("input", function () {
        var group = document.querySelector("[data-filter-group]");
        var active = group ? group.querySelector(".filter-button.is-active") : null;
        var key = active ? active.getAttribute("data-filter") : "all";
        applySearch(scope, input.value, key);
      });
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        input.value = q;
        applySearch(scope, q, "all");
      }
    });
  }

  function setupFilters() {
    var group = document.querySelector("[data-filter-group]");
    if (!group) {
      return;
    }
    var selector = group.getAttribute("data-target");
    var scope = selector ? document.querySelector(selector) : document;
    var buttons = Array.prototype.slice.call(group.querySelectorAll("[data-filter]"));
    var input = document.querySelector("[data-search-input]");
    if (!scope) {
      return;
    }
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (other) {
          other.classList.remove("is-active");
        });
        button.classList.add("is-active");
        applySearch(scope, input ? input.value : "", button.getAttribute("data-filter"));
      });
    });
  }

  function setupPlayer() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var trigger = player.querySelector("[data-play]");
      var stream = player.getAttribute("data-stream");
      var started = false;
      var hls = null;

      function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      function start() {
        if (!video || !stream) {
          return;
        }
        player.classList.add("is-playing");
        video.setAttribute("controls", "controls");
        if (started) {
          playVideo();
          return;
        }
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          playVideo();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
          return;
        }
        video.src = stream;
        playVideo();
      }

      if (trigger) {
        trigger.addEventListener("click", start);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (!started) {
            start();
          }
        });
      }
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupFilters();
    setupPlayer();
  });
})();
