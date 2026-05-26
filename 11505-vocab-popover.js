/* 11505｜B4L7 風格單字彈窗 ＋ Vocab7000 資料夾（localStorage custom_folders） */
(function () {
  const FOLDER_KEY = 'custom_folders';
  const LV_COLORS = { 2: '#0ea5e9', 3: '#10b981', 4: '#f59e0b', 5: '#a855f7', 6: '#ec4899' };

  function getCfg() {
    return window.VOCAB11505_CONFIG || { mode: 'student', lockedFolderIds: [], lockedFolderNames: [] };
  }

  function isTeacherMode() {
    if (new URLSearchParams(location.search).get('teacher') === '1') return true;
    return getCfg().mode === 'teacher';
  }

  function normFolderName(name) {
    return String(name || '')
      .replace(/\s/g, '')
      .replace(/^0+/, '')
      .toLowerCase();
  }

  function isFolderLocked(f) {
    if (!f) return true;
    if (f.preset) return true;
    const cfg = getCfg();
    const ids = cfg.lockedFolderIds || [];
    if (ids.includes(f.id)) return true;
    const key = normFolderName(f.name);
    const locked = (cfg.lockedFolderNames || []).map(normFolderName);
    if (locked.includes(key)) return true;
    if (/^1-264$/.test(key) || key === '265-528' || /^1-528$/.test(key)) return true;
    return false;
  }

  function listFoldersForPicker() {
    const all = getFolders();
    if (isTeacherMode()) return all;
    return all.filter((f) => !isFolderLocked(f));
  }

  function saveLemma(displayWord, entry) {
    const review = window.Review;
    if (review && review.toSaveLemma) {
      review.loadCore7000();
      return String(review.toSaveLemma(displayWord, entry) || displayWord).toLowerCase();
    }
    return String(displayWord || '').toLowerCase();
  }

  function isWordSavedInWritableFolders(displayWord, entry) {
    const w = saveLemma(displayWord, entry);
    return listFoldersForPicker().some(
      (f) => Array.isArray(f.words) && f.words.some((x) => x.en.toLowerCase() === w)
    );
  }

  let activeTarget = null;
  let popoverEl = null;

  function getFolders() {
    try {
      const s = localStorage.getItem(FOLDER_KEY);
      return s ? JSON.parse(s) : [];
    } catch (_) {
      return [];
    }
  }

  function saveFolders(arr) {
    try {
      localStorage.setItem(FOLDER_KEY, JSON.stringify(arr));
    } catch (e) {
      alert('無法寫入 Vocab7000 資料夾：' + (e && e.message ? e.message : e));
    }
  }

  function isWordSavedAnywhere(displayWord, entry) {
    if (!isTeacherMode()) return isWordSavedInWritableFolders(displayWord, entry);
    const w = saveLemma(displayWord, entry);
    return getFolders().some((f) => Array.isArray(f.words) && f.words.some((x) => x.en.toLowerCase() === w));
  }

  function toggleWordInFolder(folderId, wordObj) {
    const folders = getFolders();
    const f = folders.find((x) => x.id === folderId);
    if (!f) return false;
    if (!isTeacherMode() && isFolderLocked(f)) {
      toast('此資料夾為教師段考字表，學生無法修改');
      return false;
    }
    if (!Array.isArray(f.words)) f.words = [];
    const idx = f.words.findIndex((x) => x.en.toLowerCase() === wordObj.en.toLowerCase());
    if (idx > -1) {
      f.words.splice(idx, 1);
      saveFolders(folders);
      return false;
    }
    f.words.push(wordObj);
    saveFolders(folders);
    return true;
  }

  function escHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function starSvg(saved) {
    if (saved) {
      return `<svg viewBox="0 0 24 24" fill="#f43f5e" stroke="#f43f5e" stroke-width="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
    }
    return `<svg viewBox="0 0 24 24" fill="#FFD700" stroke="#FFD700" stroke-width="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
  }

  function entryToWordObj(displayWord, entry, zhExtra) {
    const e0 = (entry && entry.entries && entry.entries[0]) || {};
    let pos = (e0.pos || 'n.').replace(/\s*\[.*?\]/g, '').trim();
    let zh = (e0.zh || zhExtra || '').trim();
    if (!zh && entry && entry.core7000) zh = '（7000 單，請在 Vocab7000 補充或練習）';
    const lemma = saveLemma(displayWord, entry);
    const surface = String(displayWord || '')
      .toLowerCase()
      .replace(/[.,!?;:'"()]/g, '');
    const out = {
      en: lemma,
      zh,
      pos: pos || 'n./v.',
      level: entry && entry.level ? entry.level : 0,
      custom: true
    };
    if (surface && surface !== lemma) out.fromText = displayWord;
    return out;
  }

  function toast(msg) {
    let t = document.getElementById('cvToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'cvToast';
      t.className = 'cv-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2400);
  }

  function buildFolderButtons(displayWord, entry, zhExtra) {
    const folders = listFoldersForPicker();
    if (!folders.length) {
      const hint = isTeacherMode()
        ? '💡 請先至 <b>Vocab7000</b> 建立資料夾'
        : '💡 請在 Vocab7000 建立<strong>自己的</strong>資料夾（段考 1-264／265-528／1-528 為教師字表，無法從檢討卷修改）';
      return `<p class="pop-folder-hint">${hint}</p>`;
    }
    return folders
      .map((f) => {
        const locked = isFolderLocked(f);
        const lemma = saveLemma(displayWord, entry);
        const inThis = Array.isArray(f.words) && f.words.some((x) => x.en.toLowerCase() === lemma);
        const fid = escHtml(f.id);
        const fname = escHtml(f.name);
        const cls = `pop-folder-btn ${inThis ? 'has-word' : ''} ${locked && isTeacherMode() ? 'locked' : ''}`;
        const lockHint = locked && isTeacherMode() ? ' 🔒' : '';
        return `<button type="button" class="${cls}" data-folder-id="${fid}" data-locked="${locked ? '1' : '0'}" title="${locked ? '段考字表（Vocab7000 內亦不可改）' : ''}">📁 ${fname}${inThis ? ' ✓' : ''}${lockHint}</button>`;
      })
      .join('');
  }

  function folderPanelHtml(displayWord, entry, zhExtra, hidden) {
    const vis = hidden ? ' style="display:none"' : '';
    return `<div class="pop-folder-panel"${vis}>
      <div class="pop-folder-title">📌 存入 Vocab7000 資料夾：</div>
      <div class="pop-folder-grid">${buildFolderButtons(displayWord, entry, zhExtra)}</div>
    </div>`;
  }

  function bindStarToggle(pop, displayWord, entry, zhExtra) {
    const star = pop.querySelector('.pop-star-svg-btn');
    const panel = pop.querySelector('.pop-folder-panel');
    if (!star || !panel) return;
    star.style.cursor = 'pointer';
    star.setAttribute('role', 'button');
    star.setAttribute('tabindex', '0');
    star.title = '點擊顯示資料夾（存入 Vocab7000）';
    const toggle = (e) => {
      if (e) e.stopPropagation();
      const opening = panel.style.display === 'none';
      panel.style.display = opening ? 'block' : 'none';
      star.classList.toggle('is-open', opening);
      if (opening && activeTarget) positionPopover(activeTarget);
    };
    star.onclick = toggle;
    star.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle(e);
      }
    };
  }

  function bindPopoverCommon(pop, displayWord, entry, zhExtra, target) {
    const review = window.Review;
    pop.querySelector('.pop-close').onclick = (e) => {
      e.stopPropagation();
      closePopover();
    };
    const audio = pop.querySelector('.pop-audio-btn');
    if (audio) {
      audio.onclick = (e) => {
        e.stopPropagation();
        review.speak(audio.getAttribute('data-speak') || displayWord);
      };
    }
    bindFolderButtons(pop, displayWord, entry, zhExtra);
    bindStarToggle(pop, displayWord, entry, zhExtra);
  }

  function bindFolderButtons(pop, displayWord, entry, zhExtra) {
    pop.querySelectorAll('.pop-folder-btn').forEach((btn) => {
      if (btn.getAttribute('data-locked') === '1' && !isTeacherMode()) return;
      btn.onclick = (e) => {
        e.stopPropagation();
        if (btn.getAttribute('data-locked') === '1' && !isTeacherMode()) {
          toast('此資料夾為教師段考字表，學生無法修改');
          return;
        }
        const folderId = btn.getAttribute('data-folder-id');
        const wordObj = entryToWordObj(displayWord, entry, zhExtra);
        const added = toggleWordInFolder(folderId, wordObj);
        if (added) {
          btn.classList.add('has-word');
          if (!btn.textContent.includes('✓')) btn.textContent = btn.textContent.trim() + ' ✓';
          if (wordObj.fromText) toast(`已存入原形：${wordObj.en}（文中 ${wordObj.fromText}）`);
        } else {
          btn.classList.remove('has-word');
          btn.textContent = btn.textContent.replace(/\s*✓\s*$/, '');
        }
        const star = pop.querySelector('.pop-star-svg-btn');
        if (star) star.innerHTML = starSvg(isWordSavedAnywhere(displayWord, entry));
      };
    });
  }

  function positionPopover(target) {
    if (!popoverEl || !target) return;
    const rect = target.getBoundingClientRect();
    const margin = 12;
    const gap = 8;
    const maxDefault = 420;

    popoverEl.style.display = 'block';
    popoverEl.style.position = 'fixed';
    popoverEl.style.overflowY = 'auto';
    popoverEl.style.overflowX = 'hidden';
    popoverEl.style.webkitOverflowScrolling = 'touch';

    const popW = popoverEl.offsetWidth || Math.min(295, window.innerWidth - 24);
    let left = rect.left + rect.width / 2 - popW / 2;
    left = Math.max(margin, Math.min(left, window.innerWidth - popW - margin));
    popoverEl.style.left = left + 'px';
    popoverEl.style.right = 'auto';

    const spaceBelow = window.innerHeight - rect.bottom - gap - margin;
    const spaceAbove = rect.top - gap - margin;
    const placeAbove = spaceBelow < 160 && spaceAbove > spaceBelow;

    popoverEl.classList.toggle('pop-above', placeAbove);

    if (placeAbove) {
      popoverEl.style.top = 'auto';
      popoverEl.style.bottom = window.innerHeight - rect.top + gap + 'px';
      popoverEl.style.maxHeight = Math.max(120, Math.min(maxDefault, spaceAbove)) + 'px';
    } else {
      popoverEl.style.bottom = 'auto';
      popoverEl.style.top = rect.bottom + gap + 'px';
      popoverEl.style.maxHeight = Math.max(120, Math.min(maxDefault, spaceBelow)) + 'px';
    }

    const box = popoverEl.getBoundingClientRect();
    if (!placeAbove && box.bottom > window.innerHeight - margin) {
      const shrink = box.bottom - (window.innerHeight - margin);
      const next = Math.max(100, popoverEl.clientHeight - shrink);
      popoverEl.style.maxHeight = next + 'px';
    }
    if (placeAbove && box.top < margin) {
      popoverEl.style.maxHeight = Math.max(100, window.innerHeight - margin * 2) + 'px';
      popoverEl.style.bottom = window.innerHeight - rect.top + gap + 'px';
    }
  }

  function closePopover() {
    if (popoverEl) popoverEl.style.display = 'none';
    activeTarget = null;
    if (window.Review && window.Review.closePopup) window.Review.closePopup();
  }

  function ensurePopover() {
    if (popoverEl) return popoverEl;
    popoverEl = document.createElement('div');
    popoverEl.id = 'wordPopover';
    popoverEl.className = 'global-popover';
    popoverEl.style.display = 'none';
    document.body.appendChild(popoverEl);
    return popoverEl;
  }

  function renderPopoverHtml(displayWord, entry, zhExtra, dictHtml) {
    const review = window.Review;
    const e0 = (entry && entry.entries && entry.entries[0]) || {};
    const lv = entry && entry.level ? entry.level : 0;
    const lvColor = LV_COLORS[lv] || '#94a3b8';
    const saved = isWordSavedAnywhere(displayWord, entry);
    const rich = review.hasRichZh && review.hasRichZh(entry);
    const ipa = e0.ipa ? `<span class="pop-symbol">${escHtml(e0.ipa)}</span>` : '';
    const baseNote =
      entry && entry.base && entry.base !== displayWord.toLowerCase().replace(/[.,!?;:'"()]/g, '')
        ? `<div class="pop-ex">文中 <b>${escHtml(displayWord)}</b>｜原形 <b>${escHtml(entry.base)}</b></div>`
        : '';

    let mainBody = '';
    if (rich) {
      mainBody = `<div class="pop-vocab-body">${review.buildVocabBody(entry)}</div>`;
    } else {
      const pos = e0.pos || (lv ? '7000 單' : '');
      const zh =
        e0.zh ||
        zhExtra ||
        (dictHtml ? '' : entry && entry.core7000 ? '（載入解釋中…）' : '（查無中文，仍可存入資料夾）');
      mainBody = `<div class="pop-zh-row"><span class="pop-pos">${escHtml(pos)}</span> ${escHtml(zh)}</div>
        <div class="pop-dict-extra">${dictHtml || ''}</div>`;
    }

    return `
      <div class="pop-header">
        <span class="pop-star-svg-btn" title="已存入任一資料夾">${starSvg(saved)}</span>
        <span class="pop-title-group">
          <span class="pop-word">${escHtml(displayWord)}</span>
          ${ipa}
          ${lv >= 2 ? `<span class="pop-lv-badge" style="background:${lvColor}">L${lv}</span>` : ''}
        </span>
        <button type="button" class="pop-close" aria-label="關閉">✕</button>
      </div>
      <button type="button" class="pop-audio-btn" data-speak="${escHtml(entry && entry.base ? entry.base : displayWord)}">🔊 發音</button>
      ${mainBody}${baseNote && !rich ? baseNote : ''}
      ${folderPanelHtml(displayWord, entry, zhExtra, true)}`;
  }

  function loadOnlineDict(pop, displayWord, entry, target) {
    const review = window.Review;
    if (!review || !review.fetchContextLookup) return;
    if (entry && review.hasRichZh && review.hasRichZh(entry)) return;

    const lemma = review.toSaveLemma
      ? review.toSaveLemma(displayWord, entry)
      : ((entry && entry.base) || displayWord).toLowerCase().replace(/[.,!?;:'"()]/g, '');
    let box = pop.querySelector('.pop-dict-extra');
    if (!box) {
      box = document.createElement('div');
      box.className = 'pop-dict-extra';
      const panel = pop.querySelector('.pop-folder-panel');
      if (panel) pop.insertBefore(box, panel);
      else pop.appendChild(box);
      box.innerHTML = '<p class="pop-mini">載入線上解釋…</p>';
    }

    review.fetchContextLookup(lemma, displayWord, target, entry).then((bundle) => {
      if (!popoverEl || popoverEl.style.display !== 'block' || !box.isConnected) return;
      const extra = review.formatContextHtml
        ? review.formatContextHtml(bundle)
        : bundle.zh
          ? `<div class="sense"><div class="sense-title"><b>n.</b> ${escHtml(bundle.zh)}</div></div>`
          : '<p class="pop-mini">無法連線載入字典，請用課本或點星星存入 Vocab7000 練習。</p>';
      box.innerHTML = extra;
      const zhRow = pop.querySelector('.pop-zh-row');
      if (zhRow) {
        if (bundle.en) zhRow.style.display = 'none';
        else if (bundle.zh && !(entry && entry.entries && entry.entries[0].zh)) {
          zhRow.innerHTML = `<span class="pop-pos">7000 單</span> ${escHtml(bundle.zh)}`;
        }
      }
      bindFolderButtons(pop, displayWord, entry, bundle.zh);
      if (activeTarget) positionPopover(activeTarget);
    });
  }

  function openWordPopover(displayWord, target, entry) {
    const review = window.Review;
    if (!review) return;

    if (activeTarget === target && popoverEl && popoverEl.style.display === 'block') {
      closePopover();
      return;
    }

    review.closePopup();
    activeTarget = target;
    const pop = ensurePopover();
    pop.innerHTML = renderPopoverHtml(displayWord, entry, '', '<p class="pop-mini">載入線上解釋…</p>');
    positionPopover(target);
    bindPopoverCommon(pop, displayWord, entry, '', target);
    loadOnlineDict(pop, displayWord, entry, target);
  }

  function showWord(displayWord, el) {
    const review = window.Review;
    if (!review) return;
    review.loadCore7000();
    const entry = review.resolveWord(displayWord);
    if (!entry) {
      const pop = ensurePopover();
      activeTarget = el;
      const saved = isWordSavedAnywhere(displayWord, null);
      pop.innerHTML = `
        <div class="pop-header">
          <span class="pop-star-svg-btn">${starSvg(saved)}</span>
          <span class="pop-word">${escHtml(displayWord)}</span>
          <button type="button" class="pop-close">✕</button>
        </div>
        <p class="pop-folder-hint">不在 7000 單 Level 2～6，仍可存入 Vocab7000 資料夾練習。</p>
        <div class="pop-dict-extra"><p class="pop-mini">載入線上解釋…</p></div>
        ${folderPanelHtml(displayWord, null, '', true)}`;
      positionPopover(el);
      bindPopoverCommon(pop, displayWord, null, '', el);
      loadOnlineDict(pop, displayWord, null, el);
      return;
    }
    openWordPopover(displayWord, el, entry);
  }

  function init() {
    const review = window.Review;
    if (!review) return;

    review.showVocab = showWord;
    review.closeWordPopover = closePopover;
    review.getVocab7000Folders = getFolders;

    document.addEventListener('click', (e) => {
      if (popoverEl && popoverEl.style.display === 'block') {
        if (popoverEl.contains(e.target)) return;
        if (e.target.closest('.word')) return;
        closePopover();
      }
    });
    window.addEventListener('scroll', () => {
      if (activeTarget && popoverEl && popoverEl.style.display === 'block') positionPopover(activeTarget);
    }, true);
    window.addEventListener('resize', () => {
      if (activeTarget && popoverEl && popoverEl.style.display === 'block') positionPopover(activeTarget);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
