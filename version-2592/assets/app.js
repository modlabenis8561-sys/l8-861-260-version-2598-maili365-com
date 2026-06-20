(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var mobile = document.querySelector(".mobile-nav");
        if (!toggle || !mobile) {
            return;
        }
        toggle.addEventListener("click", function () {
            mobile.classList.toggle("open");
        });
    }

    function setupCarousel() {
        var hero = document.querySelector(".hero");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector(".hero-prev");
        var next = hero.querySelector(".hero-next");
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }
        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
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
        restart();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        panels.forEach(function (panel) {
            var input = panel.querySelector(".js-search-input");
            var select = panel.querySelector(".js-year-select");
            var cards = Array.prototype.slice.call(panel.querySelectorAll(".movie-card"));
            var empty = panel.querySelector(".empty-tip");
            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var year = select ? select.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var search = card.getAttribute("data-search") || "";
                    var cardYear = card.getAttribute("data-year") || "";
                    var matched = (!keyword || search.indexOf(keyword) !== -1) && (!year || cardYear === year);
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("active", visible === 0);
                }
            }
            if (input) {
                input.addEventListener("input", apply);
            }
            if (select) {
                select.addEventListener("change", apply);
            }
            apply();
        });
    }

    window.startMoviePlayer = function (videoId, triggerId, sourceUrl) {
        var video = document.getElementById(videoId);
        var trigger = document.getElementById(triggerId);
        if (!video || !sourceUrl) {
            return;
        }
        var hls = null;
        var loaded = false;
        function load() {
            if (!loaded) {
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = sourceUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(sourceUrl);
                    hls.attachMedia(video);
                } else {
                    video.src = sourceUrl;
                }
            }
            if (trigger) {
                trigger.classList.add("hidden");
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }
        if (trigger) {
            trigger.addEventListener("click", load);
            trigger.addEventListener("keydown", function (event) {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    load();
                }
            });
        }
        video.addEventListener("click", function () {
            if (!loaded) {
                load();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupCarousel();
        setupFilters();
    });
})();
