import { H as Hls } from './hls-vendor-dru42stk.js';

function initPlayer(root) {
  var video = root.querySelector('video');
  var overlay = root.querySelector('[data-player-overlay]');
  var source = root.getAttribute('data-video-src');
  var attached = false;
  var hls = null;

  if (!video || !overlay || !source) {
    return;
  }

  function attach() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function play() {
    attach();
    overlay.classList.add('is-hidden');
    video.controls = true;
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        overlay.classList.remove('is-hidden');
      });
    }
  }

  overlay.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
    }
  }, { once: true });
}

document.querySelectorAll('[data-player]').forEach(initPlayer);
