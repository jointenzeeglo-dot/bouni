
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- PRELOADER ---------- */
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => preloader.classList.add('hidden'), 600);
  });
  // Fallback in case 'load' already fired
  setTimeout(() => preloader.classList.add('hidden'), 2200);

  /* ---------- AMBIENT PARTICLE BACKGROUND ---------- */
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function makeParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.6,
      speedY: Math.random() * 0.25 + 0.05,
      speedX: (Math.random() - 0.5) * 0.15,
      opacity: Math.random() * 0.5 + 0.15,
      hue: Math.random() > 0.5 ? '243,174,198' : '233,221,245' // rose / lavender
    };
  }

  const PARTICLE_COUNT = window.innerWidth < 600 ? 34 : 60;
  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(makeParticle());

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.hue}, ${p.opacity})`;
      ctx.shadowBlur = 6;
      ctx.shadowColor = `rgba(${p.hue}, 0.6)`;
      ctx.fill();

      p.y -= p.speedY;
      p.x += p.speedX;

      if (p.y < -10) {
        p.y = canvas.height + 10;
        p.x = Math.random() * canvas.width;
      }
    });
    requestAnimationFrame(drawParticles);
  }
  drawParticles();

  /* ---------- CURSOR GLOW ---------- */
  const cursorGlow = document.getElementById('cursor-glow');
  window.addEventListener('mousemove', (e) => {
    cursorGlow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
  });

  /* ---------- SCREEN NAVIGATION ---------- */
  const screens = document.querySelectorAll('.screen');
  const progressTrack = document.getElementById('progress-track');
  const progressFill = document.getElementById('progress-fill');
  const TOTAL_QUESTIONS = 5;

  function goToScreen(id) {
    screens.forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    target.classList.add('active');

    const qNum = target.dataset.question;
    if (qNum) {
      progressTrack.classList.add('visible');
      progressFill.style.width = `${(qNum / TOTAL_QUESTIONS) * 100}%`;
    } else if (id === 'screen-final') {
      progressTrack.classList.remove('visible');
      launchConfetti();
      // animateLoveLetters();
      startFloatingHearts();
    } else {
      progressTrack.classList.remove('visible');
    }
  }

  document.getElementById('start-btn').addEventListener('click', (e) => {
    spawnRipple(e);
    spawnClickSparkles(e.clientX, e.clientY);
    goToScreen('screen-q1');
  });

  document.querySelectorAll('[data-next]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      spawnRipple(e);
      spawnClickSparkles(e.clientX, e.clientY);
      goToScreen(btn.dataset.next);
    });
  });

  /* ---------- RIPPLE EFFECT ---------- */
  function spawnRipple(e) {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    btn.style.position = btn.style.position || 'relative';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
  }

  /* ---------- CLICK SPARKLE BURST ---------- */
  function spawnClickSparkles(x, y) {
    for (let i = 0; i < 8; i++) {
      const s = document.createElement('div');
      s.className = 'click-sparkle';
      const angle = (Math.PI * 2 * i) / 8;
      const dist = 30 + Math.random() * 20;
      s.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
      s.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
      s.style.left = `${x}px`;
      s.style.top = `${y}px`;
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 650);
    }
  }

  /* ---------- REUSABLE "EVASIVE BUTTON" FACTORY ----------
     Powers both the quiz "No" buttons AND (once the person
     has tried to slap too many times) the slap button itself. */
  const escapeMessages = ['Nice try 😂', 'Nope!', 'You almost got me!', 'Still no!', 'Hehe 😜', 'Too slow!', 'Missed me!'];
  const noColors = [
    'linear-gradient(135deg, #F3AEC6, #FFD9E8)',
    'linear-gradient(135deg, #C9B3E8, #E9DDF5)',
    'linear-gradient(135deg, #E8C99B, #FBE7C6)',
    'linear-gradient(135deg, #9BC98A, #C7E6BC)',
    'linear-gradient(135deg, #D97FA0, #F3AEC6)'
  ];

  function makeEvasive(btn, { minScale = 0.28, verticalRange = 220, recolor = true } = {}) {
    let scale = 1;

    function escape(clientX, clientY) {
      if (scale <= minScale) return; // too tiny to escape further, effectively unpressable

      const row = btn.parentElement;
      const rowRect = row.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();

      scale = Math.max(minScale, scale * 0.9);
      const rotation = (Math.random() - 0.5) * 40;

      const maxX = Math.max(0, rowRect.width - btnRect.width * scale);
      const maxY = verticalRange;
      const randX = Math.random() * maxX;
      const randY = (Math.random() - 0.5) * maxY;

      btn.classList.add('evasive');
      btn.style.left = `${randX}px`;
      btn.style.top = `${randY}px`;
      btn.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
      if (recolor) btn.style.background = noColors[Math.floor(Math.random() * noColors.length)];
      btn.style.transition = 'left 0.35s var(--ease-soft), top 0.35s var(--ease-soft), transform 0.3s var(--ease-soft), background 0.3s ease';

      const msg = escapeMessages[Math.floor(Math.random() * escapeMessages.length)];
      const floatEl = document.createElement('div');
      floatEl.className = 'escape-text';
      floatEl.textContent = msg;
      floatEl.style.left = `${clientX - 20}px`;
      floatEl.style.top = `${clientY - 30}px`;
      document.body.appendChild(floatEl);
      setTimeout(() => floatEl.remove(), 1000);
    }

    return escape;
  }

  /* ---------- THE ESCAPING "NO" BUTTON (quiz screens) ---------- */
  document.querySelectorAll('[data-question-no]').forEach(btn => {
    const escape = makeEvasive(btn);
    btn.addEventListener('mouseenter', (e) => escape(e.clientX, e.clientY));
    btn.addEventListener('click', (e) => { e.preventDefault(); escape(e.clientX, e.clientY); });
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      escape(touch.clientX, touch.clientY);
    }, { passive: false });
  });

  /* ---------- CONFETTI ---------- */
  const confettiCanvas = document.getElementById('confetti-canvas');
  const cctx = confettiCanvas.getContext('2d');
  let confettiPieces = [];
  let confettiRunning = false;

  function resizeConfetti() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  resizeConfetti();
  window.addEventListener('resize', resizeConfetti);

  const confettiColors = ['#F3AEC6', '#E9DDF5', '#E8C99B', '#D97FA0', '#C7E6BC', '#FFFFFF'];

  function makeConfettiPiece() {
    return {
      x: Math.random() * confettiCanvas.width,
      y: -20 - Math.random() * confettiCanvas.height * 0.5,
      w: Math.random() * 7 + 4,
      h: Math.random() * 10 + 6,
      speed: Math.random() * 2.5 + 1.5,
      drift: (Math.random() - 0.5) * 1.5,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)]
    };
  }

  function launchConfetti(count = 130, duration = 6000) {
    confettiPieces = Array.from({ length: count }, makeConfettiPiece);
    if (!confettiRunning) {
      confettiRunning = true;
      animateConfetti();
    }
    setTimeout(() => { confettiRunning = false; }, duration);
  }

  function animateConfetti() {
    cctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiPieces.forEach(p => {
      cctx.save();
      cctx.translate(p.x, p.y);
      cctx.rotate((p.rotation * Math.PI) / 180);
      cctx.fillStyle = p.color;
      cctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      cctx.restore();

      p.y += p.speed;
      p.x += p.drift;
      p.rotation += p.rotationSpeed;

      if (p.y > confettiCanvas.height + 20) {
        if (confettiRunning) {
          Object.assign(p, makeConfettiPiece(), { y: -20 });
        }
      }
    });

    if (confettiPieces.some(p => p.y < confettiCanvas.height + 20) || confettiRunning) {
      requestAnimationFrame(animateConfetti);
    } else {
      cctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  /* ---------- "I LOVE YOU" LETTER REVEAL ---------- */
  function animateLoveLetters() {
    const letters = document.querySelectorAll('#i-love-you-text span');
    letters.forEach((el, i) => {
      el.style.animationDelay = `${0.9 + i * 0.07}s`;
    });
  }

  /* ---------- FLOATING HEARTS (final screen ambience) ---------- */
  const heartsHost = document.getElementById('floating-hearts');
  const heartEmojis = ['💗', '💕', '🩷', '💖', '🐒'];
  let heartsInterval = null;

  function spawnFloatingHeart() {
    const el = document.createElement('span');
    el.className = 'floating-heart';
    el.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
    el.style.left = `${Math.random() * 100}%`;
    el.style.setProperty('--drift', `${(Math.random() - 0.5) * 120}px`);
    const duration = 6 + Math.random() * 5;
    el.style.animationDuration = `${duration}s`;
    el.style.fontSize = `${1 + Math.random() * 1.1}rem`;
    heartsHost.appendChild(el);
    setTimeout(() => el.remove(), duration * 1000 + 200);
  }

  function startFloatingHearts() {
    if (heartsInterval) return; // only start once
    for (let i = 0; i < 4; i++) setTimeout(spawnFloatingHeart, i * 400);
    heartsInterval = setInterval(spawnFloatingHeart, 900);
  }

  /* ---------- TINY SYNTHESIZED "SLAP" SOUND (no audio file needed) ---------- */
  let audioCtx = null;
  function playSlapSound() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const now = audioCtx.currentTime;

      // Short filtered noise burst = the "smack"
      const bufferSize = audioCtx.sampleRate * 0.15;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.12);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      noise.connect(filter).connect(gain).connect(audioCtx.destination);
      noise.start(now);
      noise.stop(now + 0.18);
    } catch (err) {
      // Web Audio unsupported or blocked — fail silently, the visuals still land the joke
    }
  }

  /* ---------- SCREEN SHAKE + FLASH (comedic impact) ---------- */
  function triggerShake() {
    document.body.classList.remove('shake');
    void document.body.offsetWidth; // restart animation
    document.body.classList.add('shake');
    setTimeout(() => document.body.classList.remove('shake'), 460);
  }

  const screenFlash = document.getElementById('screen-flash');
  function triggerFlash() {
    screenFlash.classList.remove('flash');
    void screenFlash.offsetWidth;
    screenFlash.classList.add('flash');
  }

  /* ---------- FLYING HAND EMOJI ---------- */
  const handEmojis = ['✋', '🖐️', '🤚'];
  function spawnFlyingHands(x, y) {
    for (let i = 0; i < 3; i++) {
      const el = document.createElement('div');
      el.className = 'flying-hand';
      el.textContent = handEmojis[Math.floor(Math.random() * handEmojis.length)];
      const angle = (-Math.PI / 2) + (Math.random() - 0.5) * 1.6;
      const dist = 90 + Math.random() * 140;
      el.style.setProperty('--hx', `${Math.cos(angle) * dist}px`);
      el.style.setProperty('--hy', `${Math.sin(angle) * dist}px`);
      el.style.setProperty('--hr', `${(Math.random() - 0.5) * 240}deg`);
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.animationDelay = `${i * 0.04}s`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 850);
    }
  }

  /* ---------- THE SLAP GAME ---------- */
  const hugBtn = document.getElementById('hug-btn');
  const hugBtnLabel = document.getElementById('hug-btn-label');
  const hugOverlay = document.getElementById('hug-overlay');
  const hugSparkles = document.getElementById('hug-sparkles');
  const hugToast = document.getElementById('hug-toast');
  const slapCounter = document.getElementById('slap-counter');

  const slapMessages = [
    "You can't!! Don't try 🤣🤣",
    "Nuh-uh, Nagara banayko Badarni  🚫🤭",
    "My reflexes say otherwise 😌✋",
    "Cute attempt though you putki🐒💕",
    "Denied! Try again in 0 years 😂",
    "Bouni, be nice 🥺👉👈",
    "Slap declined by the management 📋😤",
    "Error 404: slap not found 💻🤣"
  ];
  const escalatingLabels = [
    "Do you wanna slap Me",
    "Try again? 😏",
    "Getting closer... not really 😂",
    "Ok this is just funny now 🤣",
    "You're persistent, I respect it 🐒",
    "Legendary levels of trying 🏆😤"
  ];

  let slapAttempts = 0;
  let slapEscape = null; // set once evasion kicks in

  function updateSlapCounter() {
    if (slapAttempts === 0) {
      slapCounter.classList.remove('show');
      return;
    }
    slapCounter.textContent = `attempts so far: ${slapAttempts} 😅`;
    slapCounter.classList.add('show');
  }

  function doHugOverlay(message) {
    hugToast.textContent = message;
    hugOverlay.classList.remove('active');
    void hugOverlay.offsetWidth; // restart animation
    hugOverlay.classList.add('active');

    hugSparkles.innerHTML = '';
    for (let i = 0; i < 24; i++) {
      const s = document.createElement('div');
      s.className = 'hug-sparkle';
      const angle = Math.random() * Math.PI * 2;
      const dist = 80 + Math.random() * 220;
      s.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
      s.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
      s.style.left = '50%';
      s.style.top = '50%';
      s.style.animationDelay = `${Math.random() * 0.3}s`;
      hugSparkles.appendChild(s);
    }
  }

  hugBtn.addEventListener('click', (e) => {
    spawnRipple(e);

    slapAttempts += 1;
    updateSlapCounter();
    hugBtnLabel.textContent = escalatingLabels[Math.min(slapAttempts, escalatingLabels.length - 1)];

    // comedic impact: shake, flash, synth "smack" sound, flying hands, sparkles + toast
    triggerShake();
    triggerFlash();
    playSlapSound();
    spawnFlyingHands(e.clientX, e.clientY);

    const message = slapMessages[Math.floor(Math.random() * slapMessages.length)];
    doHugOverlay(message);

    // gentle whole-page zoom pulse for extra punch
    const app = document.getElementById('app');
    app.style.transform = 'scale(1.025)';
    setTimeout(() => { app.style.transform = 'scale(1)'; }, 700);

    // after a few genuine attempts, the button itself starts dodging — chaos mode
    if (slapAttempts >= 3) {
      if (!slapEscape) {
        slapEscape = makeEvasive(hugBtn, { minScale: 0.45, verticalRange: 140, recolor: false });
      }
      slapEscape(e.clientX, e.clientY);
    }
  });

  /* ---------- COMPLIMENT / "PROOF" GENERATOR ---------- */
  const complimentBtn = document.getElementById('compliment-btn');
  const speechBubble = document.getElementById('speech-bubble');
  const compliments = [
    "Exhibit A: you're the tiniest, moti-est, sundari-est Bouni alive 🐒🩷",
    "Scientific fact: I'm right 97% of the time. The other 3% I'm still right, you just don't know it yet 😌",
    "You said 'you' to question 5 yourself. The court has ruled. Case closed 👨‍⚖️😂",
    "Objection overruled — bihana dila uthnay manxay confirmed by you 😃",
    "Even the monkeys agree with me 🐒🐒🐒",
    "You're cuter when you're annoyed, which is convenient for me 🤭",
    "I rest my case. Also I rest my head on your shoulder later 🥹",
    "Proof #7: this entire website exists because I adore you 🤍"
  ];
  let complimentIndex = -1;

  complimentBtn.addEventListener('click', (e) => {
    spawnRipple(e);
    spawnClickSparkles(e.clientX, e.clientY);
    complimentIndex = (complimentIndex + 1) % compliments.length;
    speechBubble.textContent = compliments[complimentIndex];
    speechBubble.classList.remove('show');
    void speechBubble.offsetWidth; // restart transition
    speechBubble.classList.add('show');
  });

  /* ---------- MUSIC PLAYER ---------- */
  const audio = document.getElementById('bg-audio');
  const musicToggle = document.getElementById('music-toggle');
  const playIcon = document.getElementById('play-icon');
  const pauseIcon = document.getElementById('pause-icon');
  const musicBarFill = document.getElementById('music-bar-fill');

  musicToggle.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().catch(() => {
        // No song file added yet — silently ignore so the demo still works
      });
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'inline';
    } else {
      audio.pause();
      playIcon.style.display = 'inline';
      pauseIcon.style.display = 'none';
    }
  });

  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      musicBarFill.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
    }
  });

  audio.addEventListener('ended', () => {
    playIcon.style.display = 'inline';
    pauseIcon.style.display = 'none';
  });

});