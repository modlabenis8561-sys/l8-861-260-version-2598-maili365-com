(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function parseConfig(container) {
    var node = container.querySelector(".stream-config");
    if (!node) {
      return null;
    }
    try {
      return JSON.parse(node.textContent);
    } catch (error) {
      return null;
    }
  }

  function attachPlayer(container) {
    var video = container.querySelector("video");
    var config = parseConfig(container);
    if (!video || !config || !config.src || video.dataset.ready === "true") {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = config.src;
      video.dataset.ready = "true";
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var player = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      player.loadSource(config.src);
      player.attachMedia(video);
      container._hlsPlayer = player;
      video.dataset.ready = "true";
      return;
    }
    video.src = config.src;
    video.dataset.ready = "true";
  }

  function play(container) {
    var video = container.querySelector("video");
    if (!video) {
      return;
    }
    attachPlayer(container);
    container.classList.add("is-playing");
    video.setAttribute("controls", "controls");
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {});
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("hidden");
      });
    }

    document.querySelectorAll("[data-local-filter]").forEach(function (input) {
      var list = document.querySelector("[data-filter-list]");
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll("[data-filter-card]"));
      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var value = (card.getAttribute("data-search") || "").toLowerCase();
          card.classList.toggle("hidden-by-filter", keyword && value.indexOf(keyword) === -1);
        });
      });
    });

    document.querySelectorAll("[data-player]").forEach(function (container) {
      var overlay = container.querySelector(".play-overlay");
      var video = container.querySelector("video");
      if (overlay) {
        overlay.addEventListener("click", function () {
          play(container);
        });
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            play(container);
          }
        });
        video.addEventListener("play", function () {
          container.classList.add("is-playing");
        });
      }
    });
  });
})();
