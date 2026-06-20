import { H as Hls } from "./hls-vendor-dru42stk.js";

export function setupPlayer(source) {
  var video = document.getElementById("movieVideo");
  var cover = document.querySelector(".play-cover");
  var hls = null;
  var attached = false;

  if (!video || !source) {
    return;
  }

  function attachSource() {
    if (attached) {
      return Promise.resolve();
    }
    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return Promise.resolve();
    }

    if (Hls && Hls.isSupported()) {
      return new Promise(function (resolve) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hls) {
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          }
        });
      });
    }

    video.src = source;
    return Promise.resolve();
  }

  function start() {
    if (cover) {
      cover.classList.add("is-hidden");
    }
    video.controls = true;
    attachSource().then(function () {
      var playRequest = video.play();
      if (playRequest && typeof playRequest.catch === "function") {
        playRequest.catch(function () {});
      }
    });
  }

  if (cover) {
    cover.addEventListener("click", start);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });
}
