# Step 2: state-preview

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/Users/maknkkong/project/wpb/wpb_framework/CLAUDE.md`
- `/Users/maknkkong/project/wpb/wpb_framework/docs/ARCHITECTURE.md`
- `/Users/maknkkong/project/wpb/wpb_framework/docs/ADR.md`
- `/Users/maknkkong/project/wpb/wpb_framework/index.html` (step 0,1에서 생성/수정됨)
- `/Users/maknkkong/project/wpb/wpb_framework/editor.js` (step 1에서 생성됨)

이전 step에서 만들어진 코드를 꼼꼼히 읽고, 설계 의도를 이해한 뒤 작업하라.

이전 step 요약: editor.js(initEditors/getValue/setValue/switchTab API) + 탭 UI 생성 완료, Monaco 교체 가능한 추상 인터페이스 설계됨

## 작업

### 1. `app.js` 생성

프로젝트 루트에 `app.js`를 생성한다. 이 파일은 애플리케이션의 단일 진입점이자 중앙 상태 관리자다.

중앙 상태 객체(Single Source of Truth):
```javascript
const state = {
  html: '',
  css: '',
  js: ''
};
```

`app.js`가 export해야 할 공개 API:

```javascript
// state를 업데이트하고 preview를 갱신한다.
// type: 'html' | 'css' | 'js', value: string
function setState(type, value) { ... }

// 현재 state 전체를 반환한다. (download.js에서 사용)
function getState() { ... }
```

초기화 로직 (`DOMContentLoaded`):
1. `initEditors(onEditorChange)` 호출 — 에디터 초기화
2. `onEditorChange(type, value)` 콜백 내에서 `setState(type, value)` 호출
3. `initPreview()` 호출 — preview.js 초기화

`setState` 내부 동작:
- `state[type] = value`로 상태 갱신
- `renderPreview(state)` 호출로 미리보기 갱신
- debounce 적용: 에디터 입력 후 300ms 내 연속 호출 시 마지막 호출만 실행. 이유: 타이핑할 때마다 iframe을 재렌더링하면 성능 저하 발생.

### 2. `preview.js` 생성

프로젝트 루트에 `preview.js`를 생성한다. 이 모듈은 iframe에 코드를 렌더링하는 역할만 한다.

`preview.js`가 export해야 할 공개 API:

```javascript
// preview iframe을 초기화한다. iframe 요소를 DOM에서 찾아 참조를 캐싱한다.
function initPreview() { ... }

// state 객체를 받아 srcdoc으로 iframe에 렌더링한다.
// state: { html: string, css: string, js: string }
function renderPreview(state) { ... }
```

`renderPreview` 내부 로직:
- `srcdoc` 속성에 아래 형태의 완성된 HTML 문서를 주입한다:
  ```html
  <!DOCTYPE html>
  <html>
    <head><style>{state.css}</style></head>
    <body>{state.html}<script>{state.js}</script></body>
  </html>
  ```
- **CRITICAL**: iframe의 `sandbox` 속성을 절대 변경하지 마라. `allow-scripts`만 유지해야 한다.

### 3. `index.html` 수정

step 1에서 추가된 임시 inline script를 제거하고, `app.js`를 단일 진입점으로 연결한다:

```html
<script type="module" src="app.js"></script>
```

`app.js`는 내부에서 `editor.js`와 `preview.js`를 import하므로, `index.html`에는 `app.js` 하나만 포함한다.

## Acceptance Criteria

```bash
# 파일 생성 확인
ls /Users/maknkkong/project/wpb/wpb_framework/app.js
ls /Users/maknkkong/project/wpb/wpb_framework/preview.js

# JS 문법 검사
node --check /Users/maknkkong/project/wpb/wpb_framework/app.js
node --check /Users/maknkkong/project/wpb/wpb_framework/preview.js

# 핵심 API 존재 확인
grep -c 'function setState' /Users/maknkkong/project/wpb/wpb_framework/app.js
grep -c 'function getState' /Users/maknkkong/project/wpb/wpb_framework/app.js
grep -c 'function renderPreview' /Users/maknkkong/project/wpb/wpb_framework/preview.js
grep -c 'function initPreview' /Users/maknkkong/project/wpb/wpb_framework/preview.js

# debounce 존재 확인
grep -c 'debounce\|setTimeout' /Users/maknkkong/project/wpb/wpb_framework/app.js

# index.html에 app.js 연결 확인
grep -c 'src="app.js"' /Users/maknkkong/project/wpb/wpb_framework/index.html

# srcdoc 사용 확인
grep -c 'srcdoc' /Users/maknkkong/project/wpb/wpb_framework/preview.js

# sandbox 변경 여부 확인 (preview.js에서 sandbox 속성을 건드리지 않아야 함)
grep -c 'sandbox' /Users/maknkkong/project/wpb/wpb_framework/preview.js || echo "OK: preview.js에서 sandbox 미변경"
```

`sandbox` 검사는 0이 정상이다(preview.js에서 sandbox 속성을 건드리면 안 됨).

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - ARCHITECTURE.md의 데이터 흐름(editor → app.js → preview.js)을 따르는가?
   - `state` 객체가 `app.js`에만 존재하는가? (SSOT 원칙)
   - `preview.js`가 state를 직접 보관하지 않고 인자로만 받는가?
   - CLAUDE.md CRITICAL: iframe sandbox 속성이 변경되지 않았는가?
3. 결과에 따라 `phases/0-mvp/index.json`의 step 2를 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "app.js(SSOT state, setState/getState, 300ms debounce) + preview.js(srcdoc 렌더링) 생성 완료, 에디터-상태-미리보기 통합 동작"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- `preview.js`에서 iframe의 `sandbox` 속성을 수정하지 마라. 이유: allow-same-origin 추가 시 XSS 취약점 발생. sandbox는 index.html 정적 선언에서만 관리한다.
- `state` 객체를 `app.js` 외부에 두지 마라. 이유: SSOT 원칙 위반. editor.js, preview.js는 state를 인자로 받거나 콜백으로 전달받는 방식만 사용한다.
- debounce 없이 `renderPreview`를 에디터 input 이벤트마다 직접 호출하지 마라. 이유: 타이핑 중 iframe 재생성이 반복되어 성능 저하 및 UX 저하 발생.
- `index.html`에 `editor.js`나 `preview.js`를 직접 script 태그로 추가하지 마라. 이유: ES Module 의존성은 `app.js`가 단일 진입점으로 관리한다.
