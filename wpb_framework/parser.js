/**
 * parser.js — AI 응답 텍스트에서 HTML/CSS/JS 코드 블록 추출
 *
 * CLAUDE.md CRITICAL: 정규식 기반 파싱만 사용한다.
 * 의존성 없음 — 이 모듈은 외부 모듈을 참조하지 않는다.
 */

/**
 * AI 응답 텍스트를 파싱하여 html/css/js 객체로 반환한다.
 * @param {string} text — AI 응답 원문
 * @returns {{ html: string, css: string, js: string }}
 *   각 필드는 파싱된 코드이거나 빈 문자열('')이다.
 *   특정 블록이 없으면 해당 필드는 '' 반환.
 */
function parseAIResponse(text) {
  const htmlMatch = text.match(/```html\n?([\s\S]*?)```/i);
  const cssMatch = text.match(/```css\n?([\s\S]*?)```/i);
  // ```javascript 와 ```js 모두 지원
  const jsMatch =
    text.match(/```javascript\n?([\s\S]*?)```/i) ||
    text.match(/```js\n?([\s\S]*?)```/i);

  return {
    html: htmlMatch ? htmlMatch[1].trim() : '',
    css: cssMatch ? cssMatch[1].trim() : '',
    js: jsMatch ? jsMatch[1].trim() : '',
  };
}

export { parseAIResponse };
