// Natuurkunde op GCSE / havo-vwo niveau. Onderwerpen volgens kandidaatverslagen:
// elektrische circuits, momenten, golven, energie, gaswetten, krachten, druk en beweging.
const PhysicsGen = (() => {
  const { ri, pick, numOptions, fmt, textOptions } = U;
  const g = 10;

  const SHEET = `
  <table class="tbl small">
  <tr><td>v = s / t</td><td>a = (v − u) / t</td></tr>
  <tr><td>v = u + at</td><td>s = ut + ½at²</td></tr>
  <tr><td>v² = u² + 2as</td><td>F = ma</td></tr>
  <tr><td>W = mg (g = 10 N/kg)</td><td>p = mv</td></tr>
  <tr><td>Moment = F × d</td><td>Work = F × s</td></tr>
  <tr><td>Eₖ = ½mv²</td><td>Eₚ = mgh</td></tr>
  <tr><td>P = E / t</td><td>efficiency = useful / total</td></tr>
  <tr><td>ρ = m / V</td><td>p = F / A</td></tr>
  <tr><td>p = ρgh</td><td>p₁V₁ = p₂V₂</td></tr>
  <tr><td>V₁/T₁ = V₂/T₂ (T in K)</td><td>p₁/T₁ = p₂/T₂</td></tr>
  <tr><td>V = IR</td><td>P = VI = I²R</td></tr>
  <tr><td>Q = It</td><td>E = QV</td></tr>
  <tr><td>Series: R = R₁ + R₂</td><td>Parallel: 1/R = 1/R₁ + 1/R₂</td></tr>
  <tr><td>v = fλ</td><td>T = 1 / f</td></tr>
  <tr><td>F = kx</td><td>K = °C + 273</td></tr>
  </table>`;

  const one = [
    () => { const I = ri(2, 12), R = pick([2, 4, 5, 10, 20, 50]); const V = I * R;
      return { topic: 'Elektriciteit', stem: `A current of ${I} A flows through a ${R} Ω resistor. What is the voltage across it?`, ...numOptions(V, [I / R, R / I, V * 2], 3, 'V'), explain: `V = IR = ${I} × ${R} = ${V} V.` }; },
    () => { const m = pick([2, 5, 10, 20, 60, 75]); const a = pick([2, 3, 4, 5]); const F = m * a;
      return { topic: 'Krachten', stem: `What net force is needed to accelerate a ${m} kg mass at ${a} m/s²?`, ...numOptions(F, [m / a, m * g, F + m], 3, 'N'), explain: `F = ma = ${m} × ${a} = ${F} N.` }; },
    () => { const m = pick([3, 5, 12, 40, 70]); const W = m * g;
      return { topic: 'Krachten', stem: `What is the weight of a ${m} kg mass on Earth (g = 10 N/kg)?`, ...numOptions(W, [m, m / g, W * 2], 3, 'N'), explain: `W = mg = ${m} × 10 = ${W} N. Massa (kg) is geen gewicht (N).` }; },
    () => { const f = pick([50, 100, 200, 500, 1000]); const l = pick([0.5, 2, 3, 0.2, 1.5]); const v = f * l;
      return { topic: 'Golven', stem: `A wave has frequency ${f} Hz and wavelength ${l} m. What is its speed?`, ...numOptions(v, [f / l, l / f, v * 2], 3, 'm/s'), explain: `v = fλ = ${f} × ${l} = ${fmt(v)} m/s.` }; },
    () => { const c = pick([
        ['What is the SI unit of power?', 'watt', ['joule', 'newton', 'pascal']],
        ['What is the SI unit of pressure?', 'pascal', ['newton', 'bar', 'watt']],
        ['What is the SI unit of electrical charge?', 'coulomb', ['ampere', 'volt', 'ohm']],
        ['Which quantity is a vector?', 'velocity', ['speed', 'mass', 'energy']],
        ['Which of these is a scalar?', 'temperature', ['force', 'acceleration', 'displacement']],
        ['Which type of wave is sound in air?', 'longitudinal', ['transverse', 'electromagnetic', 'stationary']],
        ['Which electromagnetic wave has the shortest wavelength?', 'gamma rays', ['X-rays', 'ultraviolet', 'radio waves']],
        ['In a series circuit, what is the same through every component?', 'current', ['voltage', 'resistance', 'power']],
        ['In a parallel circuit, what is the same across every branch?', 'voltage', ['current', 'resistance', 'charge']],
        ['What happens to the resistance of a metal wire when its temperature rises?', 'it increases', ['it decreases', 'it stays the same', 'it becomes zero']],
        ['Absolute zero is equal to', '−273 °C', ['0 °C', '−100 °C', '−373 °C']],
        ['Which law states that every action has an equal and opposite reaction?', "Newton's third law", ["Newton's first law", "Newton's second law", "Hooke's law"]],
        ['An object moving at constant velocity has a resultant force of', 'zero', ['equal to its weight', 'in the direction of motion', 'opposite to its motion']],
        ['Which energy store increases when an aircraft climbs at constant speed?', 'gravitational potential', ['kinetic', 'elastic', 'chemical']],
      ]); return { topic: 'Begrippen', stem: c[0], ...textOptions(c[1], c[2]), explain: `Juist: ${c[1]}.` }; },
    () => { const m = pick([200, 400, 600, 900]); const V = pick([100, 200, 300, 50]); const r = m / V;
      return { topic: 'Dichtheid en druk', stem: `A block has a mass of ${m} g and a volume of ${V} cm³. What is its density?`, ...numOptions(r, [V / m, m * V / 1000, r * 10], 3, 'g/cm³'), explain: `ρ = m/V = ${m}/${V} = ${fmt(r)} g/cm³.` }; },
  ];

  const two = [
    () => { const R1 = pick([2, 4, 6, 10]), R2 = pick([3, 4, 6, 12, 20]); const series = Math.random() < 0.5;
      const R = series ? R1 + R2 : R1 * R2 / (R1 + R2);
      return { topic: 'Elektriciteit', stem: `Two resistors of ${R1} Ω and ${R2} Ω are connected in ${series ? 'series' : 'parallel'}. What is the total resistance?`,
        ...numOptions(R, [series ? R1 * R2 / (R1 + R2) : R1 + R2, (R1 + R2) / 2, Math.abs(R1 - R2)], 2, 'Ω'),
        explain: series ? `Serie: R = ${R1} + ${R2} = ${R} Ω.` : `Parallel: R = R₁R₂/(R₁+R₂) = ${R1 * R2}/${R1 + R2} = ${fmt(R, 2)} Ω. Altijd kleiner dan de kleinste weerstand.` }; },
    () => { const V = pick([6, 12, 24, 230]); const R = pick([2, 3, 4, 6, 12, 46]); const P = V * V / R;
      return { topic: 'Elektriciteit', stem: `A ${V} V supply is connected across a ${R} Ω heater. What power does it dissipate?`, ...numOptions(P, [V / R, V * R, V * V * R], 2, 'W'), explain: `I = V/R = ${fmt(V / R, 2)} A, P = V²/R = ${V * V}/${R} = ${fmt(P, 2)} W.` }; },
    () => { const I = pick([2, 3, 5, 0.5]); const t = pick([10, 30, 60, 120]); const Q = I * t;
      return { topic: 'Elektriciteit', stem: `A current of ${I} A flows for ${t} s. How much charge passes?`, ...numOptions(Q, [I / t, t / I, Q * 60], 3, 'C'), explain: `Q = It = ${I} × ${t} = ${fmt(Q)} C.` }; },
    () => { const F1 = pick([10, 20, 30, 40, 60]), d1 = pick([0.5, 1, 1.5, 2, 3]), d2 = pick([0.5, 1, 2, 2.5, 4]); const F2 = F1 * d1 / d2;
      return { topic: 'Momenten', stem: `On a balanced beam, a ${F1} N force acts ${d1} m to the left of the pivot. What force is needed ${d2} m to the right of the pivot to balance it?`,
        ...numOptions(F2, [F1 * d2 / d1, F1, F1 * d1 * d2], 2, 'N'), explain: `Momenten in evenwicht: ${F1} × ${d1} = F × ${d2}, dus F = ${fmt(F2, 2)} N.` }; },
    () => { const m = pick([2, 4, 10, 50, 1000]), v = pick([2, 4, 5, 10, 20]); const E = 0.5 * m * v * v;
      return { topic: 'Energie', stem: `What is the kinetic energy of a ${m} kg object moving at ${v} m/s?`, ...numOptions(E, [m * v * v, 0.5 * m * v, m * v], 2, 'J'), explain: `Eₖ = ½mv² = 0,5 × ${m} × ${v * v} = ${fmt(E)} J.` }; },
    () => { const m = pick([2, 5, 20, 60, 80]), h = pick([3, 5, 10, 20, 50]); const E = m * g * h;
      return { topic: 'Energie', stem: `How much gravitational potential energy does a ${m} kg mass gain when lifted ${h} m?`, ...numOptions(E, [m * h, E / 2, m * g], 2, 'J'), explain: `Eₚ = mgh = ${m} × 10 × ${h} = ${fmt(E)} J.` }; },
    () => { const E = pick([1200, 3000, 6000, 18000]), t = pick([10, 20, 30, 60]); const P = E / t;
      return { topic: 'Energie', stem: `A motor transfers ${fmt(E)} J of energy in ${t} s. What is its power?`, ...numOptions(P, [E * t, t / E, P * 60], 3, 'W'), explain: `P = E/t = ${E}/${t} = ${fmt(P)} W.` }; },
    () => { const i = pick([200, 500, 800, 1000]), eff = pick([20, 25, 40, 60, 75]); const u = i * eff / 100;
      return { topic: 'Energie', stem: `A machine has an efficiency of ${eff}%. If ${i} J of energy is supplied, how much is usefully transferred?`, ...numOptions(u, [i - u, i / eff, u * 2], 2, 'J'), explain: `Nuttig = ${eff}% × ${i} = ${fmt(u)} J. De rest gaat verloren als warmte.` }; },
    () => { const F = pick([200, 500, 1000, 1500, 6000]), A = pick([0.5, 2, 0.1, 0.25, 4]); const p = F / A;
      return { topic: 'Dichtheid en druk', stem: `A force of ${F} N acts on an area of ${A} m². What is the pressure?`, ...numOptions(p, [F * A, A / F, p / 10], 2, 'Pa'), explain: `p = F/A = ${F}/${A} = ${fmt(p)} Pa.` }; },
    () => { const p1 = pick([100, 200, 150]), V1 = pick([2, 3, 6, 4]), V2 = pick([1, 2, 8, 12]); if (V1 === V2) return two[9]();
      const p2 = p1 * V1 / V2;
      return { topic: 'Gaswetten', stem: `A gas at ${p1} kPa occupies ${V1} L. At constant temperature it is changed to ${V2} L. What is the new pressure?`,
        ...numOptions(p2, [p1 * V2 / V1, p1, p1 + V1 - V2], 2, 'kPa'), explain: `Wet van Boyle: p₁V₁ = p₂V₂. p₂ = ${p1} × ${V1}/${V2} = ${fmt(p2, 2)} kPa.` }; },
    () => { const u = pick([0, 2, 5, 10]), a = pick([2, 3, 4, 5]), t = pick([3, 4, 5, 6, 10]); const v = u + a * t;
      return { topic: 'Beweging', stem: `An object starts at ${u} m/s and accelerates at ${a} m/s² for ${t} s. What is its final speed?`, ...numOptions(v, [a * t, u + a, u * t + a], 2, 'm/s'), explain: `v = u + at = ${u} + ${a} × ${t} = ${v} m/s.` }; },
    () => { const k = pick([50, 100, 200, 400]), x = pick([0.02, 0.05, 0.1, 0.2]); const F = k * x;
      return { topic: 'Krachten', stem: `A spring with spring constant ${k} N/m is stretched by ${x * 100} cm. What force is applied?`, ...numOptions(F, [k * x * 100, k / x, F * 10], 3, 'N'), explain: `F = kx = ${k} × ${x} = ${fmt(F)} N. Let op: cm naar m!` }; },
    () => { const T = pick([0.02, 0.01, 0.5, 0.25, 0.002]); const f = 1 / T;
      return { topic: 'Golven', stem: `A wave has a period of ${T} s. What is its frequency?`, ...numOptions(f, [T, f / 10, f * 2], 3, 'Hz'), explain: `f = 1/T = 1/${T} = ${fmt(f)} Hz.` }; },
  ];

  const five = [
    () => { const V1 = pick([2, 3, 4, 6]), T1c = pick([27, 0, 127, 77]), T2c = pick([127, 227, 327, 27]); if (T1c === T2c) return five[0]();
      const T1 = T1c + 273, T2 = T2c + 273; const V2 = V1 * T2 / T1;
      return { topic: 'Gaswetten', stem: `A gas at constant pressure has a volume of ${V1} L at ${T1c} °C. What is its volume at ${T2c} °C?`,
        ...numOptions(V2, [V1 * T2c / (T1c || 1), V1 * T1 / T2, V1 + (T2c - T1c) / 100], 2, 'L'),
        explain: `Wet van Charles, temperatuur in kelvin: T₁ = ${T1} K, T₂ = ${T2} K. V₂ = ${V1} × ${T2}/${T1} = ${fmt(V2, 2)} L.` }; },
    () => { const u = pick([0, 5, 10, 20]), a = pick([2, 4, 5]), t = pick([4, 5, 6, 10]); const s = u * t + 0.5 * a * t * t;
      return { topic: 'Beweging', stem: `A car starting at ${u} m/s accelerates uniformly at ${a} m/s² for ${t} s. How far does it travel?`,
        ...numOptions(s, [u * t + a * t * t, 0.5 * a * t * t, (u + a * t) * t], 2, 'm'), explain: `s = ut + ½at² = ${u * t} + ${0.5 * a * t * t} = ${fmt(s)} m.` }; },
    () => { const v = pick([10, 20, 30, 40]), a = pick([2, 4, 5, 8]); const s = v * v / (2 * a);
      return { topic: 'Beweging', stem: `An aircraft lands at ${v} m/s and decelerates uniformly at ${a} m/s². What landing distance does it need to stop?`,
        ...numOptions(s, [v / a, v * v / a, v * a], 2, 'm'), explain: `v² = u² + 2as → 0 = ${v * v} − 2 × ${a} × s → s = ${v * v}/${2 * a} = ${fmt(s, 2)} m.` }; },
    () => { const R1 = pick([4, 6, 10]), R2 = pick([6, 12, 15]), R3 = pick([2, 3, 5]), V = pick([12, 24, 30]);
      const Rp = R1 * R2 / (R1 + R2); const R = Rp + R3; const I = V / R;
      return { topic: 'Elektriciteit', stem: `Resistors of ${R1} Ω and ${R2} Ω are in parallel, and this combination is in series with ${R3} Ω. A ${V} V battery is connected. What current flows from the battery?`,
        ...numOptions(I, [V / (R1 + R2 + R3), V / Rp, V / R3], 2, 'A'), explain: `Parallel: ${fmt(Rp, 2)} Ω. Totaal: ${fmt(R, 2)} Ω. I = ${V}/${fmt(R, 2)} = ${fmt(I, 2)} A.` }; },
    () => { const h = pick([5, 10, 20, 45]); const v = Math.sqrt(2 * g * h);
      return { topic: 'Energie', stem: `An object is dropped from ${h} m. Ignoring air resistance, what is its speed just before hitting the ground (g = 10 m/s²)?`,
        ...numOptions(v, [2 * g * h, g * h, Math.sqrt(g * h)], 2, 'm/s'), explain: `mgh = ½mv² → v = √(2gh) = √${2 * g * h} = ${fmt(v, 2)} m/s.` }; },
    () => { const depth = pick([2, 5, 10, 20]), rho = 1000; const p = rho * g * depth;
      return { topic: 'Dichtheid en druk', stem: `What is the pressure due to water (density 1000 kg/m³) at a depth of ${depth} m?`, ...numOptions(p, [rho * depth, p / 1000, g * depth], 2, 'Pa'), explain: `p = ρgh = 1000 × 10 × ${depth} = ${fmt(p)} Pa.` }; },
    () => { const m1 = pick([2, 4, 1000, 1500]), v1 = pick([3, 5, 10, 20]), m2 = pick([2, 6, 500, 1000]);
      const v = m1 * v1 / (m1 + m2);
      return { topic: 'Impuls', stem: `A ${m1} kg trolley moving at ${v1} m/s collides and sticks to a stationary ${m2} kg trolley. What is their common speed afterwards?`,
        ...numOptions(v, [v1 / 2, m1 * v1 / m2, v1], 2, 'm/s'), explain: `Behoud van impuls: ${m1} × ${v1} = (${m1} + ${m2}) × v, v = ${fmt(v, 2)} m/s.` }; },
    () => { const P = pick([2000, 3000, 1500]), t = pick([2, 3, 5]), price = pick([20, 25, 30]); const cost = P / 1000 * t * price;
      return { topic: 'Elektriciteit', stem: `A ${P} W heater runs for ${t} hours. Electricity costs ${price} p per kWh. What is the cost?`,
        ...numOptions(cost, [P * t * price, P / 1000 * price, cost / 10], 2, 'p'), explain: `Energie = ${P / 1000} kW × ${t} h = ${P / 1000 * t} kWh. Kosten = × ${price} = ${fmt(cost)} p.` }; },
  ];

  function generate(i, count = 20) {
    let pool, marks;
    const r = count ? i / count : Math.random();
    if (r < 0.4) { pool = one; marks = 1; } else if (r < 0.75) { pool = two; marks = 2; } else { pool = five; marks = 5; }
    const q = pick(pool)();
    q.marks = marks;
    return q;
  }
  return { generate, SHEET };
})();
