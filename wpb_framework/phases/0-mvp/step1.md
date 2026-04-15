# Step 1: editor-setup

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/Users/maknkkong/project/wpb/wpb_framework/CLAUDE.md`
- `/Users/maknkkong/project/wpb/wpb_framework/docs/ARCHITECTURE.md`
- `/Users/maknkkong/project/wpb/wpb_framework/docs/ADR.md`
- `/Users/maknkkong/project/wpb/wpb_framework/index.html` (step 0에서 생성됨)
- `/Users/maknkkong/project/wpb/wpb_framework/style.css` (step 0에서 생성됨)

이전 step에서 만들어진 코드를 꼼꼼히 읽고, 설계 의도를 이해한 뒤 작업하라.

이전 step 요약: index.html(50-50 레이아웃, sandboxed iframe) + style.css(다크 테마, CSS 변수) 생성 완료

## 작업

### 1. `editor.js` 생성

프로젝트 루트에 `editor.js`를 생성한다. 이 모듈은 HTML/CSS/JS 세 개의 코드 에디터를 관리한다.

현재 구현은 `<textarea>`를 사용하되, 향후 Monaco Editor로 교체할 수 있도록 아래 인터페이스를 반드시 유지해야 한다.

모듈이 export해야 할 공개 API:

```javascript
// 에디터 초기화. 각 타입별 textarea를 DOM에 생성하고 이벤트를 등록한다.
// onChangeCallback: (type: 'html'|'css'|'js', value: string) => void
function initEditors(onChangeCallback) { ... }

// 특정 타입 에디터의 현재 값을 반환한다.
// type: 'html' | 'css' | 'js'
function getValue(type) { ... }

// 특정 타입 에디터에 값을 설정한다. (AI 생성 결과 주입 시 사용)
// 이 메서드는 onChangeCallback을 트리거하지 않는다. 이유: 무한 루프 방지.
function setValue(type, value) { ... }

// 현재 활성화된 탭을 전환한다.
// type: 'html' | 'css' | 'js'
function switchTab(type) { ... }
```

내부 구현 재량 사항:
- 탭 전환 시 비활성 textarea는 `display: none`으로 숨긴다
- 각 textarea는 `id="editor-{type}"` 형식으로 DOM에 배치한다
- textarea의 `input` 이벤트에서 `onChangeCallback`을 호출한다

### 2. `index.html` 수정

step 0에서 생성된 `index.html`의 왼쪽 패널(`#left-panel`)에 아래 구조를 추가한다:

```
#left-panel
├── #editor-tabs (탭 버튼 영역)
│   ├── button[data-tab="html"] "HTML"
│   ├── button[data-tab="css"]  "CSS"
│   └── button[data-tab="js"]   "JS"
└── #editor-container (textarea가 렌더링될 컨테이너)
```

`editor.js`를 `<script type="module">` 방식으로 임포트한다. 단, 이 step에서는 `app.js`가 없으므로 `editor.js`를 직접 inline script로 초기화하되, 추후 `app.js`가 init을 담당할 것임을 주석으로 명시한다.

### 3. `style.css` 수정

탭 버튼과 에디터 컨테이너 스타일을 추가한다:

- 탭 버튼: 배경 투명, 텍스트 `--text-muted`, 클릭 시 active 상태로 전환
- active 탭: 텍스트 `--text-primary`, 하단 border `2px solid var(--accent-primary)`
- textarea: 배경 `--bg-deep`, 텍스트 `--text-primary`, border 없음, 패딩 16px, `font-family: 'JetBrains Mono', monospace`, `width: 100%`, `height: 100%`, resize 없음

## Acceptance Criteria

```bash
# 파일 생성 확인
ls /Users/maknkkong/project/wpb/wpb_framework/editor.js

# JS 문법 검사
node --check /Users/maknkkong/project/wpb/wpb_framework/editor.js

# 공개 API 존재 확인
grep -c 'function initEditors' /Users/maknkkong/project/wpb/wpb_framework/editor.js
grep -c 'function getValue' /Users/maknkkong/project/wpb/wpb_framework/editor.js
grep -c 'function setValue' /Users/maknkkong/project/wpb/wpb_framework/editor.js
grep -c 'function switchTab' /Users/maknkkong/project/wpb/wpb_framework/editor.js

# index.html에 탭 구조 존재 확인
grep -c 'editor-tabs' /Users/maknkkong/project/wpb/wpb_framework/index.html
grep -c 'editor-container' /Users/maknkkong/project/wpb/wpb_framework/index.html
grep -c 'data-tab="html"' /Users/maknkkong/project/wpb/wpb_framework/index.html
```

각 grep 결과가 1 이상이어야 한다.

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - ARCHITECTURE.md의 `editor.js` 역할(Monaco Editor 관리 및 동기화)에 부합하는가?
   - `setValue`가 `onChangeCallback`을 호출하지 않는지 코드를 직접 확인한다.
   - 탭 전환 로직이 DOM 조작에만 국한되고 state를 직접 변경하지 않는지 확인한다.
3. 결과에 따라 `phases/0-mvp/index.json`의 step 1을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "editor.js(initEditors/getValue/setValue/switchTab API) + 탭 UI 생성 완료, Monaco 교체 가능한 추상 인터페이스 설계됨"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- `setValue` 내에서 `onChangeCallback`을 호출하지 마라. 이유: AI 생성 코드 주입 시 무한 루프 발생.
- Monaco Editor CDN을 이 step에서 연결하지 마라. 이유: 현재는 textarea 단계이며, Monaco 전환은 별도 step에서 다룬다.
- `editor.js`가 `app.js`의 state를 직접 import하거나 참조하지 마라. 이유: `app.js`는 다음 step에서 생성되며, 의존성 방향은 `app.js → editor.js`여야 한다.
- 기존 `index.html`의 iframe 구조와 `style.css`의 CSS 변수를 삭제하거나 변경하지 마라.
