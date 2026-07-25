# 닥공캠프 국내 스파르타 캠프 — 자체코딩 정적 사이트

아임웹이 아니라 순수 HTML/CSS/최소 JS로 만든 정적 사이트. GitHub → Netlify 자동배포.

## 구조

- `index.html` — 홈
- `curriculum.html` — 학습 시스템 (ABOUT CAMP 하위)
- `class-level.html` — 수준별 반 편성 (ABOUT CAMP 하위)
- `care-system.html` — 관리 시스템 (ABOUT CAMP 하위)
- `teachers.html` — 선생님·멘토 (ABOUT CAMP 하위)
- `facilities.html` — 생활환경·식단 (ABOUT CAMP 하위)
- `assets/css/tokens-domestic.css` — 디자인 토큰(색·타이포·간격, 코발트 #0f52c9)
- `assets/css/site.css` — 공용 스타일(헤더/내비/푸터 포함)
- `assets/js/nav.js` — 헤더 모바일 토글 + 현재 페이지 표시 최소 JS
- `assets/fonts/` — Pretendard·Paperlogy 폰트 실물
- `assets/images/logo.png` — 로고 실물

## 헤더/푸터 공통 규칙

6개 HTML 파일 전부 헤더·푸터 마크업이 동일해야 한다(정적 사이트라 include 없음).
헤더·메뉴 구조를 고칠 땐 6개 파일 전부 동일하게 반영할 것.

## 배포

GitHub `main` 브랜치 push → Netlify 자동 빌드·배포 (publish 디렉토리 = 레포 루트, 빌드 명령 없음).
