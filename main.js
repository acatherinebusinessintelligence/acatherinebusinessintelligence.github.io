// Menú móvil, filtros de investigación y animación de aparición
(function () {
  var btn = document.querySelector('.menu-btn');
  var links = document.getElementById('nav-links');
  if (btn && links) {
    btn.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var filters = document.querySelectorAll('.filter');
  filters.forEach(function (f) {
    f.addEventListener('click', function () {
      var key = f.getAttribute('data-filter');
      filters.forEach(function (o) { o.setAttribute('aria-pressed', o === f ? 'true' : 'false'); });
      document.querySelectorAll('[data-topics]').forEach(function (card) {
        var match = key === 'all' || card.getAttribute('data-topics').split(' ').indexOf(key) !== -1;
        card.setAttribute('data-hidden', match ? 'false' : 'true');
      });
    });
  });

  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  items.forEach(function (el) { io.observe(el); });
})();

// Cifras que cuentan hacia arriba al aparecer en pantalla
(function () {
  var nums = document.querySelectorAll('[data-count]');
  if (!nums.length || !('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var run = function (el) {
    var end = parseInt(el.getAttribute('data-count'), 10), suf = el.getAttribute('data-suffix') || '', t0 = null, dur = 1400;
    var step = function (t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
      el.textContent = v + (p === 1 ? suf : '');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
  }, { threshold: .6 });
  nums.forEach(function (n) { n.textContent = '0'; io.observe(n); });
})();

// Lector de la página con la voz del navegador (Web Speech API): sin cuentas ni servicios externos
(function () {
  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) return;
  var synth = window.speechSynthesis;
  var lang = (document.documentElement.lang || 'es').slice(0, 2);
  var T = lang === 'en'
    ? { listen: 'Listen to this page', play: 'Play', pause: 'Pause', resume: 'Resume', stop: 'Stop', speed: 'Speed', close: 'Close reader' }
    : { listen: 'Escuchar esta página', play: 'Reproducir', pause: 'Pausar', resume: 'Continuar', stop: 'Detener', speed: 'Velocidad', close: 'Cerrar lector' };
  var ICON = {
    sound: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
    play: '<path d="M8 5v14l11-7z"/>', pause: '<path d="M8 5h3v14H8zM13 5h3v14h-3z"/>', stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>'
  };
  var svg = function (n) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[n] + '</svg>'; };

  var box = document.createElement('div');
  box.className = 'reader';
  box.innerHTML =
    '<button type="button" class="reader-open">' + svg('sound') + '<span>' + T.listen + '</span></button>' +
    '<div class="reader-bar" role="group" aria-label="' + T.listen + '" hidden>' +
      '<button type="button" class="reader-play" aria-label="' + T.play + '">' + svg('play') + '</button>' +
      '<button type="button" class="reader-stop" aria-label="' + T.stop + '">' + svg('stop') + '</button>' +
      '<label class="reader-speed">' + T.speed + ' <select><option value="0.85">0.85×</option><option value="1" selected>1×</option><option value="1.2">1.2×</option><option value="1.4">1.4×</option></select></label>' +
      '<span class="reader-progress" aria-live="polite"></span>' +
      '<button type="button" class="reader-close" aria-label="' + T.close + '">' + svg('x') + '</button>' +
    '</div>';
  document.body.appendChild(box);

  var openBtn = box.querySelector('.reader-open'), bar = box.querySelector('.reader-bar'),
      playBtn = box.querySelector('.reader-play'), stopBtn = box.querySelector('.reader-stop'),
      speedSel = box.querySelector('select'), progress = box.querySelector('.reader-progress'),
      closeBtn = box.querySelector('.reader-close');
  var blocks = [], idx = 0, state = 'idle', current = null, token = 0;

  var pickVoice = function () {
    var vs = synth.getVoices().filter(function (v) { return v.lang && v.lang.toLowerCase().indexOf(lang) === 0; });
    var pref = lang === 'en' ? ['en-US', 'en-GB'] : ['es-CO', 'es-MX', 'es-US', 'es-419', 'es-ES'];
    for (var i = 0; i < pref.length; i++) {
      var hit = vs.filter(function (v) { return v.lang === pref[i]; });
      if (hit.length) return hit.find(function (v) { return /natural|google|online/i.test(v.name); }) || hit[0];
    }
    return vs[0] || null;
  };
  var collect = function () {
    var main = document.getElementById('contenido');
    return Array.prototype.filter.call(main.querySelectorAll('h1, h2, h3, p, li, blockquote, figcaption'), function (el) {
      if (el.closest('[aria-hidden="true"], .marquee, .orbit, .card-links, .tags, .badges, .reader')) return false;
      if (el.parentElement.closest('p, li, blockquote')) return false;
      if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') return false;
      return el.textContent.replace(/\s+/g, ' ').trim().length > 1;
    });
  };
  var mark = function (el) {
    if (current) current.classList.remove('reading');
    current = el;
    if (el) {
      el.classList.add('reading');
      el.closest('.reveal') && el.closest('.reveal').classList.add('in');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
  var setPlayIcon = function (playing) {
    playBtn.innerHTML = svg(playing ? 'pause' : 'play');
    playBtn.setAttribute('aria-label', playing ? T.pause : (state === 'paused' ? T.resume : T.play));
  };
  var speakNext = function () {
    if (state !== 'playing') return;
    if (idx >= blocks.length) { stop(); return; }
    var el = blocks[idx];
    mark(el);
    progress.textContent = (idx + 1) + ' / ' + blocks.length;
    var u = new SpeechSynthesisUtterance(el.textContent.replace(/\s+/g, ' ').replace(/↗|→/g, '').trim());
    var v = pickVoice(); if (v) u.voice = v;
    u.lang = v ? v.lang : (lang === 'en' ? 'en-US' : 'es-CO');
    u.rate = parseFloat(speedSel.value);
    var my = ++token;  // al cancelar, el aviso de la lectura interrumpida no debe avanzar
    var next = function () { if (state === 'playing' && my === token) { idx++; speakNext(); } };
    u.onend = next; u.onerror = next;
    synth.speak(u);
  };
  var play = function () {
    if (state === 'paused') { state = 'playing'; synth.cancel(); setPlayIcon(true); speakNext(); return; }
    blocks = collect(); idx = 0; state = 'playing'; setPlayIcon(true); synth.cancel(); speakNext();
  };
  var pause = function () { state = 'paused'; token++; synth.cancel(); setPlayIcon(false); };
  var stop = function () { state = 'idle'; synth.cancel(); idx = 0; mark(null); progress.textContent = ''; setPlayIcon(false); };

  openBtn.addEventListener('click', function () { openBtn.hidden = true; bar.hidden = false; play(); });
  playBtn.addEventListener('click', function () { state === 'playing' ? pause() : play(); });
  stopBtn.addEventListener('click', stop);
  closeBtn.addEventListener('click', function () { stop(); bar.hidden = true; openBtn.hidden = false; openBtn.focus(); });
  speedSel.addEventListener('change', function () { if (state === 'playing') { token++; synth.cancel(); speakNext(); } });
  window.addEventListener('beforeunload', function () { synth.cancel(); });
  if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = function () {};
})();
