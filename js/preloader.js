/**
 * Crystal Bookkeeping — Page Preloader with Realistic 3D Book Flipping Audio
 */
(function () {
  const MIN_DISPLAY_MS = 6000; // minimum time preloader stays visible
  const startTime = Date.now();
  let isPreloaderActive = true;
  let isMuted = false;

  // Web Audio Context for realistic page flip sound
  let audioCtx = null;
  let audioUnlocked = false;

  function initAudio() {
    if (!isPreloaderActive || isMuted) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext && !audioCtx) {
        audioCtx = new AudioContext();
      }
    } catch (e) {
      console.warn("AudioContext not supported:", e);
    }
  }

  // Synthesize realistic soft paper flutter / page flip sound
  function playSyntheticPageTurn() {
    if (!isPreloaderActive || isMuted || !audioCtx) return;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    try {
      const bufferSize = Math.floor(audioCtx.sampleRate * 0.25); // 250ms page swish
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastVal = 0;

      for (let i = 0; i < bufferSize; i++) {
        const t = i / bufferSize;
        const envelope = Math.sin(t * Math.PI) * Math.exp(-t * 3.5);
        const white = Math.random() * 2 - 1;
        lastVal = lastVal * 0.72 + white * 0.28;
        data[i] = lastVal * envelope * 0.35;
      }

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;

      // Bandpass filter for realistic paper resonance
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 850 + Math.random() * 300;
      filter.Q.value = 1.2;

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.24);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      source.start();
    } catch (e) {
      // Audio fallback silent catch
    }
  }

  // Play audio file if available
  let flipAudio = null;
  try {
    flipAudio = new Audio('assets/audio/page-flip.wav');
    flipAudio.volume = 0.5;
  } catch (e) {}

  function triggerPageFlipSound() {
    if (!isPreloaderActive || isMuted) return;

    if (flipAudio) {
      // Attempt standard audio file first
      flipAudio.currentTime = 0;
      const playPromise = flipAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(function () {
          // If browser blocks HTML5 audio autoplay, try Web Audio synthesis
          if (isPreloaderActive && !isMuted) {
            playSyntheticPageTurn();
          }
        });
      } else {
        playSyntheticPageTurn();
      }
    } else {
      playSyntheticPageTurn();
    }
  }

  let flipTimers = [];

  // Schedule rhythmic page flips during the 6-second preloader
  function startPageFlipSequence() {
    initAudio();
    triggerPageFlipSound();

    // Secondary and tertiary flips during loop
    flipTimers.push(setTimeout(triggerPageFlipSound, 900));
    flipTimers.push(setTimeout(triggerPageFlipSound, 1700));
    flipTimers.push(setTimeout(triggerPageFlipSound, 2600));
    flipTimers.push(setTimeout(triggerPageFlipSound, 3500));
  }

  function stopAllAudio() {
    isPreloaderActive = false;

    // Clear all pending flip timers
    flipTimers.forEach(function (timer) {
      clearTimeout(timer);
    });
    flipTimers = [];

    // Remove window interaction listeners
    window.removeEventListener('click', unlockAudioOnGesture);
    window.removeEventListener('touchstart', unlockAudioOnGesture);
    window.removeEventListener('keydown', unlockAudioOnGesture);

    // Stop and reset HTML5 audio
    if (flipAudio) {
      try {
        flipAudio.pause();
        flipAudio.currentTime = 0;
      } catch (e) {}
    }

    // Close and tear down Web Audio context
    if (audioCtx) {
      try {
        if (typeof audioCtx.close === 'function') {
          audioCtx.close();
        }
      } catch (e) {}
      audioCtx = null;
    }
  }

  // Handle autoplay unlock on first gesture ONLY while preloader is active
  function unlockAudioOnGesture() {
    if (!isPreloaderActive || isMuted) {
      window.removeEventListener('click', unlockAudioOnGesture);
      window.removeEventListener('touchstart', unlockAudioOnGesture);
      window.removeEventListener('keydown', unlockAudioOnGesture);
      return;
    }
    if (!audioUnlocked) {
      audioUnlocked = true;
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      triggerPageFlipSound();
    }
  }

  window.addEventListener('click', unlockAudioOnGesture, { once: true });
  window.addEventListener('touchstart', unlockAudioOnGesture, { once: true });
  window.addEventListener('keydown', unlockAudioOnGesture, { once: true });

  // Mute / Unmute toggle on preloader sound indicator
  const soundHint = document.getElementById('preloaderSoundHint');
  if (soundHint) {
    soundHint.style.cursor = 'pointer';
    soundHint.setAttribute('title', 'Click to mute/unmute sound');
    soundHint.addEventListener('click', function (e) {
      e.stopPropagation();
      isMuted = !isMuted;
      if (isMuted) {
        soundHint.innerHTML = '<i class="bi bi-volume-mute-fill"></i> Sound Muted';
        if (flipAudio) {
          try { flipAudio.pause(); } catch (err) {}
        }
      } else {
        soundHint.innerHTML = '<i class="bi bi-volume-up-fill"></i> Sound Enabled';
        initAudio();
        triggerPageFlipSound();
      }
    });
  }

  startPageFlipSequence();

  function hidePreloader() {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);

    setTimeout(function () {
      // Immediately kill all audio and remove gesture listeners when preloader begins fade out
      stopAllAudio();

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
