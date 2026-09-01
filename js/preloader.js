/**
 * Crystal Bookkeeping — Page Preloader with Realistic 3D Book Flipping Audio
 */
(function () {
  const MIN_DISPLAY_MS = 6000; // minimum time preloader stays visible
  const startTime = Date.now();

  // Web Audio Context for realistic page flip sound
  let audioCtx = null;
  let audioUnlocked = false;

  function initAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    } catch (e) {
      console.warn("AudioContext not supported:", e);
    }
  }

  // Synthesize realistic soft paper flutter / page flip sound
  function playSyntheticPageTurn() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    try {
      const bufferSize = audioCtx.sampleRate * 0.25; // 250ms page swish
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
  const flipAudio = new Audio('assets/audio/page-flip.wav');
  flipAudio.volume = 0.5;

  function triggerPageFlipSound() {
    // Attempt standard audio file first
    const playPromise = flipAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(function () {
        // If browser blocks HTML5 audio autoplay, try Web Audio synthesis
        playSyntheticPageTurn();
      });
    } else {
      playSyntheticPageTurn();
    }
  }

  // Schedule rhythmic page flips during the 6-second preloader
  function startPageFlipSequence() {
    initAudio();
    triggerPageFlipSound();

    // Secondary and tertiary flips during loop
    const flipTimer1 = setTimeout(triggerPageFlipSound, 900);
    const flipTimer2 = setTimeout(triggerPageFlipSound, 1700);
    const flipTimer3 = setTimeout(triggerPageFlipSound, 2600);
    const flipTimer4 = setTimeout(triggerPageFlipSound, 3500);

    return function cleanup() {
      clearTimeout(flipTimer1);
      clearTimeout(flipTimer2);
      clearTimeout(flipTimer3);
      clearTimeout(flipTimer4);
    };
  }

  // Handle autoplay unlock on first gesture
  function unlockAudioOnGesture() {
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

  const cleanupAudio = startPageFlipSequence();

  function hidePreloader() {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);

    setTimeout(function () {
      const preloader = document.getElementById('crystalPreloader');
      if (!preloader) return;
      preloader.classList.add('preloader--fade-out');
      if (cleanupAudio) cleanupAudio();

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
