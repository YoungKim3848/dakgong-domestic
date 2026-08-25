/* 푸터 법적 고지 팝업 — 이용약관 · 개인정보처리방침 (2026-08-25)
   그전까지 두 링크가 href="#" 이라 눌러도 아무 일이 없었다. 필핀 실사이트는
   같은 자리에서 팝업으로 전문을 띄운다.

   문서를 7페이지에 각각 심지 않고 terms.html · privacy.html 을 fetch 해 온다.
   전문이 7벌로 갈라지면 한 곳만 고쳐지는 사고가 난다(롤링밴드 문구가 실제로 그랬다).
   그래서 원본은 파일 하나이고, 링크의 href 도 그 파일을 그대로 가리킨다 —
   JS 가 없거나 fetch 가 실패하면 팝업 대신 그 페이지로 이동한다. 링크는 죽지 않는다. */
(function () {
  'use strict';
  var links = [].slice.call(document.querySelectorAll('.site-footer__legal a[data-legal]'));
  if (!links.length || !window.fetch) return;

  var box = document.createElement('div');
  box.className = 'dk-legal';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.hidden = true;
  box.innerHTML =
    '<div class="dk-legal__panel" role="document">' +
      '<div class="dk-legal__head">' +
        '<h2 class="dk-legal__h" id="dk-legal-h"></h2>' +
        '<button class="dk-legal__x" type="button" aria-label="닫기">✕</button>' +
      '</div>' +
      '<div class="dk-legal__body dk-legal-doc" tabindex="0"></div>'  /* dk-legal-doc 를 같이 걸어야 문서 본문 규칙(13px)이 적용된다.
         이걸 빠뜨려 팝업만 16px 로 떴다. 전문 페이지는 멀쩡했다. */ +
    '</div>';
  document.body.appendChild(box);
  box.setAttribute('aria-labelledby', 'dk-legal-h');

  var elH = box.querySelector('.dk-legal__h');
  var elB = box.querySelector('.dk-legal__body');
  var opener = null;
  var cache = {};

  function close() {
    box.hidden = true;
    document.body.style.overflow = '';
    if (opener) opener.focus();
  }

  function show(title, html) {
    elH.textContent = title;
    elB.innerHTML = html;
    elB.scrollTop = 0;
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    box.querySelector('.dk-legal__x').focus();
  }

  function load(url) {
    if (cache[url]) return Promise.resolve(cache[url]);
    return fetch(url, { credentials: 'same-origin' })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.text();
      })
      .then(function (t) {
        var d = document.createElement('div');
        d.innerHTML = t;
        var doc = d.querySelector('.dk-legal-doc');
        if (!doc) throw new Error('본문 없음');
        cache[url] = doc.innerHTML;
        return cache[url];
      });
  }

  links.forEach(function (a) {
    a.addEventListener('click', function (e) {
      // 새 탭·저장 등 사용자가 의도한 기본 동작은 가로채지 않는다.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      opener = a;
      var title = a.textContent.trim();
      load(a.getAttribute('href')).then(function (html) {
        show(title, html);
      })['catch'](function () {
        window.location.href = a.getAttribute('href');   // 팝업이 안 되면 페이지로
      });
    });
  });

  box.querySelector('.dk-legal__x').addEventListener('click', close);
  box.addEventListener('click', function (e) { if (e.target === box) close(); });
  document.addEventListener('keydown', function (e) {
    if (!box.hidden && e.key === 'Escape') close();
  });
})();
