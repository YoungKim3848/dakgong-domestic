/* 후기 확대창 — 홈 전용 (2026-08-17)
   롤링밴드의 카톡 캡처를 누르면 크게 본다. 카드에서는 글씨가 안 읽히므로
   확대가 없으면 후기를 실은 의미가 없다(카드는 "이만큼 있다"만 말한다).
   동작·단축키는 시설 갤러리(gallery.js)와 같게 맞췄다 — ←/→ 넘김, Esc 닫기.
   다른 점: 저기는 사진이 없어 자리표시를 띄웠고, 여기는 실물이 있어 확대본을 그때 받아온다.

   ★확대본(-full)은 22장 1MB 라 처음부터 불러오지 않는다. 열 때 src 를 넣는다.
     카드(-card)만 451KB 로 첫 화면에 들어간다. */
(function () {
  'use strict';
  var track = document.querySelector('.dk-review-scroll-track');
  if (!track) return;

  // 복제분(aria-hidden)은 세지 않는다 — 실제 장수만 알아야 "N / 22장"이 맞는다.
  var TOTAL = track.querySelectorAll('.dk-tr-shot:not([aria-hidden])').length;
  if (!TOTAL) return;

  var box = document.createElement('div');
  box.className = 'dk-galbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', '후기 크게 보기');
  box.innerHTML =
    '<button class="dk-galbox__x" type="button" aria-label="닫기">✕</button>' +
    '<button class="dk-galbox__nav is-prev" type="button" aria-label="이전 후기">‹</button>' +
    '<button class="dk-galbox__nav is-next" type="button" aria-label="다음 후기">›</button>' +
    '<figure class="dk-galbox__fig">' +
      '<img class="dk-galbox__shot" alt="">' +
      '<figcaption class="dk-galbox__cap">실제 수료생·학부모 후기</figcaption>' +
      '<p class="dk-galbox__idx"></p>' +
    '</figure>';
  document.body.appendChild(box);

  var shot = box.querySelector('.dk-galbox__shot');
  var idx = box.querySelector('.dk-galbox__idx');
  var cur = 0, opener = null;

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function draw() {
    shot.src = 'assets/images/review/dakgong-domestic-review-' + pad(cur + 1) + '-full.webp';
    shot.alt = '닥공캠프 학부모·수료생이 보내온 카카오톡 메시지 캡처 ' + (cur + 1);
    idx.textContent = (cur + 1) + ' / ' + TOTAL + '장';
  }
  function open(i) {
    cur = ((i % TOTAL) + TOTAL) % TOTAL;
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
  function step(d) { cur = ((cur + d) % TOTAL + TOTAL) % TOTAL; draw(); }

  track.addEventListener('click', function (e) {
    var el = e.target.closest('.dk-tr-shot');
    if (!el) return;
    opener = el.hasAttribute('aria-hidden') ? null : el;
    open(parseInt(el.dataset.i, 10) - 1);
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
