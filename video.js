// Auto-fullscreen the wedding video whenever playback starts, so guests
// get an immersive view instead of the small inline frame. Falls back
// gracefully on browsers/devices that block or don't support it.
(function () {
  var video = document.getElementById('main-video');
  if (!video) return;

  // Speed bump against casual saving — doesn't stop screen recording or
  // anyone who opens dev tools, but removes the one-click paths.
  video.setAttribute('draggable', 'false');
  video.addEventListener('contextmenu', function (event) {
    event.preventDefault();
  });

  function isFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }

  video.addEventListener('play', function () {
    if (isFullscreen()) return;
    if (video.requestFullscreen) {
      video.requestFullscreen().catch(function () {});
    } else if (video.webkitEnterFullscreen) {
      // iOS Safari: only the video element itself can go fullscreen.
      video.webkitEnterFullscreen();
    } else if (video.webkitRequestFullscreen) {
      video.webkitRequestFullscreen();
    }
  });
})();
