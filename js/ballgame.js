// Control & Co-ordination ("ball game"): houd de bal in het midden terwijl hij wegdrijft.
// Kandidaten melden: links/rechts via draaien (twist) van de stick, op/neer via voor/achter,
// beide assen voelen "omgekeerd", eerst een korte oefenperiode, daarna ca. 3 minuten gescoord.
function runBallGame(root) {
  const SKEY = 'cae_ball_settings_v1';
  let st = { xSrc: 'twist', invX: true, invY: false, level: 2, mode: 'single', duration: 180, practice: 30 };
  try { st = Object.assign(st, JSON.parse(localStorage.getItem(SKEY) || '{}')); } catch (e) {}
  const saveSt = () => { try { localStorage.setItem(SKEY, JSON.stringify(st)); } catch (e) {} };

  let raf = null;
  root.innerHTML = '';
  const panel = U.el('div', { class: 'card' });
  root.append(U.el('h2', {}, 'Ball game (Control & Co-ordination)'), panel);

  function settings() {
    cancelAnimationFrame(raf);
    panel.innerHTML = '';
    const sel = (label, key, options) => {
      const s = U.el('select', { onchange: e => { st[key] = isNaN(+e.target.value) ? e.target.value : +e.target.value; saveSt(); } });
      options.forEach(([v, t]) => { const o = U.el('option', { value: v }, t); if (String(st[key]) === String(v)) o.selected = true; s.append(o); });
      return U.el('label', { class: 'field' }, U.el('span', {}, label), s);
    };
    const chk = (label, key) => {
      const c = U.el('input', { type: 'checkbox', onchange: e => { st[key] = e.target.checked; saveSt(); } });
      c.checked = !!st[key];
      return U.el('label', { class: 'field chk' }, c, U.el('span', {}, label));
    };
    panel.append(
      U.el('p', {}, 'Een bal drijft steeds van het midden weg. Houd hem zo dicht mogelijk bij het midden met kleine, rustige correcties. Eerst een oefenperiode zonder score, daarna de gescoorde run.'),
      U.el('div', { class: 'grid2' },
        sel('Variant', 'mode', [['single', 'Klassiek: één bal (zoals ADAPT)'], ['dual', 'Stick + pedalen: bal én roerbalk (extra coördinatie)']]),
        sel('Links/rechts met', 'xSrc', [['twist', 'Twist (stick draaien), zoals gemeld'], ['roll', 'Stick links/rechts'], ['rudder', 'Voetpedalen']]),
        chk('Links/rechts omkeren', 'invX'),
        chk('Op/neer omkeren (stick naar voren = bal omhoog)', 'invY'),
        sel('Moeilijkheid', 'level', [[1, '1 · Rustig'], [2, '2 · Realistisch'], [3, '3 · Zwaar'], [4, '4 · Extreem']]),
        sel('Duur gescoord', 'duration', [[60, '1 minuut'], [180, '3 minuten (examen)'], [300, '5 minuten']]),
        sel('Oefenperiode', 'practice', [[0, 'Geen'], [15, '15 s'], [30, '30 s'], [60, '60 s']])),
      U.el('p', { class: 'muted small' }, 'Tip: de echte test zet je niet zelf in. Wissel dus ook eens van instelling (omkeren aan/uit), zodat je snel kunt wennen aan wat je op de dag krijgt.'),
      U.el('button', { class: 'btn primary', onclick: play }, 'Start'));
  }

  function play() {
    panel.innerHTML = '';
    const cv = U.el('canvas');
    const W = 640, H = st.mode === 'dual' ? 720 : 640;
    const ctx = U.fitCanvas(cv, W, H);
    const info = U.el('div', { class: 'hud' });
    const stop = U.el('button', { class: 'btn ghost', onclick: () => { cancelAnimationFrame(raf); settings(); } }, 'Stoppen');
    panel.append(info, cv, U.el('div', { class: 'qnav' }, stop));

    const lv = st.level;
    const noise = [0, 0.25, 0.42, 0.62, 0.85][lv];
    const inst = [0, 0.25, 0.5, 0.8, 1.1][lv];
    const gain = 1.25;
    let p = { x: 0, y: 0 }, d = { x: 0, y: 0 };
    let bar = 0, barTarget = 0, barD = 0; // pedaalbalk (dual)
    let t = 0, last = performance.now();
    let scoreSum = 0, inner = 0, mid = 0, samples = 0, barSum = 0;
    const total = st.practice + st.duration;
    // Ornstein-Uhlenbeck verstoring: vloeiend maar onvoorspelbaar.
    const ou = (v, dt, sigma, theta = 0.6) => v + (-theta * v) * dt + sigma * Math.sqrt(dt) * (Math.random() * 2 - 1) * 1.7;

    function frame(now) {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      t += dt;
      const s = Input.state();
      let ux = st.mode === 'dual' ? s.roll : s[st.xSrc];
      // Standaard: stick naar achteren = bal omhoog, naar voren = bal omlaag (zoals een vliegtuig).
      let uy = s.pitch; // +1 = stick naar achteren
      if (st.invX) ux = -ux;
      if (st.invY) uy = -uy;
      d.x = ou(d.x, dt, noise); d.y = ou(d.y, dt, noise);
      p.x += (gain * ux + d.x + inst * p.x) * dt;
      p.y += (-gain * uy + d.y + inst * p.y) * dt;
      p.x = U.clamp(p.x, -1, 1); p.y = U.clamp(p.y, -1, 1);

      if (st.mode === 'dual') {
        barD = ou(barD, dt, noise * 0.8);
        barTarget = 0.7 * Math.sin(t * 0.37) * Math.cos(t * 0.13);
        bar += (gain * s.rudder + barD + inst * 0.5 * (bar - barTarget)) * dt;
        bar = U.clamp(bar, -1, 1);
      }

      const r = Math.hypot(p.x, p.y);
      const scoring = t > st.practice;
      if (scoring) {
        samples++;
        scoreSum += Math.max(0, 1 - r);
        if (r < 0.12) inner++;
        if (r < 0.3) mid++;
        if (st.mode === 'dual') barSum += Math.max(0, 1 - Math.abs(bar - barTarget) * 2);
      }
      draw(r, scoring);
      const left = total - t;
      info.innerHTML = `<span>${scoring ? 'GESCOORD' : 'OEFENEN'}</span><span>${U.mmss(scoring ? left : st.practice - t)}</span>` +
        (samples ? `<span>Precisie ${Math.round(100 * scoreSum / samples)}%</span>` : '') +
        (!s[st.mode === 'dual' ? 'rollBound' : st.xSrc + 'Bound'] ? '<span class="warn">Let op: as niet gekoppeld, toetsenbord actief</span>' : '');
      if (t >= total) return finish();
      raf = requestAnimationFrame(frame);
    }

    function draw(r, scoring) {
      const cx = W / 2, cy = 320, R = 290;
      ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, W, H);
      [[1, '#1c2330'], [0.3, '#22314a'], [0.12, '#2b4d7a']].forEach(([f, c]) => { ctx.beginPath(); ctx.arc(cx, cy, R * f, 0, 7); ctx.fillStyle = c; ctx.fill(); });
      ctx.strokeStyle = '#4b5a70'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx + p.x * R, cy + p.y * R, 16, 0, 7);
      ctx.fillStyle = r < 0.12 ? '#30a46c' : r < 0.3 ? '#f5c518' : '#e5484d'; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      if (!scoring) { ctx.fillStyle = '#9aa7b8'; ctx.font = '16px system-ui'; ctx.textAlign = 'center'; ctx.fillText('Oefenperiode, telt niet mee', cx, 24); }
      if (st.mode === 'dual') {
        const by = 670, bw = 280;
        ctx.fillStyle = '#1c2330'; ctx.fillRect(cx - bw - 10, by - 18, 2 * bw + 20, 36);
        ctx.fillStyle = '#2b4d7a'; ctx.fillRect(cx + barTarget * bw - 22, by - 18, 44, 36);
        ctx.fillStyle = '#f5c518'; ctx.fillRect(cx + bar * bw - 4, by - 22, 8, 44);
        ctx.fillStyle = '#9aa7b8'; ctx.font = '13px system-ui'; ctx.textAlign = 'center'; ctx.fillText('Pedalen: houd de gele streep in het blauwe vak', cx, by + 40);
      }
    }

    function finish() {
      cancelAnimationFrame(raf);
      const prec = samples ? Math.round(100 * scoreSum / samples) : 0;
      const inn = samples ? Math.round(100 * inner / samples) : 0;
      const md = samples ? Math.round(100 * mid / samples) : 0;
      const barP = st.mode === 'dual' && samples ? Math.round(100 * barSum / samples) : null;
      const score = barP === null ? prec : Math.round((prec + barP) / 2);
      Store.add({ module: 'ball', title: 'Ball game', mode: `${st.mode}/niveau ${st.level}`, score, detail: `binnen ${inn}%, middelste ring ${md}%` + (barP !== null ? `, pedalen ${barP}%` : '') });
      panel.innerHTML = '';
      panel.append(U.el('div', { class: 'result' },
        U.el('div', { class: 'big ' + (score >= 75 ? 'ok' : score >= 60 ? 'mid' : 'nok') }, score + '%'),
        U.el('p', {}, `Precisie ${prec}%. Tijd in de binnenste cirkel ${inn}%, binnen de middelste ring ${md}%.` + (barP !== null ? ` Pedalen ${barP}%.` : '')),
        U.el('p', { class: 'muted small' }, 'Het hoeft niet perfect: kandidaten slagen ook als de bal soms wegloopt. Blijf rustig en corrigeer klein. Vermijd grote, schokkerige bewegingen.')),
        U.el('div', { class: 'qnav' }, U.el('button', { class: 'btn primary', onclick: play }, 'Opnieuw'), U.el('button', { class: 'btn', onclick: settings }, 'Instellingen')));
    }
    raf = requestAnimationFrame(frame);
  }

  settings();
  return () => cancelAnimationFrame(raf);
}
