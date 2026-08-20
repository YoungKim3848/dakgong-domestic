/* 인터뷰 영상 — 유튜브 파사드(facade) (2026-08-20)
   썸네일을 먼저 보여 주고, 누른 뒤에야 유튜브 iframe 을 붙인다.
   이렇게 하는 이유 셋 —
   1. 페이지를 열기만 해도 유튜브가 붙으면 스크립트 수백 KB 가 매번 따라온다.
      영상은 두 칸뿐이고 대부분은 안 누른다.
   2. 누르기 전까지는 유튜브에 아무 요청도 안 간다(쿠키·추적 포함).
      그래서 도메인도 youtube-nocookie.com 을 쓴다.
   3. 카드 디자인(우상단 재생버튼 + 하단 캡션 바)을 그대로 유지할 수 있다.
      iframe 을 처음부터 깔면 유튜브가 자기 UI 를 그려서 그 디자인이 덮인다.
   썸네일은 저장소에 담아 같은 도메인에서 서빙한다(외부 CDN 안 쓴다 — 회장 지시). */
(function () {
  'use strict';

  var cards = [].slice.call(document.querySelectorAll('.dk-vi-card[data-yt]'));
  if (!cards.length) return;

  cards.forEach(function (card) {
    var id = card.dataset.yt;
    var btn = card.querySelector('.dk-vi-btn');
    if (!id || !btn) return;

    btn.addEventListener('click', function () {
      var frame = document.createElement('iframe');
      frame.className = 'dk-vi-frame';
      /* autoplay=1 — 사용자가 재생을 누른 결과이므로 자동재생이 아니라 그 클릭의 연장이다.
         rel=0 은 끝난 뒤 남의 채널 영상이 추천으로 뜨는 걸 막는다(같은 채널 안에서만). */
      frame.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) +
                  '?autoplay=1&rel=0';
      frame.title = btn.getAttribute('aria-label') || '인터뷰 영상';
      frame.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
      frame.allowFullscreen = true;
      frame.setAttribute('frameborder', '0');

      card.classList.add('is-playing');
      btn.replaceWith(frame);
    }, { once: true });
  });
})();
