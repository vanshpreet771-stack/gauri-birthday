/* =========================================================
   Birthday Surprise – script.js
   Vanilla JavaScript. No libraries, no servers, no tracking.
   ========================================================= */
(function () {
  'use strict';

  /* ---------------- Settings you can change ---------------- */
  var CONFIG = {
    // Names that unlock the surprise (write them in lowercase).
    acceptedNames: ['gauri'],
    // Optional: your own music file placed in the same folder, e.g. 'music.mp3'.
    // Leave empty ('') to use the built-in soft music-box birthday tune.
    musicFile: ''
  };

  /* ---------------- Helpers ---------------- */
  document.body.classList.remove('no-js');

  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  function reduced() { return motionQuery.matches; }
  function $(id) { return document.getElementById(id); }
  function wait(ms, fn) { return setTimeout(fn, reduced() ? Math.min(ms, 80) : ms); }
  function rand(min, max) { return Math.random() * (max - min) + min; }

  function scrollToEl(el) {
    window.requestAnimationFrame(function () {
      el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
    });
  }

  function showStage(el) {
    el.hidden = false;
    el.classList.add('stage-in');
    scrollToEl(el);
  }

  /* =========================================================
     NIGHT SKY: twinkling stars, glowing particles, shooting stars
     ========================================================= */
  var sky = $('sky');
  var sctx = sky.getContext('2d');
  var W = 0, H = 0;
  var stars = [], motes = [], shooters = [];
  var STAR_COLORS = ['255,255,255', '255,214,236', '220,205,255', '190,215,255'];

  function sizeSky() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    sky.width = Math.round(W * dpr);
    sky.height = Math.round(H * dpr);
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (reduced()) drawSky(0);
  }

  function buildSky() {
    var starCount = Math.min(220, Math.round((window.innerWidth * window.innerHeight) / 5500));
    var i;
    stars = [];
    for (i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random(), y: Math.random(),
        r: rand(0.5, 1.7),
        phase: rand(0, Math.PI * 2),
        speed: rand(0.6, 2.2),
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]
      });
    }
    motes = [];
    for (i = 0; i < 34; i++) {
      motes.push({
        x: Math.random(), y: Math.random(),
        r: rand(1.5, 4.2),
        vy: rand(0.012, 0.04),
        sway: rand(0.2, 0.9),
        phase: rand(0, Math.PI * 2),
        color: Math.random() < 0.5 ? '255,159,208' : (Math.random() < 0.5 ? '200,179,255' : '127,178,255')
      });
    }
  }

  function drawSky(t) {
    var i, s, m, a, x, y, g;
    sctx.clearRect(0, 0, W, H);

    for (i = 0; i < stars.length; i++) {
      s = stars[i];
      a = reduced() ? 0.75 : 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.001 * s.speed + s.phase));
      x = s.x * W; y = s.y * H;
      sctx.fillStyle = 'rgba(' + s.color + ',' + a.toFixed(3) + ')';
      sctx.beginPath();
      sctx.arc(x, y, s.r, 0, Math.PI * 2);
      sctx.fill();
      if (s.r > 1.3) {
        sctx.fillStyle = 'rgba(' + s.color + ',' + (a * 0.18).toFixed(3) + ')';
        sctx.beginPath();
        sctx.arc(x, y, s.r * 3.2, 0, Math.PI * 2);
        sctx.fill();
      }
    }

    for (i = 0; i < motes.length; i++) {
      m = motes[i];
      if (!reduced()) {
        m.y -= m.vy * 0.016;
        if (m.y < -0.05) { m.y = 1.05; m.x = Math.random(); }
      }
      x = m.x * W + Math.sin(t * 0.0005 + m.phase) * 14 * m.sway;
      y = m.y * H;
      a = 0.25 + 0.2 * Math.sin(t * 0.0012 + m.phase);
      g = sctx.createRadialGradient(x, y, 0, x, y, m.r * 4);
      g.addColorStop(0, 'rgba(' + m.color + ',' + (a + 0.25).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(' + m.color + ',0)');
      sctx.fillStyle = g;
      sctx.beginPath();
      sctx.arc(x, y, m.r * 4, 0, Math.PI * 2);
      sctx.fill();
    }

    for (i = shooters.length - 1; i >= 0; i--) {
      s = shooters[i];
      s.x += s.vx; s.y += s.vy; s.life -= 1;
      g = sctx.createLinearGradient(s.x, s.y, s.x - s.vx * 14, s.y - s.vy * 14);
      g.addColorStop(0, 'rgba(255,255,255,' + Math.max(s.life / s.max, 0) + ')');
      g.addColorStop(1, 'rgba(255,159,208,0)');
      sctx.strokeStyle = g;
      sctx.lineWidth = 2.2;
      sctx.lineCap = 'round';
      sctx.beginPath();
      sctx.moveTo(s.x, s.y);
      sctx.lineTo(s.x - s.vx * 14, s.y - s.vy * 14);
      sctx.stroke();
      if (s.life <= 0) shooters.splice(i, 1);
    }
  }

  function shootingStar() {
    var fromLeft = Math.random() < 0.5;
    var life = 55;
    shooters.push({
      x: fromLeft ? rand(0, W * 0.4) : rand(W * 0.6, W),
      y: rand(0, H * 0.3),
      vx: (fromLeft ? 1 : -1) * rand(7, 11),
      vy: rand(3.5, 6),
      life: life, max: life
    });
    if (reduced()) { drawSky(0); }
  }

  var nextShoot = 0;
  function skyLoop(t) {
    if (!document.hidden) {
      drawSky(t);
      if (t > nextShoot) {
        if (nextShoot !== 0) shootingStar();
        nextShoot = t + rand(7000, 13000);
      }
    }
    if (!reduced()) window.requestAnimationFrame(skyLoop);
  }

  buildSky();
  sizeSky();
  window.addEventListener('resize', sizeSky);
  if (reduced()) { drawSky(0); } else { window.requestAnimationFrame(skyLoop); }

  /* =========================================================
     CONFETTI
     ========================================================= */
  var cc = $('confetti');
  var cctx = cc.getContext('2d');
  var pieces = [];
  var confettiRunning = false;
  var CONFETTI_COLORS = ['#ff9fd0', '#ff6fb5', '#c8b3ff', '#8b5cf6', '#7fb2ff', '#ffe08a', '#ffffff'];

  function sizeConfetti() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cc.width = Math.round(window.innerWidth * dpr);
    cc.height = Math.round(window.innerHeight * dpr);
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  sizeConfetti();
  window.addEventListener('resize', sizeConfetti);

  function burst(x, y, count) {
    var n = reduced() ? Math.min(count, 24) : count;
    for (var i = 0; i < n; i++) {
      var angle = rand(-Math.PI * 0.95, -Math.PI * 0.05);
      var speed = rand(5, 14);
      pieces.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        g: rand(0.18, 0.3),
        size: rand(6, 12),
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.3, 0.3),
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        round: Math.random() < 0.35,
        life: 0,
        max: rand(110, 190)
      });
    }
    if (!confettiRunning) {
      confettiRunning = true;
      window.requestAnimationFrame(confettiLoop);
    }
  }

  function confettiLoop() {
    var h = window.innerHeight;
    cctx.clearRect(0, 0, window.innerWidth, h);
    for (var i = pieces.length - 1; i >= 0; i--) {
      var p = pieces[i];
      p.vx *= 0.985;
      p.vy += p.g;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life += 1;
      if (p.life > p.max || p.y > h + 30) { pieces.splice(i, 1); continue; }
      cctx.save();
      cctx.globalAlpha = Math.min(1, (p.max - p.life) / 40);
      cctx.translate(p.x, p.y);
      cctx.rotate(p.rot);
      cctx.fillStyle = p.color;
      if (p.round) {
        cctx.beginPath();
        cctx.arc(0, 0, p.size / 2.4, 0, Math.PI * 2);
        cctx.fill();
      } else {
        cctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
      cctx.restore();
    }
    if (pieces.length) {
      window.requestAnimationFrame(confettiLoop);
    } else {
      confettiRunning = false;
      cctx.clearRect(0, 0, window.innerWidth, h);
    }
  }

  function celebrate() {
    var w = window.innerWidth, h = window.innerHeight;
    burst(w * 0.2, h * 0.75, 70);
    burst(w * 0.8, h * 0.75, 70);
    setTimeout(function () { burst(w * 0.5, h * 0.55, 90); }, 260);
  }

  /* =========================================================
     FLOATING HEARTS
     ========================================================= */
  var heartLayer = $('hearts');

  function spawnHeart() {
    if (document.hidden || reduced()) return;
    if (heartLayer.children.length > 16) return;
    var h = document.createElement('span');
    h.className = 'heart c' + (1 + Math.floor(Math.random() * 4));
    h.textContent = '\u2665';
    h.style.left = rand(2, 96) + '%';
    h.style.fontSize = rand(14, 32).toFixed(0) + 'px';
    var dur = rand(8, 14);
    h.style.animationDuration = dur.toFixed(1) + 's';
    h.style.setProperty('--sway', rand(-40, 40).toFixed(0) + 'px');
    h.addEventListener('animationend', function () { h.remove(); });
    heartLayer.appendChild(h);
  }
  setInterval(spawnHeart, 1000);
  spawnHeart();

  /* =========================================================
     MUSIC (optional – starts only after the visitor taps)
     Built-in: a soft music-box "Happy Birthday" made with the
     browser's Web Audio – no audio file or internet needed.
     Optional: set CONFIG.musicFile to use your own file.
     ========================================================= */
  var musicBtn = $('musicBtn');
  var musicLabel = $('musicLabel');
  var musicOn = false;

  var synth = (function () {
    var AC = window.AudioContext || window.webkitAudioContext;
    var ctx = null, master = null, timer = null, nextStart = 0, running = false;
    var BEAT = 0.56;
    // [MIDI note, length in beats] – the traditional birthday tune (public domain)
    var PHRASE = [
      [67, 0.75], [67, 0.25], [69, 1], [67, 1], [72, 1], [71, 2],
      [67, 0.75], [67, 0.25], [69, 1], [67, 1], [74, 1], [72, 2],
      [67, 0.75], [67, 0.25], [79, 1], [76, 1], [72, 1], [71, 1], [69, 1],
      [77, 0.75], [77, 0.25], [76, 1], [72, 1], [74, 1], [72, 2]
    ];
    var phraseLen = 0;
    PHRASE.forEach(function (n) { phraseLen += n[1] * BEAT; });
    var GAP = 2.5;

    function note(midi, when, dur) {
      var f = 440 * Math.pow(2, (midi - 69) / 12);
      var o1 = ctx.createOscillator();
      var o2 = ctx.createOscillator();
      var g = ctx.createGain();
      var g2 = ctx.createGain();
      o1.type = 'sine';
      o2.type = 'triangle';
      o1.frequency.value = f;
      o2.frequency.value = f * 2;
      g2.gain.value = 0.22;
      o1.connect(g);
      o2.connect(g2);
      g2.connect(g);
      g.connect(master);
      var end = when + Math.max(dur, 0.45) + 0.9;
      g.gain.setValueAtTime(0.0001, when);
      g.gain.exponentialRampToValueAtTime(0.5, when + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, end);
      o1.start(when); o2.start(when);
      o1.stop(end + 0.05); o2.stop(end + 0.05);
    }

    function schedule(at) {
      var t = 0;
      PHRASE.forEach(function (n) {
        note(n[0], at + t, n[1] * BEAT);
        t += n[1] * BEAT;
      });
    }

    return {
      supported: !!AC,
      start: function () {
        if (!AC) return false;
        if (!ctx) ctx = new AC();
        if (ctx.resume) ctx.resume();
        master = ctx.createGain();
        master.gain.setValueAtTime(0.0001, ctx.currentTime);
        master.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.4);
        var delay = ctx.createDelay(1);
        var fb = ctx.createGain();
        delay.delayTime.value = 0.26;
        fb.gain.value = 0.28;
        master.connect(ctx.destination);
        master.connect(delay);
        delay.connect(fb);
        fb.connect(delay);
        delay.connect(ctx.destination);

        nextStart = ctx.currentTime + 0.1;
        schedule(nextStart);
        nextStart += phraseLen + GAP;
        running = true;
        timer = setInterval(function () {
          if (running && ctx.currentTime + 1.5 >= nextStart) {
            schedule(nextStart);
            nextStart += phraseLen + GAP;
          }
        }, 500);
        return true;
      },
      stop: function () {
        running = false;
        clearInterval(timer);
        if (master && ctx) {
          var m = master;
          m.gain.cancelScheduledValues(ctx.currentTime);
          m.gain.setValueAtTime(m.gain.value, ctx.currentTime);
          m.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
          setTimeout(function () { try { m.disconnect(); } catch (e) { /* ignore */ } }, 400);
        }
      }
    };
  })();

  var audioEl = null;
  if (CONFIG.musicFile) {
    audioEl = new Audio(CONFIG.musicFile);
    audioEl.loop = true;
    audioEl.volume = 0.6;
    audioEl.preload = 'none';
  }

  function setMusicUI(on, text) {
    musicOn = on;
    musicBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    musicLabel.textContent = text || (on ? 'Music on' : 'Music off');
  }

  function toggleMusic() {
    musicBtn.classList.remove('nudge');
    if (musicOn) {
      if (audioEl) audioEl.pause(); else synth.stop();
      setMusicUI(false);
      return;
    }
    if (audioEl) {
      var p = audioEl.play();
      setMusicUI(true);
      if (p && p.catch) {
        p.catch(function () { setMusicUI(false, 'Music unavailable'); });
      }
    } else if (synth.start()) {
      setMusicUI(true);
    } else {
      setMusicUI(false, 'Music unavailable');
    }
  }
  musicBtn.addEventListener('click', toggleMusic);

  /* =========================================================
     SCREEN 1: NAME ENTRY
     ========================================================= */
  var form = $('nameForm');
  var input = $('nameInput');
  var msg = $('nameMsg');
  var nameBtn = $('nameBtn');
  var welcome = $('welcome');
  var birthday = $('birthday');
  var unlocked = false;

  function normalize(s) {
    return s.trim().replace(/\s+/g, ' ').toLowerCase();
  }

  function shakeInput() {
    input.classList.remove('shake');
    void input.offsetWidth; // restart the animation
    input.classList.add('shake');
  }

  input.addEventListener('input', function () { msg.textContent = ''; });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (unlocked) return;
    var value = normalize(input.value);

    if (!value) {
      msg.textContent = 'Please type your name first \uD83D\uDC97';
      shakeInput();
      return;
    }
    if (CONFIG.acceptedNames.indexOf(value) === -1) {
      msg.textContent = 'Hmm, that\u2019s not the name I was expecting \uD83D\uDC97 Try again!';
      shakeInput();
      return;
    }
    unlock();
  });

  function unlock() {
    unlocked = true;
    msg.textContent = '';
    nameBtn.disabled = true;
    input.blur();
    welcome.classList.add('leaving');

    wait(750, function () {
      welcome.hidden = true;
      welcome.classList.remove('active');
      birthday.hidden = false;
      birthday.classList.add('enter');
      window.scrollTo(0, 0);
      musicBtn.hidden = false;
      if (!synth.supported && !audioEl) musicBtn.hidden = true;
      musicBtn.classList.add('nudge');
      $('hbTitle').focus({ preventScroll: true });
      wait(700, celebrate);
    });
  }

  /* =========================================================
     STAGE 1 -> 2: GIFT
     ========================================================= */
  $('toGift').addEventListener('click', function () {
    this.disabled = true;
    showStage($('stageGift'));
  });

  var giftBtn = $('giftBtn');
  var giftOpened = false;
  giftBtn.addEventListener('click', function () {
    if (giftOpened) return;
    giftOpened = true;
    giftBtn.classList.add('open');
    giftBtn.setAttribute('aria-expanded', 'true');
    $('giftHint').hidden = true;
    celebrate();
    wait(1000, function () {
      var reveal = $('giftReveal');
      reveal.hidden = false;
      scrollToEl(reveal);
    });
  });

  /* =========================================================
     STAGE 3: LETTER
     ========================================================= */
  $('toLetter').addEventListener('click', function () {
    this.disabled = true;
    showStage($('stageLetter'));
  });

  var envelope = $('envelope');
  var envOpened = false;
  envelope.addEventListener('click', function () {
    if (envOpened) return;
    envOpened = true;
    envelope.classList.add('opened');
    envelope.setAttribute('aria-expanded', 'true');
    $('envHint').hidden = true;

    wait(1900, function () {
      envelope.classList.add('gone');
      wait(550, function () {
        envelope.hidden = true;
        var letter = $('letter');
        letter.hidden = false;
        scrollToEl(letter);
        wait(4600, function () {
          $('wishWrap').hidden = false;
        });
      });
    });
  });

  /* =========================================================
     FINAL WISH
     ========================================================= */
  var wishCount = 0;
  $('wishBtn').addEventListener('click', function () {
    wishCount += 1;
    shootingStar();
    wait(500, shootingStar);
    celebrate();
    $('wishMsg').textContent = wishCount === 1
      ? 'Close your eyes, make a wish\u2026 and may it come true. \u2728'
      : 'One more wish for luck \u2014 you deserve every one of them. \uD83D\uDCAB';
    this.textContent = 'Make Another Wish \uD83C\uDF20';
  });
})();
