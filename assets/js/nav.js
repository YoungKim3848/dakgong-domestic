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

  /* 경로 정규화 — Netlify Pretty URLs(대시보드 설정)가 배포 시 href를
     "curriculum.html" → "/curriculum" 으로 자동 재작성해도(로컬 소스와
     달라짐), 그리고 주소창 pathname이 "/curriculum" 또는 "/curriculum/"
     또는 "/curriculum.html"이어도 전부 "curriculum"으로 맞춰 비교한다.
     ★2026-07-25: 이 정규화 누락이 배포본에서 active 강조가 전혀 안 뜨던
     근본 원인이었음(로컬 파일엔 href="curriculum.html", 배포본엔
     href="/curriculum" — 정확 일치 비교라 항상 실패). */
  function dkNormPath(p) {
    if (!p) return 'index';
    p = p.split('#')[0].split('?')[0];
    var parts = p.split('/').filter(Boolean);
    var last = parts.length ? parts[parts.length - 1] : '';
    last = last.replace(/\.html$/i, '');
    if (last === '') last = 'index';
    return last.toLowerCase();
  }
  var here = dkNormPath(location.pathname);
  var allLinks = nav.querySelectorAll('a[href]');
  for (var k = 0; k < allLinks.length; k++) {
    var href = dkNormPath(allLinks[k].getAttribute('href'));
    if (href && href === here) {
      var el = allLinks[k].closest('li');
      while (el) {
        el.classList.add('is-active');
        var parentLi = el.parentElement ? el.parentElement.closest('li') : null;
        el = parentLi;
      }
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
