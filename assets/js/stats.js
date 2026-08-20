/* 숫자 카운트업 — 홈 「숫자로 보는 닥공캠프」 (2026-08-20 회장 지시)
   화면에 들어올 때 0 에서 목표값까지 세어 올린다.

   ★목표값을 JS 에 적지 않는다. 마크업에 이미 252 가 박혀 있고, 그게 정본이다.
     여기서 또 적으면 숫자를 고칠 때 두 군데를 고쳐야 하고 언젠가 어긋난다.
     그래서 처음에 DOM 에서 읽어 두고, 그 값을 향해 센다.
   ★단위(<u>시간+</u>)는 건드리지 않는다. 첫 자식 텍스트 노드만 바꾼다.
   ★모션 최소화 설정이면 세지 않고 그냥 최종값으로 둔다 — 원래 값이 이미 거기 있으므로
     아무것도 안 하면 된다.
   ★1회만 돈다(unobserve). 스크롤로 오르내릴 때마다 다시 세면 성가시다. */
(function () {
  'use strict';

  var el = document.querySelector('.dk-glowstat .n');
  if (!el || !el.firstChild || el.firstChild.nodeType !== 3) return;

  var node = el.firstChild;
  var target = parseInt(String(node.nodeValue).replace(/[^\d]/g, ''), 10);
  if (!target) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;   // 최종값 그대로 둔다

  var DUR = 1200;   // ms
  var started = false;

  function run() {
    var t0 = null;
    function step(now) {
      if (t0 === null) t0 = now;
      var p = Math.min((now - t0) / DUR, 1);
      /* ease-out — 끝에서 천천히 멎어야 "도달했다"로 읽힌다.
         선형이면 목표값에서 뚝 끊긴다. */
      var e = 1 - Math.pow(1 - p, 3);
      node.nodeValue = String(Math.round(target * e));
      if (p < 1) requestAnimationFrame(step);
      else node.nodeValue = String(target);   // 반올림 오차로 251 에서 멎는 것 방지
    }
    requestAnimationFrame(step);
  }

  node.nodeValue = '0';
  var io = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting && !started) {
        started = true;
        io.unobserve(entries[i].target);
        run();
      }
    }
  }, { threshold: 0.4 });
  io.observe(el);
})();
