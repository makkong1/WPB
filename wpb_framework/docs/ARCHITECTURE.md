# 아키텍처 (ARCHITECTURE)

## 디렉토리 구조 (Directory Structure)
```
/
├── index.html         # 메인 진입점 및 레이아웃
├── style.css          # 전역 스타일 및 테마 정의
├── app.js             # 애플리케이션 수명 주기 및 상태 제어
├── editor.js          # Monaco Editor 관리 및 동기화
├── parser.js          # AI 응답 파싱 로직
├── preview.js         # Iframe 렌더링 및 통신
└── download.js       # Blob 기반 파일 생성 및 다운로드
```

## 패턴 (Patterns)
- **Single Source of Truth (SSOT)**: 모든 코드 상태는 `app.js`의 `state` 객체가 관리하며, 에디터와 미리보기가 이를 구독.
- **Debounced Preview**: 성능 최적화를 위해 사용자 입력 후 일정 시간(300ms) 뒤에 미리보기를 갱신.
- **Sandboxed Iframe**: 보안을 위해 미리보기를 `allow-scripts` 권한만 가진 sandbox iframe에서 실행.

## 데이터 흐름 (Data Flow)
```
[AI 생성 모드]: 프롬프트 입력 → AI 요청(Mock) → 파싱(parser.js) → 상태 업데이트(app.js) → 에디터 동기화(editor.js) + 미리보기 업데이트(preview.js)
[수동 제작 모드]: 에디터 입력(editor.js) → 상태 업데이트(app.js) → 미리보기 업데이트(preview.js)
```

## 상태 관리 (State Management)
- **Vanilla State Object**: `html`, `css`, `js` 문자열로 구성된 단순 객체 사용.
- **Event Dispatcher**: 상태 변경 시 특정 이벤트를 발생시켜 UI 컴포넌트 간 동기화 구현.
