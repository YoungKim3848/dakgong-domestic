"""개인정보처리방침 전문 동기화 — contact.html → privacy.html

정본은 contact.html 의 동의 상자 하나다. 사람이 실제로 읽고 체크하는 자리가
거기라서, 그쪽을 원본으로 둔다. privacy.html 은 여기서 뽑아 만든다.

⚠️ privacy.html 을 손으로 고치지 말 것. 고치면 두 곳이 갈라지고,
   그때부터 "동의한 내용"과 "게시된 방침"이 다른 상태가 된다.
   방침을 바꿀 일이 생기면 contact.html 을 고치고 이 스크립트를 돌린다.

    python sync-legal.py            # 다시 뽑기
    python sync-legal.py --check    # 갈라졌는지만 확인 (0=같음, 1=다름)
"""
import io, os, re, sys, hashlib

ROOT = os.path.dirname(os.path.abspath(__file__))
TAIL = '</div>' + chr(10) + '    <p class="dk-legal-page__back">'

def body_from_contact():
    s = io.open(os.path.join(ROOT, 'contact.html'), encoding='utf-8').read()
    i = s.index('<div class="dk-consent-box" tabindex="0">')
    i = s.index('>', i) + 1
    j = s.index('</div>', i)
    return re.sub(r'<!--.*?-->', '', s[i:j], flags=re.S).strip()

def body_from_privacy():
    s = io.open(os.path.join(ROOT, 'privacy.html'), encoding='utf-8').read()
    i = s.index('<div class="dk-legal-doc">')
    i = s.index('>', i) + 1
    return s[i:s.rindex(TAIL)].strip()

def h(t):
    return hashlib.sha256(re.sub(r'\s+', ' ', t).strip().encode()).hexdigest()[:16]

src = body_from_contact()

if '--check' in sys.argv:
    got = body_from_privacy()
    same = h(src) == h(got)
    print(('일치' if same else '★불일치') + '  contact=' + h(src) + '  privacy=' + h(got))
    sys.exit(0 if same else 1)

p = os.path.join(ROOT, 'privacy.html')
s = io.open(p, encoding='utf-8').read()
i = s.index('<div class="dk-legal-doc">')
i = s.index('>', i) + 1
j = s.rindex(TAIL)
io.open(p + '.tmp', 'w', encoding='utf-8', newline='').write(s[:i] + chr(10) + src + chr(10) + '    ' + s[j:])
os.replace(p + '.tmp', p)
print('privacy.html 갱신  해시 ' + h(src) + '  ' + str(len(src)) + '자')
