/**
 * api.js — 외부 AI API 호출 추상화 레이어
 *
 * 이 파일만 교체하면 Ollama → Claude API 전환이 가능하다.
 * app.js, parser.js는 API 공급자를 직접 참조하지 않는다.
 *
 * To switch to Claude API, replace the generateCode implementation:
 * - Endpoint: https://api.anthropic.com/v1/messages
 * - Auth: x-api-key header
 * - Body: { model, max_tokens, messages: [{role:'user', content: prompt}] }
 * - Response: data.content[0].text
 */

const OLLAMA_ENDPOINT = 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = 'codellama';

const SYSTEM_PROMPT = `You are a web developer. Generate HTML, CSS, and JavaScript code based on the user's request.
Always wrap HTML in \`\`\`html ... \`\`\`, CSS in \`\`\`css ... \`\`\`, and JavaScript in \`\`\`javascript ... \`\`\` blocks.
Only output code blocks, no explanations.`;

/**
 * 프롬프트를 받아 AI 응답 텍스트를 반환한다.
 * @param {string} prompt — 사용자 입력 프롬프트
 * @returns {Promise<string>} AI 응답 원문
 * @throws {Error} 네트워크 실패 또는 API 에러 시
 */
async function generateCode(prompt) {
  const response = await fetch(OLLAMA_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: `${SYSTEM_PROMPT}\n\nUser request: ${prompt}`,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();
  return data.response;
}

export { generateCode };
