/* 11505｜教師自訂單字中文（優先於線上翻譯）
 * 格式說明：
 *   word: { adjective: '...', noun: '...', verb: '...', adverb: '...' }
 *   word: { all: '...' }  ← 所有詞性共用同一翻譯
 *
 * 片語覆寫請用空格連結，例如 'in_response_to' 或直接覆寫主要單字
 */
window.GLOSS_OVERRIDES_11505 = {

  /* ── 詞性修正 ── */

  // official：此卷中出現於 official announcement，應為形容詞
  official: {
    adjective: '官方的；正式的',
    noun: '官員；官方人士'
  },

  // response：此卷中出現於 in response to，片語優先
  response: {
    noun: '回應（in response to = 回應……）'
  },

};
