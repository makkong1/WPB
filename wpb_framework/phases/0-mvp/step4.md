# Step 4: download

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/Users/maknkkong/project/wpb/wpb_framework/CLAUDE.md`
- `/Users/maknkkong/project/wpb/wpb_framework/docs/ARCHITECTURE.md`
- `/Users/maknkkong/project/wpb/wpb_framework/docs/ADR.md`
- `/Users/maknkkong/project/wpb/wpb_framework/app.js` (step 2,3에서 생성/수정됨)
- `/Users/maknkkong/project/wpb/wpb_framework/index.html` (step 0,1,2,3에서 생성/수정됨)
- `/Users/maknkkong/project/wpb/wpb_framework/style.css` (step 0,1에서 생성/수정됨)

이전 step에서 만들어진 코드를 꼼꼼히 읽고, 설계 의도를 이해한 뒤 작업하라.

이전 step 요약: api.js(Ollama 추상화, generateCode) + parser.js(regex 파싱) 생성, app.js에 handleGenerate 통합, AI 생성→에디터 반영 흐름 완성

## 작업

### 1. `download.js` 생성

프로젝트 루트에 `download.js`를 생성한다. 이 모듈은 현재 state의 코드를 파일로 다운로드하는 역할만 담당한다.

`download.js`가 export해야 할 공개 API:

```javascript
// content를 filename으로 다운로드한다.
// content: string, filename: string, mimeType: string
function downloadFile(content, filename, mimeType) { ... }

// state.html을 index.html로 다운로드한다.
// state: { html: string, css: string, js: string }
function downloadHTML(state) { ... }

// state.css를 style.css로 다운로드한다.
function downloadCSS(state) { ... }

// state.js를 script.js로 다운로드한다.
function downloadJS(state) { ... }
```

`downloadFile` 내부 구현 (Blob API, ADR-004):
1. `new Blob([content], { type: mimeType })`으로 Blob 생성
2. `URL.createObjectURL(blob)`으로 오브젝트 URL 생성
3. `<a>` 태그를 동적 생성하여 `href`와 `download` 속성 설정 후 클릭
4. `URL.revokeObjectURL(url)`로 메모리 해제

MIME 타입:
- HTML: `text/html`
- CSS: `text/css`
- JS: `application/javascript`

### 2. `app.js` 수정

step 2,3에서 생성된 `app.js`에 download 연결을 추가한다:

DOMContentLoaded 내에서 다운로드 버튼들의 클릭 이벤트를 등록한다:
```javascript
document.getElementById('download-html-btn').addEventListener('click', () => downloadHTML(getState()));
document.getElementById('download-css-btn').addEventListener('click', () => downloadCSS(getState()));
document.getElementById('download-js-btn').addEventListener('click', () => downloadJS(getState()));
```

`download.js`를 `app.js` 상단에서 import한다.

### 3. `index.html` 수정

헤더 또는 좌측 패널 하단에 다운로드 버튼 3개를 추가한다:

```
#download-section
├── button#download-html-btn "HTML"
├── button#download-css-btn  "CSS"
└── button#download-js-btn   "JS"
```

버튼 배치 권장: 헤더 우측 영역 (앱 이름 반대편). UI_GUIDE.md의 버튼 스타일(padding: 8px 16px, border-radius: 4px, font-weight: 500) 적용.

### 4. `style.css` 수정

다운로드 버튼 스타일을 추가한다:
- 기본 스타일: 배경 `--bg-panel`, 텍스트 `--text-muted`, border `1px solid var(--border)`
- hover 시: 배경 `--accent-primary`, 텍스트 `--text-primary`
- 버튼 간격: `gap: 8px`

## Acceptance Criteria

```bash
# 파일 생성 확인
ls /Users/maknkkong/project/wpb/wpb_framework/download.js

# JS 문법 검사
node --check /Users/maknkkong/project/wpb/wpb_framework/download.js
node --check /Users/maknkkong/project/wpb/wpb_framework/app.js

# 핵심 API 존재 확인
grep -c 'function downloadFile' /Users/maknkkong/project/wpb/wpb_framework/download.js
grep -c 'function downloadHTML' /Users/maknkkong/project/wpb/wpb_framework/download.js
grep -c 'function downloadCSS' /Users/maknkkong/project/wpb/wpb_framework/download.js
grep -c 'function downloadJS' /Users/maknkkong/project/wpb/wpb_framework/download.js

# Blob API 사용 확인
grep -c 'new Blob' /Users/maknkkong/project/wpb/wpb_framework/download.js
grep -c 'createObjectURL' /Users/maknkkong/project/wpb/wpb_framework/download.js
grep -c 'revokeObjectURL' /Users/maknkkong/project/wpb/wpb_framework/download.js

# download.js가 app.js에 연결됐는지 확인
grep -c 'download' /Users/maknkkong/project/wpb/wpb_framework/app.js

# UI 버튼 존재 확인
grep -c 'download-html-btn' /Users/maknkkong/project/wpb/wpb_framework/index.html
grep -c 'download-css-btn' /Users/maknkkong/project/wpb/wpb_framework/index.html
grep -c 'download-js-btn' /Users/maknkkong/project/wpb/wpb_framework/index.html

# 전체 파일 구조 최종 확인
ls /Users/maknkkong/project/wpb/wpb_framework/index.html \
   /Users/maknkkong/project/wpb/wpb_framework/style.css \
   /Users/maknkkong/project/wpb/wpb_framework/app.js \
   /Users/maknkkong/project/wpb/wpb_framework/editor.js \
   /Users/maknkkong/project/wpb/wpb_framework/parser.js \
   /Users/maknkkong/project/wpb/wpb_framework/preview.js \
   /Users/maknkkong/project/wpb/wpb_framework/api.js \
   /Users/maknkkong/project/wpb/wpb_framework/download.js
```

각 grep 결과가 1 이상이어야 하며, 마지막 ls 명령에서 8개 파일 모두 출력되어야 한다.

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - ARCHITECTURE.md의 최종 디렉토리 구조(8개 파일)가 모두 생성되었는가?
   - ADR-004(Blob API 기반 다운로드)를 따르는가?
   - `revokeObjectURL`이 호출되어 메모리 누수가 없는가?
   - `download.js`가 state를 직접 보관하지 않고 인자로만 받는가?
3. 결과에 따라 `phases/0-mvp/index.json`의 step 4를 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "download.js(Blob API, downloadHTML/CSS/JS) 생성, 다운로드 버튼 UI 추가, WPB MVP(AI생성+수동편집+미리보기+다운로드) 완성"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- `revokeObjectURL`을 생략하지 마라. 이유: 오브젝트 URL이 메모리에 계속 남아 메모리 누수 발생.
- `download.js`에서 `state` 전역 변수를 직접 import하거나 참조하지 마라. 이유: state는 `app.js`에서만 관리하며, download.js는 인자로 받은 state 스냅샷만 사용한다.
- `window.open`이나 `location.href`를 이용한 다운로드 방식을 사용하지 마라. 이유: ADR-004에서 Blob API를 사용하기로 결정했으며, 브라우저 호환성 및 UX 일관성 문제가 있다.
- 기존에 구현된 AI 생성 흐름(api.js, parser.js 연동)을 수정하거나 제거하지 마라.
