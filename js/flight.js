// Fixed wing: eenvoudige vliegsimulatie met primary flight display.
// Kandidaten melden: eerst een niet-gescoorde tutorial (Fixed wing 1), daarna 15 minuten
// hoogte en snelheid vasthouden terwijl je koersen naar waypoints volgt (Fixed wing 2).
function runFlight(root) {
  const SKEY = 'cae_flight_settings_v1';
  let st = { duration: 600, turb: 2, rudderReq: true, speech: true };
  try { st = Object.assign(st, JSON.parse(localStorage.getItem(SKEY) || '{}')); } catch (e) {}
  const saveSt = () => { try { localStorage.setItem(SKEY, JSON.stringify(st)); } catch (e) {} };
  let raf = null;

  root.innerHTML = '';
  const panel = U.el('div', { class: 'card' });
  root.append(U.el('h2', {}, 'Fixed wing (vliegtest)'), panel);

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
      U.el('div', { html: `<p>Bediening: <b>stick</b> voor pitch en roll, <b>throttle</b> voor snelheid, <b>pedalen</b> om het slipbolletje in het midden te houden.
        Zonder throttle: <kbd>W</kbd>/<kbd>S</kbd>. Zonder joystick: pijltjestoetsen, pedalen <kbd>Z</kbd>/<kbd>X</kbd>.</p>
        <p>De paarse markeringen op de schalen zijn je doelwaarden. Nieuwe opdrachten komen bovenin en worden uitgesproken.</p>
        <p class="muted small">Vlieg op de instrumenten: eerst attitude (stand), dan snelheid en hoogte controleren. Kleine bewegingen, en trim eerst je gas voor horizontale vlucht.</p>` }),
      U.el('div', { class: 'grid2' },
        sel('Duur', 'duration', [[300, '5 minuten'], [600, '10 minuten'], [900, '15 minuten (examen)']]),
        sel('Turbulentie', 'turb', [[0, 'Geen'], [1, 'Licht'], [2, 'Matig'], [3, 'Fors']]),
        chk('Roer telt mee (slip scoren)', 'rudderReq'),
        chk('Opdrachten uitspreken', 'speech')),
      U.el('div', { class: 'qnav' },
        U.el('button', { class: 'btn', onclick: () => play(false) }, 'Fixed wing 1: vrij oefenen (geen score)'),
        U.el('button', { class: 'btn primary', onclick: () => play(true) }, 'Fixed wing 2: gescoorde opdracht')));
  }

  function makeLegs(n) {
    const legs = [];
    let hdg = U.ri(0, 35) * 10, alt = 3000, spd = 120;
    legs.push({ hdg, alt, spd, dur: 45, text: `Maintain heading ${pad(hdg)}, ${alt} ft, ${spd} knots` });
    for (let i = 1; i < n; i++) {
      const kind = U.pick(['turn', 'climb', 'descend', 'speed', 'turnclimb', 'turn']);
      if (kind.includes('turn')) hdg = ((hdg + U.pick([-1, 1]) * U.pick([30, 45, 60, 90, 120])) % 360 + 360) % 360;
      if (kind.includes('climb')) alt += U.pick([500, 1000]);
      if (kind === 'descend') alt = Math.max(1500, alt - U.pick([500, 1000]));
      if (kind === 'speed') spd = U.pick([100, 110, 130, 140].filter(s => s !== spd));
      legs.push({ hdg, alt, spd, dur: U.ri(50, 80), text: `${U.pick(['Turn', 'Fly'])} heading ${pad(hdg)}, ${alt} ft, ${spd} knots` });
    }
    return legs;
  }
  const pad = h => String(Math.round(h) % 360).padStart(3, '0');

  function play(scored) {
    panel.innerHTML = '';
    const W = 760, H = 500;
    const cv = U.el('canvas');
    const ctx = U.fitCanvas(cv, W, H);
    const hud = U.el('div', { class: 'hud' });
    panel.append(hud, cv, U.el('div', { class: 'qnav' }, U.el('button', { class: 'btn ghost', onclick: settings }, 'Stoppen')));

    const legs = [];
    let tot = 0;
    makeLegs(40).forEach(l => { if (tot < st.duration) { legs.push(l); tot += l.dur; } });
    let leg = 0, legStart = 0;
    const a = { pitch: 2, bank: 0, hdg: legs[0].hdg, spd: 120, alt: 3000, beta: 0, vs: 0 };
    let t = 0, last = performance.now();
    let turbP = 0, turbR = 0;
    const sc = { alt: 0, spd: 0, hdg: 0, slip: 0, n: 0 };
    if (st.speech) U.speak(legs[0].text);

    function frame(now) {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      t += dt;
      const s = Input.state();
      const k = st.turb;
      turbP += (-0.8 * turbP) * dt + (Math.random() * 2 - 1) * k * 1.6 * Math.sqrt(dt);
      turbR += (-0.8 * turbR) * dt + (Math.random() * 2 - 1) * k * 3 * Math.sqrt(dt);
      // Pitch: snelheid van standverandering volgt de stick, met lichte stabiliteit naar ~2° neus omhoog.
      a.pitch += (14 * s.pitch - 0.25 * (a.pitch - 2) + turbP) * dt;
      a.pitch = U.clamp(a.pitch, -25, 25);
      const rollRate = 50 * s.roll + turbR + 0.06 * a.bank;
      a.bank += rollRate * dt;
      a.bank = U.clamp(a.bank, -70, 70);
      // Adverse yaw bij rollen; pedalen corrigeren de slip.
      a.beta += (-2.2 * a.beta + 22 * s.rudder - 0.12 * rollRate + turbR * 0.3) * dt;
      a.beta = U.clamp(a.beta, -15, 15);
      const V = a.spd * 0.5144;
      const turn = 9.81 * Math.tan(a.bank * Math.PI / 180) / Math.max(20, V) * 180 / Math.PI;
      a.hdg = ((a.hdg + (turn - 0.25 * a.beta) * dt) % 360 + 360) % 360;
      // Vliegbaanhoek: stand min invalshoek, minder lift in een bocht.
      const alpha = 2 * Math.pow(120 / Math.max(60, a.spd), 2);
      const gamma = a.pitch - alpha - (1 / Math.cos(a.bank * Math.PI / 180) - 1) * 6 - Math.abs(a.beta) * 0.1;
      a.vs = a.spd * 101.27 * Math.sin(gamma * Math.PI / 180);
      a.alt = Math.max(0, a.alt + a.vs / 60 * dt);
      const drag = 0.25 + (a.spd - 80) / 200 + Math.abs(a.beta) * 0.01;
      a.spd += (9 * (s.throttle - drag) - 0.33 * gamma) * dt;
      a.spd = U.clamp(a.spd, 50, 220);

      // Opdrachten
      if (t - legStart > legs[leg].dur && leg < legs.length - 1) {
        leg++; legStart = t;
        if (st.speech) U.speak(legs[leg].text);
        U.beep(700, 0.12);
      }
      const L = legs[leg];
      if (scored && t - legStart > 15) {
        let dh = Math.abs(a.hdg - L.hdg); dh = Math.min(dh, 360 - dh);
        sc.alt += Math.max(0, 1 - Math.abs(a.alt - L.alt) / 300);
        sc.spd += Math.max(0, 1 - Math.abs(a.spd - L.spd) / 15);
        sc.hdg += Math.max(0, 1 - dh / 15);
        sc.slip += Math.max(0, 1 - Math.abs(a.beta) / 5);
        sc.n++;
      }
      draw(L, s);
      const cur = sc.n ? Math.round(100 * total()) : null;
      hud.innerHTML = `<span>${scored ? 'Fixed wing 2' : 'Fixed wing 1 (oefenen)'}</span><span>${U.mmss(st.duration - t)}</span>` + (cur !== null ? `<span>Score ${cur}%</span>` : '') +
        (!s.throttleBound ? '<span class="warn">Throttle: W/S</span>' : '');
      if (t >= st.duration) return finish();
      raf = requestAnimationFrame(frame);
    }
    function total() {
      if (!sc.n) return 0;
      const parts = [sc.alt / sc.n, sc.spd / sc.n, sc.hdg / sc.n];
      if (st.rudderReq) parts.push(sc.slip / sc.n);
      return parts.reduce((x, y) => x + y, 0) / parts.length;
    }

    function tape(x, y, w, h, val, target, step, unitPerPx, label, fmt) {
      ctx.save();
      ctx.fillStyle = '#20252c'; ctx.fillRect(x, y, w, h);
      ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
      ctx.fillStyle = '#e8eef5'; ctx.strokeStyle = '#e8eef5'; ctx.font = '13px system-ui'; ctx.textAlign = 'center';
      const cy = y + h / 2;
      const range = h / 2 * unitPerPx;
      for (let v = Math.floor((val - range) / step) * step; v <= val + range; v += step) {
        const py = cy - (v - val) / unitPerPx;
        ctx.beginPath(); ctx.moveTo(x, py); ctx.lineTo(x + 8, py); ctx.stroke();
        ctx.fillText(fmt(v), x + w / 2 + 4, py + 4);
      }
      if (target !== null) {
        const ty = U.clamp(cy - (target - val) / unitPerPx, y + 4, y + h - 4);
        ctx.fillStyle = '#d65cff'; ctx.fillRect(x + w - 10, ty - 6, 10, 12);
      }
      ctx.restore();
      ctx.fillStyle = '#000'; ctx.fillRect(x - 4, cy - 14, w + 8, 28);
      ctx.strokeStyle = '#ffd400'; ctx.lineWidth = 2; ctx.strokeRect(x - 4, cy - 14, w + 8, 28);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 16px system-ui'; ctx.textAlign = 'center'; ctx.fillText(fmt(val), x + w / 2, cy + 6);
      ctx.fillStyle = '#9aa7b8'; ctx.font = '12px system-ui'; ctx.fillText(label, x + w / 2, y - 6);
    }

    function draw(L, s) {
      ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, W, H);
      // Opdrachtbalk
      ctx.fillStyle = '#16202c'; ctx.fillRect(0, 0, W, 40);
      ctx.fillStyle = '#d65cff'; ctx.font = 'bold 18px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(L.text, W / 2, 26);
      // Attitude
      const cx = 380, cy = 235, R = 150, ppd = 5;
      ctx.save();
      ctx.beginPath(); ctx.rect(cx - R, cy - R, 2 * R, 2 * R); ctx.clip();
      ctx.translate(cx, cy); ctx.rotate(-a.bank * Math.PI / 180); ctx.translate(0, a.pitch * ppd);
      ctx.fillStyle = '#3e8ed0'; ctx.fillRect(-600, -1200, 1200, 1200);
      ctx.fillStyle = '#8a5a2b'; ctx.fillRect(-600, 0, 1200, 1200);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-600, 0); ctx.lineTo(600, 0); ctx.stroke();
      ctx.font = '11px system-ui'; ctx.fillStyle = '#fff'; ctx.lineWidth = 1.5;
      for (let p = -30; p <= 30; p += 5) {
        if (!p) continue;
        const w = p % 10 === 0 ? 40 : 20;
        ctx.beginPath(); ctx.moveTo(-w, -p * ppd); ctx.lineTo(w, -p * ppd); ctx.stroke();
        if (p % 10 === 0) { ctx.fillText(Math.abs(p), w + 6, -p * ppd + 4); ctx.fillText(Math.abs(p), -w - 20, -p * ppd + 4); }
      }
      ctx.restore();
      // Bank-schaal
      ctx.save(); ctx.translate(cx, cy);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
      [-60, -45, -30, -20, -10, 0, 10, 20, 30, 45, 60].forEach(b => {
        const r1 = R - 6, r2 = b % 30 === 0 ? R - 22 : R - 14, an = (b - 90) * Math.PI / 180;
        ctx.beginPath(); ctx.moveTo(r1 * Math.cos(an), r1 * Math.sin(an)); ctx.lineTo(r2 * Math.cos(an), r2 * Math.sin(an)); ctx.stroke();
      });
      ctx.rotate(-a.bank * Math.PI / 180);
      ctx.fillStyle = '#ffd400'; ctx.beginPath(); ctx.moveTo(0, -R + 24); ctx.lineTo(-8, -R + 38); ctx.lineTo(8, -R + 38); ctx.closePath(); ctx.fill();
      ctx.restore();
      // Vliegtuigsymbool
      ctx.strokeStyle = '#ffd400'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(cx - 80, cy); ctx.lineTo(cx - 30, cy); ctx.lineTo(cx - 20, cy + 10); ctx.moveTo(cx + 80, cy); ctx.lineTo(cx + 30, cy); ctx.lineTo(cx + 20, cy + 10); ctx.stroke();
      ctx.fillStyle = '#ffd400'; ctx.fillRect(cx - 4, cy - 4, 8, 8);
      // Slipindicator
      ctx.fillStyle = '#20252c'; ctx.fillRect(cx - 60, cy + R + 8, 120, 18);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(cx - 10, cy + R + 8, 20, 18);
      ctx.fillStyle = Math.abs(a.beta) < 2 ? '#e8eef5' : '#f5c518';
      ctx.beginPath(); ctx.arc(cx + U.clamp(-a.beta * 8, -54, 54), cy + R + 17, 7, 0, 7); ctx.fill();
      // Tapes
      tape(130, 85, 80, 300, a.spd, L.spd, 10, 0.25, 'IAS kt', v => String(Math.round(v)));
      tape(550, 85, 90, 300, a.alt, L.alt, 100, 4, 'ALT ft', v => String(Math.round(v / 10) * 10));
      // VSI
      ctx.fillStyle = '#20252c'; ctx.fillRect(660, 110, 40, 250);
      const vy = 235 - U.clamp(a.vs / 2000, -1, 1) * 120;
      ctx.strokeStyle = '#30a46c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(700, 235); ctx.lineTo(664, vy); ctx.stroke();
      ctx.fillStyle = '#9aa7b8'; ctx.font = '11px system-ui'; ctx.textAlign = 'center'; ctx.fillText('V/S', 680, 104);
      ctx.fillStyle = '#fff'; ctx.fillText(String(Math.round(a.vs / 50) * 50), 680, 376);
      // Koersband
      const hy = 430, hw = 420;
      ctx.save(); ctx.fillStyle = '#20252c'; ctx.fillRect(cx - hw / 2, hy, hw, 40);
      ctx.beginPath(); ctx.rect(cx - hw / 2, hy, hw, 40); ctx.clip();
      ctx.fillStyle = '#e8eef5'; ctx.strokeStyle = '#e8eef5'; ctx.font = '12px system-ui';
      for (let d = Math.floor(a.hdg / 5) * 5 - 60; d <= a.hdg + 60; d += 5) {
        const x = cx + (d - a.hdg) * 3.5;
        ctx.beginPath(); ctx.moveTo(x, hy); ctx.lineTo(x, hy + (d % 10 === 0 ? 12 : 6)); ctx.stroke();
        if (d % 10 === 0) ctx.fillText(pad(((d % 360) + 360) % 360), x, hy + 28);
      }
      let dh = L.hdg - a.hdg; if (dh > 180) dh -= 360; if (dh < -180) dh += 360;
      ctx.fillStyle = '#d65cff'; ctx.fillRect(cx + U.clamp(dh, -58, 58) * 3.5 - 6, hy, 12, 8);
      ctx.restore();
      ctx.fillStyle = '#000'; ctx.fillRect(cx - 28, hy - 26, 56, 24); ctx.strokeStyle = '#ffd400'; ctx.strokeRect(cx - 28, hy - 26, 56, 24);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 15px system-ui'; ctx.fillText(pad(a.hdg), cx, hy - 8);
      // Gashendel
      ctx.fillStyle = '#20252c'; ctx.fillRect(40, 140, 26, 200);
      ctx.fillStyle = '#3e7bfa'; ctx.fillRect(40, 340 - s.throttle * 200, 26, s.throttle * 200);
      ctx.fillStyle = '#9aa7b8'; ctx.font = '11px system-ui'; ctx.fillText('THR', 53, 134);
    }

    function finish() {
      cancelAnimationFrame(raf);
      try { speechSynthesis.cancel(); } catch (e) {}
      panel.innerHTML = '';
      if (!scored) {
        panel.append(U.el('p', {}, 'Oefenvlucht klaar.'), U.el('button', { class: 'btn primary', onclick: settings }, 'Terug'));
        return;
      }
      const pct = v => Math.round(100 * v / (sc.n || 1));
      const score = Math.round(100 * total());
      Store.add({ module: 'flight', title: 'Fixed wing', mode: `turb ${st.turb}`, score, detail: `hoogte ${pct(sc.alt)}%, snelheid ${pct(sc.spd)}%, koers ${pct(sc.hdg)}%, slip ${pct(sc.slip)}%` });
      panel.append(U.el('div', { class: 'result' },
        U.el('div', { class: 'big ' + (score >= 75 ? 'ok' : score >= 55 ? 'mid' : 'nok') }, score + '%'),
        U.el('p', {}, `Hoogte ${pct(sc.alt)}% · Snelheid ${pct(sc.spd)}% · Koers ${pct(sc.hdg)}% · Slip ${pct(sc.slip)}%`),
        U.el('p', { class: 'muted small' }, 'Na elke nieuwe opdracht heb je 15 s om de nieuwe waarden te bereiken; daarna telt de afwijking (hoogte ±300 ft, snelheid ±15 kt, koers ±15°).')),
        U.el('div', { class: 'qnav' }, U.el('button', { class: 'btn primary', onclick: () => play(true) }, 'Opnieuw'), U.el('button', { class: 'btn', onclick: settings }, 'Instellingen')));
    }
    raf = requestAnimationFrame(frame);
  }

  settings();
  return () => { cancelAnimationFrame(raf); try { speechSynthesis.cancel(); } catch (e) {} };
}
