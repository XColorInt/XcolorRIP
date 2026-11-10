/* Language switch: English is the default. A first-time visitor whose browser language is Korean is sent to the
   Korean pages once. The top "English" / "한국어" links carry ?lang=en / ?lang=ko, so a click always works,
   and the choice is remembered (localStorage, then a cookie as a fallback). */
(function () {
  try {
    var KEY = 'xc_lang';
    var path = location.pathname;
    var inKo = /\/ko(\/|$)/.test(path);

    function save(v) {
      try { localStorage.setItem(KEY, v); } catch (x) {}
      try { document.cookie = KEY + '=' + v + '; path=/; max-age=31536000; SameSite=Lax'; } catch (x) {}
    }
    function load() {
      var v = null;
      try { v = localStorage.getItem(KEY); } catch (x) {}
      if (!v) { var m = /(?:^|; )xc_lang=([a-z]+)/.exec(document.cookie || ''); if (m) v = m[1]; }
      return v;
    }

    // 1) an explicit choice in the address (?lang=en / ?lang=ko) always wins
    var q = /[?&]lang=(en|ko)\b/.exec(location.search);
    var choice = q ? q[1] : null;
    if (choice) save(choice);

    // 2) clicking a language link also remembers the choice
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[lang]') : null;
      if (a) save(a.getAttribute('lang'));
    });

    if (inKo) return;                       // Korean pages never redirect
    if (document.documentElement.hasAttribute('data-nolang')) return;   // post.html?id=... keeps its address

    var wantKo;
    if (choice) wantKo = (choice === 'ko');
    else {
      var pref = load();
      if (pref) wantKo = (pref === 'ko');
      else {
        var l = (navigator.languages && navigator.languages[0]) || navigator.language || '';
        wantKo = /^ko/i.test(l);
      }
    }
    if (!wantKo) return;

    var seg = path.split('/').pop();
    var file = seg ? (seg.indexOf('.') < 0 ? seg + '.html' : seg) : 'index.html';
    var base = path.replace(/[^\/]*$/, '');
    location.replace(base + 'ko/' + file + '?lang=ko' + location.hash);
  } catch (e) { /* never block the page */ }
})();
