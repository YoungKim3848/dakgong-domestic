/* 시설 갤러리 확대창 — 생활환경 페이지 전용 (2026-08-03)
   사진(또는 「전체 보기」 버튼)을 누르면 그 구역의 사진을 처음부터 넘겨볼 수 있다.
   필핀 시설 페이지의 라이트박스와 같은 역할이고, 마크업은 국내 구조에 맞춰 새로 썼다.
   ★2026-08-21 실사진 27장 연결. 각 구역의 전체 목록은 .fac 안
   <script type="application/json" class="fac-photos"> 에 있다 — 벤토에는 앞 4장만 보이므로
   DOM 만 훑으면 나머지를 알 수 없다. 그래서 목록을 따로 싣는다. */
(function () {
  'use strict';
  var root = document.querySelector('.page-life-care-gal');
  if (!root) return;

  var SEC = [].slice.call(document.querySelectorAll('.page-life-care-gal .fac')).map(function (el) {
    var j = el.querySelector('script.fac-photos');
    var ph = [];
    if (j) { try { ph = JSON.parse(j.textContent); } catch (e) { ph = []; } }
    return { name: el.dataset.name || '', photos: ph,
             total: ph.length || parseInt(el.dataset.total, 10) || 1 };
  });
  if (!SEC.length) return;

  var box = document.createElement('div');
  box.className = 'dk-galbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', '시설 사진 크게 보기');
  box.innerHTML =
    '<button class="dk-galbox__x" type="button" aria-label="닫기">✕</button>' +
    '<button class="dk-galbox__nav is-prev" type="button" aria-label="이전 사진">‹</button>' +
    '<button class="dk-galbox__nav is-next" type="button" aria-label="다음 사진">›</button>' +
    '<figure class="dk-galbox__fig">' +
      '<div class="dk-galbox__img"><img alt=""><p class="t"></p></div>' +
      '<figcaption class="dk-galbox__cap"></figcaption>' +
      '<p class="dk-galbox__idx"></p>' +
    '</figure>';
  document.body.appendChild(box);

  var elT = box.querySelector('.dk-galbox__img .t');
  var elImg = box.querySelector('.dk-galbox__img img');
  var elCap = box.querySelector('.dk-galbox__cap');
  var elIdx = box.querySelector('.dk-galbox__idx');
  var cur = { s: 0, i: 0 };
  var opener = null;

  function draw() {
    var s = SEC[cur.s], p = s.photos[cur.i];
    if (p) {
      elImg.src = p.src; elImg.alt = p.alt; elImg.hidden = false;
      elT.hidden = true;
      elCap.textContent = p.alt;
      // 다음·이전 장을 미리 받아 둔다 — 넘길 때마다 검은 화면이 뜨지 않게.
      [1, -1].forEach(function (d) {
        var q = s.photos[(cur.i + d + s.total) % s.total];
        if (q) { var im = new Image(); im.src = q.src; }
      });
    } else {
      elImg.hidden = true; elT.hidden = false;
      elT.textContent = s.name + ' — ' + (cur.i + 1) + '번째';
      elCap.textContent = s.name;
    }
    elIdx.textContent = (cur.i + 1) + ' / ' + s.total + '장';
  }
  function open(si, i) {
    if (!SEC[si]) return;
    cur = { s: si, i: Math.min(Math.max(i, 0), SEC[si].total - 1) };
    box.classList.add('is-on');
    document.body.style.overflow = 'hidden';
    draw();
    box.querySelector('.dk-galbox__x').focus();
  }
  function close() {
    box.classList.remove('is-on');
    document.body.style.overflow = '';
    if (opener) opener.focus();
  }
  function step(d) {
    var n = SEC[cur.s].total;
    cur.i = (cur.i + d + n) % n;
    draw();
  }

  function from(el) {
    var fac = el.closest('.fac');
    if (!fac) return null;
    var list = [].slice.call(document.querySelectorAll('.page-life-care-gal .fac'));
    return { s: list.indexOf(fac), i: parseInt(el.dataset.i, 10) || 0 };
  }
  root.addEventListener('click', function (e) {
    var el = e.target.closest('.b, .more');
    if (!el) return;
    var t = from(el);
    if (!t) return;
    opener = el;
    open(t.s, t.i);
  });
  root.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var el = e.target.closest('.b');
    if (!el) return;
    e.preventDefault();
    var t = from(el);
    if (!t) return;
    opener = el;
    open(t.s, t.i);
  });

  box.querySelector('.dk-galbox__x').addEventListener('click', close);
  box.querySelector('.is-prev').addEventListener('click', function () { step(-1); });
  box.querySelector('.is-next').addEventListener('click', function () { step(1); });
  box.addEventListener('click', function (e) { if (e.target === box) close(); });
  document.addEventListener('keydown', function (e) {
    if (!box.classList.contains('is-on')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
  });
})();
