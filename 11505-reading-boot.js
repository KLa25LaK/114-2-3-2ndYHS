/* 閱讀分頁啟動：確保資料載入後再渲染 */
window.bootReadingPage = function (articleKey) {
  function showErr(msg) {
    const art = document.getElementById('article');
    const qs = document.getElementById('questions');
    const html = `<p class="mini" style="color:#991b1b;font-weight:900">⚠ ${msg}</p><p class="small">請確認以下檔案與本頁同一資料夾：<br>11505-review.js、11505-reading-data.js、11505-reading-vocab.js</p>`;
    if (art) art.innerHTML = html;
    if (qs) qs.innerHTML = '';
  }

  function mountReadingFab() {
    const header = document.querySelector('.top-header');
    const fab = document.querySelector('.fab');
    if (!header || !fab || fab.classList.contains('fab-in-header')) return;
    fab.classList.remove('fab-tools');
    fab.classList.add('fab-in-header');
    header.appendChild(fab);
  }

  function run() {
    const R = window.Review;
    if (!R || typeof R.initReadingArticle !== 'function') {
      showErr('11505-review.js 未正確載入');
      return;
    }
    if (!window.READING11505 || !window.READING11505[articleKey]) {
      showErr('11505-reading-data.js 未載入或文章代碼錯誤：' + articleKey);
      return;
    }
    try {
      document.body.classList.add('page-reading');
      mountReadingFab();
      R.initReadingArticle(articleKey, window.READING11505_VOCAB || {});
      if (R.loadCore7000) R.loadCore7000();
      const pack = window.READING11505[articleKey];
      const btn = document.getElementById('btnFullTrans');
      if (btn && pack) btn.onclick = () => R.showFullTranslation(pack.fullTranslation);
    } catch (e) {
      showErr('渲染失敗：' + (e && e.message ? e.message : e));
      console.error(e);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
};
