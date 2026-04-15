/**
 * app.js — 애플리케이션 단일 진입점 및 중앙 상태 관리자 (Single Source of Truth)
 *
 * 데이터 흐름:
 *   [수동 모드] 에디터 입력(editor.js) → onEditorChange → setState → renderPreview(preview.js)
 *   [AI 모드]  AI 파싱 결과 → setState → editor.js setValue + renderPreview(preview.js)
 */

import { initEditors, setValue } from './editor.js';
import { initPreview, renderPreview } from './preview.js';

/**
 * 중앙 상태 객체 (SSOT).
 * html, css, js 상태는 오직 이 객체에서만 관리한다.
 * @type {{ html: string, css: string, js: string }}
 */
const state = {
  html: '',
  css: '',
  js: '',
};

/** @type {number | null} */
let debounceTimer = null;

/**
 * state를 업데이트하고 debounce(300ms)를 적용하여 preview를 갱신한다.
 * @param {'html'|'css'|'js'} type
 * @param {string} value
 */
function setState(type, value) {
  state[type] = value;

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    renderPreview(state);
  }, 300);
}

/**
 * 현재 state 전체를 반환한다. (download.js 등 외부 모듈에서 사용)
 * @returns {{ html: string, css: string, js: string }}
 */
function getState() {
  return { ...state };
}

/**
 * 에디터 변경 콜백 — editor.js의 input 이벤트에서 호출된다.
 * @param {'html'|'css'|'js'} type
 * @param {string} value
 */
function onEditorChange(type, value) {
  setState(type, value);
}

// DOMContentLoaded: 에디터와 미리보기 초기화
document.addEventListener('DOMContentLoaded', () => {
  initEditors(onEditorChange);
  initPreview();
});

export { setState, getState };
