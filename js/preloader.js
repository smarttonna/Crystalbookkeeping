/**
 * Crystal Bookkeeping — Page Preloader
 */
(function () {
  const MIN_DISPLAY_MS = 6000; // minimum time preloader stays visible
  const startTime = Date.now();

  function hidePreloader() {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);

    setTimeout(function () {
      const preloader = document.getElementById('crystalPreloader');
      if (!preloader) return;
      preloader.classList.add('preloader--fade-out');

      preloader.addEventListener('animationend', function () {
        preloader.style.display = 'none';
        document.body.classList.remove('preloader-active');
      }, { once: true });
    }, remaining);
  }

  if (document.readyState === 'complete') {
    hidePreloader();
  } else {
    window.addEventListener('load', hidePreloader);
  }
})();
