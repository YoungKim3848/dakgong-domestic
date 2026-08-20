/* 후기 롤링 띠 — 손으로 미는 슬라이더 (2026-08-20 회장 지시로 전면 교체)
   전에는 ①CSS keyframes 로 흘리고 ②누르면 확대창이 떴다.
   지시: 확대창은 빼고, 손·커서 올리면 멈추고, 좌우로 밀면 민 속도만큼 미끄러질 것.

   ★왜 CSS 를 버리고 JS 로 왔나 — ①(정지)은 animation-play-state 로 됐지만
     ②(민다) ③(관성)은 매 프레임 위치가 사람 손에 달려 있어 keyframes 로 표현이 안 된다.

   ★속도 모델이 이 파일의 전부다. 상태를 늘리지 않고 속도 하나만 목표값으로 당긴다:
        목표 = 손 올렸으면 0, 아니면 -AUTO(왼쪽으로 흐름)
        v += (목표 - v) * (1 - e^(-dt/TAU))
     · 가만히 두면 v 가 -AUTO 로 수렴 → 평소의 자동 흐름
     · 손 올리면 목표가 0 → 부드럽게 정지
     · 던지면 v 에 던진 속도를 꽂아 둠 → 같은 식이 감속시키다 자동 흐름으로 되돌림
     세 가지 요구가 분기 없이 한 줄에서 나온다. if 로 나누면 경계에서 속도가 튄다.

   ★AUTO = 34px/s 는 지어낸 값이 아니라 원래 CSS 속도다.
     140s 에 translateX(-50%), PC 한 벌 ≈ 4,686px → 33.5px/s.
     모바일도 마찬가지로 104s/3,476px ≈ 33.4px/s 였다(그래서 브레이크포인트마다
     duration 을 다르게 준 것). 속도가 원래 상수였으니 상수로 적는다. */
(function () {
  'use strict';

  var wrap = document.querySelector('.dk-review-scroll');
  var track = wrap && wrap.querySelector('.dk-review-scroll-track');
  if (!track) return;

  var AUTO = 34;      // px/s — 평소 흐름 (원래 CSS 속도)
  var TAU = 0.35;     // s — 속도가 목표에 붙는 시간상수. 크면 더 오래 미끄러진다
  var VMAX = 3800;    // px/s — 아무리 세게 던져도 이 이상은 안 나간다
  var SAMPLE = 90;    // ms — 놓는 순간의 속도를 재는 구간

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) AUTO = 0;   // 자동 흐름만 끈다. 미는 것은 사용자가 시작한 동작이라 남긴다

  /* 한 바퀴 폭 = 첫 복제 카드가 시작하는 지점.
     ⚠️ scrollWidth/2 로 잡으면 안 된다 — 카드 사이 gap 이 44장에 43번 들어가서
        절반이 「22장 + 21.5칸」이 되고, gap 반 칸(10px)만큼 매 바퀴 어긋난다. */
  var period = 0;
  function measure() {
    var kids = track.children;
    var half = Math.floor(kids.length / 2);
    period = (kids.length > half && half > 0)
      ? kids[half].offsetLeft - kids[0].offsetLeft
      : track.scrollWidth / 2;
  }
  measure();
  window.addEventListener('resize', measure);
  if (window.ResizeObserver) new ResizeObserver(measure).observe(track);

  var x = 0, v = 0;
  var paused = false, dragging = false;
  var pid = null, grabX = 0, grabOffset = 0;
  var samples = [];   // [시각, 포인터x] — 놓을 때 최근 구간의 속도를 여기서 뽑는다

  function draw() {
    /* 한 벌 폭 안으로 접어 둔다. 안 접으면 x 가 계속 커져 정밀도가 떨어진다. */
    if (period > 0) {
      x = x % period;
      if (x > 0) x -= period;
    }
    track.style.transform = 'translate3d(' + x + 'px,0,0)';
  }

  var last = 0;
  function frame(now) {
    var dt = last ? Math.min((now - last) / 1000, 0.05) : 0;  // 탭 복귀 시 큰 점프 방지
    last = now;
    if (!dragging && dt) {
      var target = paused ? 0 : -AUTO;
      v += (target - v) * (1 - Math.exp(-dt / TAU));
      if (Math.abs(v - target) < 0.5) v = target;   // 끝없이 0.0001 씩 도는 것 방지
      x += v * dt;
      draw();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ── 손 올리면 정지 ── */
  wrap.addEventListener('pointerenter', function () { paused = true; });
  wrap.addEventListener('pointerleave', function () { if (!dragging) paused = false; });

  /* ── 밀기 ── */
  wrap.addEventListener('pointerdown', function (e) {
    if (e.button !== undefined && e.button !== 0) return;   // 우클릭·가운데클릭 제외
    dragging = true; paused = true; v = 0;
    pid = e.pointerId; grabX = e.clientX; grabOffset = x;
    samples = [[e.timeStamp, e.clientX]];
    wrap.classList.add('is-dragging');
    if (wrap.setPointerCapture) wrap.setPointerCapture(pid);
  });

  wrap.addEventListener('pointermove', function (e) {
    if (!dragging || e.pointerId !== pid) return;
    x = grabOffset + (e.clientX - grabX);
    draw();
    samples.push([e.timeStamp, e.clientX]);
    if (samples.length > 12) samples.shift();
  });

  function release(e) {
    if (!dragging || (e && e.pointerId !== pid)) return;
    dragging = false;
    wrap.classList.remove('is-dragging');
    if (pid !== null && wrap.releasePointerCapture) {
      try { wrap.releasePointerCapture(pid); } catch (err) {}
    }
    pid = null;

    /* 놓는 순간의 속도 = 최근 SAMPLE(ms) 구간의 이동량 ÷ 걸린 시간.
       마지막 두 점만 쓰면 손을 멈춘 채 떼도 직전 떨림이 튀어 엉뚱하게 날아간다. */
    var end = samples[samples.length - 1];
    var start = samples[0];
    for (var i = samples.length - 1; i >= 0; i--) {
      if (end[0] - samples[i][0] <= SAMPLE) start = samples[i]; else break;
    }
    var span = end[0] - start[0];
    v = span > 0 ? Math.max(-VMAX, Math.min(VMAX, (end[1] - start[1]) / span * 1000)) : 0;
    samples = [];

    /* 커서가 아직 띠 위에 있으면 계속 멈춰 있어야 한다(손 올리면 정지 규칙).
       터치는 떼면 손이 떠난 것이므로 다시 흐른다. */
    paused = (e && e.pointerType === 'mouse') ? wrap.matches(':hover') : false;
  }

  wrap.addEventListener('pointerup', release);
  wrap.addEventListener('pointercancel', release);

  /* 탭이 숨어 있는 동안은 프레임이 안 오다가 돌아올 때 몰아친다. 시계를 끊어 준다. */
  document.addEventListener('visibilitychange', function () { last = 0; });
})();
