/* Tadiran - Service & Warranty page. All listeners are scoped to #tadiran-service-page. */
(function () {
  // Everything is scoped to the wrapper so nothing touches the host page.
  var W = document.getElementById('tadiran-service-page');
  if (!W) return;
  var $ = function (s, r) { return (r || W).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || W).querySelectorAll(s)); };
  var byId = function (id) { return W.querySelector('#' + CSS.escape(id)); };
  var ICON = function (id) { return '<svg class="icon"><use href="#' + id + '"/></svg>'; };
  var toast = $('#toast'), tt;
  function say(msg) {
    toast.textContent = msg; toast.classList.add('show'); clearTimeout(tt);
    tt = setTimeout(function () { toast.classList.remove('show'); }, 2600);
  }

  // ---- In-page anchors: smooth scroll, limited to links inside the wrapper ----
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  W.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || !W.contains(a)) return;
    var href = a.getAttribute('href'), t = href.length > 1 && W.querySelector(href);
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth', block: 'start' });
  });

  // ---- Live service status (real hours, Israel time) ----
  var now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
  var day = now.getDay(), mins = now.getHours() * 60 + now.getMinutes();
  var close = day <= 4 ? 16 : day === 5 ? 12 : 0;
  var open = close && mins >= 480 && mins < close * 60;
  $('#live-c-t').textContent = open ? 'המוקד פתוח עכשיו, עד ' + close + ':00' : 'המוקד סגור כעת';
  if (!open) $('#live-c').classList.add('closed');


  // ---- Reveal on scroll (with stagger) ----
  $$('.rv-stagger').forEach(function (g) { Array.prototype.forEach.call(g.children, function (c, i) { c.style.setProperty('--i', i); }); });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .15, rootMargin: '0px 0px -40px 0px' });
  $$('.rv, .rv-stagger').forEach(function (el) { io.observe(el); });

  // ---- Hero search: rotating placeholder hints ----
  var HINTS = ['נסו לחפש "הפעלת אחריות"', 'נסו לחפש "המזגן לא מקרר"', 'נסו לחפש "ניקוי מסנן"', 'נסו לחפש "הוראות שימוש"', 'נסו לחפש "מוקד שירות"'];
  var hi = 0, qEl = $('#q');
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(function () {
      if (document.activeElement === qEl || qEl.value) return;
      hi = (hi + 1) % HINTS.length; qEl.setAttribute('placeholder', HINTS[hi]);
    }, 3200);
  }

  // ---- FAQ: nested accordion (category > question) ----
  var faqItems = $$('.qa');
  function setFcat(c, on) { c.classList.toggle('open', on); $('.fcat-q', c).setAttribute('aria-expanded', on); }
  function setQa(it, on) {
    it.classList.toggle('open', on); $('.qa-q', it).setAttribute('aria-expanded', on);
    if (on) setFcat(it.closest('.fcat'), true);
  }
  $$('.fcat').forEach(function (c) {
    $('.fcat-q', c).addEventListener('click', function () { setFcat(c, !c.classList.contains('open')); });
  });
  faqItems.forEach(function (it) {
    $('.qa-q', it).addEventListener('click', function () { setQa(it, !it.classList.contains('open')); });
  });
  function openFromHash() {
    var m = location.hash.match(/^#faq-(\d+)$/);
    var it = m && byId('faq-' + m[1]);
    if (it) { setQa(it, true); setTimeout(function () { it.scrollIntoView({ block: 'center' }); }, 450); }
  }
  addEventListener('hashchange', openFromHash); openFromHash();

  // ---- Dropdown (Tadiran custom-select-global): builds a button + list over a native select ----
  function closeAllSelects(except) {
    $$('.tsel.active').forEach(function (t) { if (t !== except) setOpen(t, false); });
  }
  function setOpen(t, on) {
    t.classList.toggle('active', on);
    $('.tsel-btn', t).setAttribute('aria-expanded', on);
    if (on) {
      var cur = $('[aria-selected="true"]', t) || $('li', t);
      $$('li', t).forEach(function (li) { li.classList.toggle('focus', li === cur); });
      cur.scrollIntoView({ block: 'nearest' });
    }
  }
  $$('.tsel').forEach(function (t, n) {
    var sel = $('select', t), id = 'tsel-' + n;
    sel.tabIndex = -1;
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'tsel-btn';
    btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', id);
    var lbl = W.querySelector('label[for="' + sel.id + '"]');
    if (lbl) { lbl.id = lbl.id || sel.id + '-lbl'; btn.setAttribute('aria-labelledby', lbl.id + ' ' + id + '-v'); lbl.htmlFor = ''; lbl.addEventListener('click', function () { btn.focus(); }); }
    btn.innerHTML = '<span id="' + id + '-v"></span>';
    var ul = document.createElement('ul');
    ul.className = 'tsel-list'; ul.id = id; ul.setAttribute('role', 'listbox');
    ul.innerHTML = Array.prototype.map.call(sel.options, function (o, i) {
      return '<li role="option" data-i="' + i + '" aria-selected="' + (o.selected) + '">' + o.text + '</li>';
    }).join('');
    t.appendChild(btn); t.appendChild(ul);
    function sync() {
      $('span', btn).textContent = sel.options[sel.selectedIndex].text;
      $$('li', ul).forEach(function (li, i) { li.setAttribute('aria-selected', i === sel.selectedIndex); });
    }
    function choose(i) {
      sel.selectedIndex = i; sync(); t.classList.remove('invalid');
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      setOpen(t, false); btn.focus();
    }
    sync();
    btn.addEventListener('click', function () { var on = !t.classList.contains('active'); closeAllSelects(t); setOpen(t, on); });
    ul.addEventListener('click', function (e) { var li = e.target.closest('li'); if (li) choose(+li.dataset.i); });
    btn.addEventListener('keydown', function (e) {
      var items = $$('li', ul), cur = items.indexOf($('li.focus', ul));
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!t.classList.contains('active')) { setOpen(t, true); return; }
        var nx = Math.max(0, Math.min(items.length - 1, cur + (e.key === 'ArrowDown' ? 1 : -1)));
        items.forEach(function (li, i) { li.classList.toggle('focus', i === nx); });
        items[nx].scrollIntoView({ block: 'nearest' });
      } else if ((e.key === 'Enter' || e.key === ' ') && t.classList.contains('active')) {
        e.preventDefault(); if (cur > -1) choose(cur);
      } else if (e.key === 'Escape' && t.classList.contains('active')) {
        e.stopPropagation(); setOpen(t, false);
      }
    });
    sel.addEventListener('invalid', function () { t.classList.add('invalid'); });
    sel.form && sel.form.addEventListener('reset', function () { setTimeout(sync); });
  });
  W.addEventListener('click', function (e) { if (!e.target.closest('.tsel')) closeAllSelects(); });

  // ---- Modals ----
  var lastFocus;
  function openModal(id) {
    var m = byId(id); if (!m) return;
    lastFocus = document.activeElement;
    m.classList.add('open'); document.body.style.overflow = 'hidden';
    var f = $('input,.tsel-btn,button.tsw-close', m); if (f) f.focus();
  }
  function closeModal(m) {
    m.classList.remove('open'); document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  W.addEventListener('click', function (e) {
    var t = e.target.closest('[data-modal]');
    if (t) { e.preventDefault(); openModal(t.dataset.modal); return; }
    if (e.target.closest('[data-close]') || e.target.classList.contains('tsw-modal')) closeModal(e.target.closest('.tsw-modal'));
    if (e.target.closest('[data-chat]')) say("כאן ייפתח חלון הצ'ט עם נציג");
  });
  W.addEventListener('keydown', function (e) {
    var m = $('.tsw-modal.open');
    if (e.key === 'Escape' && m && !$('.tsel.active')) closeModal(m);
  });



  // ---- Autocomplete (Tadiran .autoCompleteStyle): type to filter, pick from the list ----
  var LISTS = {
    models: ["TADIRAN Super Slim", "SUPER LOW INVERTER", "AMCOR NEW 10 - 14", "Tadiran multi 1_2 1_3 1_4 _1_5", "TADIRAN SUPREME", "SPACE R", "TADIRAN JOY 10 - 35-3", "Class", "TADIRAN ALPHA X 10 - 35-3", "TADIRAN SUPREME INVERTER NG", "WIND-WAVE-SLIM-SILENT-INV"],
    streets: ["אחד העם", "אלנבי", "ארלוזורוב", "בן גוריון", "בן יהודה", "ביאליק", "בלפור", "דיזנגוף", "הגפן", "הדקל", "ההסתדרות", "הזית", "החשמונאים", "הלהב", "המלאכה", "הנביאים", "הנרקיס", "העצמאות", "הפלמ\"ח", "הרב קוק", "הרצל", "התאנה", "ויצמן", "ז'בוטינסקי", "ירושלים", "כצנלסון", "מוריה", "סוקולוב", "קק\"ל", "רוטשילד", "רמב\"ם", "שבזי", "שדרות ירושלים", "שינקין", "תרומפלדור"],
    cities: ["אופקים", "אור יהודה", "אור עקיבא", "אילת", "אלעד", "אריאל", "אשדוד", "אשקלון", "באר שבע", "בית שאן", "בית שמש", "בני ברק", "בת ים", "גבעת שמואל", "גבעתיים", "דימונה", "הוד השרון", "הרצליה", "חדרה", "חולון", "חיפה", "טבריה", "טירת כרמל", "יבנה", "יהוד", "יקנעם עילית", "ירושלים", "כפר יונה", "כפר סבא", "כרמיאל", "לוד", "מגדל העמק", "מודיעין-מכבים-רעות", "מעלה אדומים", "נהריה", "נס ציונה", "נצרת", "נתיבות", "נתניה", "עכו", "עפולה", "ערד", "פתח תקווה", "צפת", "קריית אונו", "קריית אתא", "קריית ביאליק", "קריית גת", "קריית מוצקין", "קריית שמונה", "ראש העין", "ראשון לציון", "רחובות", "רמלה", "רמת גן", "רמת השרון", "רעננה", "שדרות", "תל אביב-יפו"]
  };
  $$('.tac').forEach(function (box) {
    var input = $('input', box), ul = $('ul', box), items = LISTS[box.dataset.list], act = -1;
    ul.id = input.id + '-list'; input.setAttribute('aria-controls', ul.id);
    function render() {
      var q = input.value.trim().toLowerCase(), hits = items.filter(function (m) { return !q || m.toLowerCase().indexOf(q) > -1; });
      act = -1;
      ul.innerHTML = hits.length ? hits.map(function (m) {
        var i = m.toLowerCase().indexOf(q), label = q && i > -1 ? m.slice(0, i) + '<b>' + m.slice(i, i + q.length) + '</b>' + m.slice(i + q.length) : m;
        return '<li class="list" role="option" data-v="' + m + '">' + label + '</li>';
      }).join('') : '<li class="no_results">לא נמצאו תוצאות</li>';
      box.classList.add('open'); input.setAttribute('aria-expanded', 'true');
    }
    function close() { box.classList.remove('open'); input.setAttribute('aria-expanded', 'false'); }
    function pick(v) { input.value = v; close(); input.closest('.f').classList.remove('bad'); input.dispatchEvent(new Event('change', { bubbles: true })); }
    input.addEventListener('focus', render);
    input.addEventListener('click', render);
    input.addEventListener('input', render);
    input.addEventListener('keydown', function (e) {
      var li = $$('li.list', ul);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault(); if (!box.classList.contains('open')) render(); if (!li.length) return;
        act = Math.max(0, Math.min(li.length - 1, act + (e.key === 'ArrowDown' ? 1 : -1)));
        li.forEach(function (x, i) { x.classList.toggle('focus', i === act); }); li[act].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter' && box.classList.contains('open') && act > -1) { e.preventDefault(); pick(li[act].dataset.v); }
      else if (e.key === 'Escape') close();
    });
    ul.addEventListener('mousedown', function (e) { var li = e.target.closest('li.list'); if (li) { e.preventDefault(); pick(li.dataset.v); } });
    input.addEventListener('blur', function () { setTimeout(close, 120); });
    box.validate = function () { return !!box.dataset.free || items.indexOf(input.value.trim()) > -1; };
  });

  // ---- Datepicker (jQuery UI look, Hebrew, max date = today) ----
  var HMONTHS = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
  var HDAYS = ["א'","ב'","ג'","ד'","ה'","ו'",'שבת'];
  $$('.tdate').forEach(function (wrap) {
    var input = $('input', wrap), dp = document.createElement('div'), today = new Date(), view, chosen = null;
    today.setHours(0, 0, 0, 0);
    dp.className = 'dp'; dp.setAttribute('role', 'dialog'); dp.setAttribute('aria-label', 'בחירת תאריך');
    wrap.appendChild(dp);
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function draw() {
      var y = view.getFullYear(), m = view.getMonth(), first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate();
      var canNext = new Date(y, m + 1, 1) <= today;
      var h = '<div class="dp-head"><button type="button" class="dp-prev" aria-label="החודש הקודם">&gt;</button><span>' + HMONTHS[m] + ' ' + y + '</span><button type="button" class="dp-next" aria-label="החודש הבא"' + (canNext ? '' : ' disabled') + '>&lt;</button></div>';
      h += '<table><thead><tr>' + HDAYS.map(function (d) { return '<th>' + d + '</th>'; }).join('') + '</tr></thead><tbody><tr>';
      for (var i = 0; i < first; i++) h += '<td></td>';
      for (var d = 1; d <= days; d++) {
        var dt = new Date(y, m, d), cls = [];
        if (dt.getTime() === today.getTime()) cls.push('today');
        if (chosen && dt.getTime() === chosen.getTime()) cls.push('sel');
        if (dt > today) cls.push('off');
        h += '<td class="' + cls.join(' ') + '"><button type="button" data-d="' + d + '"' + (dt > today ? ' tabindex="-1" aria-disabled="true"' : '') + '>' + d + '</button></td>';
        if ((first + d) % 7 === 0 && d < days) h += '</tr><tr>';
      }
      dp.innerHTML = h + '</tr></tbody></table>';
    }
    function open() { var b = chosen || today; view = new Date(b.getFullYear(), b.getMonth(), 1); draw(); dp.classList.add('open'); }
    function close() { dp.classList.remove('open'); }
    input.addEventListener('click', function () { dp.classList.contains('open') ? close() : open(); });
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); open(); } else if (e.key === 'Escape') close(); });
    dp.addEventListener('click', function (e) {
      if (e.target.closest('.dp-prev')) { view.setMonth(view.getMonth() - 1); draw(); return; }
      if (e.target.closest('.dp-next')) { view.setMonth(view.getMonth() + 1); draw(); return; }
      var b = e.target.closest('td:not(.off) button'); if (!b) return;
      chosen = new Date(view.getFullYear(), view.getMonth(), +b.dataset.d);
      input.value = pad(chosen.getDate()) + '/' + pad(chosen.getMonth() + 1) + '/' + chosen.getFullYear();
      input.closest('.f').classList.remove('bad'); close(); input.focus();
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    W.addEventListener('click', function (e) { if (!wrap.contains(e.target)) close(); });
    wrap.reset = function () { chosen = null; close(); };
  });

  // ---- Warranty activation: product types + field validation ----
  var TYPES = {
    ac: { name: 'מזגן', noun: 'המזגן', icon: 'i-shield', models: true, ac: true },
    portable: { name: 'מזגן נייד', noun: 'המזגן', icon: 'i-wind', models: true, ac: true },
    electric: { name: 'מוצרי חשמל', noun: 'המוצר', icon: 'i-plug', models: false },
    heatpump: { name: 'משאבות חום', noun: 'המוצר', icon: 'i-thermo', models: false }
  };
  var RX = {
    he: /^[֐-׿\s'"\-]{2,}$/,
    mobile: /^05\d{8}$/,
    phone: /^0\d{8,9}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    id: /^\d{5,9}$/
  };
  function fieldOk(input) {
    var v = (input.value || '').trim(), f = input.closest('.f');
    var ok = input.required ? !!v : true;
    var tac = input.closest('.tac'); if (ok && tac && tac.validate) ok = tac.validate();
    if (ok && v && input.dataset.v) ok = RX[input.dataset.v].test(/phone|mobile/.test(input.dataset.v) ? v.replace(/[\s-]/g, '') : v);
    if (f) f.classList.toggle('bad', !ok);
    return ok;
  }
  var pendingExit = 'tsw-warranty';
  $('#leave-yes').addEventListener('click', function () { closeModal($('#m-leave')); exitFlow2(pendingExit); });
  $$('[data-flow]').forEach(function (b) { b.addEventListener('click', function () { openFlow2(b.dataset.flow); }); });
  addEventListener('popstate', function () {
    var m = location.hash.match(/^#activate2-(\w+)$/);
    if (m && TYPES[m[1]]) openFlow2(m[1], false);
    else if (W.classList.contains('in-flow2')) exitFlow2('tsw-warranty', true);
  });
  setTimeout(function () { var m = location.hash.match(/^#activate2-(\w+)$/); if (m && TYPES[m[1]]) openFlow2(m[1], false); }, 0);

  // ---- Warranty activation flow (Figma behaviour: invoice + serial check -> details -> address -> plan per unit) ----
  var f2 = $('#f2'), f2step = 1, f2type = 'ac', f2dirty = false, units = [];
  var SERIAL_RX = /^[A-Za-z0-9]{8,20}$/;
  function f2noun() { return TYPES[f2type].noun; }
  function serialRow(i, total) {
    var d = document.createElement('div');
    d.className = 'serial f';
    var lbl = total > 1 ? 'מספר סיריאלי של ' + (TYPES[f2type].ac ? 'מזגן' : 'מוצר') + ' ' + (i + 1) : 'מספר סיריאלי של ' + f2noun();
    d.innerHTML = '<label for="f2-sn-' + i + '"><span class="req">*</span>' + lbl + '</label>' +
      '<div class="sfield"><input id="f2-sn-' + i + '" type="text" placeholder="הקלד את המספר הסיריאלי" maxlength="20" autocomplete="off">' +
      '<span class="s-tools"><button class="s-check" type="button">בדיקת סיריאלי</button><span class="s-spin" aria-label="בודקים"></span><svg class="icon s-ok"><use href="#i-check-c"/></svg>' +
      (i > 0 ? '<button class="s-rm" type="button" aria-label="הסרה"><svg class="icon"><use href="#i-x"/></svg></button>' : '') + '</span></div>' +
      '<div class="s-meta" aria-live="polite"></div>';
    return d;
  }
  function renderSerials(values) {
    var box = $('#serials'); box.innerHTML = '';
    values.forEach(function (v, i) {
      var r = serialRow(i, values.length); box.appendChild(r);
      var inp = $('input', r); inp.value = v.sn || '';
      if (v.ok) { r.classList.add('ok'); r.dataset.model = v.model; $('.s-meta', r).innerHTML = '<span class="found">זוהה: ' + f2noun().replace('ה', '') + ' ' + v.model + '</span>'; }
      else if (SERIAL_RX.test(inp.value)) r.classList.add('ready');
    });
    f2gate();
  }
  function readSerials() {
    return $$('#serials .serial').map(function (r) { return { sn: $('input', r).value.trim(), ok: r.classList.contains('ok'), model: r.dataset.model || '' }; });
  }
  function f2gate() {
    var hasFile = $('#f2-file-row').classList.contains('on');
    var all = readSerials(), allOk = all.length && all.every(function (x) { return x.ok; });
    $('.f2s[data-s="1"] .f2-next').disabled = !(hasFile && allOk);
    if (f2step === 4) {
      var picked = $$('#units .unit').every(function (u) { return u.classList.contains('picked'); });
      $('.f2s[data-s="4"] .f2-next').disabled = !(picked && $('#f2-terms').checked);
    }
  }
  $('#serials').addEventListener('input', function (e) {
    var r = e.target.closest('.serial'); if (!r) return;
    f2dirty = true;
    r.classList.remove('ok', 'err'); delete r.dataset.model; $('.s-meta', r).textContent = '';
    r.classList.toggle('ready', SERIAL_RX.test(e.target.value.trim()));
    f2gate();
  });
  $('#serials').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.matches('input')) { e.preventDefault(); var b = $('.s-check', e.target.closest('.serial')); if (e.target.closest('.serial').classList.contains('ready')) b.click(); }
  });
  $('#serials').addEventListener('click', function (e) {
    var r = e.target.closest('.serial'); if (!r) return;
    if (e.target.closest('.s-rm')) { var v = readSerials(); v.splice($$('#serials .serial').indexOf(r), 1); renderSerials(v); return; }
    if (e.target.closest('.s-check')) {
      var sn = $('input', r).value.trim();
      r.classList.remove('ready'); r.classList.add('busy'); $('.s-meta', r).textContent = 'בודקים את המספר…';
      setTimeout(function () {
        r.classList.remove('busy');
        var dup = readSerials().filter(function (x) { return x.sn === sn; }).length > 1;
        if (dup) { r.classList.add('err', 'ready'); $('.s-meta', r).innerHTML = '<span class="bad">המספר הזה כבר הוזן</span>'; f2gate(); return; }
        var sum = 0; for (var i = 0; i < sn.length; i++) sum += sn.charCodeAt(i);
        var model = LISTS.models[sum % LISTS.models.length];
        r.classList.add('ok'); r.dataset.model = model;
        $('.s-meta', r).innerHTML = '<span class="found">זוהה: ' + model + '</span>';
        f2gate();
      }, 1100);
    }
  });
  $('#add-serial').addEventListener('click', function () {
    var v = readSerials(); v.push({ sn: '' }); renderSerials(v);
    var inputs = $$('#serials input'); inputs[inputs.length - 1].focus(); f2dirty = true;
  });
  // invoice upload (Figma: up to 10MB)
  var f2drop = $('#f2-drop'), f2file = $('#f2-file');
  function f2clearFile() { f2file.value = ''; $('#f2-file-row').classList.remove('on'); f2drop.hidden = false; f2gate(); }
  function f2take(f) {
    var err = $('#f2-file-err');
    if (!f) return;
    if (!/\.(pdf|jpe?g|png)$/i.test(f.name)) { err.textContent = 'ניתן לצרף קבצי PDF, JPG או PNG בלבד'; err.hidden = false; return; }
    if (f.size > 10 * 1024 * 1024) { err.textContent = 'הקובץ גדול מ-10MB'; err.hidden = false; return; }
    err.hidden = true; $('#f2-file-name').textContent = f.name; $('#f2-file-row').classList.add('on'); f2drop.hidden = true; f2dirty = true; f2gate();
  }
  f2file.addEventListener('change', function () { f2take(f2file.files[0]); });
  ['dragenter', 'dragover'].forEach(function (ev) { f2drop.addEventListener(ev, function (e) { e.preventDefault(); f2drop.classList.add('over'); }); });
  ['dragleave', 'drop'].forEach(function (ev) { f2drop.addEventListener(ev, function (e) { e.preventDefault(); f2drop.classList.remove('over'); }); });
  f2drop.addEventListener('drop', function (e) { var f = e.dataTransfer.files[0]; if (f) f2take(f); });
  $('#f2-file-rm').addEventListener('click', f2clearFile);

  // step 4: one accordion per recognised unit
  function renderUnits() {
    var list = readSerials(), box = $('#units'), noun = TYPES[f2type].ac ? 'מזגן' : 'מוצר';
    box.innerHTML = list.map(function (u, i) {
      return '<div class="unit' + (i === 0 ? ' open' : '') + '" data-i="' + i + '">' +
        '<button class="unit-h" type="button" aria-expanded="' + (i === 0) + '"><span class="st"></span><span>' + noun + ' ' + u.model + ' <span class="sn">' + u.sn + '</span></span><span class="plan"></span><span class="chev" aria-hidden="true"><svg class="icon"><use href="#i-down"/></svg></span></button>' +
        '<div class="unit-b"><div><div class="unit-in">' +
          '<div class="know"><svg class="icon"><use href="#i-info"/></svg><div><b>חשוב לדעת</b>לכל ' + noun + ' יש אחריות יצרן לשנה עפ"י דין. ניתן להרחיב את האחריות לשנתיים נוספות בתשלום חד פעמי. פרטי המסלולים המלאים מופיעים בטבלת האחריות.</div></div>' +
          '<label class="plan-card"><input type="radio" name="plan-' + i + '" value="basic"><span><b>אחריות בסיסית</b><small>שנת אחריות יצרן עפ"י דין - 0 ש"ח</small></span></label>' +
          '<label class="plan-card"><input type="radio" name="plan-' + i + '" value="ext"><span><b>אחריות מורחבת</b><small>שנת אחריות עפ"י דין + 2 נוספות - 199 ש"ח</small></span><span class="rec">מומלץ!</span></label>' +
        '</div></div></div></div>';
    }).join('');
  }
  $('#units').addEventListener('click', function (e) {
    var h = e.target.closest('.unit-h'); if (!h) return;
    var u = h.parentNode, on = !u.classList.contains('open');
    u.classList.toggle('open', on); h.setAttribute('aria-expanded', on);
  });
  $('#units').addEventListener('change', function (e) {
    if (!e.target.matches('input[type=radio]')) return;
    var u = e.target.closest('.unit'); f2dirty = true;
    u.classList.add('picked');
    $('.plan', u).textContent = e.target.value === 'ext' ? 'אחריות מורחבת' : 'אחריות בסיסית';
    var next = u.nextElementSibling;
    if (next && !next.classList.contains('picked')) {
      setTimeout(function () {
        u.classList.remove('open'); $('.unit-h', u).setAttribute('aria-expanded', 'false');
        next.classList.add('open'); $('.unit-h', next).setAttribute('aria-expanded', 'true');
      }, 350);
    }
    f2gate();
  });
  $('#f2-terms').addEventListener('change', f2gate);

  function f2show(n) {
    f2step = n;
    $$('.f2s', f2).forEach(function (s) { s.classList.toggle('on', +s.dataset.s === n); });
    $$('#ps li').forEach(function (li, i) { li.classList.toggle('cur', i + 1 === n); li.classList.toggle('done', i + 1 < n); });
    if (n === 4) renderUnits();
    f2gate();
    $('#ps').scrollIntoView({ block: 'start' }); scrollBy(0, -90);
  }
  function f2stepOk(n) {
    var step = $('.f2s[data-s="' + n + '"]', f2), ok = true;
    $$('.f input:not([type=checkbox])', step).forEach(function (i) { if (!fieldOk(i)) ok = false; });
    if (!ok) { var bad = $('.f.bad input', step); if (bad) bad.focus(); }
    return ok;
  }
  f2.addEventListener('input', function (e) {
    if (e.target.closest('#serials')) return;
    f2dirty = true; var f = e.target.closest('.f'); if (f && f.classList.contains('bad')) fieldOk(e.target);
  });
  f2.addEventListener('submit', function (e) {
    e.preventDefault();
    if (f2step === 1) { f2show(2); return; }
    if (f2step < 4) { if (f2stepOk(f2step)) f2show(f2step + 1); return; }
    var btn = $('.f2s[data-s="4"] .f2-next'); btn.disabled = true; btn.textContent = 'מפעילים…';
    setTimeout(function () {
      btn.textContent = 'להפעלת האחריות';
      $('#f2-sum').innerHTML = $$('#units .unit').map(function (u) {
        return '<li><b>' + $('.unit-h > span:nth-child(2)', u).textContent + '</b><span>' + $('.plan', u).textContent + '</span></li>';
      }).join('');
      f2.hidden = true; $('#ps').hidden = true; $('#f2-done').hidden = false; f2dirty = false;
      W.scrollIntoView({ block: 'start' });
    }, 900);
  });
  $$('.f2-prev', f2).forEach(function (b) { b.addEventListener('click', function () { f2show(f2step - 1); }); });
  $('#f2-free').addEventListener('change', function () {
    ['#f2-city', '#f2-street'].forEach(function (id) {
      var t = $(id).closest('.tac'); if (this.checked) t.dataset.free = '1'; else delete t.dataset.free;
      $(id).closest('.f').classList.remove('bad');
    }, this);
  });
  function openFlow2(type, push) {
    f2type = type; var t = TYPES[type];
    $('#f2-type').textContent = t.name;
    $$('.noun2').forEach(function (n) { n.textContent = t.noun; });
    $$('.ac-only2').forEach(function (n) { n.hidden = !t.ac; });
    f2.reset(); f2dirty = false; f2clearFile(); $('#f2-file-err').hidden = true;
    $$('.tdate', f2).forEach(function (w) { w.reset(); });
    $$('.tac', f2).forEach(function (t) { delete t.dataset.free; });
    $$('.f.bad', f2).forEach(function (f) { f.classList.remove('bad'); });
    renderSerials([{ sn: '' }]);
    f2.hidden = false; $('#ps').hidden = false; $('#f2-done').hidden = true;
    W.classList.add('in-flow2');
    if (push !== false) history.pushState({ flow2: type }, '', '#activate2-' + type);
    f2show(1); W.scrollIntoView({ block: 'start' });
  }
  function exitFlow2(to, fromPop) {
    W.classList.remove('in-flow2');
    if (!fromPop && /^#activate2-/.test(location.hash)) history.pushState({}, '', location.pathname + location.search);
    var target = byId(to || 'tsw-warranty');
    if (target) target.scrollIntoView({ block: 'start' });
  }
  $$('[data-exit2]').forEach(function (b) {
    b.addEventListener('click', function () {
      pendingExit = b.dataset.exit2 || 'tsw-warranty';
      if (f2dirty && $('#f2-done').hidden) openModal('m-leave'); else exitFlow2(pendingExit);
    });
  });

  // ---- User guide picker ----
  var model = $('#model'), gbtn = $('#guide-btn');
  model.addEventListener('change', function () {
    var ok = !!model.value;
    gbtn.disabled = !ok;
    $('#gs-1').classList.toggle('done', ok);
    $('#gs-2').classList.toggle('locked', !ok); $('#gs-2').classList.toggle('active', ok);
    $('#gs-2-hint').textContent = ok ? 'הוראות השימוש לדגם ' + model.value + ' מוכנות להורדה.' : 'הכפתור יופעל אחרי שתבחרו דגם.';
  });
  $('#guide-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var label = $('span', gbtn), use = $('use', gbtn);
    gbtn.classList.add('busy'); label.textContent = 'מכינים את הקובץ…';
    setTimeout(function () {
      gbtn.classList.remove('busy'); gbtn.classList.add('done');
      use.setAttribute('href', '#i-check-c'); label.textContent = 'הקובץ מוכן';
      say('כאן תרד חוברת ההוראות של ' + model.value);
      setTimeout(function () { gbtn.classList.remove('done'); use.setAttribute('href', '#i-download'); label.textContent = 'להורדה'; }, 2200);
    }, 900);
  });

  // ---- Search with suggestions ----
  var INDEX = [
    { t: 'הפעלת אחריות', k: 'אחריות הפעלה חשבונית סיריאלי רישום', href: '#tsw-warranty', icon: 'i-shield' },
    { t: 'היכן נמצא המספר הסיריאלי?', k: 'סיריאלי מספר מדבקה ברקוד', modal: 'm-serial', icon: 'i-help' },
    { t: 'הוראות שימוש', k: 'הוראות שימוש מדריך דגם הורדה שלט', href: '#tsw-user-guide', icon: 'i-book' },
    { t: 'ייעוץ בבחירת מזגן', k: 'ייעוץ בחירה קנייה רכישה מזגן יועץ', href: 'https://www.tadiran-group.co.il/advisor/', icon: 'i-headset' },
    { t: 'טבלת אחריות', k: 'אחריות תנאים טבלה תקופה', href: 'https://www.tadiran-group.co.il/warranty-table-info/', icon: 'i-file' },
    { t: 'תקנון אחריות מורחבת', k: 'אחריות מורחבת תקנון', href: 'https://www.tadiran-group.co.il/%d7%aa%d7%a7%d7%a0%d7%95%d7%9f-%d7%94%d7%a8%d7%97%d7%91%d7%aa-%d7%90%d7%97%d7%a8%d7%99%d7%95%d7%aa-%d7%a2%d7%9c-%d7%9e%d7%96%d7%92%d7%a0%d7%99%d7%9d/', icon: 'i-file' },
    { t: 'שאלות ותשובות', k: 'שאלות תשובות תפעול תחזוקה תקלה', href: '#faq', icon: 'i-help' },
    { t: 'מוקד שירות וטלפונים', k: 'טלפון מוקד שירות נציג שעות כתובת מייל sms', modal: 'm-phones', icon: 'i-phone' },
    { t: 'Whatsapp', k: 'וואטסאפ ווטסאפ הודעה', href: 'https://api.whatsapp.com/send?phone=972541466491', icon: 'i-msg' },
    { t: 'ביטול עסקה', k: 'ביטול עסקה החזרה', href: 'https://www.tadiran-group.co.il/cancel-order/', icon: 'i-file' },
    { t: 'איסוף מוצר ישן מבית הלקוח', k: 'איסוף מוצר ישן מחזור', href: 'https://www.tadiran-group.co.il/%d7%90%d7%99%d7%a1%d7%95%d7%a3-%d7%9e%d7%95%d7%a6%d7%a8-%d7%99%d7%a9%d7%9f-%d7%9e%d7%91%d7%99%d7%aa-%d7%94%d7%9c%d7%a7%d7%95%d7%97/', icon: 'i-file' }
  ];
  faqItems.forEach(function (it) {
    INDEX.push({ t: $('.qa-q span', it).textContent, k: '', href: '#' + it.id, faq: it.id, icon: 'i-help' });
  });
  var q = $('#q'), box = $('#suggest'), act = -1;
  function esc(s) { return s.replace(/[<>&"]/g, ''); }
  function hl(t, s) { var i = t.indexOf(s); return i < 0 ? t : t.slice(0, i) + '<mark>' + s + '</mark>' + t.slice(i + s.length); }
  function render() {
    var s = esc(q.value.trim()); act = -1;
    if (!s) { box.classList.remove('open'); q.setAttribute('aria-expanded', 'false'); return; }
    var hits = INDEX.filter(function (x) { return (x.t + ' ' + x.k).toLowerCase().indexOf(s.toLowerCase()) > -1; }).slice(0, 8);
    box.innerHTML = hits.length
      ? hits.map(function (h) {
          var i = INDEX.indexOf(h);
          return h.modal
            ? '<button type="button" role="option" data-modal="' + h.modal + '">' + ICON(h.icon) + '<span>' + hl(h.t, s) + '</span></button>'
            : '<a role="option" href="' + h.href + '"' + (h.faq ? ' data-faq="' + h.faq + '"' : '') + '>' + ICON(h.icon) + '<span>' + hl(h.t, s) + '</span></a>';
        }).join('')
      : '<div class="none">לא מצאנו תוצאות. אפשר לפנות אלינו בכל אחד מהערוצים למטה.</div>';
    box.classList.add('open'); q.setAttribute('aria-expanded', 'true');
  }
  q.addEventListener('input', render);
  q.addEventListener('focus', render);
  q.addEventListener('keydown', function (e) {
    var items = $$('[role=option]', box);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault(); if (!items.length) return;
      act = (act + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items.forEach(function (el, i) { el.classList.toggle('act', i === act); });
    } else if (e.key === 'Escape') box.classList.remove('open');
  });
  $('#search-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var items = $$('[role=option]', box);
    if (items.length) (items[act] || items[0]).click();
  });
  box.addEventListener('click', function (e) {
    box.classList.remove('open');
    var a = e.target.closest('[data-faq]'); if (a) setQa(byId(a.dataset.faq), true);
  });
  W.addEventListener('click', function (e) { if (!e.target.closest('.search')) box.classList.remove('open'); });
})();
