/**
 * editor.js — HTML/CSS/JS 코드 에디터 관리 모듈
 *
 * 현재 구현: <textarea> 기반.
 * 향후 Monaco Editor로 교체 시 아래 공개 API 시그니처만 유지하면 된다.
 * 의존성 방향: app.js → editor.js (이 모듈은 app.js를 참조하지 않는다)
 */

/** @type {Object.<string, HTMLTextAreaElement>} */
const editors = {};

/** @type {string} */
let activeTab = 'html';

/** @type {((type: string, value: string) => void) | null} */
let changeCallback = null;

/**
 * 에디터 초기화. 각 타입별 textarea를 DOM에 생성하고 이벤트를 등록한다.
 * @param {(type: 'html'|'css'|'js', value: string) => void} onChangeCallback
 */
function initEditors(onChangeCallback) {
  changeCallback = onChangeCallback;

  const container = document.getElementById('editor-container');
  if (!container) {
    console.error('[editor.js] #editor-container 엘리먼트를 찾을 수 없습니다.');
    return;
  }

  ['html', 'css', 'js'].forEach((type) => {
    const textarea = document.createElement('textarea');
    textarea.id = `editor-${type}`;
    textarea.style.display = type === activeTab ? 'block' : 'none';
    textarea.spellcheck = false;
    textarea.autocomplete = 'off';
    textarea.autocorrect = 'off';
    textarea.autocapitalize = 'off';

    textarea.addEventListener('input', () => {
      if (changeCallback) changeCallback(type, textarea.value);
    });

    container.appendChild(textarea);
    editors[type] = textarea;
  });

  // 탭 버튼 클릭 이벤트 등록
  document.querySelectorAll('[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });
}

/**
 * 특정 타입 에디터의 현재 값을 반환한다.
 * @param {'html'|'css'|'js'} type
 * @returns {string}
 */
function getValue(type) {
  return editors[type] ? editors[type].value : '';
}

/**
 * 특정 타입 에디터에 값을 설정한다. (AI 생성 결과 주입 시 사용)
 * ⚠️ 이 메서드는 onChangeCallback을 트리거하지 않는다.
 *    이유: AI 생성 코드 주입 시 상태 업데이트 → editor 재반영 → 다시 상태 업데이트 무한 루프 방지.
 * @param {'html'|'css'|'js'} type
 * @param {string} value
 */
function setValue(type, value) {
  if (editors[type]) {
    editors[type].value = value;
    // 의도적으로 changeCallback을 호출하지 않는다 — 무한 루프 방지
  }
}

/**
 * 현재 활성화된 탭을 전환한다. DOM 조작만 수행하며 state를 직접 변경하지 않는다.
 * @param {'html'|'css'|'js'} type
 */
function switchTab(type) {
  if (!editors[type]) return;

  // 비활성 textarea 숨기기, 활성 textarea 표시
  Object.keys(editors).forEach((t) => {
    editors[t].style.display = t === type ? 'block' : 'none';
  });

  // 탭 버튼 active 클래스 토글
  document.querySelectorAll('[data-tab]').forEach((btn) => {
    btn.classList.toggle('tab-active', btn.dataset.tab === type);
  });

  activeTab = type;
}

export { initEditors, getValue, setValue, switchTab };
