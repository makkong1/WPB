# Step 3: ai-integration

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/Users/maknkkong/project/wpb/wpb_framework/CLAUDE.md`
- `/Users/maknkkong/project/wpb/wpb_framework/docs/PRD.md`
- `/Users/maknkkong/project/wpb/wpb_framework/docs/ARCHITECTURE.md`
- `/Users/maknkkong/project/wpb/wpb_framework/app.js` (step 2에서 생성됨)
- `/Users/maknkkong/project/wpb/wpb_framework/editor.js` (step 1에서 생성됨)
- `/Users/maknkkong/project/wpb/wpb_framework/index.html` (step 0,1,2에서 생성/수정됨)

이전 step에서 만들어진 코드를 꼼꼼히 읽고, 설계 의도를 이해한 뒤 작업하라.

이전 step 요약: app.js(SSOT state, setState/getState, 300ms debounce) + preview.js(srcdoc 렌더링) 생성 완료, 에디터-상태-미리보기 통합 동작

## 작업

### 1. `api.js` 생성

프로젝트 루트에 `api.js`를 생성한다. 이 파일은 외부 AI API 호출을 추상화하는 유일한 레이어다.

**추상화 목표**: 이 파일만 교체하면 Ollama → Claude API 전환이 가능해야 한다. 나머지 파일(app.js, parser.js)은 API 공급자를 알아서는 안 된다.

`api.js`가 export해야 할 공개 API:

```javascript
// 프롬프트를 받아 AI 응답 텍스트를 반환한다.
// prompt: string
// returns: Promise<string> (AI 응답 원문)
// throws: Error (네트워크 실패, API 에러 시)
async function generateCode(prompt) { ... }
```

내부 구현 (Ollama):
- 엔드포인트: `http://localhost:11434/api/generate`
- 요청 body:
  ```json
  {
    "model": "codellama",
    "prompt": "<아래 시스템 프롬프트 참조>",
    "stream": false
  }
  ```
- 시스템 프롬프트(model에게 전달):
  ```
  You are a web developer. Generate HTML, CSS, and JavaScript code based on the user's request.
  Always wrap HTML in ```html ... ```, CSS in ```css ... ```, and JavaScript in ```javascript ... ``` blocks.
  Only output code blocks, no explanations.
  ```
- 응답에서 `response` 필드를 추출하여 반환한다.
- HTTP 상태가 200이 아닌 경우 `throw new Error(`API Error: ${response.status}`)` 처리.

**Claude API 교체 가이드 (주석으로 파일 상단에 포함)**:
```javascript
// To switch to Claude API, replace the generateCode implementation:
// - Endpoint: https://api.anthropic.com/v1/messages
// - Auth: x-api-key header
// - Body: { model, max_tokens, messages: [{role:'user', content: prompt}] }
// - Response: data.content[0].text
```

### 2. `parser.js` 생성

프로젝트 루트에 `parser.js`를 생성한다. 이 모듈은 AI 응답 텍스트에서 HTML/CSS/JS 코드 블록을 추출한다.

`parser.js`가 export해야 할 공개 API:

```javascript
// AI 응답 텍스트를 파싱하여 html/css/js 객체로 반환한다.
// text: string (AI 응답 원문)
// returns: { html: string, css: string, js: string }
//   - 각 필드는 파싱된 코드이거나 빈 문자열('')이다.
//   - 특정 블록이 없으면 해당 필드는 '' 반환.
function parseAIResponse(text) { ... }
```

정규식 패턴 (CLAUDE.md CRITICAL 요구사항):
- HTML: `` /```html\n?([\s\S]*?)```/i ``
- CSS: `` /```css\n?([\s\S]*?)```/i ``
- JS: `` /```javascript\n?([\s\S]*?)```/i `` 또는 `` /```js\n?([\s\S]*?)```/i `` (둘 다 지원)

반환값은 항상 `{ html, css, js }` 세 필드를 포함해야 한다. 코드 블록이 없으면 빈 문자열.

### 3. `app.js` 수정

step 2에서 생성된 `app.js`에 아래 AI 흐름을 추가한다:

```javascript
// AI 생성 함수 (generateCode + parseAIResponse 호출 후 state 반영)
async function handleGenerate(prompt) { ... }
```

`handleGenerate` 내부 동작:
1. UI를 로딩 상태로 전환 (버튼 비활성화, 텍스트 변경)
2. `generateCode(prompt)` 호출
3. `parseAIResponse(responseText)` 호출
4. 파싱 결과의 각 타입에 대해:
   - `setState(type, value)` 호출 (state 반영 + preview 갱신)
   - `setValue(type, value)` 호출 (에디터 UI 반영)
