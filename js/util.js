// Kleine hulpfuncties die door alle modules gebruikt worden.
const U = {
  rnd: (a, b) => a + Math.random() * (b - a),
  ri: (a, b) => Math.floor(a + Math.random() * (b - a + 1)),
  pick: arr => arr[Math.floor(Math.random() * arr.length)],
  shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },
  clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
  round: (v, d = 2) => { const f = Math.pow(10, d); return Math.round(v * f) / f; },
  // Getal netjes weergeven, zonder overbodige nullen.
  fmt(v, d = 3) {
    if (typeof v !== 'number') return String(v);
    const r = U.round(v, d);
    return Number.isInteger(r) ? r.toLocaleString('en-GB') : String(r);
  },
  gcd: (a, b) => (b ? U.gcd(b, a % b) : Math.abs(a)),
  el(tag, attrs = {}, ...children) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v);
    }
    for (const c of children.flat()) if (c != null) e.append(c.nodeType ? c : document.createTextNode(c));
    return e;
  },
  // Maakt 4 unieke antwoordopties rond een juist numeriek antwoord.
  numOptions(correct, distractors, d = 3, unit = '') {
    const seen = new Set([U.fmt(correct, d)]);
    const opts = [correct];
    for (const x of distractors) {
      if (opts.length >= 4) break;
      if (!isFinite(x)) continue;
      const k = U.fmt(x, d);
      if (!seen.has(k)) { seen.add(k); opts.push(x); }
    }
    let guard = 0;
    while (opts.length < 4 && guard++ < 50) {
      const f = U.pick([0.5, 0.8, 0.9, 1.1, 1.25, 1.5, 2, 10, 0.1]);
      const x = correct === 0 ? U.ri(1, 9) : correct * f;
      const k = U.fmt(x, d);
      if (!seen.has(k)) { seen.add(k); opts.push(x); }
    }
    const sh = U.shuffle(opts.map((v, i) => ({ v, c: i === 0 })));
    return {
      options: sh.map(o => U.fmt(o.v, d) + (unit ? ' ' + unit : '')),
      answer: sh.findIndex(o => o.c),
    };
  },
  // Maakt 4 tekstopties met één juiste.
  textOptions(correct, wrong) {
    const all = [correct, ...U.shuffle([...new Set(wrong)].filter(w => w !== correct)).slice(0, 3)];
    const sh = U.shuffle(all.map((v, i) => ({ v, c: i === 0 })));
    return { options: sh.map(o => o.v), answer: sh.findIndex(o => o.c) };
  },
  mmss(sec) {
    sec = Math.max(0, Math.round(sec));
    return String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0');
  },
  speak(text) {
    try {
      if (!('speechSynthesis' in window)) return;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-GB'; u.rate = 1.05;
      speechSynthesis.speak(u);
    } catch (e) {}
  },
  beep(freq = 880, dur = 0.08, vol = 0.08) {
    try {
      U._ac = U._ac || new (window.AudioContext || window.webkitAudioContext)();
      const o = U._ac.createOscillator(), g = U._ac.createGain();
      o.frequency.value = freq; g.gain.value = vol;
      o.connect(g); g.connect(U._ac.destination);
      o.start(); o.stop(U._ac.currentTime + dur);
    } catch (e) {}
  },
  // Canvas schalen op het scherm met scherpe weergave op hoge DPI.
  fitCanvas(cv, w, h) {
    const dpr = window.devicePixelRatio || 1;
    cv.width = w * dpr; cv.height = h * dpr;
    cv.style.width = '100%';
    cv.style.maxWidth = w + 'px';
    cv.style.aspectRatio = w + ' / ' + h;
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  },
};

// Resultatenopslag in de browser.
const Store = {
  KEY: 'cae_trainer_history_v1',
  all() { try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); } catch (e) { return []; } },
  add(entry) {
    const a = this.all();
    a.push(Object.assign({ date: new Date().toISOString() }, entry));
    try { localStorage.setItem(this.KEY, JSON.stringify(a.slice(-500))); } catch (e) {}
  },
  clear() { try { localStorage.removeItem(this.KEY); } catch (e) {} },
};
