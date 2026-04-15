# Step 0: project-setup

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/Users/maknkkong/project/wpb/wpb_framework/CLAUDE.md`
- `/Users/maknkkong/project/wpb/wpb_framework/docs/PRD.md`
- `/Users/maknkkong/project/wpb/wpb_framework/docs/ARCHITECTURE.md`
- `/Users/maknkkong/project/wpb/wpb_framework/docs/ADR.md`
- `/Users/maknkkong/project/wpb/wpb_framework/docs/UI_GUIDE.md`

파일을 꼼꼼히 읽은 뒤 설계 의도를 이해하고 작업하라.

## 작업

프로젝트 루트(`/Users/maknkkong/project/wpb/wpb_framework/`)에 아래 두 파일을 생성한다.

### 1. `index.html`

애플리케이션의 유일한 진입점. JS 모듈은 이 단계에서 연결하지 않는다(이후 step에서 추가).

레이아웃 구조:
- 최상단: 헤더 바 — 앱 이름(`WPB`) 표시
- 본문: CSS Grid `1fr 1fr`으로 좌우 50-50 분할
  - **왼쪽 패널 (`#left-panel`)**: 상단에 프롬프트 입력 영역 placeholder, 하단에 코드 에디터 영역 placeholder
  - **오른쪽 패널 (`#right-panel`)**: 미리보기 iframe

iframe 선언 규칙:
```html
<iframe id="preview-frame" sandbox="allow-scripts" ...></iframe>
```

`sandbox` 속성에 `allow-scripts` 만 포함할 것. `allow-same-origin`은 절대 추가하지 마라. 이유: allow-same-origin을 추가하면 iframe 내부 스크립트가 부모 DOM에 접근할 수 있어 XSS 위험이 생긴다.

외부 리소스:
- Google Fonts: Inter, JetBrains Mono
- Lucide Icons CDN

### 2. `style.css`

UI_GUIDE.md의 디자인 시스템을 기준으로 프리미엄 다크 테마를 구현한다.

반드시 적용할 색상 변수 (CSS custom properties):
```css
--bg-base: #0f172a;      /* slate-950: 최외곽 배경 */
--bg-panel: #1e293b;     /* slate-800: 패널 배경 */
--bg-deep: #020617;      /* slate-1000: 입력창 배경 */
--text-primary: #f8fafc; /* slate-50 */
--text-muted: #94a3b8;   /* slate-400 */
--accent-primary: #6366f1; /* indigo-500 */
--accent-success: #10b981; /* emerald-500 */
--border: rgba(255,255,255,0.1);
```

레이아웃 규칙:
- `body`: 배경 `--bg-base`, `height: 100vh`, overflow hidden
- 헤더: 고정 높이 48px, 하단 border `1px solid var(--border)`
- 좌우 패널: 헤더를 제외한 나머지 높이 전체 사용 (`calc(100vh - 48px)`)
- 패널 구분: 우측 패널 좌측에 `1px solid var(--border)` 경계선
- 폰트: `font-family: 'Inter', sans-serif`
- 코드 영역(에디터 placeholder): `font-family: 'JetBrains Mono', monospace`

금지: 부트스트랩, Tailwind 등 외부 CSS 프레임워크 임포트. 이유: ADR-001에서 바닐라 CSS만 사용하기로 결정했다.

## Acceptance Criteria

```bash
# 파일이 생성되었는지 확인
ls /Users/maknkkong/project/wpb/wpb_framework/index.html
ls /Users/maknkkong/project/wpb/wpb_framework/style.css

# HTML 구조 핵심 요소 존재 확인
grep -c 'id="preview-frame"' /Users/maknkkong/project/wpb/wpb_framework/index.html
grep -c 'sandbox="allow-scripts"' /Users/maknkkong/project/wpb/wpb_framework/index.html
grep -c 'id="left-panel"' /Users/maknkkong/project/wpb/wpb_framework/index.html

# CSS 변수 존재 확인
grep -c '\-\-bg-base' /Users/maknkkong/project/wpb/wpb_framework/style.css
grep -c '\-\-accent-primary' /Users/maknkkong/project/wpb/wpb_framework/style.css

# allow-same-origin 미포함 확인 (출력이 0이어야 정상)
grep -c 'allow-same-origin' /Users/maknkkong/project/wpb/wpb_framework/index.html || echo "OK: allow-same-origin 없음"
```

각 grep 결과가 1 이상이어야 한다. `allow-same-origin` 검사는 0이어야 한다.

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - ARCHITECTURE.md의 디렉토리 구조(루트에 `index.html`, `style.css`)를 따르는가?
   - ADR-001(바닐라 JS, 외부 CSS 프레임워크 금지)을 위반하지 않았는가?
   - CLAUDE.md CRITICAL: `sandbox="allow-scripts"` 적용 여부 확인
3. 결과에 따라 `phases/0-mvp/index.json`의 step 0을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "index.html(50-50 레이아웃, sandboxed iframe) + style.css(다크 테마, CSS 변수) 생성 완료"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- `sandbox` 속성에 `allow-same-origin`을 추가하지 마라. 이유: 부모 DOM 접근 가능성으로 인한 XSS 보안 위험.
- 이 step에서 JS 파일(app.js, editor.js 등)을 생성하지 마라. 이유: step 범위가 레이아웃/테마에 한정된다.
- 외부 CSS 프레임워크(Bootstrap, Tailwind 등)를 CDN으로 임포트하지 마라. 이유: ADR-001 위반.
- `<script>` 태그로 JS 모듈을 연결하지 마라. 이유: JS 연결은 step 2에서 수행한다.
