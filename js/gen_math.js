// Wiskunde zonder rekenmachine. Niveau: GCSE / havo-vwo bovenbouw, met nadruk op hoofdrekenen,
// staartdelingen en vermenigvuldigingen, en snelheid-afstand-tijd (wat kandidaten het vaakst noemen).
const MathGen = (() => {
  const { ri, pick, numOptions, fmt, textOptions } = U;

  const one = [
    function addSub() {
      const a = ri(1200, 9800), b = ri(150, 4900);
      const plus = Math.random() < 0.5;
      const c = plus ? a + b : a - b;
      return { topic: 'Hoofdrekenen', stem: `${fmt(a)} ${plus ? '+' : '−'} ${fmt(b)} = ?`,
        ...numOptions(c, [c + 10, c - 10, c + 100, c - 100, c + 1]), explain: `Antwoord: ${fmt(c)}. Werk van links naar rechts per kolom.` };
    },
    function times() {
      const a = ri(12, 25), b = ri(6, 19), c = a * b;
      return { topic: 'Hoofdrekenen', stem: `${a} × ${b} = ?`, ...numOptions(c, [c + a, c - b, c + 10, (a + 1) * b]),
        explain: `${a} × ${b} = ${a} × ${b - (b % 10)} + ${a} × ${b % 10} = ${c}.` };
    },
    function pctOf() {
      const p = pick([5, 10, 12.5, 15, 20, 25, 30, 40, 75]), base = pick([40, 60, 80, 120, 160, 240, 360, 480]);
      const c = p * base / 100;
      return { topic: 'Procenten', stem: `What is ${p}% of ${base}?`, ...numOptions(c, [c * 2, c / 2, c + 10, base - c]),
        explain: `${p}% = ${p}/100. ${base} × ${p} / 100 = ${fmt(c)}.` };
    },
    function decimals() {
      const a = ri(11, 99) / 10, b = ri(2, 9);
      const c = a * b;
      return { topic: 'Decimalen', stem: `${fmt(a)} × ${b} = ?`, ...numOptions(c, [c / 10, c * 10, c + 0.1, c - b]),
        explain: `Reken ${Math.round(a * 10)} × ${b} = ${Math.round(a * 10) * b} en zet de komma één plek terug: ${fmt(c)}.` };
    },
    function fracDec() {
      const pairs = [[1, 8, 0.125], [3, 8, 0.375], [5, 8, 0.625], [1, 5, 0.2], [3, 4, 0.75], [2, 5, 0.4], [7, 8, 0.875], [1, 16, 0.0625], [3, 20, 0.15], [1, 40, 0.025]];
      const [n, d, v] = pick(pairs);
      return { topic: 'Breuken', stem: `Write ${n}/${d} as a decimal.`, ...numOptions(v, [v * 10, v / 10, n / (d + 1), (n + 1) / d], 4),
        explain: `${n} ÷ ${d} = ${v}. Ken de achtsten en vijfden uit je hoofd.` };
    },
    function square() {
      const a = ri(11, 25), c = a * a;
      return { topic: 'Machten', stem: `${a}² = ?`, ...numOptions(c, [c + a, c - a, 2 * a, c + 1]),
        explain: `${a}² = ${c}. Leer de kwadraten t/m 25 uit je hoofd.` };
    },
    function order() {
      const a = ri(2, 9), b = ri(2, 9), c = ri(2, 9), d = ri(1, 20);
      const r = a + b * c - d;
      return { topic: 'Volgorde bewerkingen', stem: `${a} + ${b} × ${c} − ${d} = ?`, ...numOptions(r, [(a + b) * c - d, a + b * (c - d), r + 2, r - 2]),
        explain: `Eerst vermenigvuldigen: ${b} × ${c} = ${b * c}, dan ${a} + ${b * c} − ${d} = ${r}.` };
    },
  ];

  const two = [
    function longMult() {
      const a = ri(120, 899), b = ri(12, 89), c = a * b;
      return { topic: 'Vermenigvuldigen', stem: `${a} × ${b} = ?`, ...numOptions(c, [c + 10 * a, c - a, c + 100, a * (b + 10)]),
        explain: `${a} × ${b} = ${a} × ${b - (b % 10)} + ${a} × ${b % 10} = ${a * (b - (b % 10))} + ${a * (b % 10)} = ${c}.` };
    },
    function longDiv() {
      const b = ri(12, 48), q = ri(14, 160), a = b * q;
      return { topic: 'Delen', stem: `${fmt(a)} ÷ ${b} = ?`, ...numOptions(q, [q + 1, q - 1, q + 10, q * 10]),
        explain: `Staartdeling: ${b} past ${q} keer in ${a}. Controle: ${b} × ${q} = ${a}.` };
    },
    function sdtDist() {
      const s = pick([120, 150, 180, 240, 300, 360, 420, 450, 480]), m = pick([10, 15, 20, 25, 40, 45, 50, 75, 90]);
      const d = s * m / 60;
      return { topic: 'Snelheid-afstand-tijd', stem: `An aircraft flies at a groundspeed of ${s} kt for ${m} minutes. How far does it travel (NM)?`,
        ...numOptions(d, [s * m / 100, d * 2, d / 2, d + 10]), explain: `Afstand = snelheid × tijd = ${s} × ${m}/60 = ${fmt(d)} NM. Tip: ${s} kt = ${s / 60} NM per minuut.` };
    },
    function sdtTime() {
      const s = pick([120, 150, 180, 240, 300, 360, 480]), d = pick([30, 45, 60, 90, 100, 120, 150, 200]);
      const t = d / s * 60;
      return { topic: 'Snelheid-afstand-tijd', stem: `How many minutes does it take to fly ${d} NM at ${s} kt?`,
        ...numOptions(t, [s / d, t * 2, t / 2, t + 5], 1), explain: `Tijd = afstand / snelheid = ${d}/${s} uur = ${fmt(t, 1)} min.` };
    },
    function sdtSpeed() {
      const d = pick([60, 90, 120, 150, 210, 240, 300]), m = pick([15, 20, 30, 40, 45, 60]);
      const s = d / m * 60;
      return { topic: 'Snelheid-afstand-tijd', stem: `An aircraft covers ${d} NM in ${m} minutes. What is its groundspeed in knots?`,
        ...numOptions(s, [d / m, s / 2, s * 2, s + 30], 1), explain: `Snelheid = ${d} / (${m}/60) = ${fmt(s, 1)} kt.` };
    },
    function linear() {
      const x = ri(-9, 12), a = ri(2, 9), b = ri(-20, 20), c = a * x + b;
      return { topic: 'Algebra', stem: `Solve for x: ${a}x ${b >= 0 ? '+ ' + b : '− ' + -b} = ${c}`,
        ...numOptions(x, [x + 1, -x, (c + b) / a, x - 2]), explain: `${a}x = ${c} ${b >= 0 ? '− ' + b : '+ ' + -b} = ${c - b}, dus x = ${x}.` };
    },
    function convert() {
      const t = pick([
        () => { const v = pick([1000, 2500, 3000, 5000, 10000]); return [`Convert ${fmt(v)} ft to metres (1 ft ≈ 0.3 m).`, v * 0.3, 'm', '1 ft ≈ 0,3 m.']; },
        () => { const v = pick([10, 20, 50, 100, 250]); return [`Convert ${v} NM to km (1 NM ≈ 1.85 km).`, v * 1.85, 'km', '1 NM = 1852 m.']; },
        () => { const v = pick([2, 3, 4.5, 6, 10]); return [`How many kg is ${v} tonnes?`, v * 1000, 'kg', '1 t = 1000 kg.']; },
        () => { const v = pick([500, 1500, 2700, 4200]); return [`Convert ${fmt(v)} litres to m³.`, v / 1000, 'm³', '1 m³ = 1000 L.']; },
        () => { const v = pick([90, 150, 210, 330]); return [`How many hours and minutes is ${v} minutes? Give it in hours.`, v / 60, 'h', 'Deel door 60.']; },
      ])();
      return { topic: 'Eenheden', stem: t[0], ...numOptions(t[1], [t[1] * 10, t[1] / 10, t[1] * 1.1, t[1] / 2], 3, t[2]), explain: t[3] + ` Antwoord: ${fmt(t[1])} ${t[2]}.` };
    },
    function ratio() {
      const a = ri(1, 5), b = ri(2, 7), tot = (a + b) * ri(5, 30);
      const c = tot * a / (a + b);
      return { topic: 'Verhoudingen', stem: `${tot} kg of cargo is split between two holds in the ratio ${a}:${b}. How much goes in the first hold?`,
        ...numOptions(c, [tot * b / (a + b), tot / a, c + a, tot / 2]), explain: `${a + b} delen, 1 deel = ${tot / (a + b)} kg, dus ${a} delen = ${fmt(c)} kg.` };
    },
    function area() {
      const r = ri(2, 9);
      const c = 3 * r * r; // pi ≈ 3 voor schatting
      return { topic: 'Meetkunde', stem: `Estimate the area of a circle with radius ${r} m (use π ≈ 3).`, ...numOptions(c, [2 * 3 * r, 3 * r, c * 2, r * r]),
        explain: `A = πr² ≈ 3 × ${r * r} = ${c} m².` };
    },
    function fuel() {
      const burn = pick([600, 800, 1200, 2400, 2700, 3000]), m = pick([20, 30, 40, 45, 50, 90]);
      const c = burn * m / 60;
      return { topic: 'Brandstof', stem: `An engine burns ${fmt(burn)} kg/h. How much fuel is used in ${m} minutes?`,
        ...numOptions(c, [burn / m, c * 2, c / 2, burn * m / 100], 1, 'kg'), explain: `${burn} × ${m}/60 = ${fmt(c)} kg.` };
    },
    function sciNot() {
      const a = ri(2, 9), e1 = ri(2, 5), b = ri(2, 4), e2 = ri(1, 3);
      let r = a * b, e = e1 + e2;
      if (r >= 10) { r = r / 10; e += 1; }
      const f = (m, x) => `${fmt(m)} × 10<sup>${x}</sup>`;
      return { topic: 'Machten', stem: `(${a} × 10<sup>${e1}</sup>) × (${b} × 10<sup>${e2}</sup>) = ?`,
        ...textOptions(f(r, e), [f(r, e - 1), f(r, e + 1), f(r, e1 * e2 === e ? e + 2 : e1 * e2), f(a + b >= 10 ? (a + b) / 10 : a + b, e), f(r, e + 2), f(r, e - 2)]),
        explain: `Getallen vermenigvuldigen (${a * b}), exponenten optellen (${e1 + e2}). In wetenschappelijke notatie: ${f(r, e)}.` };
    },
  ];

  const five = [
    function avgSpeed() {
      const d1 = pick([60, 90, 120]), s1 = pick([120, 180, 240]), d2 = pick([60, 120, 180]), s2 = pick([240, 360, 120]);
      const t = d1 / s1 + d2 / s2, avg = (d1 + d2) / t;
      return { topic: 'Snelheid-afstand-tijd', stem: `An aircraft flies ${d1} NM at ${s1} kt, then ${d2} NM at ${s2} kt. What is its average groundspeed for the whole trip?`,
        ...numOptions(avg, [(s1 + s2) / 2, avg + 20, avg - 20, (d1 + d2) / 2], 1, 'kt'),
        explain: `Totale tijd = ${d1}/${s1} + ${d2}/${s2} = ${fmt(t, 3)} h. Gemiddelde = ${d1 + d2} / ${fmt(t, 3)} = ${fmt(avg, 1)} kt. Niet het gemiddelde van de snelheden nemen!` };
    },
    function catchUp() {
      const s1 = pick([200, 240, 300]), s2 = s1 + pick([60, 100, 120]), lead = pick([10, 20, 30]);
      const t = (s1 * lead / 60) / (s2 - s1) * 60;
      return { topic: 'Snelheid-afstand-tijd', stem: `Aircraft A departs at ${s1} kt. Aircraft B departs from the same airport ${lead} minutes later at ${s2} kt on the same track. How many minutes after B departs does B catch A?`,
        ...numOptions(t, [t + lead, t / 2, lead, t * 1.5], 1, 'min'),
        explain: `Voorsprong A = ${s1} × ${lead}/60 = ${fmt(s1 * lead / 60)} NM. Inloopsnelheid = ${s2 - s1} kt. Tijd = ${fmt(s1 * lead / 60)}/${s2 - s1} h = ${fmt(t, 1)} min.` };
    },
    function simul() {
      const x = ri(-5, 9), y = ri(-5, 9), a = ri(1, 5), b = ri(1, 5), c = ri(1, 5), d = ri(-5, 5) || 2;
      if (a * d - b * c === 0) return simul();
      const e = a * x + b * y, f = c * x + d * y;
      return { topic: 'Algebra', stem: `Solve: ${a}x + ${b}y = ${e} and ${c}x ${d >= 0 ? '+ ' + d : '− ' + -d}y = ${f}. What is x + y?`,
        ...numOptions(x + y, [x - y, x * y, x + y + 1, y]), explain: `Oplossing: x = ${x}, y = ${y}, dus x + y = ${x + y}. Elimineer één variabele door de vergelijkingen te schalen en af te trekken.` };
    },
    function quadratic() {
      const r1 = ri(-8, 8), r2 = ri(-8, 8);
      const b = -(r1 + r2), c = r1 * r2;
      const big = Math.max(r1, r2);
      return { topic: 'Algebra', stem: `What is the larger solution of x² ${b >= 0 ? '+ ' + b : '− ' + -b}x ${c >= 0 ? '+ ' + c : '− ' + -c} = 0?`,
        ...numOptions(big, [-big, Math.min(r1, r2), big + 1, -Math.min(r1, r2)]),
        explain: `Ontbinden: (x ${r1 >= 0 ? '− ' + r1 : '+ ' + -r1})(x ${r2 >= 0 ? '− ' + r2 : '+ ' + -r2}) = 0, oplossingen ${r1} en ${r2}.` };
    },
    function rearrange() {
      const t = pick([
        ['v = u + at', 'a', 'a = (v − u) / t', ['a = v − u / t', 'a = (v + u) / t', 'a = t / (v − u)']],
        ['P = V² / R', 'R', 'R = V² / P', ['R = P / V²', 'R = P × V²', 'R = √(P / V)']],
        ['E = ½mv²', 'v', 'v = √(2E / m)', ['v = 2E / m', 'v = √(E / 2m)', 'v = √(2m / E)']],
        ['s = ut + ½at²', 'a', 'a = 2(s − ut) / t²', ['a = (s − ut) / 2t²', 'a = 2s / t² − u', 'a = (2s − ut) / t²']],
        ['F = Gm₁m₂ / r²', 'r', 'r = √(Gm₁m₂ / F)', ['r = Gm₁m₂ / F', 'r = √(F / Gm₁m₂)', 'r = F / Gm₁m₂']],
        ['T = 2π√(L/g)', 'L', 'L = gT² / 4π²', ['L = gT / 2π', 'L = T² / 4π²g', 'L = 4π²g / T²']],
      ]);
      const opts = U.textOptions(t[2], t[3]);
      return { topic: 'Formules ombouwen', stem: `Rearrange <b>${t[0]}</b> to make <b>${t[1]}</b> the subject.`, ...opts, explain: `Juist: ${t[2]}.` };
    },
    function compound() {
      const p = pick([10, 20, 5]), n = pick([2, 3]), base = pick([1000, 2000, 5000, 800]);
      const c = base * Math.pow(1 + p / 100, n);
      return { topic: 'Procenten', stem: `A value of ${fmt(base)} increases by ${p}% each year. What is it after ${n} years?`,
        ...numOptions(c, [base * (1 + p * n / 100), c + base * p / 100, base * Math.pow(1 + p / 100, n - 1)], 2),
        explain: `${fmt(base)} × ${1 + p / 100}<sup>${n}</sup> = ${fmt(c, 2)}. Samengestelde groei, niet ${p}% × ${n} optellen.` };
    },
    function windTime() {
      const tas = pick([120, 150, 200, 250, 300]), w = pick([20, 30, 50]), d = pick([100, 150, 200, 300]);
      const head = Math.random() < 0.5;
      const gs = head ? tas - w : tas + w, t = d / gs * 60;
      return { topic: 'Snelheid-afstand-tijd', stem: `True airspeed is ${tas} kt with a direct ${head ? 'headwind' : 'tailwind'} of ${w} kt. How long to fly ${d} NM?`,
        ...numOptions(t, [d / tas * 60, d / (head ? tas + w : tas - w) * 60, t + 10], 1, 'min'),
        explain: `Grondsnelheid = ${tas} ${head ? '−' : '+'} ${w} = ${gs} kt. Tijd = ${d}/${gs} × 60 = ${fmt(t, 1)} min.` };
    },
    function descent() {
      const alt = pick([30000, 36000, 24000, 18000]), rate = pick([1500, 2000, 2500, 3000]), gs = pick([240, 300, 360, 420]);
      const tmin = alt / rate, dist = gs * tmin / 60;
      return { topic: 'Snelheid-afstand-tijd', stem: `An aircraft must descend ${fmt(alt)} ft at ${fmt(rate)} ft/min with a groundspeed of ${gs} kt. How many NM before the target must it start descending?`,
        ...numOptions(dist, [tmin, dist * 2, gs * tmin / 100, dist / 2], 1, 'NM'),
        explain: `Tijd = ${alt}/${rate} = ${fmt(tmin, 2)} min. Afstand = ${gs}/60 × ${fmt(tmin, 2)} = ${fmt(dist, 1)} NM.` };
    },
    function trig() {
      const t = pick([[30, 'sin', 0.5], [60, 'cos', 0.5], [30, 'cos', 0.866], [60, 'sin', 0.866], [90, 'sin', 1], [0, 'cos', 1]]);
      const h = pick([10, 20, 40, 100]);
      const v = h * t[2];
      return { topic: 'Goniometrie', stem: `In a right-angled triangle the hypotenuse is ${h} and one angle is ${t[0]}°. Using ${t[1]} ${t[0]}° = ${t[2]}, what is the ${t[1] === 'cos' ? 'adjacent' : 'opposite'} side?`,
        ...numOptions(v, [h / t[2], h * 0.5, h * 0.707, h]),
        explain: `Zijde = schuine zijde × ${t[1]} = ${h} × ${t[2]} = ${fmt(v)}.` };
    },
  ];

  function fixText(q) {
    // Bij vragen met vooraf gemaakte tekstopties de juiste index bepalen.
    if (q._correct) { q.answer = q.options.indexOf(q._correct); delete q._correct; }
    return q;
  }

  function generate(i, count = 20) {
    // Verdeling vergelijkbaar met kandidaatverslagen: veel 1- en 2-punters, enkele 5-punters aan het eind.
    const r = count ? i / count : Math.random();
    let pool, marks;
    if (r < 0.4) { pool = one; marks = 1; } else if (r < 0.75) { pool = two; marks = 2; } else { pool = five; marks = 5; }
    if (count === 0) { const x = Math.random(); pool = x < 0.35 ? one : x < 0.75 ? two : five; marks = pool === one ? 1 : pool === two ? 2 : 5; }
    const q = fixText(pick(pool)());
    q.marks = marks;
    return q;
  }
  return { generate };
})();
