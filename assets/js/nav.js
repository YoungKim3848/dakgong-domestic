/* 닥공캠프 국내 사이트 — 헤더 내비게이션 최소 JS (아임웹 런타임 비의존)
   기능: ①모바일 햄버거 토글 ②모바일에서 "ABOUT CAMP" 탭 시 하위메뉴 펼침
        ③현재 페이지 메뉴 항목 활성화 표시(is-active) */
(function () {
  var header = document.getElementById('site-header');
  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('site-nav');
  if (!header || !toggle || !nav) return;

  toggle.addEventListener('click', function () {
    var isOpen = header.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  var subParents = nav.querySelectorAll('.has-sub > a');
  for (var i = 0; i < subParents.length; i++) {
    subParents[i].addEventListener('click', function (e) {
      if (window.matchMedia('(max-width: 880px)').matches) {
        e.preventDefault();
        this.parentElement.classList.toggle('is-open');
      }
    });
  }

  var leafLinks = nav.querySelectorAll('a');
  for (var j = 0; j < leafLinks.length; j++) {
    leafLinks[j].addEventListener('click', function () {
      if (this.parentElement.classList.contains('has-sub')) return;
      if (window.matchMedia('(max-width: 880px)').matches) {
        header.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  var here = location.pathname.split('/').pop() || 'index.html';
  var allLinks = nav.querySelectorAll('a[href]');
  for (var k = 0; k < allLinks.length; k++) {
    var href = allLinks[k].getAttribute('href').split('#')[0];
    if (href && href === here) {
      var li = allLinks[k].closest('li');
      if (li) li.classList.add('is-active');
    }
  }

  // 스크롤 고정 헤더 — position:sticky는 CSS가 처리, 여기서는 스크롤량에 따라
  // .is-scrolled만 토글해 옅은 그림자를 얹는다(맨 위에서는 그림자 없음).
  var onScroll = function () {
    if (window.scrollY > 8) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
