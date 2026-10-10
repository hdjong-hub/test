// Hoofdapp: navigatie, controller-instellingen, voortgang en informatiepagina's.
const App = (() => {
  const view = document.getElementById('view');
  let cleanup = null;

  const MODULES = [
    { id: 'maths', group: 'Kennis', title: 'Maths', time: '30 min · 20 vragen', desc: 'Hoofdrekenen, staartdelingen, snelheid-afstand-tijd, algebra. Geen rekenmachine. Vragen van 1, 2 en 5 punten.' },
    { id: 'physics', group: 'Kennis', title: 'Physics', time: '30 min · 20 vragen', desc: 'Circuits, momenten, golven, energie, gaswetten, krachten, druk. Met formuleblad.' },
    { id: 'technical', group: 'Kennis', title: 'Technical reasoning', time: '20 min · 25 vragen', desc: 'Tandwielen, riemen, hefbomen, katrollen, veren, hydrauliek. Meerkeuze met tekeningen.' },
    { id: 'cognitive', group: 'Cognitief', title: 'Cognitive', time: '15 min · 25 vragen', desc: 'Geheugen (5 s kijken), reeksen, patronen, mentale rotatie, koers en zon, instrumenten, waarnemingssnelheid.' },
    { id: 'aviation', group: 'Kennis', title: 'Aviation knowledge', time: 'optioneel · 20 vragen', desc: 'Basis luchtvaartkennis: principles of flight, meteo, navigatie, air law, CRM. Handig voor het interview.' },
    { id: 'ball', group: 'Psychomotoriek', title: 'Ball game', time: '3 min gescoord', desc: 'Houd de bal in het midden met stick (of pedalen voor links/rechts). Optioneel extra pedaaltaak.' },
    { id: 'fast', group: 'Psychomotoriek', title: 'FAST multitask', time: '2 runs', desc: 'Route vliegen, verkeer en waypoints melden, ATC luisteren en vragen beantwoorden tegelijk.' },
    { id: 'flight', group: 'Psychomotoriek', title: 'Fixed wing', time: 'tot 15 min', desc: 'Vliegsimulatie: hoogte, snelheid en koers vasthouden met stick, throttle en pedalen.' },
    { id: 'stage3', group: 'Stage 3', title: 'Interview & groepsopdracht', time: 'voorbereiding', desc: 'Competenties, veelgestelde vragen en tips voor de groepsoefening.' },
  ];

  const QUIZ = {
    maths: () => ({ title: 'Maths', count: 20, timeLimit: 1800, noCalc: true, gen: (i, n) => MathGen.generate(i, n),
      intro: '<p>Zoals gemeld door kandidaten: 30 minuten, geen rekenmachine, vragen van 1, 2 en 5 punten. Nadruk op hoofdrekenen, lange vermenigvuldigingen en delingen en snelheid-afstand-tijd.</p>' }),
    physics: () => ({ title: 'Physics', count: 20, timeLimit: 1800, noCalc: true, sheet: PhysicsGen.SHEET, gen: (i, n) => PhysicsGen.generate(i, n),
      intro: '<p>GCSE / havo-vwo niveau: circuits, momenten, golven, energie, gaswetten. De laatste vragen zijn 5 punten waard, bewaar daar tijd voor. Er is een formuleblad (zoals op de dag).</p>' }),
    technical: () => ({ title: 'Technical reasoning', count: 25, timeLimit: 1200, gen: () => TechGen.generate(),
      intro: '<p>CAE noemt een "multiple-choice test of technical reasoning". Mechanisch inzicht: draairichtingen, overbrengingen, hefbomen en krachten.</p>' }),
    cognitive: () => ({ title: 'Cognitive', count: 25, timeLimit: 900, gen: () => CogGen.generate(),
      intro: '<p>Patroon- en vormherkenning en kortetermijngeheugen: je ziet iets 5 seconden en kiest daarna uit vier opties. Sommige vragen hebben een eigen tijdslimiet; dat zie je aan de balk.</p>' }),
    aviation: () => ({ title: 'Aviation knowledge', count: 20, timeLimit: 1200, gen: () => AviationGen.generate(),
      intro: '<p>Niet verplicht voor Generation easyJet (geen voorkennis vereist), maar sommige ADAPT-versies hebben dit deel en het helpt bij het interview.</p>' }),
  };

  function route() {
    if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
    try { speechSynthesis.cancel(); } catch (e) {}
    const h = location.hash.replace(/^#\/?/, '');
    const [page, arg] = h.split('/');
    document.querySelectorAll('nav a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#/' + (page || '')));
    view.innerHTML = '';
    window.scrollTo(0, 0);
    if (!page) return home();
    if (page === 'setup') return setup();
    if (page === 'results') return results();
    if (page === 'info') return info();
    if (page === 'stage3') return stage3();
    if (page === 'ball') { cleanup = runBallGame(view); return; }
    if (page === 'fast') { cleanup = runFast(view); return; }
    if (page === 'flight') { cleanup = runFlight(view); return; }
    if (QUIZ[page]) return quizPage(page, arg);
    home();
  }

  function quizPage(id, mode) {
    const q = QUIZ[id]();
    if (!mode) {
      view.append(U.el('h2', {}, q.title), U.el('div', { class: 'card', html: q.intro }),
        U.el('div', { class: 'cards2' },
          U.el('a', { class: 'card link', href: `#/${id}/exam` }, U.el('h3', {}, 'Examenmodus'), U.el('p', {}, `${q.count} vragen, ${Math.round(q.timeLimit / 60)} minuten, nakijken aan het eind.`)),
          U.el('a', { class: 'card link', href: `#/${id}/practice` }, U.el('h3', {}, 'Oefenmodus'), U.el('p', {}, 'Onbeperkt vragen zonder tijdsdruk, direct uitleg na elk antwoord.'))));
      return;
    }
    cleanup = runQuiz(view, {
      id, title: q.title + (mode === 'exam' ? ' · examen' : ' · oefenen'), mode, count: q.count, timeLimit: q.timeLimit, sheet: q.sheet, noCalc: q.noCalc,
      intro: q.intro, generate: i => q.gen(i, mode === 'exam' ? q.count : 0),
    });
  }

  function home() {
    const hist = Store.all();
    const best = {};
    hist.forEach(h => { best[h.module] = Math.max(best[h.module] ?? 0, h.score); });
    view.append(U.el('section', { class: 'hero' },
      U.el('h1', {}, 'Generation easyJet · CAE assessment trainer'),
      U.el('p', {}, 'Oefen alle onderdelen van de CAE Stage 2 (ADAPT) assessment: kennis, cognitief en psychomotoriek met joystick, throttle en voetpedalen. Plus voorbereiding op Stage 3.'),
      U.el('div', { class: 'row' },
        U.el('a', { class: 'btn primary', href: '#/setup' }, '1. Controller instellen'),
        U.el('a', { class: 'btn', href: '#/info' }, 'Wat staat je te wachten?'))));
    const groups = {};
    MODULES.forEach(m => { (groups[m.group] = groups[m.group] || []).push(m); });
    for (const [g, list] of Object.entries(groups)) {
      view.append(U.el('h3', { class: 'group' }, g));
      const wrap = U.el('div', { class: 'cards' });
      list.forEach(m => {
        const key = m.id === 'maths' ? 'maths' : m.id;
        wrap.append(U.el('a', { class: 'card link', href: '#/' + m.id },
          U.el('div', { class: 'card-top' }, U.el('h3', {}, m.title), best[key] !== undefined ? U.el('span', { class: 'badge' }, 'best ' + best[key] + '%') : null),
          U.el('p', { class: 'muted small' }, m.time), U.el('p', {}, m.desc)));
      });
      view.append(wrap);
    }
    view.append(U.el('div', { class: 'card' }, U.el('h3', {}, 'Volledige proefdag'),
      U.el('p', {}, 'Op de echte dag kies je zelf de volgorde van de tests en mag je tussendoor pauzeren, maar een gestarte test kun je niet pauzeren. Doe voor een generale repetitie op één dag: Maths en Physics in examenmodus, Cognitive, FAST (2 runs), Fixed wing 2 (15 min) en de Ball game (3 min). Leg pen, papier en een formuleblad klaar.')));
  }

  function setup() {
    view.append(U.el('h2', {}, 'Controller instellen'));
    const pads = U.el('div', { class: 'card' });
    const binds = U.el('div', { class: 'card' });
    const live = U.el('div', { class: 'card' });
    view.append(pads, binds, live);
    binds.append(U.el('p', {}, 'Klik op "Koppel" en beweeg daarna de betreffende as volledig (of druk de knop in). Werkt met meerdere apparaten tegelijk, bijvoorbeeld joystick + losse pedalen + throttle.'),
      U.el('p', { class: 'muted small' }, 'Joystick met alleen X en Y en een Z-as voor gas? Koppel X aan Roll, Y aan Pitch en Z aan Throttle. Twist kun je leeg laten; de app gebruikt dan stick links/rechts. Gaat het gas de verkeerde kant op, zet dan Omkeren aan bij Throttle.'),
      U.el('p', { class: 'muted small' }, 'Zie je geen apparaat? Druk eerst een knop in op elk apparaat. Browsers tonen controllers pas na de eerste invoer. Chrome en Edge werken het best.'));
    const table = U.el('table', { class: 'tbl' });
    binds.append(table);
    const dzIn = U.el('input', { type: 'range', min: 0, max: 0.2, step: 0.01, value: Input.cfg.deadzone, oninput: e => { Input.setDeadzone(+e.target.value); dzv.textContent = (+e.target.value).toFixed(2); } });
    const dzv = U.el('span', {}, Input.cfg.deadzone.toFixed(2));
    binds.append(U.el('label', { class: 'field' }, U.el('span', {}, 'Dode zone'), dzIn, dzv));

    function renderBinds() {
      table.innerHTML = '';
      table.append(U.el('tr', {}, ...['Functie', 'Gekoppeld aan', 'Omkeren', ''].map(h => U.el('th', {}, h))));
      for (const [k, f] of Object.entries(Input.FUNCS)) {
        const b = Input.cfg.bindings[k];
        const desc = b ? `${b.id.slice(0, 32)} · ${f.type === 'axis' ? 'as ' + b.axis : 'knop ' + b.button}` : U.el('span', { class: 'muted' }, 'toetsenbord');
        const inv = U.el('input', { type: 'checkbox', onchange: e => Input.setInvert(k, e.target.checked) });
        inv.checked = !!(b && b.inv);
        if (!b || f.type !== 'axis') inv.disabled = true;
        const btn = U.el('button', { class: 'btn small', onclick: () => {
          btn.textContent = 'Beweeg nu...'; btn.disabled = true;
          Input.detect(k, () => renderBinds(), () => renderBinds());
        } }, 'Koppel');
        const clr = U.el('button', { class: 'btn small ghost', onclick: () => { Input.clear(k); renderBinds(); } }, 'Wis');
        table.append(U.el('tr', {}, U.el('td', {}, f.label), U.el('td', {}, desc), U.el('td', {}, inv), U.el('td', {}, btn, ' ', clr)));
      }
    }
    renderBinds();

    live.append(U.el('h3', {}, 'Live test'));
    const bars = U.el('div', { class: 'bars' });
    live.append(bars, U.el('p', { class: 'muted small' }, 'Controle: stick naar achteren = Pitch positief, stick naar rechts = Roll positief, rechterpedaal = Roer positief, gas vol = Throttle 100%. Klopt een richting niet? Zet "Omkeren" aan.'),
      U.el('p', { class: 'muted small', html: 'Toetsenbord als reserve: pijltjes = stick, <kbd>Q</kbd>/<kbd>E</kbd> = twist, <kbd>Z</kbd>/<kbd>X</kbd> = pedalen, <kbd>W</kbd>/<kbd>S</kbd> = gas, <kbd>G</kbd>/spatie = groen, <kbd>R</kbd>/Enter = rood.' }));
    let raf;
    const loop = () => {
      const list = Input.pads();
      pads.innerHTML = '<h3>Gevonden apparaten</h3>' + (list.length ? list.map(p => `<div class="pad"><b>#${p.index}</b> ${p.id}<div class="axes">${p.axes.map((v, i) => `<span title="as ${i}">as ${i}: <i style="--v:${((v + 1) / 2 * 100).toFixed(0)}%"></i></span>`).join('')}</div></div>`).join('') : '<p class="muted">Nog geen apparaten. Druk op een knop van je joystick of pedalen.</p>');
      const s = Input.state();
      bars.innerHTML = ['pitch', 'roll', 'twist', 'rudder'].map(k => `<div class="bar"><span>${k}</span><i style="--v:${((s[k] + 1) / 2 * 100).toFixed(0)}%"></i><b>${s[k].toFixed(2)}</b></div>`).join('') +
        `<div class="bar"><span>throttle</span><i style="--v:${(s.throttle * 100).toFixed(0)}%"></i><b>${Math.round(s.throttle * 100)}%</b></div>` +
        `<div class="bar"><span>knoppen</span><em class="${s.green ? 'on g' : ''}">groen</em><em class="${s.red ? 'on r' : ''}">rood</em></div>`;
      raf = requestAnimationFrame(loop);
    };
    loop();
    cleanup = () => { cancelAnimationFrame(raf); Input.cancelDetect(); };
  }

  function results() {
    const hist = Store.all().slice().reverse();
    view.append(U.el('h2', {}, 'Voortgang'));
    if (!hist.length) { view.append(U.el('p', { class: 'muted' }, 'Nog geen resultaten. Maak een toets of speel een psychomotorische test.')); return; }
    // Gemiddelde per module (laatste 5) als korte trend.
    const per = {};
    Store.all().forEach(h => { (per[h.title] = per[h.title] || []).push(h.score); });
    const sum = U.el('div', { class: 'cards' });
    Object.entries(per).forEach(([k, v]) => {
      const last5 = v.slice(-5), avg = Math.round(last5.reduce((a, b) => a + b, 0) / last5.length);
      const spark = v.slice(-20).map((x, i, a) => `${(i / Math.max(1, a.length - 1)) * 100},${40 - x * 0.4}`).join(' ');
      sum.append(U.el('div', { class: 'card' }, U.el('h3', {}, k), U.el('p', {}, `Gem. laatste 5: ${avg}% · ${v.length}× gedaan`),
        U.el('div', { html: `<svg viewBox="0 0 100 40" preserveAspectRatio="none" class="spark"><polyline points="${spark}" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>` })));
    });
    view.append(sum);
    const t = U.el('table', { class: 'tbl' }, U.el('tr', {}, ...['Datum', 'Onderdeel', 'Modus', 'Score', 'Details'].map(h => U.el('th', {}, h))));
    hist.forEach(h => t.append(U.el('tr', {}, U.el('td', {}, new Date(h.date).toLocaleString('nl-NL')), U.el('td', {}, h.title), U.el('td', {}, h.mode || ''), U.el('td', {}, h.score + '%'), U.el('td', { class: 'small' }, h.detail || ''))));
    view.append(t, U.el('button', { class: 'btn ghost', onclick: () => { if (confirm('Alle resultaten wissen?')) { Store.clear(); route(); } } }, 'Resultaten wissen'));
  }

  function info() {
    view.append(U.el('div', { class: 'card prose', html: INFO_HTML }));
  }
  function stage3() {
    view.append(U.el('div', { class: 'card prose', html: STAGE3_HTML }));
    const qs = STAGE3_QUESTIONS;
    const box = U.el('div', { class: 'card' });
    const show = () => {
      box.innerHTML = '';
      const q = U.pick(qs);
      let secs = 0;
      const tm = U.el('span', { class: 'tag' }, '0:00');
      const iv = setInterval(() => { secs++; tm.textContent = U.mmss(secs); }, 1000);
      cleanup = () => clearInterval(iv);
      box.append(U.el('h3', {}, 'Oefen hardop (STAR-methode)'), U.el('p', { class: 'bigq' }, q[0]), U.el('p', { class: 'muted small' }, 'Competentie: ' + q[1]), tm,
        U.el('div', { class: 'qnav' }, U.el('button', { class: 'btn primary', onclick: () => { clearInterval(iv); show(); } }, 'Volgende vraag')));
    };
    show();
    view.append(box);
  }

  window.addEventListener('hashchange', route);
  window.addEventListener('gamepadconnected', () => {});
  route();
  return { route };
})();
