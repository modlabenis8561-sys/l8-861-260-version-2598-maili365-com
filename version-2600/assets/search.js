(function () {
  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function card(movie) {
    return [
      '<a class="group movie-card bg-slate-900 rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-yellow-400/20 transition-all duration-300 hover:-translate-y-2" href="' + escapeHtml(movie.url) + '">',
      '  <div class="relative h-56 overflow-hidden">',
      '    <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>',
      '    <span class="absolute top-4 left-4 px-3 py-1 bg-yellow-500 text-black text-xs font-semibold rounded-full">' + escapeHtml(movie.category) + '</span>',
      '    <span class="absolute top-4 right-4 px-2 py-1 bg-black bg-opacity-70 text-white text-xs rounded">' + escapeHtml(movie.year) + '</span>',
      '  </div>',
      '  <div class="p-5">',
      '    <h3 class="text-lg font-semibold text-white mb-2 group-hover:text-yellow-400 transition-colors line-clamp-1">' + escapeHtml(movie.title) + '</h3>',
      '    <p class="text-gray-400 text-sm mb-3 line-clamp-2">' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="flex items-center justify-between text-xs text-gray-500">',
      '      <span class="text-yellow-400">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</span>',
      '    </div>',
      '  </div>',
      '</a>'
    ].join("");
  }

  function collectText(movie) {
    return [
      movie.title,
      movie.year,
      movie.region,
      movie.type,
      movie.genre,
      movie.category,
      movie.oneLine,
      (movie.tags || []).join(" ")
    ].join(" ").toLowerCase();
  }

  function render() {
    var data = window.MOVIE_SEARCH || [];
    var input = document.getElementById("search-input");
    var results = document.getElementById("search-results");
    var summary = document.getElementById("search-summary");
    if (!input || !results || !summary) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    input.value = query;
    var keyword = query.trim().toLowerCase();
    var matches = keyword ? data.filter(function (movie) {
      return collectText(movie).indexOf(keyword) !== -1;
    }) : data.slice(0, 24);
    results.innerHTML = matches.slice(0, 200).map(card).join("");
    if (keyword) {
      summary.textContent = matches.length ? "搜索结果" : "没有找到匹配的影视作品";
    } else {
      summary.textContent = "热门影视";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
