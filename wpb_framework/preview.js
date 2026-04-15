/**
 * preview.js — iframe 렌더링 모듈
 *
 * srcdoc 속성을 이용해 HTML/CSS/JS를 iframe에 주입한다.
 * state를 직접 보관하지 않으며, 항상 인자로 받는다.
 * 의존성 방향: app.js → preview.js (이 모듈은 app.js를 참조하지 않는다)
 *
 * CRITICAL: iframe의 sandbox 속성을 절대 변경하지 않는다.
 *           allow-same-origin 추가 시 XSS 취약점 발생. sandbox는 index.html에서만 관리한다.
 */

/** @type {HTMLIFrameElement | null} */
let iframeEl = null;

/**
 * preview iframe을 초기화한다. iframe 요소를 DOM에서 찾아 참조를 캐싱한다.
 */
function initPreview() {
  iframeEl = document.getElementById('preview-frame');
  if (!iframeEl) {
    console.error('[preview.js] #preview-frame 엘리먼트를 찾을 수 없습니다.');
  }
}

/**
 * state 객체를 받아 srcdoc으로 iframe에 렌더링한다.
 * @param {{ html: string, css: string, js: string }} state
 */
function renderPreview(state) {
  if (!iframeEl) return;

  const doc = `<!DOCTYPE html>
<html>
  <head><style>${state.css}</style></head>
  <body>${state.html}<script>${state.js}<\/script></body>
</html>`;

  iframeEl.srcdoc = doc;
}

export { initPreview, renderPreview };
