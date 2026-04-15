/**
 * app.js — 애플리케이션 단일 진입점 및 중앙 상태 관리자 (Single Source of Truth)
 *
 * 데이터 흐름:
 *   [수동 모드] 에디터 입력(editor.js) → onEditorChange → setState → renderPreview(preview.js)
 *   [AI 모드]  프롬프트 입력 → handleGenerate → generateCode(api.js) → parseAIResponse(parser.js)
 *              → setState (state 갱신 + preview 자동 갱신) + setValue (에디터 UI 반영)
 */

import { initEditors, setValue } from './editor.js';
import { initPreview, renderPreview } from './preview.js';
import { generateCode } from './api.js';
import { parseAIResponse } from './parser.js';

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

/**
 * AI 생성 함수 — 프롬프트를 받아 코드를 생성하고 state + 에디터에 반영한다.
 * @param {string} prompt — 사용자 입력 프롬프트
 */
async function handleGenerate(prompt) {
  const btn = document.getElementById('generate-btn');
  const originalText = btn ? btn.innerHTML : '';

  // 1. UI 로딩 상태로 전환
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i data-lucide="loader" class="icon"></i> 생성 중…';
    if (window.lucide) lucide.createIcons();
  }

  try {
    // 2. AI API 호출
    const responseText = await generateCode(prompt);

    // 3. 응답 파싱
    const parsed = parseAIResponse(responseText);

    // 4. 각 타입에 대해 state + 에디터 반영
    ['html', 'css', 'js'].forEach((type) => {
      if (parsed[type]) {
        setState(type, parsed[type]);   // state 갱신 → preview 자동 갱신
        setValue(type, parsed[type]);   // 에디터 UI 반영 (사용자가 직접 수정 가능하도록)
      }
    });
  } catch (err) {
    console.error('[app.js] AI 생성 실패:', err);
    alert(`AI 생성에 실패했습니다.\n${err.message}`);
  } finally {
    // 5. UI 정상 상태 복원
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalText;
      if (window.lucide) lucide.createIcons();
    }
  }
}

// DOMContentLoaded: 에디터, 미리보기 초기화 및 Generate 버튼 연결
document.addEventListener('DOMContentLoaded', () => {
  initEditors(onEditorChange);
  initPreview();

  const generateBtn = document.getElementById('generate-btn');
  const promptInput = document.getElementById('prompt-input');

  if (generateBtn && promptInput) {
    generateBtn.disabled = false;

    generateBtn.addEventListener('click', () => {
      const prompt = promptInput.value.trim();
      if (!prompt) return;
      handleGenerate(prompt);
    });
  }
});

export { setState, getState };
