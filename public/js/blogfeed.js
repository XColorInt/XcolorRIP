/* XColorRIP site: shows the posts of the Blogger blog (xcolorrip.blogspot.com) inside this site.
   Labels on every post (ALL LOWERCASE - Blogger labels are case sensitive):
     kind     = news | blog
     language = ko | en
   Markup:  <div class="feed" data-label="news" data-max="20" data-style="list|cards"></div>
   Blogger feeds are read with JSONP (script tag) because the feed has no CORS header.
   A post opens in post.html?id=<postId> (same window, site design); the post page also lists the other posts of the same kind. */
(function () {
  var BLOG = 'https://xcolorrip.blogspot.com';
  var TXT = {
    ko: { empty: '아직 글이 없습니다. 곧 올라옵니다.', err: '블로그를 불러오지 못했습니다.', locale: 'ko-KR' },
    en: { empty: 'No posts yet. Coming soon.', err: 'Could not load the blog.', locale: 'en-US' }
  };
  var LABELS = { news: 'news', blog: 'blog' };           // data-label -> Blogger label
  var LANG_LABELS = { ko: 'ko', en: 'en' };
  var counter = 0;

  function strip(html) {
    var d = document.createElement('div');
    d.innerHTML = html || '';
    return (d.textContent || '').replace(/\s+/g, ' ').trim();
  }
  function link(entry) {
    var l = entry.link || [];
    for (var i = 0; i < l.length; i++) if (l[i].rel === 'alternate') return l[i].href;
    return BLOG;
  }
  // Blogger entry id = tag:blogger.com,1999:blog-<blogId>.post-<postId>
  function postId(entry) {
    var m = /\.post-(\d+)$/.exec((entry.id && entry.id.$t) || '');
    return m ? m[1] : '';
  }
  function postHref(entry) {
    var id = postId(entry);
    return id ? 'post.html?id=' + id : link(entry);
  }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }
  function message(box, text) {
    box.innerHTML = '';
    box.appendChild(el('p', 'note', text));
  }
  function pageLang() { return document.documentElement.lang === 'en' ? 'en' : 'ko'; }

  function render(box, entries, lang) {
    var t = TXT[lang] || TXT.ko;
    box.innerHTML = '';
    if (!entries || !entries.length) { message(box, t.empty); return; }
    var list = box.getAttribute('data-style') === 'list';
    var wrap = el(list ? 'ul' : 'div', list ? 'feedlist' : 'grid g3');
    var cur = (/[?&]id=(\d+)/.exec(location.search) || [])[1];
    entries.forEach(function (e) {
      var title = (e.title && e.title.$t) || '';
      var date = e.published ? new Date(e.published.$t).toLocaleDateString(t.locale) : '';
      var href = postHref(e);
      if (list) {
        var li = el('li');
        li.appendChild(el('span', 'fdate', date));
        var a = el('a', null, title); a.href = href;
        if (cur && postId(e) === cur && document.getElementById('post')) li.className = 'cur';   // post page: highlight the post being read
        li.appendChild(a);
        wrap.appendChild(li);
        return;
      }
      var card = el('div', 'card');
      var thumb = e.media$thumbnail && e.media$thumbnail.url;
      if (thumb) thumb = thumb.replace(/\/s\d+(-c)?\//, '/w480-h300-c/');
      if (!thumb && e.content && e.content.$t) {
        var m = /<img[^>]+src=["']([^"']+)["']/i.exec(e.content.$t);
        if (m) thumb = m[1];
      }
      if (thumb) {
        var img = el('img', 'thumb');
        img.src = thumb; img.alt = ''; img.loading = 'lazy';
        card.appendChild(img);
      }
      var h = el('h3'); var a2 = el('a', null, title); a2.href = href; h.appendChild(a2);
      card.appendChild(h);
      card.appendChild(el('p', 'footnote', date));
      var text = strip((e.summary && e.summary.$t) || (e.content && e.content.$t));
      card.appendChild(el('p', null, text.length > 120 ? text.slice(0, 120) + '…' : text));
      wrap.appendChild(card);
    });
    box.appendChild(wrap);
  }

  function jsonp(url, cbName, ok, fail) {
    var done = false, s = document.createElement('script');
    var timer = setTimeout(giveUp, 9000);
    function cleanup() { clearTimeout(timer); delete window[cbName]; if (s.parentNode) s.parentNode.removeChild(s); }
    function giveUp() { if (done) return; done = true; cleanup(); fail(); }
    window[cbName] = function (data) { if (done) return; done = true; cleanup(); ok(data); };
    s.onerror = giveUp;
    s.src = url + (url.indexOf('?') < 0 ? '?' : '&') + 'alt=json-in-script&callback=' + cbName;
    document.head.appendChild(s);
  }

  function load(box) {
    var key = box.getAttribute('data-label') || 'blog';
    var label = LABELS[key] || key;
    var max = parseInt(box.getAttribute('data-max') || '3', 10);
    var lang = pageLang();
    var path = encodeURIComponent(label) + '/' + encodeURIComponent(LANG_LABELS[lang]);     // both labels (verified on the feed)
    jsonp(BLOG + '/feeds/posts/default/-/' + path + '?max-results=' + max, '__xcFeed' + (counter++),
      function (data) { render(box, data && data.feed && data.feed.entry, lang); },
      function () { message(box, TXT[lang].err); });
  }

  // ---- single post page (post.html?id=<postId>)
  var PT = {
    ko: { back: '← 목록으로', orig: '블로그에서 원문 보기', miss: '글을 찾을 수 없습니다.', err: '글을 불러오지 못했습니다.', loading: '불러오는 중…' },
    en: { back: '← Back to the list', orig: 'View the original on the blog', miss: 'The post was not found.', err: 'Could not load the post.', loading: 'Loading…' }
  };
  var ALLOWED_FRAMES = /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com)\//i;
  function clean(html) {                                    // the post is written by us; this still removes scripts and event handlers
    var doc = new DOMParser().parseFromString('<body>' + (html || '') + '</body>', 'text/html');
    var kill = doc.body.querySelectorAll('script,style,link,meta,object,embed,form,base');
    for (var i = 0; i < kill.length; i++) kill[i].parentNode.removeChild(kill[i]);
    var frames = doc.body.querySelectorAll('iframe');
    for (var f = 0; f < frames.length; f++) if (!ALLOWED_FRAMES.test(frames[f].getAttribute('src') || '')) frames[f].parentNode.removeChild(frames[f]);
    var all = doc.body.querySelectorAll('*');
    for (var j = 0; j < all.length; j++) {
      var n = all[j];
      for (var k = n.attributes.length - 1; k >= 0; k--) {
        var an = n.attributes[k].name.toLowerCase(), av = n.attributes[k].value;
        if (an.indexOf('on') === 0 || /^\s*javascript:/i.test(av)) n.removeAttribute(n.attributes[k].name);
      }
      if (n.tagName === 'A' && n.getAttribute('href')) { n.setAttribute('target', '_blank'); n.setAttribute('rel', 'noopener'); }
    }
    return doc.body.innerHTML;
  }
  function loadPost(box) {
    var lang = pageLang();
    var t = PT[lang];
    var id = (/[?&]id=(\d+)/.exec(location.search) || [])[1];
    if (!id) { message(box, t.miss); return; }
    message(box, t.loading);
    jsonp(BLOG + '/feeds/posts/default/' + id, '__xcPost' + (counter++), function (data) {
      var e = data && data.entry;
      if (!e) { message(box, t.miss); return; }
      var title = (e.title && e.title.$t) || '';
      var date = e.published ? new Date(e.published.$t).toLocaleDateString(TXT[lang].locale) : '';
      document.title = title + ' — XColorRIP';
      box.innerHTML = '';
      box.appendChild(el('h1', 'ptitle', title));
      box.appendChild(el('p', 'footnote', date));
      var body = el('div', 'pbody'); body.innerHTML = clean(e.content && e.content.$t); box.appendChild(body);
      var cats = (e.category || []).map(function (c) { return c.term; });
      var kind = cats.indexOf('news') >= 0 ? 'news' : 'blog';
      var nav = el('p', 'pnav');
      var back = el('a', null, t.back); back.href = kind + '.html';
      nav.appendChild(back);
      var o = el('a', null, t.orig); o.href = link(e); o.target = '_blank'; o.rel = 'noopener'; o.style.marginLeft = '18px';
      nav.appendChild(o);
      box.appendChild(nav);
      // list of the same kind (news / blog) next to the post, so the reader stays in the board
      var side = document.getElementById('sidelist');
      if (side) {
        side.className = 'feed';
        side.setAttribute('data-label', kind);
        side.setAttribute('data-max', '15');
        side.setAttribute('data-style', 'list');
        load(side);
      }
    }, function () { message(box, t.err); });
  }

  window.XcFeed = { render: render, clean: clean };
  function start() {
    var boxes = document.querySelectorAll('.feed[data-label]');
    for (var i = 0; i < boxes.length; i++) load(boxes[i]);
    var post = document.getElementById('post');
    if (post) loadPost(post);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
