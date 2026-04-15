/**
 * download.js — Blob API 기반 클라이언트 사이드 파일 다운로드 (ADR-004)
 *
 * 이 모듈은 state를 직접 보관하지 않는다.
 * 외부에서 state 스냅샷을 인자로 받아 다운로드 처리만 담당한다.
 */

/**
 * content를 filename으로 다운로드한다.
 * @param {string} content   - 다운로드할 파일 내용
 * @param {string} filename  - 저장될 파일명
 * @param {string} mimeType  - MIME 타입
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
}

/**
 * state.html을 index.html로 다운로드한다.
 * @param {{ html: string, css: string, js: string }} state
 */
function downloadHTML(state) {
  downloadFile(state.html, 'index.html', 'text/html');
}

/**
 * state.css를 style.css로 다운로드한다.
 * @param {{ html: string, css: string, js: string }} state
 */
function downloadCSS(state) {
  downloadFile(state.css, 'style.css', 'text/css');
}

/**
 * state.js를 script.js로 다운로드한다.
 * @param {{ html: string, css: string, js: string }} state
 */
function downloadJS(state) {
  downloadFile(state.js, 'script.js', 'application/javascript');
}

export { downloadFile, downloadHTML, downloadCSS, downloadJS };
