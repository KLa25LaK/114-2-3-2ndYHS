/* 11505 學測第2回｜互動檢討共用程式 */
const Review = (function () {
  let vocabDB = {};
  let currentPopup = null;
  let levelColorsOn = true;
  let core7000Ready = false;
  const dictCache = {};

  function registerVocab(obj) {
    Object.assign(vocabDB, obj);
  }

  function loadCore7000() {
    if (core7000Ready || !window.CORE7000_LEVELS) return;
    const core = window.CORE7000_LEVELS;
    for (const w of Object.keys(core)) {
      const lv = core[w];
      if (lv < 2 || lv > 6) continue;
      if (!vocabDB[w]) {
        vocabDB[w] = {
          level: lv,
          core7000: true,
          entries: [{ pos: '7000單', zh: '', ipa: '', colloc: '', ex: '' }]
        };
      }
    }
    core7000Ready = true;
  }

  function esc(s) {
    return String(s).replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }

  function escHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function isBadZh(zh, en) {
    const z = String(zh || '').trim();
    const e = String(en || '').trim().toLowerCase();
    if (!z) return true;
    if (z.toLowerCase() === e) return true;
    if (/^warning:|query length|invalid|error/i.test(z)) return true;
    if (/^[a-z][a-z\s.'-]*$/i.test(z) && z.length > 2) return true;
    return false;
  }

  const POS_ABBR = {
    noun: 'n.',
    verb: 'v.',
    adjective: 'adj.',
    adverb: 'adv.',
    pronoun: 'pron.',
    preposition: 'prep.',
    conjunction: 'conj.',
    interjection: 'int.'
  };

  const MAIN_POS = new Set(['noun', 'verb', 'adjective', 'adverb']);

  /* 教師可另建 11505-gloss-overrides.js 覆寫；格式：{ word: { noun:'版本', adjective:'經典的' } } */
  const GLOSS_OVERRIDES_BUILTIN = {
    classic: { noun: '經典', adjective: '經典的' },
    version: { noun: '版本' },
    versions: { noun: '版本' },
    region: { noun: '區域' },
    regions: { noun: '區域' },
    inner: { adjective: '內部的' },
    rim: { noun: '邊緣；輪緣' },
    identify: { verb: '指認；認定' },
    identifies: { verb: '指認；認定' },
    identified: { verb: '指認；認定' },
    identification: { noun: '指認；身分識別' }
  };

  function glossOverrides() {
    const ext = window.GLOSS_OVERRIDES_11505 || {};
    return Object.assign({}, GLOSS_OVERRIDES_BUILTIN, ext);
  }

  function overrideGloss(word, pos) {
    const key = cleanWord(word);
    const p = posShort(pos);
    const map = glossOverrides()[key];
    if (!map) return '';
    if (typeof map === 'string') return map;
    return map[p] || map.all || '';
  }

  function posShort(pos) {
    const raw = String(pos || '').toLowerCase();
    const m = raw.match(
      /(noun|verb|adjective|adverb|pronoun|preposition|conjunction|interjection|article|determiner|exclamation)/
    );
    return m ? m[1] : raw.split(/\s/)[0] || '—';
  }

  function simplifyGloss(zh) {
    let z = String(zh || '')
      .trim()
      .replace(/^[「『"]|[」』"]$/g, '');
    z = z.replace(/^(一種|一個|一件|一位)\s*/, '');
    z = z.split(/[。；;]/)[0];
    const parts = z.split(/[,，]/).map((x) => x.trim()).filter(Boolean);
    if (parts.length > 2) z = parts.slice(0, 2).join('，');
    else if (parts.length) z = parts.join('，');
    if (z.length > 28) z = z.slice(0, 26).replace(/[，、]$/, '') + '…';
    return z;
  }

  function isStudentFriendlyZh(zh) {
    const z = String(zh || '').trim();
    if (!z || z.length > 20) return false;
    if (/[a-z]{4,}/i.test(z)) return false;
    if (/的意思$|名詞|動詞|形容詞|副詞/.test(z)) return false;
    if (/屬於|關於|用於|指稱|表示|尤其|特別是|領域|階級|等級|文學或藝術|一等或/.test(z)) return false;
    return true;
  }

  function shouldIncludePos(word, pos, enData) {
    const p = posShort(pos);
    if (!MAIN_POS.has(p)) return false;
    if (p !== 'verb') return true;
    const w = cleanWord(word);
    if (/(tion|sion|ment|ness|ity|ance|ence|ship|hood|ism)$/.test(w)) return false;
    const e0 = enData && enData[0];
    if (!e0) return true;
    const meanings = e0.meanings || [];
    const nounFirst = meanings.findIndex((m) => posShort(m.partOfSpeech) === 'noun');
    const verbIdx = meanings.findIndex((m) => posShort(m.partOfSpeech) === 'verb');
    if (nounFirst >= 0 && verbIdx > nounFirst) {
      const vDefs = (meanings[verbIdx].definitions || []).length;
      if (vDefs <= 1) return false;
    }
    return true;
  }

  function glossForPosFromBase(base, pos) {
    const p = posShort(pos);
    let z = String(base || '').trim();
    if (!z) return '';
    if (p === 'noun') return z.replace(/的$/, '').replace(/地$/, '');
    if (p === 'adjective') {
      z = z.replace(/的$/, '');
      return z.endsWith('的') ? z : z + '的';
    }
    if (p === 'adverb') {
      z = z.replace(/的$/, '');
      return z.endsWith('地') ? z : z + '地';
    }
    return z;
  }

  async function fetchWordGlossBase(word) {
    const key = cleanWord(word);
    const ov = overrideGloss(key, 'noun') || overrideGloss(key, 'all');
    if (ov) return ov.replace(/的$/, '');
    const raw = simplifyGloss(await fetchZhTw(key));
    if (!isStudentFriendlyZh(raw)) return '';
    return raw.replace(/的$/, '');
  }

  function studentGlossForPos(word, pos, baseZh) {
    const ov = overrideGloss(word, pos);
    if (ov) return ov;
    const z = glossForPosFromBase(baseZh, pos);
    return isStudentFriendlyZh(z) ? z : '';
  }

  function fixVerbGloss(lemma, gloss) {
    const z = String(gloss || '').trim();
    const key = cleanWord(lemma);
    if (/^identif/.test(key) && /識別碼|代碼|編碼|\bID\b/i.test(z)) return '指認；認定';
    if (/識別碼|識別号/.test(z)) return '指認；認出';
    return z;
  }

  function pickShortGlossFromPhrase(phraseZh) {
    const parts = String(phraseZh || '').match(/[\u4e00-\u9fff]{2,5}/g) || [];
    if (!parts.length) return '';
    const hit = parts.filter((w) => /認|指|說|為|是|成|表|視|當|認定|指出|認為/.test(w));
    const use = hit.length ? hit : parts;
    return [...new Set(use)].slice(0, 3).join('；');
  }

  async function fetchLemmaGloss(lemma, pos) {
    const key = cleanWord(lemma);
    const ov = overrideGloss(key, pos) || overrideGloss(key, 'all');
    if (ov) return ov;
    const p = posShort(pos);
    let z = '';
    if (p === 'verb') {
      z = fixVerbGloss(key, simplifyGloss(await fetchZhTw('to ' + key)));
    }
    if (!isStudentFriendlyZh(z)) {
      z = fixVerbGloss(key, simplifyGloss(await fetchZhTw(key)));
    }
    if (!isStudentFriendlyZh(z)) return '';
    return glossForPosFromBase(z, pos) || z;
  }

  function getWordContext(el) {
    if (!el || !el.closest) return '';
    const root = el.closest('.sentence, .q-stem, p, #passage, #article, article, .reading-pane, .card');
    if (!root) return '';
    const clone = root.cloneNode(true);
    clone.querySelectorAll('.trans, button, .sound, script, style').forEach((n) => n.remove());
    return (clone.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function sentenceContaining(text, word) {
    const raw = String(text || '').trim();
    if (!raw) return '';
    const w = cleanWord(word);
    const chunks = raw.split(/(?<=[.!?])\s+/).filter(Boolean);
    const list = chunks.length ? chunks : [raw];
    for (const c of list) {
      if (new RegExp(`\\b${w}\\w*\\b`, 'i').test(c)) return c.trim().slice(0, 320);
    }
    for (const v of stemVariants(w).slice(1)) {
      for (const c of list) {
        if (new RegExp(`\\b${v}\\w*\\b`, 'i').test(c)) return c.trim().slice(0, 320);
      }
    }
    return raw.slice(0, 320);
  }

  function extractPhraseAround(sentence, word) {
    const tokens = sentence.match(/[A-Za-z0-9'-]+/g) || [];
    const w = cleanWord(word);
    let idx = tokens.findIndex((t) => cleanWord(t) === w);
    if (idx < 0) {
      idx = tokens.findIndex((t) => {
        const c = cleanWord(t);
        return c.startsWith(w.slice(0, 4)) || w.startsWith(c.slice(0, 4));
      });
    }
    if (idx < 0) return sentence.slice(0, 140);
    const start = Math.max(0, idx - 5);
    const end = Math.min(tokens.length, idx + 6);
    return tokens.slice(start, end).join(' ');
  }

  function inferPos(surface, lemma, enData) {
    const senses = collectDictSenses(enData, lemma);
    if (senses.length) return senses[0].pos;
    const s = cleanWord(surface);
    if (/ly$/.test(s)) return 'adverb';
    if (/(ing|ed|es|s)$/.test(s) && cleanWord(lemma) !== s) return 'verb';
    return 'noun';
  }

  function formatContextHtml(bundle) {
    if (!bundle) return '<p class="mini">暫無解釋。</p>';
    let html = '';
    const senses = bundle.senses || [];
    const senseZh = bundle.senseZh || [];
    const seen = new Set();
    senses.forEach((s, i) => {
      const meaning = senseZh[i] || '';
      if (!meaning || seen.has(meaning)) return;
      seen.add(meaning);
      const posLabel = POS_ABBR[posShort(s.pos)] || posShort(s.pos);
      html += `<div class="sense"><div class="sense-title"><b>${escHtml(posLabel)}</b> ${escHtml(meaning)}</div></div>`;
    });
    if (bundle.phraseZh) {
      html += `<div class="pop-ctx"><span class="pop-ctx-tag">文中</span> ${escHtml(bundle.phraseZh)}</div>`;
    }
    return html || '<p class="mini">暫無解釋，請對照句意或課本。</p>';
  }

  async function fetchContextLookup(lemma, displayWord, contextEl, entry) {
    const key = cleanWord(lemma || displayWord);
    const surface = displayWord || lemma;
    const ctxText = getWordContext(contextEl);
    const cacheKey = 'ctx5:' + key + ':' + ctxText.slice(0, 100);
    if (dictCache[cacheKey] && dictCache[cacheKey].v === 5) return dictCache[cacheKey];

    const resolved = entry || resolveWord(surface);
    if (resolved && hasRichZh(resolved)) {
      const e0 = resolved.entries[0];
      const out = { zh: e0.zh, senseZh: [e0.zh], senses: [{ pos: e0.pos || 'n.' }], v: 5 };
      dictCache[cacheKey] = out;
      return out;
    }

    const ovMap = glossOverrides()[key];
    if (ovMap && typeof ovMap === 'object') {
      const senses = Object.keys(ovMap)
        .filter((p) => p !== 'all')
        .map((p) => ({ pos: p }));
      const senseZh = senses.map((s) => ovMap[s.pos] || ovMap[posShort(s.pos)]);
      const out = { en: null, zh: senseZh[0] || '', senseZh, senses, v: 5 };
      dictCache[cacheKey] = out;
      return out;
    }

    let enData = null;
    try {
      const r = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(key)}`);
      if (r.ok) enData = await r.json();
    } catch (_) {}

    const sentence = sentenceContaining(ctxText, surface);
    const phrase = sentence ? extractPhraseAround(sentence, surface) : '';
    const pos = inferPos(surface, key, enData);
    let gloss = await fetchLemmaGloss(key, pos);

    let phraseZh = '';
    if (phrase.length > 5) {
      phraseZh = simplifyGloss(await fetchZhTw(phrase));
      if (phraseZh.length > 50) phraseZh = phraseZh.slice(0, 48) + '…';
    }

    if (phraseZh && (!gloss || /識別碼|代碼|編碼/.test(gloss))) {
      const fromPhrase = pickShortGlossFromPhrase(phraseZh);
      if (fromPhrase) gloss = fromPhrase;
    }
    if (!gloss && phraseZh) gloss = pickShortGlossFromPhrase(phraseZh) || phraseZh.slice(0, 12);

    const senses = [{ pos: posShort(pos) || 'verb' }];
    const senseZh = gloss ? [gloss] : [];
    const out = {
      en: enData,
      zh: gloss || '',
      senseZh,
      senses,
      phraseEn: phrase,
      phraseZh,
      sentenceEn: sentence,
      v: 5
    };
    dictCache[cacheKey] = out;
    return out;
  }

  async function fetchZhTw(text) {
    const q = String(text || '').trim();
    if (!q) return '';
    const cacheKey = 'zh:' + q.toLowerCase();
    if (Object.prototype.hasOwnProperty.call(dictCache, cacheKey)) return dictCache[cacheKey];

    let zh = '';
    try {
      const tr = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}&langpair=en|zh-TW`
      );
      if (tr.ok) {
        const tj = await tr.json();
        zh = String(tj.responseData?.translatedText || '').trim();
        if (isBadZh(zh, q)) zh = '';
      }
    } catch (_) {}

    if (!zh) {
      try {
        const g = await fetch(
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-TW&dt=t&q=${encodeURIComponent(q)}`
        );
        if (g.ok) {
          const gj = await g.json();
          zh = String((gj[0] && gj[0][0] && gj[0][0][0]) || '').trim();
          if (isBadZh(zh, q)) zh = '';
        }
      } catch (_) {}
    }

    dictCache[cacheKey] = zh;
    return zh;
  }

  function collectDictSenses(enData, word) {
    const e0 = enData && enData[0];
    if (!e0) return [];
    const out = [];
    (e0.meanings || []).forEach((m) => {
      if (!shouldIncludePos(word, m.partOfSpeech, enData)) return;
      const d = (m.definitions || [])[0];
      if (!d || !d.definition) return;
      out.push({ pos: m.partOfSpeech || '—', definition: d.definition });
    });
    const rank = { noun: 0, adjective: 1, verb: 2, adverb: 3 };
    out.sort((a, b) => (rank[posShort(a.pos)] ?? 9) - (rank[posShort(b.pos)] ?? 9));
    return out.slice(0, 3);
  }

  function cleanWord(w) {
    return String(w || '')
      .toLowerCase()
      .replace(/[.,!?;:'"()]/g, '');
  }

  /* 僅複數／不可拆成單數的字（存入時保留原文） */
  const PLURAL_ONLY = new Set([
    'scissors',
    'trousers',
    'pants',
    'jeans',
    'shorts',
    'glasses',
    'sunglasses',
    'pliers',
    'tongs',
    'shears',
    'binoculars',
    'headquarters',
    'stairs',
    'goods',
    'earnings',
    'odds',
    'surroundings',
    'belongings',
    'clothes',
    'thanks',
    'remains',
    'savings',
    'wages',
    'riches'
  ]);

  /* 結尾像複數但不可還原成單數字 */
  const LEMMA_KEEP_SURFACE = new Set([
    'news',
    'series',
    'species',
    'means',
    'physics',
    'mathematics',
    'economics',
    'politics',
    'ethics',
    'athletics',
    'logistics',
    'diabetes',
    'rabies',
    'measles',
    'mumps',
    'billiards',
    'darts',
    'alms'
  ]);

  function stemVariants(key) {
    const keys = [key];
    if (key.endsWith('ies') && key.length > 4) keys.push(key.slice(0, -3) + 'y');
    if (key.endsWith('es') && key.length > 3) {
      keys.push(key.slice(0, -2));
      keys.push(key.slice(0, -1));
    }
    if (key.endsWith('s') && key.length > 2 && !key.endsWith('ss')) keys.push(key.slice(0, -1));
    if (key.endsWith('ed') && key.length > 3) {
      keys.push(key.slice(0, -2));
      keys.push(key.slice(0, -1));
      keys.push(key.slice(0, -2) + 'e');
    }
    if (key.endsWith('ing') && key.length > 4) {
      keys.push(key.slice(0, -3));
      keys.push(key.slice(0, -3) + 'e');
    }
    if (key.endsWith('ly') && key.length > 3) keys.push(key.slice(0, -2));
    if (key.endsWith('er') && key.length > 3) keys.push(key.slice(0, -2));
    if (key.endsWith('est') && key.length > 4) keys.push(key.slice(0, -3));
    return [...new Set(keys)];
  }

  function morphGuessLemma(clean) {
    if (PLURAL_ONLY.has(clean) || LEMMA_KEEP_SURFACE.has(clean)) return clean;
    const vars = stemVariants(clean).slice(1);
    for (const v of vars) {
      if (!v || v.length < 2 || LEMMA_KEEP_SURFACE.has(v) || PLURAL_ONLY.has(v)) continue;
      if (vocabDB[v] && !vocabDB[v].pluralOnly) return v;
      if (clean.endsWith('ies') && v.endsWith('y')) return v;
      if ((clean.endsWith('ed') || clean.endsWith('ing')) && v.length < clean.length) return v;
      if (clean.endsWith('ily') && v === clean.slice(0, -3) + 'y') return v;
      if (clean.endsWith('ly') && v === clean.slice(0, -2)) return v;
      if (clean.endsWith('est') && v === clean.slice(0, -3)) return v;
      if (clean.endsWith('er') && v === clean.slice(0, -2) && clean.length > 4) return v;
      if (clean.endsWith('s') && !clean.endsWith('ss') && v === clean.slice(0, -1) && v.length >= 3) return v;
    }
    return clean;
  }

  /** 存入 Vocab7000 時用：動詞/形容詞原形、名詞單數（僅複數字除外） */
  function toSaveLemma(raw, entry) {
    const display = String(raw || '').trim();
    const clean = cleanWord(display);
    if (!clean) return display;

    if (entry && (entry.pluralOnly || entry.keepSurface)) return clean;
    if (PLURAL_ONLY.has(clean) || LEMMA_KEEP_SURFACE.has(clean)) return clean;

    loadCore7000();

    if (entry && entry.base) {
      const base = cleanWord(entry.base);
      if (base && base !== clean && !PLURAL_ONLY.has(clean)) return base;
    }

    const resolved = resolveWord(display);
    if (resolved) {
      if (resolved.pluralOnly || resolved.keepSurface) return clean;
      const base = cleanWord(resolved.base || '');
      if (base && base !== clean) return base;
      if (vocabDB[clean] && vocabDB[clean].pluralOnly) return clean;
      return clean;
    }

    return morphGuessLemma(clean);
  }

  function resolveWord(raw) {
    const clean = raw.toLowerCase().replace(/[.,!?;:'"()]/g, '');
    for (const key of stemVariants(clean)) {
      const entry = vocabDB[key];
      if (!entry) continue;
      if (entry.base && vocabDB[entry.base]) {
        return {
          ...vocabDB[entry.base],
          display: raw,
          base: entry.base,
          level: entry.level || vocabDB[entry.base].level
        };
      }
      return { ...entry, display: raw, base: key };
    }
    return null;
  }

  function hasRichZh(entry) {
    const zh = entry.entries?.[0]?.zh;
    return !!(zh && String(zh).trim());
  }

  function levelTagClass(level) {
    return 'lv' + Math.min(6, Math.max(2, level || 2));
  }

  function levelBadge(level) {
    const map = { 2: 'var(--lv2)', 3: 'var(--lv3)', 4: 'var(--lv4)', 5: 'var(--lv5)', 6: 'var(--lv6)' };
    const c = map[level] || '#374151';
    return `<span class="leveltag" style="color:${c};border-color:${c}">Level ${level}</span>`;
  }

  function renderWord(w) {
    const entry = resolveWord(w);
    if (entry && entry.level >= 2) {
      const cls = levelTagClass(entry.level);
      return `<span class="word ${cls}" onclick="Review.showVocab('${esc(w.toLowerCase())}',this)">${w}</span>`;
    }
    return w;
  }

  function autoHighlightLevels(html) {
    return html.split(/(<[^>]+>)/).map((seg) => {
      if (!seg || seg.startsWith('<')) return seg;
      return seg.replace(/\b([A-Za-z][A-Za-z'-]*)\b/g, (m) => {
        const entry = resolveWord(m);
        if (entry && entry.level >= 2 && entry.level <= 6) return renderWord(m);
        return m;
      });
    }).join('');
  }

  function processText(raw) {
    loadCore7000();
    let html = raw;
    html = html.replace(/\[\[(\d+):([^\]]+)\]\]/g, (_, no, word) =>
      `<span class="blank" onclick="Review.showExplain(${no},this)">${no}. ${word}</span>`
    );
    html = html.replace(/\[\[(\d+)\]\]/g, (_, no) =>
      `<span class="blank" onclick="Review.showExplain(${no},this)">${no}</span>`
    );
    html = html.replace(/\{([^}]+)\}/g, (_, word) => renderWord(word));
    html = autoHighlightLevels(html);
    return html;
  }

  function item(title, body) {
    return `<div class="tag">${title}</div><div>${body}</div>`;
  }

  function buildVocabBody(entry) {
    const entries = entry.entries || [];
    let html = entries
      .map(
        (e) => `
    <div class="sense">
      <div class="sense-title"><b>${escHtml(e.pos)}</b> ${escHtml(e.zh)}</div>
      ${e.ipa ? `<div class="phonetic">${escHtml(e.ipa)}</div>` : ''}
    </div>`
      )
      .join('');
    const dk = entry.display.toLowerCase().replace(/[.,!?;:'"()]/g, '');
    if (entry.base && entry.base !== dk) {
      html =
        `<div class="mini">文中形式：<b>${entry.display}</b>｜原形：<b>${entry.base}</b></div>` + html;
    }
    return html;
  }

  function showPopup(content, el) {
    showCenterPopup(content);
  }

  function showCenterPopup(content) {
    if (currentPopup) currentPopup.remove();
    const overlay = document.createElement('div');
    overlay.id = 'overlayPopup';
    overlay.innerHTML = `<div class="center-popup"><span class="big-close" onclick="Review.closePopup()">✕</span>${content}</div>`;
    overlay.addEventListener('click', (e) => {
      if (e.target.id === 'overlayPopup') closePopup();
    });
    document.body.appendChild(overlay);
    currentPopup = overlay;
  }

  function closePopup() {
    if (currentPopup) {
      currentPopup.remove();
      currentPopup = null;
    }
  }

  document.addEventListener('click', (e) => {
    if (!currentPopup) return;
    if (currentPopup.id === 'overlayPopup') return;
    if (currentPopup.contains(e.target)) return;
    if (e.target.closest('.blank,.word,.trans,.choice,.opt-btn,.explain-btn,.sound,.fab button,.index-link,.sec-pick-item,.sec-nav-fab,.jump-bar a,.jump-current,#secPickerOverlay,.custom-vocab-overlay,.cv-inline-btn,.cv-word-chip')) return;
    closePopup();
  });

  function speak(text) {
    if (!('speechSynthesis' in window)) {
      alert('此瀏覽器不支援發音');
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text).replace(/\s*\(.*?\)/g, ''));
    u.lang = 'en-US';
    u.rate = 0.82;
    window.speechSynthesis.speak(u);
  }

  function buildCore7000Body(entry, extraHtml) {
    const base = entry.base || entry.display;
    return (
      `<div class="sense">
        <div class="sense-title"><b>108 課綱 7000 單</b> Level ${entry.level}</div>
        <div class="mini">字表收錄此字；點下方可聽發音。${entry.base && entry.base !== entry.display.toLowerCase().replace(/[.,!?;:'"()]/g, '') ? `文中形式 <b>${entry.display}</b>，原形推測 <b>${entry.base}</b>。` : ''}</div>
        ${extraHtml || ''}
        <button class="sound" onclick="Review.speak('${esc(base)}')">🔊 單字發音</button>
      </div>`
    );
  }

  function formatDictHtml(data, zhHint, senseZhList, sensesOpt) {
    const e0 = data && data[0];
    let html = '';
    const senses = sensesOpt || (data ? collectDictSenses(data, '') : []);
    const hasSenseZh = senseZhList && senseZhList.some(Boolean);

    if (zhHint && !hasSenseZh) {
      html += `<div class="sense"><div class="sense-title">${escHtml(zhHint)}</div></div>`;
    }

    if (senses.length) {
      const seen = new Set();
      senses.forEach((s, i) => {
        const meaning = (senseZhList && senseZhList[i]) || (i === 0 ? zhHint : '') || '';
        if (!meaning || seen.has(meaning)) return;
        seen.add(meaning);
        const posLabel = POS_ABBR[posShort(s.pos)] || posShort(s.pos);
        html += `<div class="sense"><div class="sense-title"><b>${escHtml(posLabel)}</b> ${escHtml(meaning)}</div></div>`;
      });
    } else if (e0 && zhHint) {
      html += `<div class="sense"><div class="sense-title">${escHtml(zhHint)}</div></div>`;
    }

    if (!zhHint && (!senseZhList || !senseZhList.some(Boolean)) && html) {
      html += '<p class="mini">中文翻譯暫時無法取得，請關閉後再點一次，或對照 7000 單／課本。</p>';
    }
    return html || '<p class="mini">暫無線上解釋，請對照 7000 單字表或課本。</p>';
  }

  async function fetchDictLookup(base, displayWord, contextEl) {
    return fetchContextLookup(base, displayWord || base, contextEl, null);
  }

  async function showVocab(w, el) {
    loadCore7000();
    const entry = resolveWord(w);
    if (!entry) {
      showPopup(item(w, '此字不在 7000 單 Level 2～6 字表中。'), el);
      return;
    }
    if (hasRichZh(entry)) {
      showPopup(item(`${entry.display} ${levelBadge(entry.level)}`, buildVocabBody(entry)), el);
      return;
    }

    const base = (entry.base || w).toLowerCase().replace(/[.,!?;:'"()]/g, '');
    showPopup(
      item(`${entry.display} ${levelBadge(entry.level)}`, buildCore7000Body(entry, '<p class="mini">載入解釋中…</p>')),
      el
    );

    const bundle = await fetchDictLookup(base, w, el);
    const extra = bundle.senses
      ? formatContextHtml(bundle)
      : bundle.zh
        ? `<div class="zh"><b>中文參考：</b>${bundle.zh}</div>`
        : '<p class="mini">無法連線載入英英／中文解釋，請對照 7000 單或課本。</p>';
    if (currentPopup) showPopup(item(`${entry.display} ${levelBadge(entry.level)}`, buildCore7000Body(entry, extra)), el);
  }

  function showTrans(text, el) {
    showCenterPopup(item('全句翻譯', `<div class="zh" style="font-size:17px;line-height:1.9">${text}</div>`));
  }

  function scrollInPane(el) {
    if (!el) return;
    const pane = el.closest('.reading-pane');
    if (!pane) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const top = el.getBoundingClientRect().top - pane.getBoundingClientRect().top + pane.scrollTop - 16;
    pane.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }

  let _passageParts = [];
  let _explanations = {};
  let _choices = [];
  let _answerMap = {};

  function initPassagePage(cfg) {
    loadCore7000();
    _passageParts = cfg.passageParts || [];
    _explanations = cfg.explanations || {};
    _choices = cfg.choices || [];
    _answerMap = cfg.answerMap || {};
    if (cfg.vocab) registerVocab(cfg.vocab);

    const bank = document.getElementById('choiceBank');
    if (bank && _choices.length) {
      bank.innerHTML = _choices
        .map(([letter, word]) => `<div class="choice" onclick="Review.showChoice('${letter}',this)">(${letter}) ${word}</div>`)
        .join('');
    }

    const passage = document.getElementById('passage');
    if (passage) {
      passage.innerHTML = _passageParts
        .map(
          (p, i) =>
            `<p class="sentence">${processText(p.html)} <span class="trans" onclick="Review.showTrans(Review._passageParts[${i}].trans,this)">翻譯</span></p>`
        )
        .join('');
    }
  }

  function showExplain(n, el) {
    const x = _explanations[n];
    if (!x) return;
    let body = '';
    if (x.why) body += `<b>解析</b><br>${x.why}`;
    if (x.zh) body += `<br><br><b>中文：</b>${x.zh}`;
    if (x.wrong) {
      const wrong = (Array.isArray(x.wrong) ? x.wrong : []).map((v) => `<div>${v}</div>`).join('');
      body += `<div class="wrong"><b>其他選項為什麼不對？</b>${wrong}</div>`;
    }
    if (x.choices) {
      const html = Object.entries(x.choices)
        .map(
          ([L, t]) =>
            `<div class="choiceLine ${L === _answerMap[n] ? 'choiceCorrect' : 'choiceWrong'}">(${L}) ${t}</div>`
        )
        .join('');
      body += `<div class="wrong"><b>選項解析</b>${html}</div>`;
    }
    showPopup(item(x.title || `${n} 題`, body), el);
  }

  function showChoice(letter, el) {
    const row = _choices.find((c) => c[0] === letter);
    if (!row) return;
    const word = row[1];
    const correctNo = Object.entries(_answerMap).find(([, l]) => l === letter)?.[0];
    const entry = resolveWord(word.split(' ')[0]);
    let body = entry ? buildVocabBody(entry) : '<p>請參考選項意思與篇章語意。</p>';
    if (correctNo) body += `<div class="mini"><b>本篇正確位置：</b>第 ${correctNo} 格</div>`;
    else body += `<div class="mini">此選項在本篇其他空格不適用，仍可查字義。</div>`;
    showPopup(item(`(${letter}) ${word} ${entry ? levelBadge(entry.level) : ''}`, body), el);
  }

  function toggleLevelColors() {
    levelColorsOn = !levelColorsOn;
    const app = document.getElementById('app');
    if (app) app.classList.toggle('hide-lv', !levelColorsOn);
  }

  function showFullTranslation(html) {
    showCenterPopup(`<div class="tag">全文白話翻譯</div><div class="zh" style="font-size:17px;line-height:2">${html}</div>`);
  }

  function goHome() {
    window.location.href = '11505-index.html';
  }

  /* 詞彙題 1-10 */
  function initVocabMCPage(cfg) {
    loadCore7000();
    if (cfg.vocab) registerVocab(cfg.vocab);
    const root = document.getElementById('vocabQuestions');
    if (!root) return;
    root.innerHTML = cfg.questions
      .map((q) => {
        const opts = q.options
          .map(([L, text]) => {
            const isAns = L === q.answer;
            return `<div class="opt-btn ${isAns ? 'correct-ans' : ''}" onclick="Review.showVocabOption('${q.no}','${L}',this)">(${L}) ${text}</div>`;
          })
          .join('');
        return `<div class="card q-card">
          <div class="q-title">第 ${q.no} 題</div>
          <div class="q-stem">${processText(q.stem)}</div>
          <div class="answer-badge">正確答案：(${q.answer}) ${q.options.find((o) => o[0] === q.answer)[1]}</div>
          <div class="opts">${opts}</div>
        </div>`;
      })
      .join('');
  }

  let _vocabQuestions = [];
  function initVocabMCData(questions) {
    _vocabQuestions = questions;
  }

  function showVocabOption(no, letter, el) {
    const q = _vocabQuestions.find((x) => String(x.no) === String(no));
    if (!q) return;
    const opt = q.options.find((o) => o[0] === letter);
    if (!opt) return;
    const entry = resolveWord(opt[1].split(' ')[0]);
    let body = entry ? buildVocabBody(entry) : `<b>${opt[1]}</b>`;
    const isCorrect = letter === q.answer;
    body =
      `<div class="mini">${isCorrect ? '✅ 本題正解' : '❌ 非本題正解'}</div>` +
      body +
      (q.explain && q.explain[letter] ? `<div class="wrong"><b>說明</b><div>${q.explain[letter]}</div></div>` : '');
    showPopup(item(`第 ${no} 題 (${letter}) ${opt[1]}`, body), el);
  }

  /* 閱讀測驗 */
  let _readingQ = [];
  let _readingSentences = [];
  let _activeReadingQ = null;

  function setReadingQuestions(q) {
    _readingQ = q;
  }

  function getReadingQuestion(no) {
    return _readingQ.find((x) => x.no === no || String(x.no) === String(no));
  }

  function clearReadingEvidence() {
    document.querySelectorAll('.sentence.evidence-hit, .sentence.evidence-dim').forEach((el) => {
      el.classList.remove('evidence-hit', 'evidence-dim');
    });
    document.querySelectorAll('.opt-btn.evidence-selected, .opt-btn.evidence-wrong-pick').forEach((el) => {
      el.classList.remove('evidence-selected', 'evidence-wrong-pick');
    });
  }

  function highlightReadingEvidence(ids) {
    const article = document.getElementById('article');
    if (!article || !ids || !ids.length) return;
    article.querySelectorAll('.sentence[data-sid]').forEach((el) => el.classList.add('evidence-dim'));
    ids.forEach((id) => {
      const el = article.querySelector(`[data-sid="${id}"]`);
      if (el) {
        el.classList.remove('evidence-dim');
        el.classList.add('evidence-hit');
      }
    });
    const first = article.querySelector('.evidence-hit');
    scrollInPane(first);
  }

  function buildReadingOptionsHtml(q, answer) {
    if (!q.options || !q.options.length) return '';
    let html = '<div class="wrong"><b>選項</b>';
    q.options.forEach(([L, text]) => {
      html += `<div class="choiceLine ${L === answer ? 'choiceCorrect' : ''}"><b>(${L})</b> ${text}</div>`;
    });
    return html + '</div>';
  }

  function buildReadingFullExplainHtml(q) {
    let html = `<div class="answer-badge">正確答案：${q.answer}</div>`;
    html += buildReadingOptionsHtml(q, q.answer);
    html += `<div class="mini"><b>📍 文章定位</b>：左側 <span class="evidence-label">黃底反白</span> 為解題關鍵句。</div>`;
    if (q.explain && q.explain[q.answer]) {
      html += `<div class="zh"><b>為什麼 (${q.answer}) 正確？</b><br>${String(q.explain[q.answer]).replace(/^✅\s*/, '')}</div>`;
    }
    if (q.explain) {
      const rest = q.options
        .filter(([L]) => L !== q.answer)
        .map(([L]) => (q.explain[L] ? `<div class="choiceLine choiceWrong"><b>(${L})</b> ${q.explain[L]}</div>` : ''))
        .join('');
      if (rest) html += `<div class="wrong"><b>各選項解析</b>${rest}</div>`;
    }
    return html;
  }

  function showReadingFullExplain(no, el) {
    const q = getReadingQuestion(no);
    if (!q) return;
    _activeReadingQ = no;
    clearReadingEvidence();
    highlightReadingEvidence(q.evidenceIds || []);
    showCenterPopup(item(`第 ${no} 題｜完整解析`, buildReadingFullExplainHtml(q)));
  }

  function buildReadingFeedbackHtml(q, letter) {
    const ok = letter === q.answer;
    const opt = q.options.find((o) => o[0] === letter);
    let html = `<div class="reading-verdict ${ok ? 'ok' : 'bad'}">${ok ? '✅ 你選的 (' + letter + ') 是正解' : '❌ 你選的 (' + letter + ') 非正解｜正確答案 (' + q.answer + ')'}</div>`;
    html += `<div class="mini"><b>📍 文章定位</b>：左側 <span class="evidence-label">黃底反白</span> 為解題關鍵句。</div>`;
    if (q.explain && q.explain[q.answer]) {
      html += `<div class="zh"><b>為什麼 (${q.answer}) 正確？</b><br>${String(q.explain[q.answer]).replace(/^✅\s*/, '')}</div>`;
    }
    if (!ok && q.explain && q.explain[letter]) {
      html += `<div class="wrong"><b>為什麼 (${letter}) 不符合文章？</b><div>${String(q.explain[letter]).replace(/^❌\s*/, '')}</div></div>`;
    }
    if (q.explain) {
      const rest = q.options
        .filter(([L]) => L !== letter && L !== q.answer)
        .map(([L]) => (q.explain[L] ? `<div class="choiceLine choiceWrong"><b>(${L})</b> ${q.explain[L]}</div>` : ''))
        .join('');
      if (rest) html += `<div class="wrong"><b>其他選項</b>${rest}</div>`;
    }
    if (!q.explain && opt) html += `<div class="mini">${opt[1]}</div>`;
    return html;
  }

  function initReadingPage(cfg) {
    loadCore7000();
    if (cfg.vocab) registerVocab(cfg.vocab);
    _readingSentences = cfg.sentences || [];
    _passageParts = _readingSentences;
    _readingQ = cfg.questions || [];
    _activeReadingQ = null;
    clearReadingEvidence();

    const art = document.getElementById('article');
    if (art) {
      art.innerHTML = _readingSentences
        .map(
          (p, i) =>
            `<span class="sentence" data-sid="${p.id || 's' + i}">${processText(p.html)} <button type="button" class="trans" onclick="Review.showTrans(Review._passageParts[${i}].trans,this)">翻譯</button></span>`
        )
        .join('');
    }
    const qs = document.getElementById('questions');
    if (qs && _readingQ.length) {
      qs.innerHTML = _readingQ
        .map(
          (q) => `<div class="card q-card" data-qno="${q.no}">
            <div class="q-title">${q.no}. ${q.prompt || ''}</div>
            <div class="answer-badge">正確答案：${q.answer}</div>
            <button type="button" class="explain-btn" onclick="Review.showReadingFullExplain(${q.no},this)">📖 完整解析</button>
          </div>`
        )
        .join('');
    }
  }

  function initReadingArticle(articleKey, vocab) {
    const pack = window.READING11505 && window.READING11505[articleKey];
    if (!pack) return null;
    window.EXP_READING_NOS = pack.questions.map((q) => q.no);
    initReadingPage({ sentences: pack.sentences, questions: pack.questions, vocab: vocab || {} });
    return pack;
  }

  function showReadingExplain(no, letter, el) {
    const q = getReadingQuestion(no);
    if (!q) return;
    _activeReadingQ = no;
    clearReadingEvidence();
    highlightReadingEvidence(q.evidenceIds || []);

    document.querySelectorAll(`.opt-btn[data-q="${no}"]`).forEach((btn) => {
      btn.classList.remove('evidence-selected', 'evidence-wrong-pick');
    });
    if (el) el.classList.add(letter === q.answer ? 'evidence-selected' : 'evidence-wrong-pick');

    const html = buildReadingFeedbackHtml(q, letter);
    const ok = letter === q.answer;
    showCenterPopup(item(`第 ${no} 題 (${letter}) ${ok ? '✅' : '❌'}`, html));
  }

  /* 簡易詞彙建構 */
  function V(level, pos, zh, ipa, colloc, ex, base) {
    const o = { level, entries: [{ pos, ipa: ipa || '', zh, colloc: colloc || '', ex: ex || `I learned the word.` }] };
    if (base) o.base = base;
    return o;
  }

  return {
    item,
    registerVocab,
    loadCore7000,
    initPassagePage,
    initVocabMCPage,
    initVocabMCData,
    initReadingPage,
    initReadingArticle,
    setReadingQuestions,
    getReadingQuestion,
    resolveWord,
    toSaveLemma,
    hasRichZh,
    buildVocabBody,
    formatDictHtml,
    formatContextHtml,
    fetchDictLookup,
    fetchContextLookup,
    getWordContext,
    fetchZhTw,
    highlightReadingEvidence,
    clearReadingEvidence,
    showVocab,
    showTrans,
    showExplain,
    showChoice,
    showVocabOption,
    showReadingExplain,
    buildReadingOptionsHtml,
    buildReadingFullExplainHtml,
    showReadingFullExplain,
    showPopup,
    showCenterPopup,
    showFullTranslation,
    closePopup,
    speak,
    toggleLevelColors,
    goHome,
    V,
    get _passageParts() {
      return _passageParts;
    }
  };
})();
window.Review = Review;
