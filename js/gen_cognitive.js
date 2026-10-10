// Cognitief: kortetermijngeheugen (5 seconden kijken), patroon- en vormherkenning,
// ruimtelijk inzicht, waarnemingssnelheid en het aflezen van instrumenten.
const CogGen = (() => {
  const { ri, pick, shuffle, textOptions, numOptions } = U;
  const themed = s => (window.themedSvg ? window.themedSvg(s) : s);
  const COLORS = [['red', '#e5484d'], ['blue', '#3e7bfa'], ['green', '#30a46c'], ['yellow', '#f5c518'], ['purple', '#8e4ec6'], ['orange', '#f76b15']];
  const SHAPES = ['circle', 'square', 'triangle', 'star', 'diamond', 'cross'];

  function shapeSvg(shape, color, size = 40) {
    const h = size / 2;
    let inner;
    switch (shape) {
      case 'circle': inner = `<circle cx="${h}" cy="${h}" r="${h - 3}"/>`; break;
      case 'square': inner = `<rect x="4" y="4" width="${size - 8}" height="${size - 8}"/>`; break;
      case 'triangle': inner = `<polygon points="${h},3 ${size - 3},${size - 4} 3,${size - 4}"/>`; break;
      case 'diamond': inner = `<polygon points="${h},2 ${size - 2},${h} ${h},${size - 2} 2,${h}"/>`; break;
      case 'cross': inner = `<polygon points="${h - 6},3 ${h + 6},3 ${h + 6},${h - 6} ${size - 3},${h - 6} ${size - 3},${h + 6} ${h + 6},${h + 6} ${h + 6},${size - 3} ${h - 6},${size - 3} ${h - 6},${h + 6} 3,${h + 6} 3,${h - 6} ${h - 6},${h - 6}"/>`; break;
      default: {
        const p = [];
        for (let i = 0; i < 10; i++) { const r = i % 2 ? h * 0.42 : h - 2, a = -Math.PI / 2 + i * Math.PI / 5; p.push(`${h + r * Math.cos(a)},${h + r * Math.sin(a)}`); }
        inner = `<polygon points="${p.join(' ')}"/>`;
      }
    }
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="fill:${color}">${inner}</svg>`;
  }

  // Willekeurige vorm voor mentale rotatie (polyomino op raster).
  function polyomino() {
    const cells = [[0, 0]];
    while (cells.length < 5) {
      const [x, y] = pick(cells);
      const [dx, dy] = pick([[1, 0], [-1, 0], [0, 1], [0, -1]]);
      if (!cells.some(c => c[0] === x + dx && c[1] === y + dy)) cells.push([x + dx, y + dy]);
    }
    return cells;
  }
  const normalize = cells => { const mx = Math.min(...cells.map(c => c[0])), my = Math.min(...cells.map(c => c[1])); return cells.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[0] - b[0] || a[1] - b[1]); };
  const rot = cells => cells.map(([x, y]) => [-y, x]);
  const mirror = cells => cells.map(([x, y]) => [-x, y]);
  const key = cells => JSON.stringify(normalize(cells));
  function polySvg(cells, s = 16) {
    const n = normalize(cells);
    const w = (Math.max(...n.map(c => c[0])) + 1) * s, h = (Math.max(...n.map(c => c[1])) + 1) * s;
    return `<svg width="${w + 4}" height="${h + 4}" viewBox="-2 -2 ${w + 4} ${h + 4}">${n.map(([x, y]) => `<rect x="${x * s}" y="${y * s}" width="${s}" height="${s}" style="fill:var(--accent);stroke:var(--bg)" stroke-width="2"/>`).join('')}</svg>`;
  }

  function attitudeSvg(pitch, bank, size = 140) {
    // pitch in graden (+ = neus omhoog), bank in graden (+ = rechts).
    const c = size / 2, ppd = 2.2;
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs><clipPath id="ac${size}"><circle cx="${c}" cy="${c}" r="${c - 4}"/></clipPath></defs>
      <g clip-path="url(#ac${size})"><g transform="rotate(${-bank} ${c} ${c}) translate(0 ${pitch * ppd})">
        <rect x="-200" y="-400" width="${size + 400}" height="${400 + c}" fill="#3e8ed0"/>
        <rect x="-200" y="${c}" width="${size + 400}" height="400" fill="#8a5a2b"/>
        <line x1="-200" y1="${c}" x2="${size + 200}" y2="${c}" stroke="#fff" stroke-width="2"/>
        ${[-20, -10, 10, 20].map(p => `<line x1="${c - 14}" y1="${c - p * ppd}" x2="${c + 14}" y2="${c - p * ppd}" stroke="#fff" stroke-width="1.5"/>`).join('')}
      </g></g>
      <circle cx="${c}" cy="${c}" r="${c - 4}" fill="none" stroke="#222" stroke-width="6"/>
      <path d="M${c - 40},${c} h28 l6,8 l6,-8 h28" stroke="#ffd400" stroke-width="4" fill="none"/>
      <circle cx="${c}" cy="${c}" r="3" fill="#ffd400"/>
    </svg>`;
  }
  function headingSvg(hdg, size = 140) {
    const c = size / 2;
    let ticks = '';
    for (let a = 0; a < 360; a += 30) {
      const lab = { 0: 'N', 90: 'E', 180: 'S', 270: 'W' }[a] || String(a / 10);
      ticks += `<g transform="rotate(${a - hdg} ${c} ${c})"><line x1="${c}" y1="8" x2="${c}" y2="18" stroke="#fff" stroke-width="2"/><text x="${c}" y="32" fill="#fff" font-size="12" text-anchor="middle">${lab}</text></g>`;
    }
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${c}" cy="${c}" r="${c - 2}" fill="#1b1f24" stroke="#444" stroke-width="3"/>${ticks}
      <path d="M${c},${c - 18} l5,22 l14,6 v4 l-14,-2 l-2,10 l5,4 v3 l-8,-2 l-8,2 v-3 l5,-4 l-2,-10 l-14,2 v-4 l14,-6z" fill="#ffd400"/></svg>`;
  }

  const gens = [
    function digitMemory() {
      const len = ri(7, 9);
      const seq = Array.from({ length: len }, () => ri(0, 9)).join('');
      const variants = new Set([seq]);
      while (variants.size < 4) {
        const a = seq.split('');
        const i = ri(0, len - 2);
        if (Math.random() < 0.5) { [a[i], a[i + 1]] = [a[i + 1], a[i]]; } else { a[i] = String((+a[i] + ri(1, 8)) % 10); }
        variants.add(a.join(''));
      }
      return { topic: 'Geheugen', memorize: { html: `<div class="memo-digits">${seq.split('').join(' ')}</div>`, sec: 5 },
        stem: '<p>Which sequence was shown?</p>', ...textOptions(seq, [...variants].slice(1)), explain: `De reeks was ${seq}. Tip: knip in groepjes van 3.` };
    },
    function gridMemory() {
      const n = 6;
      const items = shuffle(SHAPES).slice(0, n).map(s => ({ s, c: pick(COLORS) }));
      const cells = shuffle([...Array(9).keys()]).slice(0, n);
      const grid = Array(9).fill(null);
      items.forEach((it, i) => { grid[cells[i]] = it; });
      const html = `<div class="memo-grid">${grid.map(g => `<div>${g ? shapeSvg(g.s, g.c[1]) : ''}</div>`).join('')}</div>`;
      const target = pick(items);
      if (Math.random() < 0.5) {
        return { topic: 'Geheugen', memorize: { html, sec: 5 }, stem: `<p>What colour was the <b>${target.s}</b>?</p>`,
          ...textOptions(target.c[0], COLORS.map(c => c[0])), explain: `De ${target.s} was ${target.c[0]}.` };
      }
      const pos = grid.indexOf(target);
      const names = ['top left', 'top middle', 'top right', 'middle left', 'centre', 'middle right', 'bottom left', 'bottom middle', 'bottom right'];
      return { topic: 'Geheugen', memorize: { html, sec: 5 }, stem: `<p>Which shape was in the <b>${names[pos]}</b> position?</p>`,
        ...textOptions(target.s, SHAPES), explain: `Op ${names[pos]} stond een ${target.c[0]} ${target.s}.` };
    },
    function panelMemory() {
      const fuel = ri(30, 120) * 100, alt = ri(20, 390) * 100, hdg = ri(0, 35) * 10, spd = ri(140, 320);
      const light = pick(COLORS);
      const order = shuffle(['ALT', 'ASI', 'AI']);
      const html = `<div class="memo-panel"><div><small>FUEL</small><b>${fuel} kg</b></div><div><small>ALT</small><b>${alt} ft</b></div>
        <div><small>HDG</small><b>${String(hdg).padStart(3, '0')}</b></div><div><small>IAS</small><b>${spd} kt</b></div>
        <div><small>MASTER</small><span class="lamp" style="background:${light[1]}"></span></div>
        <div><small>STBY</small><b>${order.join(' · ')}</b></div></div>`;
      const q = pick([
        ['How much fuel was displayed?', `${fuel} kg`, [fuel + 1000, fuel - 500, fuel + 300].map(x => `${x} kg`)],
        ['What altitude was displayed?', `${alt} ft`, [alt + 1000, alt - 1000, alt + 500].map(x => `${x} ft`)],
        ['What heading was displayed?', String(hdg).padStart(3, '0'), [(hdg + 30) % 360, (hdg + 180) % 360, (hdg + 350) % 360].map(x => String(x).padStart(3, '0'))],
        ['What colour was the MASTER light?', light[0], COLORS.map(c => c[0])],
        ['In which order were the standby instruments?', order.join(' · '), [[0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]].map(ix => ix.map(i => order[i]).join(' · '))],
      ]);
      return { topic: 'Geheugen', memorize: { html, sec: 5 }, stem: `<p>${q[0]}</p>`, ...textOptions(q[1], q[2]), explain: `Juist: ${q[1]}.` };
    },
    function series() {
      const t = pick(['arith', 'geo', 'alt', 'square', 'fib', 'diff']);
      let s, next, why;
      if (t === 'arith') { const a = ri(2, 40), d = pick([-7, -4, 3, 6, 9, 11, 13]); s = [0, 1, 2, 3, 4].map(i => a + i * d); next = a + 5 * d; why = `Telkens ${d > 0 ? '+' : ''}${d}.`; }
      else if (t === 'geo') { const a = ri(1, 5), r = pick([2, 3]); s = [0, 1, 2, 3, 4].map(i => a * r ** i); next = a * r ** 5; why = `Telkens × ${r}.`; }
      else if (t === 'alt') { const a = ri(1, 9), b = ri(10, 30), d1 = ri(2, 5), d2 = ri(-4, -1); s = [a, b, a + d1, b + d2, a + 2 * d1]; next = b + 2 * d2; why = `Twee verweven reeksen: ${d1 > 0 ? '+' : ''}${d1} en ${d2}.`; }
      else if (t === 'square') { const o = ri(1, 6); s = [0, 1, 2, 3, 4].map(i => (i + o) ** 2); next = (5 + o) ** 2; why = 'Kwadraten.'; }
      else if (t === 'fib') { const a = ri(1, 4), b = ri(2, 6); s = [a, b]; while (s.length < 5) s.push(s[s.length - 1] + s[s.length - 2]); next = s[3] + s[4]; why = 'Som van de twee vorige.'; }
      else { const a = ri(1, 10), d = ri(1, 4); s = [a]; for (let i = 1; i < 5; i++) s.push(s[i - 1] + d * i); next = s[4] + d * 5; why = `Verschil neemt elke stap met ${d} toe.`; }
      return { topic: 'Reeksen', stem: `<p>What comes next?</p><div class="series">${s.join(', ')}, ?</div>`, ...numOptions(next, [next + 1, next - 2, s[4] * 2, next + 3]), explain: why + ` Antwoord: ${next}.` };
    },
    function arrowSeq() {
      const step = pick([45, 90, -45, 135, -90]), start = ri(0, 7) * 45;
      const arr = a => `<svg width="44" height="44" viewBox="0 0 44 44"><g transform="rotate(${a} 22 22)"><path d="M22,4 L34,20 H26 V40 H18 V20 H10 Z" style="fill:var(--accent)"/></g></svg>`;
      const seq = [0, 1, 2, 3].map(i => arr(start + i * step)).join('');
      const correct = start + 4 * step;
      const wrong = [correct + 45, correct + 90, correct + 180, correct - 45].map(a => ((a % 360) + 360) % 360).filter(a => a !== ((correct % 360) + 360) % 360);
      const opts = textOptions(((correct % 360) + 360) % 360, [...new Set(wrong)]);
      return { topic: 'Patronen', stem: `<p>Which arrow comes next?</p><div class="series">${seq} <b>?</b></div>`,
        options: opts.options.map(a => arr(a)), answer: opts.answer, explain: `Elke stap draait de pijl ${Math.abs(step)}° ${step > 0 ? 'met de klok mee' : 'tegen de klok in'}.` };
    },
    function rotation() {
      let base = polyomino();
      if (key(base) === key(mirror(base))) return rotation();
      // Alle rotaties van het gespiegelde figuur moeten verschillen van de rotaties van het origineel.
      const rots = [base, rot(base), rot(rot(base)), rot(rot(rot(base)))].map(key);
      const m = mirror(base);
      if (rots.includes(key(m)) || [rot(m), rot(rot(m)), rot(rot(rot(m)))].some(c => rots.includes(key(c)))) return rotation();
      // Drie verschillende rotaties (symmetrische vormen leveren dubbele op).
      const uniq = [];
      let r = base;
      for (let i = 0; i < 4; i++) { if (!uniq.some(u => key(u) === key(r))) uniq.push(r); r = rot(r); }
      if (uniq.length < 3) return rotation();
      const same = shuffle(uniq).slice(0, 3);
      let mm = m;
      for (let i = 0; i < ri(0, 3); i++) mm = rot(mm);
      const opts = textOptions('M', ['A', 'B', 'C']);
      const map = { M: polySvg(mm), A: polySvg(same[0]), B: polySvg(same[1]), C: polySvg(same[2]) };
      return { topic: 'Ruimtelijk inzicht', stem: `<p>Which option is <b>not</b> a rotation of this shape? (it is mirrored)</p><div class="series">${polySvg(base)}</div>`,
        options: opts.options.map(k => map[k]), answer: opts.answer, explain: 'De andere drie zijn gedraaide versies. Het juiste antwoord is gespiegeld; die kun je niet terugdraaien naar het origineel.' };
    },
    function heading() {
      const h = ri(0, 35) * 10, t = pick([45, 90, 120, 135, 180, 210, 270]), right = Math.random() < 0.5;
      const n = ((h + (right ? t : -t)) % 360 + 360) % 360;
      const f = x => String(x).padStart(3, '0');
      return { topic: 'Ruimtelijk inzicht', stem: `<p>You are flying heading ${f(h)}. You turn <b>${right ? 'right' : 'left'}</b> through ${t}°. What is your new heading?</p>`,
        ...textOptions(f(n), [f(((h + (right ? -t : t)) % 360 + 360) % 360), f((n + 180) % 360), f((n + 10) % 360), f((n + 90) % 360)]),
        explain: `${f(h)} ${right ? '+' : '−'} ${t} = ${f(n)} (modulo 360).` };
    },
    function sunSide() {
      const dirs = [['north', 0], ['east', 90], ['south', 180], ['west', 270]];
      const sun = pick(dirs), hdg = pick([0, 45, 90, 135, 180, 225, 270, 315]);
      const rel = ((sun[1] - hdg) % 360 + 360) % 360;
      const ans = rel === 0 ? 'Straight ahead' : rel === 180 ? 'Directly behind' : rel < 180 ? (rel === 90 ? 'Right' : rel < 90 ? 'Ahead, to the right' : 'Behind, to the right') : (rel === 270 ? 'Left' : rel > 270 ? 'Ahead, to the left' : 'Behind, to the left');
      const all = ['Straight ahead', 'Directly behind', 'Right', 'Left', 'Ahead, to the right', 'Ahead, to the left', 'Behind, to the right', 'Behind, to the left'];
      return { topic: 'Ruimtelijk inzicht', stem: `<p>The sun is due <b>${sun[0]}</b>. You are flying heading ${String(hdg).padStart(3, '0')}. Where is the sun relative to you?</p>`,
        ...textOptions(ans, all), explain: `Relatieve peiling = zon ${sun[1]}° − koers ${hdg}° = ${rel}°. 0° = recht vooruit, 90° = rechts.` };
    },
    function codeCompare() {
      const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
      const mk = () => Array.from({ length: 4 }, () => Array.from({ length: 5 }, () => pick(chars.split(''))).join(''));
      const a = mk(), b = a.map(s => s.split(''));
      const diffs = ri(0, 3);
      const idx = shuffle([0, 1, 2, 3]).slice(0, diffs);
      idx.forEach(i => { const p = ri(0, 4); let c; do { c = pick(chars.split('')); } while (c === b[i][p]); b[i][p] = c; });
      return { topic: 'Waarnemingssnelheid', timeLimit: 10,
        stem: `<p>How many rows are <b>different</b>?</p><table class="codes">${a.map((s, i) => `<tr><td>${s}</td><td>${b[i].join('')}</td></tr>`).join('')}</table>`,
        ...textOptions(String(diffs), ['0', '1', '2', '3', '4']), explain: `Er ${diffs === 1 ? 'was' : 'waren'} ${diffs} verschillende rij(en).` };
    },
    function countSymbols() {
      const sym = pick(['▲', '●', '■', '◆']), others = ['▲', '●', '■', '◆', '▼', '○'].filter(s => s !== sym);
      const n = ri(5, 12), total = 40;
      const arr = shuffle([...Array(n).fill(sym), ...Array.from({ length: total - n }, () => pick(others))]);
      return { topic: 'Waarnemingssnelheid', timeLimit: 12, stem: `<p>How many <b>${sym}</b> are there?</p><div class="symgrid">${arr.join(' ')}</div>`,
        ...numOptions(n, [n + 1, n - 1, n + 2, n - 2]), explain: `Er waren ${n}.` };
    },
    function instruments() {
      const pitch = pick([-10, 0, 10]), bank = pick([-30, 0, 30]), hdg = pick([0, 90, 180, 270]);
      const dir = { 0: 'north', 90: 'east', 180: 'south', 270: 'west' };
      const d = (p, b, h) => `${p > 0 ? 'Climbing' : p < 0 ? 'Descending' : 'Level'}, ${b > 0 ? 'turning right' : b < 0 ? 'turning left' : 'wings level'}, heading ${dir[h]}`;
      const correct = d(pitch, bank, hdg);
      const wrong = [d(-pitch || 10, bank, hdg), d(pitch, -bank || 30, hdg), d(pitch, bank, (hdg + 180) % 360), d(pitch, -bank || -30, (hdg + 90) % 360)];
      return { topic: 'Instrumenten', stem: `<div class="series">${attitudeSvg(pitch, bank)}${headingSvg(hdg)}</div><p>Which statement describes the aircraft?</p>`,
        ...textOptions(correct, wrong), explain: `Kunstmatige horizon: lucht boven het vliegtuigsymbool = neus omlaag; hellende horizon naar links = bocht naar rechts. Koersindicator: bovenaan staat de huidige koers.` };
    },
    function logic() {
      const c = pick([
        ['All captains are pilots. Some pilots are instructors. Which statement must be true?', 'All captains are pilots', ['Some captains are instructors', 'All instructors are captains', 'No captain is an instructor']],
        ['Tom is taller than Sam. Sam is taller than Ali. Ben is shorter than Ali. Who is the shortest?', 'Ben', ['Ali', 'Sam', 'Tom']],
        ['Flight A departs before B. C departs after A but before B. D departs last. Which departs second?', 'C', ['A', 'B', 'D']],
        ['If it is raining, the runway is wet. The runway is not wet. What follows?', 'It is not raining', ['It is raining', 'The runway is dry because it is sunny', 'Nothing can be concluded']],
        ['No turboprops are jets. All A320s are jets. Which must be true?', 'No A320 is a turboprop', ['Some A320s are turboprops', 'All jets are A320s', 'Some turboprops are A320s']],
        ['WING is to BIRD as FIN is to ...', 'FISH', ['WATER', 'SHARK TOOTH', 'BOAT']],
        ['Which word is the odd one out?', 'Runway', ['Aileron', 'Elevator', 'Rudder']],
      ]);
      return { topic: 'Logisch redeneren', stem: `<p>${c[0]}</p>`, ...textOptions(c[1], c[2]), explain: `Juist: ${c[1]}.` };
    },
  ];

  function generate() {
    const q = pick(gens)();
    if (q.stem) q.stem = themed(q.stem);
    q.marks = 1;
    return q;
  }
  return { generate, attitudeSvg, headingSvg };
})();
