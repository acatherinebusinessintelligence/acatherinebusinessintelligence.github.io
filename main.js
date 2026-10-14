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
