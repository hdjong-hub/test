// Algemene toetsmotor voor meerkeuze- en invulvragen.
// Examenmodus: vaste set vragen, timer, terugbladeren, pas na inleveren de uitleg.
// Oefenmodus: eindeloos vragen, direct feedback met uitleg.
//
// Vraagformaat:
// { stem: html, options: [html], answer: index, marks: 1|2|5, explain: html,
//   topic: string, memorize: { html, sec } (optioneel), timeLimit: sec (optioneel) }
function runQuiz(root, opts) {
  const o = Object.assign({ count: 20, timeLimit: 1800, mode: 'exam', sheet: null, noCalc: false }, opts);
  let questions = [];
  let answers = [];
  let flagged = [];
  let seenMemo = [];
  let cur = 0;
  let endAt = 0;
  let timer = null;
  let qTimer = null;
  let finished = false;
  let practiceStats = { right: 0, total: 0, marks: 0, maxMarks: 0, byTopic: {} };

  root.innerHTML = '';
  const head = U.el('div', { class: 'quiz-head' });
  const body = U.el('div', { class: 'quiz-body' });
  const side = U.el('div', { class: 'quiz-side' });
  const wrap = U.el('div', { class: 'quiz-wrap' }, body, side);
  root.append(head, wrap);

  function newQuestion(i) {
    const q = o.generate(i);
    q.marks = q.marks || 1;
    return q;
  }

  function start() {
    if (o.mode === 'exam') {
      questions = [];
      for (let i = 0; i < o.count; i++) questions.push(newQuestion(i));
      // Oplopende moeilijkheid, net als het echte progressieve examen.
      questions.sort((a, b) => (a.order ?? a.marks) - (b.order ?? b.marks));
      answers = questions.map(() => null);
      flagged = questions.map(() => false);
      seenMemo = questions.map(() => false);
      endAt = performance.now() + o.timeLimit * 1000;
      timer = setInterval(tick, 250);
    } else {
      questions = [newQuestion(0)];
      answers = [null];
      seenMemo = [false];
    }
    cur = 0;
    renderHead();
    renderQ();
  }

  function tick() {
    const left = (endAt - performance.now()) / 1000;
    const t = head.querySelector('.timer');
    if (t) {
      t.textContent = U.mmss(left);
      t.classList.toggle('warn', left < 120);
    }
    if (left <= 0) finish(true);
  }

  function renderHead() {
    head.innerHTML = '';
    head.append(U.el('h2', {}, o.title));
    const info = U.el('div', { class: 'quiz-info' });
    if (o.noCalc) info.append(U.el('span', { class: 'tag' }, 'Geen rekenmachine'));
    if (o.mode === 'exam') {
      info.append(U.el('span', { class: 'timer' }, U.mmss(o.timeLimit)));
    } else {
      info.append(U.el('span', { class: 'tag' }, 'Oefenmodus'));
      info.append(U.el('span', { class: 'pstat' }, ''));
      info.append(U.el('button', { class: 'btn small ghost', onclick: () => finish(false) }, 'Stoppen en resultaat'));
    }
    head.append(info);
    renderSide();
  }

  function renderSide() {
    side.innerHTML = '';
    if (o.mode === 'exam') {
      const grid = U.el('div', { class: 'qgrid' });
      questions.forEach((q, i) => {
        const b = U.el('button', {
          class: 'qnum' + (i === cur ? ' cur' : '') + (answers[i] !== null ? ' done' : '') + (flagged[i] ? ' flag' : ''),
          onclick: () => { cur = i; renderQ(); },
        }, String(i + 1));
        grid.append(b);
      });
      side.append(U.el('h4', {}, 'Vragen'), grid);
      side.append(U.el('button', { class: 'btn danger', onclick: () => {
        const open = answers.filter(a => a === null).length;
        if (!open || confirm(`Er staan nog ${open} vragen open. Toch inleveren?`)) finish(false);
      } }, 'Inleveren'));
    }
    if (o.sheet) {
      const det = U.el('details', { class: 'sheet' }, U.el('summary', {}, 'Formuleblad'), U.el('div', { html: o.sheet }));
      side.append(det);
    }
    if (o.noCalc) {
      side.append(U.el('p', { class: 'muted small' }, 'Tip: gebruik pen en kladpapier, net als op de assessment dag.'));
    }
  }

  function renderQ() {
    clearInterval(qTimer);
    const q = questions[cur];
    body.innerHTML = '';
    if (o.mode === 'exam') renderSide();
    const n = U.el('div', { class: 'qmeta' },
      o.mode === 'exam' ? `Vraag ${cur + 1} van ${questions.length}` : `Vraag ${practiceStats.total + 1}`,
      U.el('span', { class: 'marks' }, `${q.marks} ${q.marks === 1 ? 'punt' : 'punten'}`),
      q.topic ? U.el('span', { class: 'topic' }, q.topic) : null);
    body.append(n);

    if (q.memorize && !seenMemo[cur]) {
      const box = U.el('div', { class: 'memo' });
      const cd = U.el('div', { class: 'memo-cd' });
      box.append(U.el('p', { class: 'muted' }, 'Onthoud het volgende:'), U.el('div', { class: 'memo-content', html: q.memorize.html }), cd);
      body.append(box);
      let left = q.memorize.sec;
      cd.textContent = left + ' s';
      qTimer = setInterval(() => {
        left--;
        cd.textContent = left + ' s';
        if (left <= 0) { clearInterval(qTimer); seenMemo[cur] = true; renderQ(); }
      }, 1000);
      return;
    }

    body.append(U.el('div', { class: 'stem', html: q.stem }));
    const list = U.el('div', { class: 'opts' });
    const letters = 'ABCDEF';
    q.options.forEach((opt, i) => {
      const b = U.el('button', { class: 'opt' + (answers[cur] === i ? ' sel' : ''), onclick: () => choose(i) },
        U.el('span', { class: 'ol' }, letters[i]), U.el('span', { class: 'ot', html: opt }));
      list.append(b);
    });
    body.append(list);

    // Sommige vragen (geheugen, snelheid) hebben een eigen tijdslimiet.
    if (q.timeLimit && answers[cur] === null) {
      const bar = U.el('div', { class: 'qbar' }, U.el('div'));
      body.append(bar);
      const t0 = performance.now();
      qTimer = setInterval(() => {
        const f = 1 - (performance.now() - t0) / (q.timeLimit * 1000);
        bar.firstChild.style.width = Math.max(0, f * 100) + '%';
        if (f <= 0) {
          clearInterval(qTimer);
          if (answers[cur] === null) { answers[cur] = -1; afterAnswer(); }
        }
      }, 100);
    }

    if (o.mode === 'exam') {
      const nav = U.el('div', { class: 'qnav' },
        U.el('button', { class: 'btn', onclick: () => { if (cur > 0) { cur--; renderQ(); } } }, '← Vorige'),
        U.el('button', { class: 'btn ghost', onclick: () => { flagged[cur] = !flagged[cur]; renderSide(); } }, flagged[cur] ? 'Markering weg' : 'Markeer'),
        U.el('button', { class: 'btn', onclick: () => { if (cur < questions.length - 1) { cur++; renderQ(); } } }, 'Volgende →'));
      body.append(nav);
    }
    // Sneltoetsen 1-4 / A-D.
    keyHandler = e => {
      const idx = '1234'.indexOf(e.key) >= 0 ? '1234'.indexOf(e.key) : 'abcd'.indexOf(e.key.toLowerCase());
      if (idx >= 0 && idx < q.options.length && document.activeElement.tagName !== 'INPUT') choose(idx);
    };
  }

  let keyHandler = null;
  const onKey = e => keyHandler && keyHandler(e);
  window.addEventListener('keydown', onKey);

  function choose(i) {
    if (finished) return;
    if (o.mode === 'practice' && answers[cur] !== null) return;
    const q = questions[cur];
    if (o.mode === 'exam' && (q.memorize || q.timeLimit) && answers[cur] !== null) return;
    answers[cur] = i;
    afterAnswer();
  }

  function afterAnswer() {
    clearInterval(qTimer);
    const q = questions[cur];
    if (o.mode === 'exam') {
      // Geheugen- en tijdvragen kun je niet opnieuw beantwoorden.
      if (q.memorize || q.timeLimit) seenMemo[cur] = true;
      if (cur < questions.length - 1) { cur++; renderQ(); } else renderQ();
      return;
    }
    // Oefenmodus: direct feedback.
    const ok = answers[cur] === q.answer;
    practiceStats.total++;
    practiceStats.maxMarks += q.marks;
    if (ok) { practiceStats.right++; practiceStats.marks += q.marks; }
    const t = q.topic || 'Overig';
    practiceStats.byTopic[t] = practiceStats.byTopic[t] || { r: 0, n: 0 };
    practiceStats.byTopic[t].n++;
    if (ok) practiceStats.byTopic[t].r++;
    const ps = head.querySelector('.pstat');
    if (ps) ps.textContent = `${practiceStats.right}/${practiceStats.total} goed`;
    body.querySelectorAll('.opt').forEach((b, i) => {
      b.disabled = true;
      if (i === q.answer) b.classList.add('good');
      else if (i === answers[cur]) b.classList.add('bad');
    });
    body.append(U.el('div', { class: 'explain ' + (ok ? 'ok' : 'nok') },
      U.el('strong', {}, ok ? 'Goed! ' : (answers[cur] === -1 ? 'Te laat. ' : 'Fout. ')),
      U.el('span', { html: q.explain || '' })));
    const next = U.el('button', { class: 'btn primary', onclick: nextPractice }, 'Volgende vraag (spatie)');
    body.append(U.el('div', { class: 'qnav' }, U.el('span'), next));
    keyHandler = e => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); nextPractice(); } };
  }

  function nextPractice() {
    questions.push(newQuestion(questions.length));
    answers.push(null);
    seenMemo.push(false);
    cur = questions.length - 1;
    renderQ();
  }

  function finish(timeout) {
    if (finished) return;
    finished = true;
    clearInterval(timer); clearInterval(qTimer);
    keyHandler = null;
    let marks = 0, maxMarks = 0, right = 0, total = 0;
    const byTopic = {};
    const qs = o.mode === 'exam' ? questions : questions.slice(0, practiceStats.total);
    qs.forEach((q, i) => {
      maxMarks += q.marks; total++;
      const t = q.topic || 'Overig';
      byTopic[t] = byTopic[t] || { r: 0, n: 0 };
      byTopic[t].n++;
      if (answers[i] === q.answer) { marks += q.marks; right++; byTopic[t].r++; }
    });
    const pct = maxMarks ? Math.round(100 * marks / maxMarks) : 0;
    if (total) Store.add({ module: o.id, title: o.title, mode: o.mode, score: pct, detail: `${marks}/${maxMarks} punten, ${right}/${total} goed` });

    body.innerHTML = '';
    side.innerHTML = '';
    head.querySelector('.quiz-info').innerHTML = '';
    body.append(U.el('div', { class: 'result' },
      U.el('div', { class: 'big ' + (pct >= 70 ? 'ok' : pct >= 50 ? 'mid' : 'nok') }, pct + '%'),
      U.el('p', {}, `${marks} van ${maxMarks} punten, ${right} van ${total} vragen goed.` + (timeout ? ' (Tijd was op.)' : '')),
      U.el('p', { class: 'muted small' }, 'Er is geen officiële slaaggrens bekend. Kandidaten melden dat de score een gewogen gemiddelde is over alle onderdelen. Mik in de training op 80% of hoger.')));
    const tt = U.el('table', { class: 'tbl' }, U.el('tr', {}, U.el('th', {}, 'Onderwerp'), U.el('th', {}, 'Goed')));
    Object.entries(byTopic).sort((a, b) => a[1].r / a[1].n - b[1].r / b[1].n).forEach(([k, v]) =>
      tt.append(U.el('tr', {}, U.el('td', {}, k), U.el('td', {}, `${v.r}/${v.n}`))));
    body.append(U.el('h3', {}, 'Per onderwerp (zwakste bovenaan)'), tt);

    if (o.mode === 'exam') {
      body.append(U.el('h3', {}, 'Nakijken'));
      qs.forEach((q, i) => {
        const ok = answers[i] === q.answer;
        const d = U.el('details', { class: 'review ' + (ok ? 'ok' : 'nok') },
          U.el('summary', {}, `${ok ? '✔' : '✘'} Vraag ${i + 1} (${q.marks}p) ${q.topic ? '· ' + q.topic : ''}`),
          U.el('div', { class: 'stem', html: q.stem }),
          U.el('p', { html: `<b>Jouw antwoord:</b> ${answers[i] === null || answers[i] === -1 ? 'geen' : q.options[answers[i]]}<br><b>Juist:</b> ${q.options[q.answer]}` }),
          U.el('div', { class: 'explain', html: q.explain || '' }));
        body.append(d);
      });
    }
    body.append(U.el('div', { class: 'qnav' },
      U.el('button', { class: 'btn primary', onclick: () => { cleanup(); runQuiz(root, opts); } }, 'Opnieuw'),
      U.el('button', { class: 'btn', onclick: () => { location.hash = '#/'; } }, 'Naar overzicht')));
  }

  function cleanup() {
    clearInterval(timer); clearInterval(qTimer);
    window.removeEventListener('keydown', onKey);
  }

  // Startscherm met uitleg.
  const intro = U.el('div', { class: 'intro' });
  intro.append(U.el('div', { html: o.intro || '' }));
  if (o.mode === 'exam') intro.append(U.el('p', {}, `${o.count} vragen, ${Math.round(o.timeLimit / 60)} minuten. Vragen lopen op in moeilijkheid (1, 2 en 5 punten).`));
  intro.append(U.el('button', { class: 'btn primary', onclick: start }, 'Start'));
  body.append(intro);

  return cleanup;
}
