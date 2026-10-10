// FAST multitask: vlieg een route op een bewegende kaart en doe tegelijkertijd:
//  - groene knop zodra je ander verkeer ziet
//  - rode knop bij elk waypoint / elke bocht
//  - obstakels (masten) ontwijken
//  - luisteren naar ATC (alleen jouw callsign telt)
//  - meerkeuzevragen over wat er gebeurde, plus snelle rekensommen
// Daarna wordt de run herhaald met dezelfde route. Kandidaten melden dat je moet laten zien dat je verbetert.
function runFast(root) {
  const SKEY = 'cae_fast_settings_v1';
  let st = { duration: 240, steer: 'roll', speech: true, level: 2 };
  try { st = Object.assign(st, JSON.parse(localStorage.getItem(SKEY) || '{}')); } catch (e) {}
  const saveSt = () => { try { localStorage.setItem(SKEY, JSON.stringify(st)); } catch (e) {} };
  let raf = null, cleanupKeys = null, briefIv = null;
  const results = [];
  let seed = Math.floor(Math.random() * 1e9);

  root.innerHTML = '';
  const panel = U.el('div', { class: 'card' });
  root.append(U.el('h2', {}, 'FAST multitask'), panel);

  function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  function settings() {
    stopAll();
    panel.innerHTML = '';
    const sel = (label, key, options) => {
      const s = U.el('select', { onchange: e => { st[key] = isNaN(+e.target.value) ? e.target.value : +e.target.value; saveSt(); } });
      options.forEach(([v, t]) => { const o = U.el('option', { value: v }, t); if (String(st[key]) === String(v)) o.selected = true; s.append(o); });
      return U.el('label', { class: 'field' }, U.el('span', {}, label), s);
    };
    const sp = U.el('input', { type: 'checkbox', onchange: e => { st.speech = e.target.checked; saveSt(); } });
    sp.checked = st.speech;
    panel.append(
      U.el('div', { html: `
        <p>Je vliegt over een kaart (koers omhoog). Taken tegelijk:</p>
        <ul>
          <li><b>Sturen:</b> blijf op de witte routelijn (stick links/rechts of pedalen).</li>
          <li><b>Groene knop</b> (of <kbd>G</kbd>/<kbd>spatie</kbd>): zodra je ander verkeer ziet.</li>
          <li><b>Rode knop</b> (of <kbd>R</kbd>/<kbd>Enter</kbd>): op het moment dat je een waypoint passeert.</li>
          <li><b>Masten</b> (rode driehoekjes) niet raken.</li>
          <li><b>ATC:</b> luister naar berichten. Alleen die voor <b>jouw callsign</b> zijn belangrijk.</li>
          <li><b>Vragen</b> rechts: beantwoorden met muis of <kbd>1</kbd>-<kbd>4</kbd>.</li>
        </ul>
        <p>Vooraf zie je 5 seconden een briefing. Daar komen later vragen over. Na run 1 volgt run 2 met dezelfde route.</p>` }),
      U.el('div', { class: 'grid2' },
        sel('Duur per run', 'duration', [[120, '2 minuten'], [240, '4 minuten'], [360, '6 minuten']]),
        sel('Sturen met', 'steer', [['roll', 'Stick links/rechts'], ['twist', 'Twist (alleen als je stick kan draaien)'], ['rudder', 'Voetpedalen']]),
        sel('Moeilijkheid', 'level', [[1, '1 · Rustig'], [2, '2 · Realistisch'], [3, '3 · Druk']]),
        U.el('label', { class: 'field chk' }, sp, U.el('span', {}, 'ATC-spraak (anders tekst in beeld)'))),
      U.el('button', { class: 'btn primary', onclick: () => { results.length = 0; seed = Math.floor(Math.random() * 1e9); briefing(1); } }, 'Start'));
  }

  function briefing(run) {
    panel.innerHTML = '';
    const rng = mulberry(seed);
    const cs = 'Easy ' + (100 + Math.floor(rng() * 899));
    const fuel = (40 + Math.floor(rng() * 80)) * 100;
    const squawk = String(Math.floor(rng() * 8)) + Math.floor(rng() * 8) + Math.floor(rng() * 8) + Math.floor(rng() * 8);
    const brief = { cs, fuel, squawk };
    const box = U.el('div', { class: 'memo' });
    box.append(U.el('p', { class: 'muted' }, `Run ${run}. Briefing, onthoud dit:`),
      U.el('div', { class: 'memo-panel', html: `<div><small>CALLSIGN</small><b>${cs}</b></div><div><small>FUEL</small><b>${fuel} kg</b></div><div><small>SQUAWK</small><b>${squawk}</b></div>` }));
    const cd = U.el('div', { class: 'memo-cd' }, '5 s');
    box.append(cd);
    panel.append(box);
    let left = 5;
    briefIv = setInterval(() => { left--; cd.textContent = left + ' s'; if (left <= 0) { clearInterval(briefIv); play(run, brief); } }, 1000);
  }

  function play(run, brief) {
    panel.innerHTML = '';
    const rng = mulberry(seed + 7);
    const W = 760, H = 520;
    const cv = U.el('canvas');
    const ctx = U.fitCanvas(cv, W, H);
    const hud = U.el('div', { class: 'hud' });
    const qbox = U.el('div', { class: 'fast-q' }, U.el('p', { class: 'muted' }, 'Vragen verschijnen hier.'));
    const atcText = U.el('div', { class: 'atc' });
    panel.append(hud, U.el('div', { class: 'fast-wrap' }, U.el('div', { class: 'fast-map' }, cv, atcText), qbox),
      U.el('div', { class: 'qnav' }, U.el('button', { class: 'btn ghost', onclick: settings }, 'Afbreken')));

    const lv = st.level;
    const speed = 55; // px per seconde
    const NAMES = ['ALPHA', 'BRAVO', 'KILO', 'LIMA', 'MIKE', 'ROMEO', 'SIERRA', 'TANGO', 'VICTOR', 'ZULU', 'DELTA', 'ECHO', 'GOLF', 'HOTEL', 'OSCAR', 'PAPA', 'NOVEM', 'RIDAR', 'LOGAN', 'TULIP', 'ARNEM', 'SPY', 'PAM', 'EEL'];
    // Route vooraf genereren (zelfde seed = zelfde route in run 2).
    const wps = [{ x: 0, y: 0, name: 'START' }];
    let hdg0 = 0, total = 0;
    while (total < speed * st.duration + 2000) {
      const len = 380 + rng() * 380;
      const p = wps[wps.length - 1];
      wps.push({ x: p.x + Math.sin(hdg0) * len, y: p.y - Math.cos(hdg0) * len, name: NAMES[Math.floor(rng() * NAMES.length)] });
      hdg0 += (rng() < 0.5 ? -1 : 1) * (0.4 + rng() * 0.9);
      total += len;
    }
    const towers = [];
    for (let i = 1; i < wps.length - 1; i++) {
      if (rng() < 0.6) {
        const a = wps[i - 1], b = wps[i], f = 0.3 + rng() * 0.5;
        const nx = -(b.y - a.y), ny = b.x - a.x, nl = Math.hypot(nx, ny);
        const off = (rng() - 0.5) * 50;
        towers.push({ x: a.x + (b.x - a.x) * f + nx / nl * off, y: a.y + (b.y - a.y) * f + ny / nl * off, hit: false });
      }
    }
    const COLORS = [['red', '#e5484d'], ['blue', '#3e7bfa'], ['green', '#30a46c'], ['yellow', '#f5c518'], ['white', '#ffffff'], ['orange', '#f76b15']];

    // Toestand
    const ac = { x: 0, y: 0, hdg: Math.atan2(wps[1].x, -wps[1].y) };
    let seg = 0, t = 0, last = performance.now();
    let wind = 0;
    let xtkSum = 0, xtkN = 0, collisions = 0;
    const traffic = [];
    let nextTraffic = 4 + rng() * 5;
    const passages = [], redPresses = [];
    let tHits = 0, tMiss = 0, tFalse = 0, rtSum = 0;
    const events = { lastColor: null, count: 0, lastWp: null, level: null, freq: null, qnh: null, lastOtherCs: null };
    let nextAtc = 8 + rng() * 6, atcHide = 0;
    let nextQ = 12, curQ = null, qShownAt = 0;
    let qRight = 0, qTotal = 0;
    let flash = 0;

    function sayAtc() {
      const mine = rng() < 0.55;
      const cs = mine ? brief.cs : 'Easy ' + (100 + Math.floor(rng() * 899));
      if (!mine) events.lastOtherCs = cs;
      const kind = Math.floor(rng() * 3);
      let msg;
      const spell = s => String(s).split('').join(' ');
      if (kind === 0) {
        const fl = (8 + Math.floor(rng() * 30)) * 10;
        msg = `${cs}, climb flight level ${spell(fl)}`; if (mine) events.level = fl;
      } else if (kind === 1) {
        const fi = 118 + Math.floor(rng() * 17), fd = pick3(rng), f = fi + '.' + fd;
        msg = `${cs}, contact London on ${spell(fi)} decimal ${spell(fd)}`; if (mine) events.freq = f;
      } else {
        const q = 990 + Math.floor(rng() * 40);
        msg = `${cs}, Q N H ${spell(q)}`; if (mine) events.qnh = q;
      }
      if (st.speech && 'speechSynthesis' in window) U.speak(msg);
      else { atcText.textContent = 'ATC: ' + msg; atcHide = t + 5; }
    }
    function pick3(r) { return String(Math.floor(r() * 40) * 25).padStart(3, '0'); }

    function makeQuestion() {
      const opts = [];
      if (events.lastColor) opts.push(() => ({ q: 'What colour was the most recent traffic?', ...U.textOptions(events.lastColor, COLORS.map(c => c[0])) }));
      if (events.count > 1) opts.push(() => ({ q: 'How many traffic aircraft have appeared so far?', ...U.numOptions(events.count, [events.count + 1, events.count - 1, events.count + 2]) }));
      if (events.lastWp) opts.push(() => ({ q: 'Which waypoint did you pass most recently?', ...U.textOptions(events.lastWp, NAMES) }));
      if (events.level) opts.push(() => ({ q: `To which flight level was ${brief.cs} cleared?`, ...U.textOptions('FL' + events.level, ['FL' + (events.level + 20), 'FL' + (events.level - 10), 'FL' + (events.level + 100), 'FL' + (events.level + 10)]) }));
      if (events.freq) opts.push(() => ({ q: `Which frequency was ${brief.cs} told to contact?`, ...U.textOptions(events.freq, [(parseFloat(events.freq) + 1).toFixed(3), (parseFloat(events.freq) - 0.5).toFixed(3), (parseFloat(events.freq) + 0.025).toFixed(3)]) }));
      if (events.qnh) opts.push(() => ({ q: `What QNH was given to ${brief.cs}?`, ...U.textOptions(String(events.qnh), [String(events.qnh + 1), String(events.qnh - 2), String(events.qnh + 10)]) }));
      opts.push(() => ({ q: 'What was your squawk code in the briefing?', ...U.textOptions(brief.squawk, [brief.squawk.split('').reverse().join(''), brief.squawk.slice(0, 2) + brief.squawk[3] + brief.squawk[2], String((+brief.squawk[0] + 1) % 8) + brief.squawk.slice(1)]) }));
      opts.push(() => ({ q: 'How much fuel was in the briefing?', ...U.textOptions(brief.fuel + ' kg', [brief.fuel + 1000, brief.fuel - 500, brief.fuel + 200].map(x => x + ' kg')) }));
      opts.push(() => { const a = U.ri(12, 49), b = U.ri(3, 9); return { q: `${a} × ${b} = ?`, ...U.numOptions(a * b, [a * b + b, a * b - 10, (a + 1) * b]) }; });
      opts.push(() => { const s = U.pick([120, 180, 240, 300]), m = U.pick([10, 20, 30]); return { q: `${s} kt for ${m} min = ? NM`, ...U.numOptions(s * m / 60, [s * m / 100, s / m, s * m / 30]) }; });
      opts.push(() => { const h = U.ri(0, 35) * 10, d = U.pick([90, 180, 270]); const n = (h + d) % 360; return { q: `Heading ${String(h).padStart(3, '0')}, turn right ${d}°. New heading?`, ...U.textOptions(String(n).padStart(3, '0'), [(n + 90) % 360, (n + 180) % 360, (h - d + 360) % 360].map(x => String(x).padStart(3, '0'))) }; });
      const f = U.pick(opts)();
      return f;
    }

    function showQuestion() {
      curQ = makeQuestion();
      qShownAt = t;
      qbox.innerHTML = '';
      qbox.append(U.el('p', { class: 'fq' }, curQ.q));
      curQ.options.forEach((o, i) => qbox.append(U.el('button', { class: 'opt', onclick: () => answer(i) }, U.el('span', { class: 'ol' }, String(i + 1)), U.el('span', { class: 'ot' }, o))));
      qbox.append(U.el('div', { class: 'qbar' }, U.el('div')));
    }
    function answer(i) {
      if (!curQ) return;
      qTotal++;
      const ok = i === curQ.answer;
      if (ok) qRight++;
      U.beep(ok ? 1000 : 300, 0.06);
      curQ = null;
      qbox.innerHTML = '';
      qbox.append(U.el('p', { class: 'muted' }, ok ? 'Goed.' : 'Fout.'));
      nextQ = t + 6 + Math.random() * 6;
    }
    const onKey = e => { const i = '1234'.indexOf(e.key); if (i >= 0) answer(i); };
    window.addEventListener('keydown', onKey);
    cleanupKeys = () => window.removeEventListener('keydown', onKey);

    function frame(now) {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      t += dt;
      const s = Input.state();
      const e = Input.edges();
      // Sturen: koerswijziging evenredig met de uitslag, plus zijwind die je moet corrigeren.
      wind += (-0.4 * wind) * dt + (Math.random() * 2 - 1) * 0.5 * Math.sqrt(dt) * lv;
      ac.hdg += (s[Input.source(st.steer, s)] * 0.9) * dt;
      ac.x += (Math.sin(ac.hdg) * speed + Math.cos(ac.hdg) * wind * 12) * dt;
      ac.y += (-Math.cos(ac.hdg) * speed + Math.sin(ac.hdg) * wind * 12) * dt;

      // Huidige routesegment en afwijking.
      let a = wps[seg], b = wps[seg + 1];
      let dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy);
      let along = ((ac.x - a.x) * dx + (ac.y - a.y) * dy) / L;
      if (along > L) {
        passages.push(t); events.lastWp = b.name;
        seg++; a = wps[seg]; b = wps[seg + 1];
        dx = b.x - a.x; dy = b.y - a.y; L = Math.hypot(dx, dy);
        along = ((ac.x - a.x) * dx + (ac.y - a.y) * dy) / L;
      }
      const xtk = Math.abs(((ac.x - a.x) * dy - (ac.y - a.y) * dx) / L);
      xtkSum += Math.max(0, 1 - xtk / 90); xtkN++;

      for (const tw of towers) {
        if (!tw.hit && Math.hypot(tw.x - ac.x, tw.y - ac.y) < 13) { tw.hit = true; collisions++; flash = 0.6; U.beep(160, 0.25, 0.12); }
      }

      // Verkeer
      if (t > nextTraffic) {
        const side = Math.random() < 0.5 ? -1 : 1;
        const fwd = 150 + Math.random() * 200, lat = side * (120 + Math.random() * 160);
        const px = ac.x + Math.sin(ac.hdg) * fwd + Math.cos(ac.hdg) * lat;
        const py = ac.y - Math.cos(ac.hdg) * fwd + Math.sin(ac.hdg) * lat;
        const dir = ac.hdg + (side > 0 ? -Math.PI / 2 : Math.PI / 2) + (Math.random() - 0.5);
        const col = COLORS[Math.floor(Math.random() * COLORS.length)];
        traffic.push({ x: px, y: py, dir, born: t, seen: false, col });
        events.lastColor = col[0]; events.count++;
        nextTraffic = t + (lv === 3 ? 4 : lv === 2 ? 6 : 9) + Math.random() * 6;
      }
      for (const tr of traffic) { tr.x += Math.sin(tr.dir) * 35 * dt; tr.y -= Math.cos(tr.dir) * 35 * dt; }
      for (let i = traffic.length - 1; i >= 0; i--) {
        if (t - traffic[i].born > 6) { if (!traffic[i].seen) tMiss++; traffic.splice(i, 1); }
      }
      if (e.green) {
        const tr = traffic.find(x => !x.seen);
        if (tr) { tr.seen = true; tHits++; rtSum += t - tr.born; U.beep(1200, 0.04); } else { tFalse++; U.beep(250, 0.08); }
      }
      if (e.red) redPresses.push(t);

      if (t > nextAtc) { sayAtc(); nextAtc = t + 14 + Math.random() * 10; }
      if (atcHide && t > atcHide) { atcText.textContent = ''; atcHide = 0; }
      if (!curQ && t > nextQ) showQuestion();
      if (curQ) {
        const f = 1 - (t - qShownAt) / 12;
        const bar = qbox.querySelector('.qbar div');
        if (bar) bar.style.width = Math.max(0, f * 100) + '%';
        if (f <= 0) answer(-1);
      }

      draw();
      hud.innerHTML = `<span>Run ${run}</span><span>${U.mmss(st.duration - t)}</span><span>${brief.cs}</span>` +
        (!s[Input.source(st.steer, s) + 'Bound'] ? '<span class="warn">Sturen via toetsenbord</span>' : '');
      if (t >= st.duration) return finish();
      raf = requestAnimationFrame(frame);
    }

    function toScreen(x, y) {
      // Koers-omhoog kaart; vliegtuig onderin het midden.
      const rx = x - ac.x, ry = y - ac.y;
      const c = Math.cos(-ac.hdg), s = Math.sin(-ac.hdg);
      return [W / 2 + rx * c - ry * s, H * 0.72 + rx * s + ry * c];
    }

    function draw() {
      ctx.fillStyle = '#18301f'; ctx.fillRect(0, 0, W, H);
      // Rasterlijnen geven een gevoel van beweging.
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
      const gs = 120;
      const gx0 = Math.floor((ac.x - 900) / gs) * gs, gy0 = Math.floor((ac.y - 900) / gs) * gs;
      for (let gx = gx0; gx < ac.x + 900; gx += gs) { const [x1, y1] = toScreen(gx, ac.y - 900), [x2, y2] = toScreen(gx, ac.y + 900); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
      for (let gy = gy0; gy < ac.y + 900; gy += gs) { const [x1, y1] = toScreen(ac.x - 900, gy), [x2, y2] = toScreen(ac.x + 900, gy); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
      // Route
      ctx.strokeStyle = '#e8eef5'; ctx.lineWidth = 3; ctx.beginPath();
      for (let i = Math.max(0, seg - 1); i < Math.min(wps.length, seg + 5); i++) { const [x, y] = toScreen(wps[i].x, wps[i].y); i === Math.max(0, seg - 1) ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.stroke();
      ctx.font = '12px system-ui'; ctx.textAlign = 'left';
      for (let i = seg; i < Math.min(wps.length, seg + 5); i++) {
        const [x, y] = toScreen(wps[i].x, wps[i].y);
        ctx.fillStyle = '#7fd1ff'; ctx.beginPath(); ctx.moveTo(x, y - 8); ctx.lineTo(x + 7, y + 5); ctx.lineTo(x - 7, y + 5); ctx.closePath(); ctx.fill();
        ctx.fillText(wps[i].name, x + 10, y + 4);
      }
      for (const tw of towers) {
        const [x, y] = toScreen(tw.x, tw.y);
        if (x < -20 || x > W + 20 || y < -20 || y > H + 20) continue;
        ctx.fillStyle = tw.hit ? '#555' : '#ff5a5f'; ctx.beginPath(); ctx.moveTo(x, y - 9); ctx.lineTo(x + 7, y + 6); ctx.lineTo(x - 7, y + 6); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
      }
      for (const tr of traffic) {
        const [x, y] = toScreen(tr.x, tr.y);
        drawPlane(x, y, tr.dir - ac.hdg, tr.col[1], 0.8);
      }
      drawPlane(W / 2, H * 0.72, 0, '#ffd400', 1.1);
      if (flash > 0) { ctx.fillStyle = `rgba(255,0,0,${flash * 0.4})`; ctx.fillRect(0, 0, W, H); flash -= 0.02; }
    }
    function drawPlane(x, y, rot, col, sc) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
      ctx.fillStyle = col; ctx.beginPath();
      ctx.moveTo(0, -14); ctx.lineTo(3, -4); ctx.lineTo(14, 2); ctx.lineTo(14, 5); ctx.lineTo(3, 3); ctx.lineTo(2, 10); ctx.lineTo(6, 13); ctx.lineTo(6, 15);
      ctx.lineTo(0, 13); ctx.lineTo(-6, 15); ctx.lineTo(-6, 13); ctx.lineTo(-2, 10); ctx.lineTo(-3, 3); ctx.lineTo(-14, 5); ctx.lineTo(-14, 2); ctx.lineTo(-3, -4); ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    function finish() {
      stopAll();
      // Rode knop: elke passage telt als goed als er binnen -2..+3 s een druk was.
      const used = new Set();
      let wHits = 0;
      passages.forEach(pt => {
        const idx = redPresses.findIndex((rp, i) => !used.has(i) && rp >= pt - 2 && rp <= pt + 3);
        if (idx >= 0) { used.add(idx); wHits++; }
      });
      const wFalse = redPresses.length - used.size;
      const track = xtkN ? xtkSum / xtkN : 0;
      const trafficScore = (tHits + tMiss) ? Math.max(0, (tHits - tFalse * 0.5) / (tHits + tMiss)) : 1;
      const wpScore = passages.length ? Math.max(0, (wHits - wFalse * 0.5) / passages.length) : 1;
      const qScore = qTotal ? qRight / qTotal : 0;
      const collPen = Math.min(0.3, collisions * 0.05);
      const score = Math.round(100 * Math.max(0, (track * 0.3 + trafficScore * 0.2 + wpScore * 0.2 + qScore * 0.3) - collPen));
      const r = { run, score, track: Math.round(track * 100), traffic: `${tHits}/${tHits + tMiss} (${tFalse} onterecht)`, rt: tHits ? (rtSum / tHits).toFixed(1) + ' s' : '-', wp: `${wHits}/${passages.length} (${wFalse} onterecht)`, q: `${qRight}/${qTotal}`, coll: collisions };
      results.push(r);
      Store.add({ module: 'fast', title: 'FAST multitask', mode: `run ${run}, niveau ${st.level}`, score, detail: `koers ${r.track}%, verkeer ${r.traffic}, waypoints ${r.wp}, vragen ${r.q}, masten ${collisions}` });
      panel.innerHTML = '';
      const tbl = U.el('table', { class: 'tbl' }, U.el('tr', {}, ...['Run', 'Score', 'Op koers', 'Verkeer gezien', 'Reactietijd', 'Waypoints', 'Vragen', 'Masten geraakt'].map(h => U.el('th', {}, h))));
      results.forEach(x => tbl.append(U.el('tr', {}, ...[x.run, x.score + '%', x.track + '%', x.traffic, x.rt, x.wp, x.q, x.coll].map(v => U.el('td', {}, String(v))))));
      panel.append(U.el('div', { class: 'result' }, U.el('div', { class: 'big ' + (score >= 70 ? 'ok' : score >= 50 ? 'mid' : 'nok') }, score + '%')), tbl);
      if (run === 1) {
        panel.append(U.el('p', {}, 'Run 2 gebruikt dezelfde route. Laat zien dat je leert: let op waar je punten liet liggen.'),
          U.el('div', { class: 'qnav' }, U.el('button', { class: 'btn primary', onclick: () => briefing(2) }, 'Start run 2'), U.el('button', { class: 'btn', onclick: settings }, 'Instellingen')));
      } else {
        const d = results[1].score - results[0].score;
        panel.append(U.el('p', {}, d >= 0 ? `Verbetering van ${d} punten. Goed zo.` : `Run 2 was ${-d} punten lager. Probeer rustig een vast scanpatroon aan te houden: kaart, vraag, kaart, verkeer.`),
          U.el('div', { class: 'qnav' }, U.el('button', { class: 'btn primary', onclick: () => { results.length = 0; seed = Math.floor(Math.random() * 1e9); briefing(1); } }, 'Nieuwe route'), U.el('button', { class: 'btn', onclick: settings }, 'Instellingen')));
      }
    }
    raf = requestAnimationFrame(frame);
  }

  function stopAll() {
    cancelAnimationFrame(raf);
    clearInterval(briefIv);
    if (cleanupKeys) { cleanupKeys(); cleanupKeys = null; }
    try { speechSynthesis.cancel(); } catch (e) {}
  }

  settings();
  return stopAll;
}
