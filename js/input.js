// Invoer: joystick, voetpedalen, throttle (Gamepad API) met toetsenbord als terugvaloptie.
// Elke functie (pitch, roll, yaw, throttle, knoppen) kan aan een willekeurig apparaat en as gekoppeld worden.
const Input = (() => {
  const STORE = 'cae_input_bindings_v1';
  const FUNCS = {
    pitch:    { label: 'Pitch (stick voor/achter)', type: 'axis' },
    roll:     { label: 'Roll (stick links/rechts)', type: 'axis' },
    twist:    { label: 'Twist (stick draaien)', type: 'axis' },
    rudder:   { label: 'Roer (voetpedalen)', type: 'axis' },
    throttle: { label: 'Throttle (gashendel)', type: 'axis' },
    green:    { label: 'Groene knop (verkeer gezien)', type: 'button' },
    red:      { label: 'Rode knop (waypoint / bocht)', type: 'button' },
  };

  let cfg = {
    deadzone: 0.04,
    bindings: {}, // naam -> {id, index, axis|button, inv}
  };
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) || 'null');
    if (saved) cfg = Object.assign(cfg, saved);
  } catch (e) { /* geen opslag beschikbaar */ }

  const save = () => { try { localStorage.setItem(STORE, JSON.stringify(cfg)); } catch (e) {} };

  const keys = new Set();
  const pressedOnce = new Set();
  window.addEventListener('keydown', e => {
    if (!keys.has(e.code)) pressedOnce.add(e.code);
    keys.add(e.code);
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code) &&
        document.activeElement && document.activeElement.tagName !== 'INPUT') e.preventDefault();
  });
  window.addEventListener('keyup', e => keys.delete(e.code));
  window.addEventListener('blur', () => keys.clear());

  const pads = () => Array.from(navigator.getGamepads ? navigator.getGamepads() : []).filter(Boolean);

  // Zoek het gekoppelde apparaat: eerst op id + index, dan alleen op id (indices kunnen wisselen).
  function findPad(b) {
    const list = pads();
    return list.find(p => p.id === b.id && p.index === b.index) || list.find(p => p.id === b.id) || null;
  }

  // Keyboard-waarden worden gladgestreken zodat ze niet als een schakelaar aanvoelen.
  const kb = { pitch: 0, roll: 0, twist: 0, rudder: 0, throttle: 0.6 };
  let lastT = performance.now();
  function keyboardAxes() {
    const now = performance.now();
    const dt = Math.min(0.1, (now - lastT) / 1000);
    lastT = now;
    const approach = (cur, target, rate) => cur + (target - cur) * Math.min(1, rate * dt);
    const t = (neg, pos) => (keys.has(pos) ? 1 : 0) - (keys.has(neg) ? 1 : 0);
    kb.pitch = approach(kb.pitch, t('ArrowUp', 'ArrowDown'), 6);
    kb.roll = approach(kb.roll, t('ArrowLeft', 'ArrowRight'), 6);
    kb.twist = approach(kb.twist, t('KeyQ', 'KeyE'), 6);
    kb.rudder = approach(kb.rudder, t('KeyZ', 'KeyX'), 6);
    if (keys.has('KeyW')) kb.throttle = Math.min(1, kb.throttle + dt * 0.5);
    if (keys.has('KeyS')) kb.throttle = Math.max(0, kb.throttle - dt * 0.5);
    return kb;
  }

  const dz = v => (Math.abs(v) < cfg.deadzone ? 0 : (v - Math.sign(v) * cfg.deadzone) / (1 - cfg.deadzone));

  function rawAxis(name) {
    const b = cfg.bindings[name];
    if (!b) return null;
    const p = findPad(b);
    if (!p || p.axes[b.axis] === undefined) return null;
    let v = p.axes[b.axis];
    if (b.inv) v = -v;
    return v;
  }

  // Geeft alle stuurwaarden terug. pitch: +1 = stick naar achteren (neus omhoog).
  function state() {
    const k = keyboardAxes();
    const out = {};
    for (const n of ['pitch', 'roll', 'twist', 'rudder']) {
      const r = rawAxis(n);
      out[n] = r === null ? k[n] : dz(r);
      out[n + 'Bound'] = r !== null;
    }
    const th = rawAxis('throttle');
    // Gashendels geven meestal -1 (vol) .. +1 (dicht); met 'omkeren' kan dit worden rechtgezet.
    out.throttle = th === null ? k.throttle : Math.max(0, Math.min(1, (1 - th) / 2));
    out.throttleBound = th !== null;
    out.green = button('green') || keys.has('KeyG') || keys.has('Space');
    out.red = button('red') || keys.has('KeyR') || keys.has('Enter');
    return out;
  }

  function button(name) {
    const b = cfg.bindings[name];
    if (!b) return false;
    const p = findPad(b);
    return !!(p && p.buttons[b.button] && p.buttons[b.button].pressed);
  }

  // Detectie van knop-indrukken als losse gebeurtenis (flank), voor FAST.
  const prevBtn = { green: false, red: false };
  function edges() {
    const s = state();
    const res = {
      green: (s.green && !prevBtn.green),
      red: (s.red && !prevBtn.red),
    };
    prevBtn.green = s.green; prevBtn.red = s.red;
    return res;
  }

  // Koppelen: wacht tot een as duidelijk beweegt of een knop wordt ingedrukt.
  let detecting = null;
  function detect(name, onDone, onCancel) {
    cancelDetect();
    const type = FUNCS[name].type;
    const base = {};
    pads().forEach(p => { base[p.index] = { axes: p.axes.slice(), buttons: p.buttons.map(b => b.pressed) }; });
    const started = performance.now();
    const loop = () => {
      if (!detecting) return;
      for (const p of pads()) {
        const bs = base[p.index] || { axes: p.axes.map(() => 0), buttons: p.buttons.map(() => false) };
        if (type === 'axis') {
          for (let i = 0; i < p.axes.length; i++) {
            if (Math.abs(p.axes[i] - bs.axes[i]) > 0.5) {
              cfg.bindings[name] = { id: p.id, index: p.index, axis: i, inv: (cfg.bindings[name] || {}).inv || false };
              save(); detecting = null; onDone(cfg.bindings[name]); return;
            }
          }
        } else {
          for (let i = 0; i < p.buttons.length; i++) {
            if (p.buttons[i].pressed && !bs.buttons[i]) {
              cfg.bindings[name] = { id: p.id, index: p.index, button: i };
              save(); detecting = null; onDone(cfg.bindings[name]); return;
            }
          }
        }
      }
      if (performance.now() - started > 15000) { detecting = null; onCancel && onCancel(); return; }
      detecting = requestAnimationFrame(loop);
    };
    detecting = requestAnimationFrame(loop);
  }
  function cancelDetect() { if (detecting) cancelAnimationFrame(detecting); detecting = null; }

  function setInvert(name, inv) { if (cfg.bindings[name]) { cfg.bindings[name].inv = inv; save(); } }
  function clear(name) { delete cfg.bindings[name]; save(); }
  function setDeadzone(v) { cfg.deadzone = v; save(); }
  function consumeKey(code) { const had = pressedOnce.has(code); pressedOnce.delete(code); return had; }

  return { FUNCS, cfg, state, edges, detect, cancelDetect, setInvert, clear, setDeadzone, pads, rawAxis, consumeKey };
})();
