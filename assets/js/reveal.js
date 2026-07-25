/* 닥공캠프 국내 사이트 — 스크롤 등장(reveal-on-scroll) 최소 JS
   [data-reveal] 요소가 뷰포트에 들어오면 .is-in 클래스를 붙인다(1회만, 이후 unobserve).
   IntersectionObserver 미지원 브라우저·모션 최소화(prefers-reduced-motion) 설정에서는
   즉시 .is-in을 붙여 콘텐츠가 항상 보이도록 안전장치를 둔다(콘텐츠 숨김 금지 원칙). */
(function () {
  var els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    for (var i = 0; i < els.length; i++) els[i].classList.add('is-in');
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    }
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  for (var j = 0; j < els.length; j++) io.observe(els[j]);
})();
