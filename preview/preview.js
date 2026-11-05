// PREVIEW ONLY (client review) - not part of the deliverable.
// Top window: review bar that renders this page in an iframe with device + My Tadiran toggles.
(function () {
  if (window.self !== window.top || /[?&]embed=1/.test(location.search)) return;
  var st = { device: 'desktop', mt: 'off' };
  try { var saved = JSON.parse(localStorage.getItem('tadiranReview') || '{}'); if (saved.device) st.device = saved.device; if (saved.mt) st.mt = saved.mt; } catch (e) {}
  var bar = document.createElement('div');
  bar.className = 'pbar';
  bar.innerHTML =
    '<span class="ttl">תדיראן · שירות ואחריות<small>מוקאפ לבדיקה</small></span>' +
    '<span class="grp sp"><span>תצוגה</span><span class="pseg" data-k="device">' +
      '<button type="button" data-v="desktop"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>דסקטופ</button>' +
      '<button type="button" data-v="mobile"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/></svg>מובייל</button></span></span>' +
    '<span class="grp"><span>My Tadiran</span><span class="pseg" data-k="mt"><button type="button" data-v="off">בלי</button><button type="button" data-v="on">עם</button></span></span>';
  var stage = document.createElement('div');
  stage.className = 'pstage';
  var frame = document.createElement('iframe');
  frame.title = 'עמוד שירות ואחריות';
  var base = location.href.split('#')[0], hash = location.hash;
  frame.src = base + (base.indexOf('?') > -1 ? '&' : '?') + 'embed=1&mt=' + st.mt + hash;
  stage.appendChild(frame);
  function paint() {
    stage.classList.toggle('mobile', st.device === 'mobile');
    bar.querySelectorAll('.pseg').forEach(function (g) {
      g.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === st[g.dataset.k]); });
    });
    try { localStorage.setItem('tadiranReview', JSON.stringify(st)); } catch (e) {}
  }
  bar.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var k = b.closest('.pseg').dataset.k; st[k] = b.dataset.v; paint();
    if (k === 'mt' && frame.contentWindow) frame.contentWindow.postMessage({ tadiranMT: st.mt }, '*');
  });
  function mount() { document.body.classList.add('shell'); document.body.appendChild(bar); document.body.appendChild(stage); paint(); }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();

// Inside the preview frame: My Tadiran toggle and the mock header's search button.
(function () {
  var W = document.getElementById('tadiran-service-page');
  if (!W) return;
  W.classList.toggle('mt-on', /[?&]mt=on/.test(location.search));
  addEventListener('message', function (e) {
    if (!e.data || !e.data.tadiranMT) return;
    var on = e.data.tadiranMT === 'on';
    W.classList.toggle('mt-on', on);
    if (on && !W.classList.contains('in-flow2')) document.getElementById('my-tadiran').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  document.querySelectorAll('[data-focus-search]').forEach(function (b) {
    b.addEventListener('click', function () { W.scrollIntoView({ block: 'start' }); document.getElementById('q').focus(); });
  });
})();
