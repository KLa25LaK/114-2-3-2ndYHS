/* 11505｜大題導覽：點「大題」→ 置中彈窗，六大題一鍵切換 */
(function () {
  const SECTIONS = [
    { file: '11505-Vocab01-10.html', label: '一、詞彙題', range: '1～10', sub: '四選一｜選項可點查字' },
    { file: '11505-Cloze11-20.html', label: '二、綜合測驗', range: '11～20', sub: '馬拉松／斯拉夫姓氏' },
    { file: '11505-VocabSelection21-30.html', label: '三、文意選填', range: '21～30', sub: '外送與幽靈廚房' },
    { file: '11505-Paragraph31-34.html', label: '四、篇章結構', range: '31～34', sub: '互動博物館 AR／VR' },
    { file: '11505-Reading35-46.html', label: '五、閱讀', range: '35～46', sub: '三篇分頁｜證據反白' },
    { file: '11505-Mixed47-50.html', label: '六、混合題', range: '47～50', sub: '希臘 & Caprese 沙拉' }
  ];

  const INDEX_FILE = '11505-index.html';

  function currentFile() {
    const p = window.location.pathname || '';
    const name = p.split('/').pop() || window.location.href.split('/').pop().split('?')[0];
    return name || INDEX_FILE;
  }

  function isIndex() {
    const f = currentFile();
    return f === INDEX_FILE || f === '' || f === 'index.html';
  }

  function currentIndex() {
    const f = currentFile();
    const i = SECTIONS.findIndex((s) => s.file === f);
    if (i >= 0) return i;
    if (/11505-Reading3[59]-/.test(f) || /11505-Reading43-/.test(f)) return 4;
    return -1;
  }

  function sectionGridHtml() {
    const idx = currentIndex();
    return SECTIONS.map((s, i) => {
      const active = i === idx ? ' sec-pick-current' : '';
      return `<a class="sec-pick-item${active}" href="${s.file}">
        <span class="sec-pick-no">${i + 1}</span>
        <span class="sec-pick-body">
          <b>${s.label}</b>
          <em>${s.range}</em>
          <small>${s.sub}</small>
        </span>
      </a>`;
    }).join('');
  }

  function openPicker() {
    closePicker();
    const idx = currentIndex();
    const overlay = document.createElement('div');
    overlay.id = 'secPickerOverlay';
    overlay.className = 'sec-picker-overlay';
    overlay.innerHTML = `
      <div class="sec-picker-dialog" role="dialog" aria-modal="true" aria-labelledby="secPickerTitle">
        <button type="button" class="sec-picker-x" id="secPickerClose" aria-label="關閉">✕</button>
        <h2 id="secPickerTitle" class="sec-picker-title">選擇要檢討的大題</h2>
        <p class="sec-picker-sub">點一下直接進入，不必回封面。</p>
        <div class="sec-picker-grid">${sectionGridHtml()}</div>
        ${idx >= 0 ? `<div class="sec-picker-foot">
          ${idx > 0 ? `<a class="sec-picker-mini" href="${SECTIONS[idx - 1].file}">◀ ${SECTIONS[idx - 1].label}</a>` : '<span></span>'}
          ${idx < SECTIONS.length - 1 ? `<a class="sec-picker-mini" href="${SECTIONS[idx + 1].file}">▶ ${SECTIONS[idx + 1].label}</a>` : '<span></span>'}
        </div>` : ''}
      </div>
    `;
    document.body.appendChild(overlay);
    document.body.classList.add('sec-picker-open');
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePicker();
    });
    document.getElementById('secPickerClose')?.addEventListener('click', closePicker);
  }

  function closePicker() {
    document.getElementById('secPickerOverlay')?.remove();
    document.body.classList.remove('sec-picker-open');
  }

  function buildFab() {
    const idx = currentIndex();
    const fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'sec-nav-fab';
    fab.id = 'secNavToggle';
    fab.title = '切換大題';
    fab.innerHTML = `
      <span class="sec-nav-fab-icon" aria-hidden="true">☰</span>
      <span class="sec-nav-fab-label">大題</span>
      ${idx >= 0 ? `<span class="sec-nav-fab-badge">${idx + 1}/6</span>` : ''}
    `;
    fab.addEventListener('click', openPicker);
    document.body.appendChild(fab);
  }

  function buildMobileJumpBar() {
    if (isIndex()) return;
    const idx = currentIndex();
    if (idx < 0) return;
    const cur = SECTIONS[idx];
    const prev = idx > 0 ? SECTIONS[idx - 1] : null;
    const next = idx < SECTIONS.length - 1 ? SECTIONS[idx + 1] : null;
    const header = document.querySelector('.top-header');
    if (!header) return;

    const bar = document.createElement('div');
    bar.className = 'jump-bar';
    bar.setAttribute('role', 'navigation');
    bar.innerHTML = `
      ${prev ? `<a class="jump-prev" href="${prev.file}">◀ ${prev.label.replace(/^..、/, '')}</a>` : '<span class="jump-spacer"></span>'}
      <button type="button" class="jump-current" id="jumpOpenNav">${cur.label} <span>${cur.range}</span></button>
      ${next ? `<a class="jump-next" href="${next.file}">${next.label.replace(/^..、/, '')} ▶</a>` : '<span class="jump-spacer"></span>'}
    `;
    header.appendChild(bar);
    document.body.classList.add('has-jump-bar');
    document.getElementById('jumpOpenNav')?.addEventListener('click', openPicker);
  }

  function tuneFab() {
    const fab = document.querySelector('.fab');
    if (!fab) return;
    if (/11505-Reading3[59]-/.test(currentFile()) || /11505-Reading43-/.test(currentFile())) return;
    fab.classList.add('fab-tools');
    const homeBtn = fab.querySelector('.btn-home');
    if (homeBtn && !isIndex()) homeBtn.remove();
  }

  function init() {
    const idx = currentIndex();
    if (idx >= 0) document.body.dataset.section = String(idx + 1);
    if (isIndex()) document.body.classList.add('page-index');

    buildFab();
    buildMobileJumpBar();
    tuneFab();

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePicker();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
