// Informatie uit het onderzoek (officiële CAE-pagina, forums, blogs van kandidaten).
const INFO_HTML = `
<h2>Wat staat je te wachten?</h2>
<p>Samengevat uit de officiële CAE-pagina en ervaringen van kandidaten op PPRuNe, The Student Room en blogs.
Formats kunnen per jaar verschillen; controleer altijd de uitnodiging die je van CAE krijgt.</p>

<h3>Selectieprocedure Generation easyJet (CAE)</h3>
<ol>
  <li><b>Stage 1, online aanvraag.</b> CAE controleert of je aan de eisen voldoet.</li>
  <li><b>Stage 2, ADAPT.</b> Virtueel of op een CAE-locatie in Europa. Volgens CAE: computertests, pilot aptitude
  (hand-oogcoördinatie, motoriek, ruimtelijk inzicht), academische, wiskundige en technische capaciteit,
  een meerkeuzetest technisch redeneren en een dynamische multitasktest.</li>
  <li><b>Stage 3, easyJet.</b> Groepsopdracht(en) en een persoonlijk interview, soms remote, soms op een CAE-centrum.</li>
</ol>
<p>De assessment is gratis. Resultaten zijn één jaar geldig. Zak je voor een stage, dan mag je na zes maanden één keer herkansen.
Je mag in totaal maximaal twee easyJet-interviews doen.</p>

<h3>Stage 2 per onderdeel (volgens kandidaten)</h3>
<table class="tbl">
<tr><th>Onderdeel</th><th>Wat kandidaten melden</th><th>In deze app</th></tr>
<tr><td>Persoonlijkheidsvragenlijst</td><td>Een paar dagen vooraf online, ca. 270 vragen, ongeveer een uur, geen tijdslimiet. Niet te oefenen; wees consistent en eerlijk.</td><td>Tips onder Stage 3</td></tr>
<tr><td>Maths</td><td>30 min, geen rekenmachine. Vragen van 1, 2 of 5 punten (soms 1/5/10 genoemd). Hoofdrekenen, lange vermenigvuldigingen en delingen, snelheid-afstand-tijd. Geen goniometrie gezien.</td><td>Maths</td></tr>
<tr><td>Physics</td><td>30 min, GCSE-niveau: circuits, momenten, golven, energie, gaswetten. Laatste vragen 5 punten. Formuleblad aanwezig.</td><td>Physics</td></tr>
<tr><td>Technical reasoning</td><td>Meerkeuzetest technisch redeneren (officieel genoemd door CAE).</td><td>Technical reasoning</td></tr>
<tr><td>Cognitive</td><td>15 min. Patroon- en vormherkenning en kortetermijngeheugen: 5 seconden kijken, dan kiezen uit 4. Sommige vragen apart getimed. Lees de instructies goed.</td><td>Cognitive</td></tr>
<tr><td>FAST</td><td>15 min multitask. Vliegtuig sturen (pijltjes of joystick), groene knop bij elk ander vliegtuig, rode knop bij elke bocht/waypoint, tegelijk meerkeuzevragen over wat er gebeurde. Ook een 5-seconden cockpitplaatje (volgorde standby-instrumenten, kleuren, brandstof). Daarna herhaald; je moet verbeteren. Door velen als het zwaarst ervaren.</td><td>FAST multitask</td></tr>
<tr><td>Fixed wing 1 en 2</td><td>1: tutorial, niet gescoord, goed luisteren. 2: 15 min hoogte en snelheid vasthouden en koersen naar waypoints volgen.</td><td>Fixed wing</td></tr>
<tr><td>Ball game</td><td>Bal in het midden houden. Links/rechts door de stick te <b>draaien</b>, op/neer met voor/achter, assen voelen omgekeerd. Kort oefenen, dan ca. 3 min gescoord. Perfect hoeft niet.</td><td>Ball game</td></tr>
</table>
<p>Je mag de tests in willekeurige volgorde doen en tussendoor pauzeren, maar een gestarte test kun je niet stoppen.
Uitslag is geslaagd/niet geslaagd binnen een paar dagen, zonder gedetailleerde scores. Kandidaten gaan uit van een gewogen gemiddelde: één zwak onderdeel is niet meteen fataal.</p>

<h3>Uitrusting</h3>
<p>Bij de virtuele variant gebruikten kandidaten een laptop, joystick en throttle, plus pen, papier en een formuleblad.
Of voetpedalen op de dag gebruikt worden is niet bevestigd; de pedalen in deze app zijn dus vooral extra coördinatietraining en handig in de vliegtest.
Train ook met alleen stick en twist, want dat is wat kandidaten beschrijven.</p>

<h3>Trainingsplan (4 weken)</h3>
<ul>
  <li><b>Week 1:</b> elke dag 20 min Maths in oefenmodus (hoofdrekenen!) en 20 min Physics. Ball game 3×.</li>
  <li><b>Week 2:</b> Technical en Cognitive in oefenmodus. FAST twee runs per dag. Snelheid-afstand-tijd elke dag 2 minuten.</li>
  <li><b>Week 3:</b> Fixed wing 2 met turbulentie, ball game niveau 3, FAST niveau 3.</li>
  <li><b>Week 4:</b> alles in examenmodus, één volledige proefdag. Rust de dag ervoor.</li>
</ul>

<h3>Bronnen</h3>
<ul class="small">
<li><a href="https://www.cae.com/civil-aviation/become-a-pilot/our-pilot-training-programmes/generation-easyjet-pilot-training-programme/" target="_blank" rel="noopener">CAE: Generation easyJet Pilot Training Programme</a></li>
<li><a href="https://becomeapilot.easyjet.com/training-cae/" target="_blank" rel="noopener">easyJet: Becoming a pilot, CAE</a></li>
<li><a href="https://meandtheskyblog.wordpress.com/tag/stage-2-assessment/" target="_blank" rel="noopener">Me and the Sky blog: Stage 2 assessment</a></li>
<li><a href="https://dutchpilotgirl.com/adapt-test/" target="_blank" rel="noopener">Dutch Pilot Girl: ADAPT test</a></li>
<li><a href="https://www.pprune.org/professional-pilot-training-includes-ground-studies/644743-generation-easyjet-cae-2.html" target="_blank" rel="noopener">PPRuNe: Generation easyJet/CAE</a></li>
<li><a href="https://www.pprune.org/professional-pilot-training-includes-ground-studies/655865-generation-cae-mpl-easyjet-5.html" target="_blank" rel="noopener">PPRuNe: Generation CAE MPL easyJet</a></li>
<li><a href="https://www.pprune.org/professional-pilot-training-includes-ground-studies/588798-cae-adapt-tests.html" target="_blank" rel="noopener">PPRuNe: CAE ADAPT tests</a></li>
<li><a href="https://www.pprune.org/professional-pilot-training-includes-ground-studies/637530-cae-adapt-assessment-virtual.html" target="_blank" rel="noopener">PPRuNe: CAE ADAPT assessment virtual</a></li>
<li><a href="https://www.thestudentroom.co.uk/showthread.php?t=7180613" target="_blank" rel="noopener">The Student Room: accepted to Generation easyJet MPL</a></li>
<li><a href="https://www.symbioticsltd.com/individual/practice-adapt-pilot-aptitude-tests" target="_blank" rel="noopener">Symbiotics: officiële ADAPT oefentests (betaald)</a></li>
<li><a href="https://www.narainaviation.com/adapt-test-preparation-guide-for-pilot-selection-with-tips-strategy/" target="_blank" rel="noopener">ADAPT preparation guide</a></li>
</ul>
<p class="muted small">Deze app is een onafhankelijke oefentool en niet verbonden aan CAE, easyJet of Symbiotics. De vragen zijn zelf gemaakt in dezelfde stijl en op hetzelfde niveau als beschreven.
Overweeg ook de officiële Symbiotics ADAPT-oefentests en de e-learning van CAE; kandidaten melden dat het format daarvan bijna gelijk is.</p>
`;

