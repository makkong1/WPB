# 프로젝트: Web Page Builder (WPB)

## 기술 스택
- **Core**: HTML5, CSS3, Vanilla JavaScript (ES Modules)
- **Editor**: Monaco Editor (via CDN)
- **Icons**: Lucide Icons
- **Typography**: Inter, JetBrains Mono (Google Fonts)

## 아키텍처 규칙
- **CRITICAL**: 모든 미리보기 실행은 반드시 `sandbox="allow-scripts"` 옵션이 적용된 `<iframe>` 내에서 수행할 것.
- **CRITICAL**: HTML, CSS, JS 상태는 `app.js`의 중앙 상태(state) 객체에서 통합 관리하며, 수동 편집과 AI 생성 결과가 상호 동기화되어야 함.
- **모듈화**: 기능별로 파일을 분리(`editor.js`, `parser.js`, `preview.js`, `download.js`)하여 가독성과 유지보수성을 높임.
- **스타일링**: 부트스트랩 등 프레임워크 없이 순수 CSS로 프리미엄 다크 테마 구현.

## 개발 프로세스
- **CRITICAL**: AI 응답 파싱 시 정규식을 사용하여 ```html, ```css, ```javascript 블록을 정확히 추출해야 함.
- 모든 UI 변경 사항은 수동 모드 에디터에도 즉시 반영되어 사용자가 마지막에 직접 수정할 수 있는 구조를 유지할 것.
- 커밋 메시지는 `feat:`, `fix:`, `docs:`, `style:` 접두사를 사용할 것.

## 명령어
- 별도의 빌드 도구가 없으므로 `index.html`을 브라우저에서 직접 열어 실행.
- (향후 도입 예정) `npm run dev` # Vite 개발 서버
