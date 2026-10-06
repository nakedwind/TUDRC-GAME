// 讀取 data/dialogues.js 裡的台詞（用「對話編輯器.html」編輯的檔案）
// id 傳 null 代表「通用」那組（角色沒有專屬台詞時的備用台詞）。
// 台詞可以是陣列，或依章節分組的 { 章節: 陣列 }（由 balance.js 的 chapterPick 挑出目前章節）。
function dialogueLines(id, key) {
  if (typeof DIALOGUES === 'undefined' || !DIALOGUES) return null;
  const v = id == null ? DIALOGUES.default?.[key] : DIALOGUES.characters?.[id]?.[key];
  const lines = typeof chapterPick === 'function' ? chapterPick(v) : (Array.isArray(v) ? v : null);
  return Array.isArray(lines) ? lines.filter(s => typeof s === 'string' && s.trim()) : null;
}
// 隨機挑一句；沒有台詞就回傳 null（呼叫的地方就不說話）
function pickDialogueLine(id, key) {
  const lines = dialogueLines(id, key);
  return lines && lines.length ? lines[Math.floor(Math.random() * lines.length)] : null;
}
