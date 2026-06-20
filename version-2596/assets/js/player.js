(function () {
  var shells = Array.prototype.slice.call(document.querySelectorAll('.video-shell'));
  shells.forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.play-overlay');
    if (!video) {
      return;
    }
    var source = video.getAttribute('src');
    var prepared = false;
    var hls = null;

    var prepare = function () {
      if (prepared) {
        return;
      }
      prepared = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    };

    var play = function () {
      prepare();
      shell.classList.add('is-playing');
      var request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    };

    if (button) {
      button.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        shell.classList.remove('is-playing');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
