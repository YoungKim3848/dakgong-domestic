/* 시설 갤러리 확대창 — 생활환경 페이지 전용 (2026-08-03)
   사진(또는 「전체 보기」 버튼)을 누르면 그 구역의 사진을 처음부터 넘겨볼 수 있다.
   필핀 시설 페이지의 라이트박스와 같은 역할이고, 마크업은 국내 구조에 맞춰 새로 썼다.
   사진이 아직 없어서 지금은 몇 번째인지만 표시된다 — 실물이 들어오면 img 를 채운다. */
(function () {
  'use strict';
  var root = document.querySelector('.page-life-care-gal');
  if (!root) return;

  var SEC = [].slice.call(document.querySelectorAll('.page-life-care-gal .fac')).map(function (el) {
    return { name: el.dataset.name || '', total: parseInt(el.dataset.total, 10) || 1 };
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
      '<div class="dk-galbox__img"><p class="t"></p>' +
      '<p class="s">사진이 들어오면 이 자리에 뜹니다</p></div>' +
      '<figcaption class="dk-galbox__cap"></figcaption>' +
      '<p class="dk-galbox__idx"></p>' +
    '</figure>';
  document.body.appendChild(box);

  var elT = box.querySelector('.dk-galbox__img .t');
  var elCap = box.querySelector('.dk-galbox__cap');
  var elIdx = box.querySelector('.dk-galbox__idx');
  var cur = { s: 0, i: 0 };
  var opener = null;

  function draw() {
    var s = SEC[cur.s];
    elT.textContent = s.name + ' — ' + (cur.i + 1) + '번째';
    elCap.textContent = s.name;
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