5. UI를 정상 상태로 복원
6. 에러 발생 시: UI 복원 후 `console.error` + 사용자에게 alert

**CRITICAL**: AI 생성 결과는 반드시 `setValue(type, value)`로 에디터에도 반영해야 한다. 이유: 사용자가 AI 생성 결과를 직접 수정할 수 있어야 한다 (PRD 핵심 요구사항).

### 4. `index.html` 수정

왼쪽 패널 상단에 프롬프트 입력 영역을 추가한다:

```
#prompt-section
├── textarea#prompt-input (placeholder: "웹 페이지를 설명하세요...")
└── button#generate-btn "Generate"
```

버튼 클릭 시 `app.js`의 `handleGenerate(prompt)` 호출. 이 연결은 `app.js` DOMContentLoaded 내에서 이벤트 리스너로 구현한다.

## Acceptance Criteria

```bash
# 파일 생성 확인
ls /Users/maknkkong/project/wpb/wpb_framework/api.js
ls /Users/maknkkong/project/wpb/wpb_framework/parser.js

# JS 문법 검사
node --check /Users/maknkkong/project/wpb/wpb_framework/api.js
node --check /Users/maknkkong/project/wpb/wpb_framework/parser.js
node --check /Users/maknkkong/project/wpb/wpb_framework/app.js

# 핵심 API 존재 확인
grep -c 'async function generateCode' /Users/maknkkong/project/wpb/wpb_framework/api.js
grep -c 'function parseAIResponse' /Users/maknkkong/project/wpb/wpb_framework/parser.js
grep -c 'async function handleGenerate' /Users/maknkkong/project/wpb/wpb_framework/app.js

# Ollama 엔드포인트 확인
grep -c 'localhost:11434' /Users/maknkkong/project/wpb/wpb_framework/api.js

# Claude API 교체 가이드 주석 확인
grep -c 'Claude API' /Users/maknkkong/project/wpb/wpb_framework/api.js

# parser 정규식 확인
grep -c 'html' /Users/maknkkong/project/wpb/wpb_framework/parser.js
grep -c 'css' /Users/maknkkong/project/wpb/wpb_framework/parser.js
grep -c 'javascript' /Users/maknkkong/project/wpb/wpb_framework/parser.js

# AI 생성 결과가 에디터에 반영되는지 확인 (setValue 호출)
grep -c 'setValue' /Users/maknkkong/project/wpb/wpb_framework/app.js

# prompt-input UI 확인
grep -c 'prompt-input' /Users/maknkkong/project/wpb/wpb_framework/index.html
grep -c 'generate-btn' /Users/maknkkong/project/wpb/wpb_framework/index.html
```

각 grep 결과가 1 이상이어야 한다.

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 아키텍처 체크리스트를 확인한다:
   - `api.js`만 교체하면 Ollama → Claude API 전환이 가능한 구조인가?
   - `app.js`와 `parser.js`가 Ollama를 직접 참조하지 않는가?
   - AI 생성 결과가 `setState` (state 갱신) + `setValue` (에디터 반영) 두 곳 모두에 적용되는가?
   - CLAUDE.md CRITICAL: AI 응답 파싱에 정규식을 사용하는가?
3. 결과에 따라 `phases/0-mvp/index.json`의 step 3을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "api.js(Ollama 추상화, generateCode) + parser.js(regex 파싱) 생성, app.js에 handleGenerate 통합, AI 생성→에디터 반영 흐름 완성"`
   - 수정 3회 시도 후에도 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
   - 사용자 개입 필요 → `"status": "blocked"`, `"blocked_reason": "구체적 사유"` 후 즉시 중단

## 금지사항

- `app.js` 또는 `parser.js`에 Ollama API URL(`localhost:11434`)을 직접 하드코딩하지 마라. 이유: API 교체 지점이 `api.js` 하나여야 한다.
- AI 생성 결과를 `setState`만 호출하고 `setValue`를 생략하지 마라. 이유: 에디터에 코드가 표시되지 않아 사용자가 수정할 수 없게 된다 (PRD 핵심 요구사항 위반).
- `stream: true`로 Ollama API를 호출하지 마라. 이유: 스트리밍 응답 처리 로직이 없으므로 파싱 실패. `stream: false`만 사용한다.
- `parseAIResponse`에서 JSON.parse 등 비정규식 방식으로 코드 블록을 추출하지 마라. 이유: CLAUDE.md에서 정규식 기반 파싱을 CRITICAL 요구사항으로 명시했다.