const STAGE3_HTML = `
<h2>Stage 3: groepsopdracht en interview</h2>
<p>Kandidaten beschrijven: een presentatie van easyJet, daarna groepen van ongeveer zes voor een of twee groepsopdrachten,
en een persoonlijk interview van ongeveer een uur met een piloot en iemand van HR. Mix van motivatie- en competentievragen.</p>

<h3>Competenties (EASA / ICAO pilot competencies)</h3>
<ul>
<li><b>Communication</b>: duidelijk, luisteren, samenvatten, assertief.</li>
<li><b>Leadership & Teamwork</b>: initiatief, anderen betrekken, conflicten oplossen.</li>
<li><b>Problem Solving & Decision Making</b>: informatie verzamelen, opties wegen, besluiten, evalueren.</li>
<li><b>Situational Awareness</b>: overzicht houden, vooruitdenken.</li>
<li><b>Workload Management</b>: prioriteren, plannen, taken delegeren.</li>
<li><b>Application of Procedures & Knowledge</b>: regels kennen en volgen, en weten wanneer niet.</li>
</ul>

<h3>Groepsopdracht</h3>
<ul>
<li>Zorg dat iemand de tijd bewaakt (bied het zelf aan, of laat het iemand doen).</li>
<li>Vat regelmatig samen: "Dus we hebben nu A en B, nog 10 minuten voor C."</li>
<li>Betrek stille groepsleden: "Wat denk jij?"</li>
<li>Niet domineren, niet verdwijnen. Kwaliteit van bijdragen telt, niet hoeveelheid.</li>
<li>Veiligheid eerst in elke prioritering. Bij twijfel: veilige optie.</li>
<li>Kom tot een besluit binnen de tijd. Een gezamenlijk goed besluit is beter dan een perfect plan dat niet af is.</li>
</ul>

<h3>Interview</h3>
<ul>
<li>Gebruik de <b>STAR</b>-methode: Situatie, Taak, Actie (wat deed <i>jij</i>), Resultaat (en wat je leerde).</li>
<li>Bereid 8 tot 10 concrete voorbeelden voor die je flexibel kunt inzetten.</li>
<li>Ken easyJet: A320-familie, basissen (ook in Nederland: Amsterdam), cultuur, recente nieuws, duurzaamheid.</li>
<li>Ken het traject: MPL bij CAE, kosten en financiering, wat er na de opleiding gebeurt.</li>
<li>Persoonlijkheidsvragenlijst: wees consistent en eerlijk. Denk als een captain: veiligheid, teamwork, procedures.</li>
</ul>
`;

