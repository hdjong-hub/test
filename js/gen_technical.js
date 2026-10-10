// Technisch inzicht (CAE: "multiple-choice test of technical reasoning").
// Tandwielen, riemen, hefbomen, katrollen, veren, hydrauliek en hellende vlakken, met tekeningen.
const TechGen = (() => {
  const { ri, pick, numOptions, fmt, textOptions } = U;
  // SVG-attributen accepteren geen CSS-variabelen, dus die gaan naar een style-attribuut (voor licht/donker thema).
  const themed = svg => svg.replace(/<(\w+)([^>]*?)(\/?)>/g, (m, tag, attrs, close) => {
    let st = '';
    attrs = attrs.replace(/\s(fill|stroke)="(var\(--[\w-]+\))"/g, (mm, a, v) => { st += `${a}:${v};`; return ''; });
    return st ? `<${tag}${attrs} style="${st}"${close}>` : m;
  });
  const S = (w, h, inner) => themed(`<svg class="diagram" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`);
  window.themedSvg = themed;

  function gear(cx, cy, r, teeth, label, fill = 'var(--d-fill)') {
    const pts = [];
    const n = teeth * 2;
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
      const rr = i % 2 === 0 ? r + 5 : r - 1;
      pts.push(`${cx + rr * Math.cos(a0)},${cy + rr * Math.sin(a0)}`, `${cx + rr * Math.cos(a1)},${cy + rr * Math.sin(a1)}`);
    }
    return `<polygon points="${pts.join(' ')}" fill="${fill}" stroke="var(--d-line)" stroke-width="1.5"/>` +
      `<circle cx="${cx}" cy="${cy}" r="4" fill="var(--d-line)"/>` +
      `<text x="${cx}" y="${cy - 8}" text-anchor="middle" class="dl">${label}</text>`;
  }
  const arrowDefs = `<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="var(--accent)"/></marker></defs>`;
  function rotArrow(cx, cy, r, cw) {
    // Boogpijl die de draairichting toont.
    const a0 = -Math.PI * 0.8, a1 = -Math.PI * 0.2;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0), x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    return cw ? `<path d="M${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1}" fill="none" stroke="var(--accent)" stroke-width="2.5" marker-end="url(#ah)"/>`
      : `<path d="M${x1},${y1} A${r},${r} 0 0 0 ${x0},${y0}" fill="none" stroke="var(--accent)" stroke-width="2.5" marker-end="url(#ah)"/>`;
  }

  const gens = [
    function gearChain() {
      const n = ri(3, 6);
      const rs = Array.from({ length: n }, () => ri(18, 34));
      let x = 30, inner = arrowDefs;
      const centers = [];
      rs.forEach((r, i) => {
        if (i > 0) x += rs[i - 1] + r + 4;
        else x += r;
        const y = 90 + (i % 2 ? -18 : 18) * (Math.random() < 0.5 ? 0 : 1);
        centers.push([x, y]);
      });
      // Zorg dat tandwielen echt aan elkaar raken: plaats ze horizontaal op afstand r1 + r2.
      centers.forEach((c, i) => { inner += gear(c[0], 90, rs[i], Math.max(8, Math.round(rs[i] / 2.5)), String.fromCharCode(65 + i)); });
      const cw0 = Math.random() < 0.5;
      inner += rotArrow(centers[0][0], 90, rs[0] + 14, cw0);
      const w = x + rs[n - 1] + 30;
      const target = n - 1;
      const cw = (target % 2 === 0) ? cw0 : !cw0;
      const name = String.fromCharCode(65 + target);
      return { topic: 'Tandwielen', stem: S(w, 180, inner) + `<p>Gear A turns ${cw0 ? 'clockwise' : 'anticlockwise'}. In which direction does gear ${name} turn?</p>`,
        ...textOptions(cw ? 'Clockwise' : 'Anticlockwise', [cw ? 'Anticlockwise' : 'Clockwise', 'It does not move', 'It alternates direction']),
        explain: `Elk volgend tandwiel draait de andere kant op. Gear ${name} is nummer ${target + 1}: ${target % 2 === 0 ? 'oneven positie, dus dezelfde richting als A' : 'even positie, dus tegengesteld aan A'}.` };
    },
    function gearSpeed() {
      const t1 = pick([10, 12, 15, 20, 24, 30, 40]), t2 = pick([10, 20, 30, 40, 45, 60, 80]);
      if (t1 === t2) return gearSpeed();
      const rpm = pick([60, 90, 120, 240, 300, 600]);
      const out = rpm * t1 / t2;
      const r1 = 12 + t1 * 0.7, r2 = 12 + t2 * 0.7;
      const inner = gear(40 + r1, 100, r1, Math.round(t1 / 2), `A: ${t1}T`) + gear(40 + 2 * r1 + r2 + 4, 100, r2, Math.round(t2 / 2), `B: ${t2}T`);
      return { topic: 'Tandwielen', stem: S(80 + 2 * r1 + 2 * r2 + 10, 200, inner) + `<p>Gear A has ${t1} teeth and turns at ${rpm} rpm. Gear B has ${t2} teeth. How fast does gear B turn?</p>`,
        ...numOptions(out, [rpm * t2 / t1, rpm, out * 2], 2, 'rpm'),
        explain: `Toerental × tanden is gelijk: ${rpm} × ${t1} = n × ${t2}, dus n = ${fmt(out, 2)} rpm. Groter tandwiel draait langzamer.` };
    },
    function belt() {
      const crossed = Math.random() < 0.5, cw0 = Math.random() < 0.5;
      const r1 = 30, r2 = ri(18, 40), x1 = 60, x2 = 240;
      let inner = arrowDefs + `<circle cx="${x1}" cy="90" r="${r1}" fill="var(--d-fill)" stroke="var(--d-line)" stroke-width="2"/><circle cx="${x2}" cy="90" r="${r2}" fill="var(--d-fill)" stroke="var(--d-line)" stroke-width="2"/>`;
      inner += `<text x="${x1}" y="94" text-anchor="middle" class="dl">A</text><text x="${x2}" y="94" text-anchor="middle" class="dl">B</text>`;
      if (crossed) inner += `<line x1="${x1}" y1="${90 - r1}" x2="${x2}" y2="${90 + r2}" stroke="var(--d-line)" stroke-width="2"/><line x1="${x1}" y1="${90 + r1}" x2="${x2}" y2="${90 - r2}" stroke="var(--d-line)" stroke-width="2"/>`;
      else inner += `<line x1="${x1}" y1="${90 - r1}" x2="${x2}" y2="${90 - r2}" stroke="var(--d-line)" stroke-width="2"/><line x1="${x1}" y1="${90 + r1}" x2="${x2}" y2="${90 + r2}" stroke="var(--d-line)" stroke-width="2"/>`;
      inner += rotArrow(x1, 90, r1 + 12, cw0);
      const cw = crossed ? !cw0 : cw0;
      return { topic: 'Riemen en katrollen', stem: S(300, 180, inner) + `<p>Pulley A turns ${cw0 ? 'clockwise' : 'anticlockwise'}. Which way does pulley B turn?</p>`,
        ...textOptions(cw ? 'Clockwise' : 'Anticlockwise', [cw ? 'Anticlockwise' : 'Clockwise', 'It does not move', 'Depends on the pulley size']),
        explain: crossed ? 'Een gekruiste riem keert de draairichting om.' : 'Een open (niet gekruiste) riem houdt dezelfde draairichting.' };
    },
    function lever() {
      const L = pick([100, 200, 300, 400, 600]), a = pick([0.5, 1, 1.5, 2]), b = pick([1, 2, 3, 4, 5]);
      if (a === b) return lever();
      const E = L * a / b;
      const scale = 40, fx = 160;
      const inner = arrowDefs + `<rect x="${fx - a * scale - 20}" y="70" width="${(a + b) * scale + 40}" height="8" fill="var(--d-fill)" stroke="var(--d-line)"/>` +
        `<polygon points="${fx},78 ${fx - 14},108 ${fx + 14},108" fill="var(--d-line)"/>` +
        `<rect x="${fx - a * scale - 16}" y="40" width="32" height="30" fill="var(--d-box)" stroke="var(--d-line)"/><text x="${fx - a * scale}" y="60" text-anchor="middle" class="dl">${L} N</text>` +
        `<line x1="${fx + b * scale}" y1="20" x2="${fx + b * scale}" y2="66" stroke="var(--accent)" stroke-width="3" marker-end="url(#ah)"/><text x="${fx + b * scale}" y="14" text-anchor="middle" class="dl">F ?</text>` +
        `<text x="${fx - a * scale / 2}" y="128" text-anchor="middle" class="dl">${a} m</text><text x="${fx + b * scale / 2}" y="128" text-anchor="middle" class="dl">${b} m</text>`;
      return { topic: 'Hefbomen', stem: S(fx + b * scale + 50, 140, inner) + `<p>What downward force F is needed to balance the ${L} N load?</p>`,
        ...numOptions(E, [L * b / a, L, L / (a + b)], 2, 'N'), explain: `Moment links = moment rechts: ${L} × ${a} = F × ${b} → F = ${fmt(E, 2)} N.` };
    },
    function pulleys() {
      const n = pick([1, 2, 3, 4, 6]), W = pick([120, 240, 360, 600, 1200]);
      const E = W / n;
      // Eenvoudige schematische tekening van n dragende touwdelen.
      let inner = `<line x1="20" y1="10" x2="260" y2="10" stroke="var(--d-line)" stroke-width="4"/>`;
      for (let i = 0; i < n; i++) inner += `<line x1="${60 + i * 25}" y1="10" x2="${60 + i * 25}" y2="120" stroke="var(--d-line)" stroke-width="2"/>`;
      inner += `<rect x="45" y="120" width="${Math.max(40, n * 25 + 5)}" height="40" fill="var(--d-box)" stroke="var(--d-line)"/><text x="${50 + Math.max(40, n * 25 + 5) / 2}" y="145" text-anchor="middle" class="dl">${W} N</text>`;
      return { topic: 'Riemen en katrollen', stem: S(280, 170, inner) + `<p>A load of ${W} N hangs from a pulley system in which <b>${n}</b> rope section${n > 1 ? 's' : ''} support${n > 1 ? '' : 's'} the moving block. Ignoring friction, what effort is needed to lift it?</p>`,
        ...numOptions(E, [W * n, W, W / (n + 1)], 2, 'N'), explain: `Mechanisch voordeel = aantal dragende touwdelen = ${n}. Kracht = ${W}/${n} = ${fmt(E, 2)} N. Je trekt het touw wel ${n}× zo ver.` };
    },
    function springs() {
      const k = pick([100, 200, 400, 500]), F = pick([10, 20, 40, 50]), series = Math.random() < 0.5;
      const x = series ? 2 * F / k : F / (2 * k);
      return { topic: 'Veren', stem: `<p>Two identical springs (k = ${k} N/m each) are connected in <b>${series ? 'series (one below the other)' : 'parallel (side by side)'}</b>. A load of ${F} N is hung from them. What is the total extension?</p>`,
        ...numOptions(x * 100, [F / k * 100, (series ? F / (2 * k) : 2 * F / k) * 100, F / k * 400], 2, 'cm'),
        explain: series ? `In serie draagt elke veer de volle ${F} N: elk rekt ${fmt(F / k * 100)} cm, samen ${fmt(x * 100)} cm.` : `Parallel deelt de last: elk ${F / 2} N, rek ${fmt(x * 100)} cm.` };
    },
    function hydraulic() {
      const a1 = pick([2, 5, 10]), a2 = pick([50, 100, 200, 400]), F1 = pick([20, 50, 100]);
      const F2 = F1 * a2 / a1;
      return { topic: 'Hydrauliek', stem: `<p>In a hydraulic jack, a force of ${F1} N is applied to a piston of area ${a1} cm². The output piston has an area of ${a2} cm². What force does the output piston produce?</p>`,
        ...numOptions(F2, [F1 * a1 / a2, F1, F1 * (a2 - a1)], 2, 'N'), explain: `Druk is overal gelijk: F₂ = F₁ × A₂/A₁ = ${F1} × ${a2 / a1} = ${fmt(F2)} N.` };
    },
    function incline() {
      const W = pick([200, 500, 600, 1000]), h = pick([1, 2, 3]), L = pick([4, 5, 6, 10]);
      const E = W * h / L;
      const inner = `<polygon points="20,150 ${20 + L * 25},150 ${20 + L * 25},${150 - h * 35}" fill="var(--d-fill)" stroke="var(--d-line)"/>` +
        `<text x="${20 + L * 12}" y="${150 - h * 20}" class="dl" text-anchor="end">L = ${L} m</text><text x="${28 + L * 25}" y="${150 - h * 15}" class="dl">h = ${h} m</text>`;
      return { topic: 'Hellend vlak', stem: S(60 + L * 25, 165, inner) + `<p>A ${W} N box is pushed up a frictionless ramp. What force parallel to the ramp is needed?</p>`,
        ...numOptions(E, [W * L / h, W, W * h], 2, 'N'), explain: `Arbeid gelijk: F × L = W × h → F = ${W} × ${h}/${L} = ${fmt(E, 2)} N.` }; },
    function concepts() {
      const c = pick([
        ['Water flows out of three holes at different heights in a tall tank. Which jet comes out with the highest speed?', 'The lowest hole', ['The highest hole', 'The middle hole', 'All the same'], 'Druk neemt toe met diepte (p = ρgh).'],
        ['Which beam cross-section is stiffest in bending for the same amount of material?', 'I-beam', ['Solid square', 'Flat plate laid flat', 'Round solid rod'], 'Materiaal ver van de neutrale lijn geeft de meeste stijfheid.'],
        ['A wheel turns faster. What happens to the speed of a point on its rim compared with a point near the hub?', 'The rim point moves faster', ['The hub point moves faster', 'They move at the same speed', 'Neither moves'], 'v = ωr: grotere straal, grotere snelheid.'],
        ['A heavier and a lighter ball are dropped together in a vacuum. Which lands first?', 'They land together', ['The heavier ball', 'The lighter ball', 'Depends on the size'], 'Zonder luchtweerstand versnelt alles met g.'],
        ['Why does a long spanner make it easier to undo a tight bolt?', 'It increases the moment for the same force', ['It reduces friction', 'It increases the force', 'It reduces the weight'], 'Moment = kracht × arm.'],
        ['Air flows faster over the top of a wing. What happens to the pressure there?', 'It decreases', ['It increases', 'It stays the same', 'It becomes zero'], 'Bernoulli: hogere snelheid, lagere statische druk.'],
        ['A metal rod is heated. What happens to its length?', 'It increases', ['It decreases', 'It stays the same', 'It first decreases then increases'], 'Thermische uitzetting.'],
        ['Two tanks are connected at the bottom by a pipe. Tank 1 is wide, tank 2 is narrow. Where does the water level settle?', 'At the same height in both', ['Higher in the narrow tank', 'Higher in the wide tank', 'All water flows to the wide tank'], 'Communicerende vaten: zelfde hoogte.'],
        ['A load is lifted with a single fixed pulley. What is the mechanical advantage?', '1 (it only changes direction)', ['2', '0.5', '4'], 'Een vaste katrol verandert alleen de richting.'],
        ['Which shape gives the lowest drag in a fast airflow?', 'Streamlined teardrop', ['Flat plate facing the flow', 'Cube', 'Hollow half-sphere facing the flow'], 'Gestroomlijnde vorm voorkomt loslating.'],
        ['A gear with 10 teeth drives a gear with 40 teeth. The output compared to the input has', 'more torque and less speed', ['more speed and more torque', 'less speed and less torque', 'more speed and less torque'], 'Overbrenging 1:4 vertraagt en vergroot koppel.'],
        ['A ship moves from fresh water to salt water. What happens?', 'It floats slightly higher', ['It sinks lower', 'It stays at the same level', 'It sinks'], 'Zout water is dichter, dus minder volume verplaatst.'],
      ]);
      return { topic: 'Inzicht', stem: `<p>${c[0]}</p>`, ...textOptions(c[1], c[2]), explain: c[3] };
    },
  ];

  function generate(i, count = 20) {
    const q = pick(gens)();
    q.marks = 1;
    return q;
  }
  return { generate };
})();
