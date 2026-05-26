/* 載入教師版詳解 EXP11505，覆寫彈窗內容 */
(function () {
  if (!window.EXP11505 || !window.Review) return;

  function fmt(t) {
    if (!t) return '';
    return String(t)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\t/g, ' ')
      .replace(/►\s*/g, '<br>► ')
      .replace(/\n/g, '<br>');
  }

  function choiceBlock(choices, answer, letters) {
    if (!choices || !Object.keys(choices).length) return '';
    let h = '<div class="wrong"><b>選項詳解</b>';
    letters.forEach((L) => {
      if (!choices[L]) return;
      const ok = L === answer;
      h += `<div class="choiceLine ${ok ? 'choiceCorrect' : 'choiceWrong'}"><b>(${L})</b><br>${fmt(choices[L])}</div>`;
    });
    return h + '</div>';
  }

  function buildPassageDetail(x, n) {
    let body = `<div class="answer-badge">正確答案：(${x.answer})</div>`;
    if (x.steps && x.steps.length) {
      body += '<div class="mini"><b>解題步驟</b><br>' + x.steps.map((s) => fmt(s)).join('<br><br>') + '</div>';
    }
    if (x.reason) {
      body += `<div class="mini"><b>為什麼選這個？</b><br>${fmt(x.reason)}</div>`;
    }
    const letters =
      window.EXP_SECTION === 'paragraph' ? ['A', 'B', 'C', 'D', 'E'] : 'ABCDEFGHIJ'.split('');
    if (window.EXP_SECTION === 'vocabSel' && window.EXP11505.vocabSelChoices) {
      body += '<div class="wrong"><b>選項區字義（A～J）</b>';
      letters.forEach((L) => {
        if (!window.EXP11505.vocabSelChoices[L]) return;
        const ok = L === x.answer;
        body += `<div class="choiceLine ${ok ? 'choiceCorrect' : ''}"><b>(${L})</b><br>${fmt(window.EXP11505.vocabSelChoices[L])}</div>`;
      });
      body += '</div>';
    }
    if (x.choices && Object.keys(x.choices).length) {
      body += choiceBlock(x.choices, x.answer, letters);
    }
    return body;
  }

  window.showMixed49 = function (letter, el) {
    const x = window.EXP11505?.mixed?.['49'];
    if (!x) return;
    const ok = x.answer && x.answer.includes(letter);
    let body = `<div class="mini">${ok ? '✅ 正解' : '❌ 非正解'}</div>`;
    body += choiceBlock(x.options, null, ['A', 'B', 'C', 'D', 'E', 'F']);
    Review.showPopup(Review.item('第 49 題（多選）', body), el);
  };

  window.showMixed50 = function () {
    const x = window.EXP11505?.mixed?.['50'];
    if (!x) return;
    Review.showCenterPopup(
      Review.item('第 50 題', `<div class="answer-badge">正確答案：${x.answer}</div><div class="zh">${fmt(x.note)}</div>`)
    );
  };

  const _showExplain = Review.showExplain;
  Review.showExplain = function (n, el) {
    const sec = window.EXP_SECTION;
    if (sec === 'mixed' && (n === 47 || n === 48)) {
      const fill = window.EXP11505?.mixed?.fillNote || '';
      const x = window.EXP11505?.mixed?.[String(n)];
      let body = `<div class="answer-badge">正確答案：${x?.answer || (n === 47 ? 'strictly' : 'inspiration')}</div>`;
      body += `<div class="zh">${fmt(fill)}</div>`;
      Review.showPopup(Review.item(`${n}. 填充題`, body), el);
      return;
    }
    const x = window.EXP11505?.[sec]?.[String(n)];
    if (x && (sec === 'cloze' || sec === 'vocabSel' || sec === 'paragraph')) {
      const title = `${n}. 答案 (${x.answer})`;
      Review.showPopup(Review.item(title, buildPassageDetail(x, n)), el);
      return;
    }
    _showExplain(n, el);
  };

  const _showVocabOption = Review.showVocabOption;
  Review.showVocabOption = function (no, letter, el) {
    const x = window.EXP11505?.vocab?.[String(no)];
    if (x) {
      const isCorrect = letter === x.answer;
      let body = `<div class="mini">${isCorrect ? '✅ 本題正解' : '❌ 非本題正解'}</div>`;
      if (x.zh) body += `<div class="zh"><b>句意：</b>${fmt(x.zh)}</div>`;
      if (x.options[letter]) {
        body += `<div class="sense">${fmt(x.options[letter])}</div>`;
      }
      body += choiceBlock(x.options, x.answer, ['A', 'B', 'C', 'D']);
      if (x.phrases) {
        body += `<div class="mini"><b>重要字詞＆片語</b><br>${fmt(x.phrases)}</div>`;
      }
      Review.showPopup(Review.item(`第 ${no} 題 (${letter})`, body), el);
      return;
    }
    _showVocabOption(no, letter, el);
  };

  const _showReadingExplain = Review.showReadingExplain;
  Review.showReadingExplain = function (no, letter, el) {
    const q = Review.getReadingQuestion(no);
    const x = window.EXP11505?.reading?.[String(no)];
    if (!q) {
      _showReadingExplain(no, letter, el);
      return;
    }

    Review.clearReadingEvidence();
    Review.highlightReadingEvidence(q.evidenceIds || []);

    document.querySelectorAll(`.opt-btn[data-q="${no}"]`).forEach((btn) => {
      btn.classList.remove('evidence-selected', 'evidence-wrong-pick');
    });
    if (el) el.classList.add(letter === (x?.answer || q.answer) ? 'evidence-selected' : 'evidence-wrong-pick');

    const ans = x?.answer || q.answer;
    const ok = letter === ans;
    let html = `<div class="reading-verdict ${ok ? 'ok' : 'bad'}">${ok ? '✅ 你選的 (' + letter + ') 是正解' : '❌ 你選的 (' + letter + ') 非正解｜正確答案 (' + ans + ')'}</div>`;
    html += `<div class="mini"><b>📍 文章定位</b>：左側 <span class="evidence-label">黃底反白</span> 為依文章脈絡的關鍵句。</div>`;

    if (x?.note) html += `<div class="zh"><b>教師版解析</b><br>${fmt(x.note)}</div>`;
    if (x?.explain && Object.keys(x.explain).length) {
      html += choiceBlock(x.explain, ans, ['A', 'B', 'C', 'D']);
    } else if (q.explain) {
      if (q.explain[ans]) {
        html += `<div class="zh"><b>為什麼 (${ans}) 正確？</b><br>${fmt(q.explain[ans])}</div>`;
      }
      ['A', 'B', 'C', 'D'].forEach((L) => {
        if (L !== ans && q.explain[L]) {
          html += `<div class="choiceLine choiceWrong"><b>(${L})</b> ${fmt(q.explain[L])}</div>`;
        }
      });
    }

    Review.showCenterPopup(Review.item(`第 ${no} 題 (${letter})`, html));
  };

  const _showReadingFullExplain = Review.showReadingFullExplain;
  Review.showReadingFullExplain = function (no, el) {
    const q = Review.getReadingQuestion(no);
    const x = window.EXP11505?.reading?.[String(no)];
    if (!q) {
      _showReadingFullExplain(no, el);
      return;
    }

    Review.clearReadingEvidence();
    Review.highlightReadingEvidence(q.evidenceIds || []);

    const ans = x?.answer || q.answer;
    let html = `<div class="answer-badge">正確答案：${ans}</div>`;
    html += Review.buildReadingOptionsHtml ? Review.buildReadingOptionsHtml(q, ans) : '';
    html += `<div class="mini"><b>📍 文章定位</b>：左側 <span class="evidence-label">黃底反白</span> 為依文章脈絡的關鍵句。</div>`;

    if (x?.note) html += `<div class="zh"><b>教師版解析</b><br>${fmt(x.note)}</div>`;
    if (x?.explain && Object.keys(x.explain).length) {
      html += choiceBlock(x.explain, ans, ['A', 'B', 'C', 'D']);
    } else if (q.explain) {
      if (q.explain[ans]) {
        html += `<div class="zh"><b>為什麼 (${ans}) 正確？</b><br>${fmt(q.explain[ans])}</div>`;
      }
      ['A', 'B', 'C', 'D'].forEach((L) => {
        if (L !== ans && q.explain[L]) {
          html += `<div class="choiceLine choiceWrong"><b>(${L})</b> ${fmt(q.explain[L])}</div>`;
        }
      });
    }

    Review.showCenterPopup(Review.item(`第 ${no} 題｜完整解析`, html));
  };

  const _showChoice = Review.showChoice;
  Review.showChoice = function (letter, el) {
    if (window.EXP_SECTION === 'vocabSel' && window.EXP11505?.vocabSelChoices) {
      const word = window.EXP11505.vocabSelChoices[letter];
      const correctNo = Object.entries(window.EXP11505.vocabSel || {}).find(
        ([, v]) => v.answer === letter
      )?.[0];
      let body = word ? `<div class="sense">${fmt(word)}</div>` : '';
      if (correctNo) {
        body += `<div class="mini"><b>本篇正確位置：</b>第 ${correctNo} 格</div>`;
        const det = window.EXP11505.vocabSel[correctNo];
        if (det) body += buildPassageDetail(det, correctNo);
      } else {
        body += '<div class="mini">此選項在本篇其他空格不適用。</div>';
      }
      Review.showPopup(Review.item(`(${letter}) 選項說明`, body), el);
      return;
    }
    _showChoice(letter, el);
  };

  /* 閱讀題：以教師版為準更新正解標示 */
  function syncReadingAnswers() {
    const E = window.EXP11505.reading;
    if (!E) return;
    document.querySelectorAll('#questions .q-card').forEach((card) => {
      const title = card.querySelector('.q-title');
      if (!title) return;
      const m = title.textContent.match(/^(\d+)\./);
      if (!m) return;
      const no = m[1];
      const x = E[no];
      if (!x) return;
      const badge = card.querySelector('.answer-badge');
      if (badge) badge.textContent = '正確答案：' + x.answer;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncReadingAnswers);
  } else {
    setTimeout(syncReadingAnswers, 0);
  }
})();