const STAGE3_QUESTIONS = [
  ['Why do you want to become a pilot?', 'Motivatie'],
  ['Why easyJet, and not another airline?', 'Motivatie'],
  ['Why did you choose the CAE MPL programme?', 'Motivatie'],
  ['What do you know about easyJet and its current challenges?', 'Kennis'],
  ['Tell me about a time you had to make a difficult decision under pressure.', 'Problem solving & decision making'],
  ['Describe a situation where you disagreed with someone in authority. What did you do?', 'Communication / authority gradient'],
  ['Give an example of when you led a team to achieve a goal.', 'Leadership'],
  ['Tell me about a time you made a mistake. How did you handle it?', 'Integriteit / leren'],
  ['Describe a time you had too many tasks at once. How did you prioritise?', 'Workload management'],
  ['Tell me about a time you noticed something others had missed.', 'Situational awareness'],
  ['Give an example of when you followed a procedure even though it was inconvenient.', 'Application of procedures'],
  ['Describe a time you had to adapt quickly to an unexpected change.', 'Flexibiliteit'],
  ['Tell me about a time you had to give difficult feedback to a colleague.', 'Communication'],
  ['How do you handle stress? Give an example.', 'Zelfmanagement'],
  ['Describe a time you worked with someone you did not get along with.', 'Teamwork'],
  ['What would you do if your captain was about to make an unsafe decision?', 'Veiligheid / assertiviteit'],
  ['What is CRM and why is it important?', 'Kennis'],
  ['What are your biggest weaknesses?', 'Zelfkennis'],
  ['How would you fund the training, and how will you cope with the workload?', 'Commitment'],
  ['Where do you see yourself in ten years?', 'Motivatie'],
  ['Tell me about a time you went above and beyond for a customer.', 'Klantgerichtheid'],
  ['Describe a time when you had to learn something complex in a short time.', 'Leervermogen'],
];
