// Basiskennis luchtvaart (sommige ADAPT-versies hebben een Aviation Knowledge-deel).
// Voor Generation easyJet is geen voorkennis vereist, maar deze basis helpt ook bij het interview.
const AviationGen = (() => {
  const B = [
    ['Principles of Flight', 'What are the four forces acting on an aircraft in flight?', 'Lift, weight, thrust, drag', ['Lift, gravity, power, friction', 'Pitch, roll, yaw, thrust', 'Lift, weight, speed, altitude'], 'De vier krachten: lift, gewicht, stuwkracht, weerstand.'],
    ['Principles of Flight', 'Which control surface controls rotation about the longitudinal axis (roll)?', 'Ailerons', ['Elevator', 'Rudder', 'Flaps'], 'Rolroeren voor rollen, hoogteroer voor pitch, richtingsroer voor yaw.'],
    ['Principles of Flight', 'Which control surface controls pitch?', 'Elevator', ['Ailerons', 'Rudder', 'Spoilers'], 'Hoogteroer = pitch.'],
    ['Principles of Flight', 'Which control surface controls yaw?', 'Rudder', ['Elevator', 'Ailerons', 'Slats'], 'Richtingsroer (pedalen) = yaw.'],
    ['Principles of Flight', 'What happens when the critical angle of attack is exceeded?', 'The wing stalls', ['Lift increases sharply', 'Drag disappears', 'The aircraft accelerates'], 'Boven de kritische invalshoek laat de stroming los: overtrek.'],
    ['Principles of Flight', 'What is the main purpose of flaps?', 'Increase lift at low speed', ['Increase cruise speed', 'Control roll', 'Reduce weight'], 'Flaps vergroten welving en lift voor start en landing.'],
    ['Principles of Flight', 'In a level turn, what happens to the load factor as bank angle increases?', 'It increases', ['It decreases', 'It stays at 1', 'It becomes zero'], 'n = 1/cos(bank). 60° bank = 2g.'],
    ['Principles of Flight', 'Lift is proportional to', 'the square of the airspeed', ['the airspeed', 'the cube of the airspeed', 'the altitude'], 'L = ½ρv²SCL.'],
    ['Principles of Flight', 'What is induced drag mainly caused by?', 'Wingtip vortices from producing lift', ['Skin friction', 'Engine exhaust', 'Landing gear'], 'Geïnduceerde weerstand ontstaat door liftopwekking (tipwervels).'],
    ['Principles of Flight', 'As an aircraft slows down in level flight, induced drag', 'increases', ['decreases', 'stays the same', 'becomes zero'], 'Lager tempo vraagt een hogere invalshoek, dus meer geïnduceerde weerstand.'],
    ['Principles of Flight', 'What does a winglet primarily reduce?', 'Induced drag', ['Parasite drag', 'Weight', 'Stall speed'], 'Winglets verminderen tipwervels.'],
    ['Principles of Flight', 'The angle between the chord line and the relative airflow is the', 'angle of attack', ['angle of incidence', 'dihedral angle', 'pitch angle'], 'Invalshoek = koorde t.o.v. aanstroming.'],
    ['Meteorology', 'In the ISA, what is the sea level temperature?', '15 °C', ['0 °C', '20 °C', '10 °C'], 'ISA: 15 °C, 1013,25 hPa.'],
    ['Meteorology', 'In the ISA, what is the sea level pressure?', '1013.25 hPa', ['1000 hPa', '1030 hPa', '29.29 inHg'], 'ISA: 1013,25 hPa.'],
    ['Meteorology', 'What is the ISA temperature lapse rate in the troposphere?', '2 °C per 1000 ft', ['1 °C per 1000 ft', '3 °C per 1000 ft', '6.5 °C per 1000 ft'], 'Ongeveer 2 °C per 1000 ft (6,5 °C per km).'],
    ['Meteorology', 'Which cloud is associated with thunderstorms?', 'Cumulonimbus', ['Cirrus', 'Stratus', 'Altostratus'], 'CB = onweer, turbulentie, ijzel, hagel.'],
    ['Meteorology', 'In the Northern Hemisphere, winds blow around a low-pressure area', 'anticlockwise', ['clockwise', 'straight into the centre', 'away from the centre'], 'Lagedrukgebied NH: tegen de klok in.'],
    ['Meteorology', 'What does a METAR describe?', 'Actual weather at an aerodrome', ['A forecast for 24 hours', 'Significant weather en route', 'Upper winds'], 'METAR = actuele waarneming, TAF = verwachting.'],
    ['Meteorology', 'Fog is most likely to form when', 'air cools to its dew point near the surface', ['temperature rises above dew point', 'strong winds blow', 'pressure falls rapidly'], 'Mist bij afkoeling tot het dauwpunt.'],
    ['Meteorology', 'When flying from high to low pressure without resetting the altimeter, the aircraft will be', 'lower than indicated', ['higher than indicated', 'at the indicated altitude', 'climbing'], '"High to low, look out below".'],
    ['Meteorology', 'Air density decreases when', 'temperature increases', ['pressure increases', 'altitude decreases', 'humidity decreases'], 'Warme lucht is ijler; ook hogere vochtigheid en hoogte verlagen de dichtheid.'],
    ['Navigation', 'How many nautical miles is one degree of latitude?', '60 NM', ['100 NM', '1 NM', '360 NM'], '1 boogminuut = 1 NM.'],
    ['Navigation', 'One knot is', 'one nautical mile per hour', ['one kilometre per hour', 'one statute mile per hour', 'one metre per second'], '1 kt = 1 NM/h ≈ 1,852 km/h.'],
    ['Navigation', 'What is the reciprocal of heading 070?', '250', ['110', '290', '340'], '070 + 180 = 250.'],
    ['Navigation', 'UTC is the same as', 'the time at the Greenwich meridian (no daylight saving)', ['local time in Amsterdam', 'British Summer Time', 'airport local time'], 'UTC = Zulu tijd.'],
    ['Navigation', 'Lines of longitude run', 'from pole to pole', ['parallel to the equator', 'only in the northern hemisphere', 'east–west'], 'Meridianen lopen van pool naar pool.'],
    ['Navigation', 'True airspeed compared with indicated airspeed at high altitude is', 'higher', ['lower', 'the same', 'zero'], 'Lagere dichtheid → TAS > IAS.'],
    ['Navigation', 'Magnetic variation is the angle between', 'true north and magnetic north', ['magnetic north and compass north', 'heading and track', 'track and wind'], 'Variatie = ware vs magnetische noord.'],
    ['Air Law', 'What does ICAO stand for?', 'International Civil Aviation Organization', ['International Commercial Airline Office', 'Inter-Continental Aviation Organization', 'International Civil Airport Operators'], 'Organisatie van de VN in Montreal.'],
    ['Air Law', 'Which agency regulates civil aviation safety in the EU?', 'EASA', ['FAA', 'Eurocontrol', 'IATA'], 'EASA in Keulen.'],
    ['Air Law', 'Transponder code 7700 means', 'general emergency', ['radio failure', 'unlawful interference', 'VFR flight'], '7500 kaping, 7600 radiostoring, 7700 noodgeval.'],
    ['Air Law', 'Transponder code 7600 means', 'radio communication failure', ['emergency', 'hijack', 'military flight'], '7600 = radiostoring.'],
    ['Air Law', 'Two aircraft approach head-on. What should both do?', 'Turn right', ['Turn left', 'Climb', 'Descend'], 'Beide naar rechts uitwijken.'],
    ['Air Law', 'An aircraft being overtaken has', 'right of way; the overtaking aircraft passes on the right', ['to give way', 'to climb', 'to turn left'], 'Inhalen gebeurt rechts langs.'],
    ['Air Law', 'What does MPL stand for?', 'Multi-crew Pilot Licence', ['Multi-engine Private Licence', 'Master Pilot Licence', 'Minimum Performance Level'], 'Generation easyJet is (deels) een MPL-traject.'],
    ['Air Law', 'Which phonetic word represents the letter "Q"?', 'Quebec', ['Queen', 'Quiet', 'Quantum'], 'NATO-alfabet.'],
    ['Air Law', 'Which phonetic word represents "J"?', 'Juliett', ['Jamaica', 'Jupiter', 'Jack'], 'NATO-alfabet: Juliett.'],
    ['Aircraft', 'easyJet operates mainly aircraft from which family?', 'Airbus A320 family', ['Boeing 737', 'Embraer E-Jets', 'Airbus A350'], 'A319, A320, A320neo, A321neo.'],
    ['Aircraft', 'The Airbus A320 is controlled through', 'fly-by-wire with sidesticks', ['cables with control yokes', 'hydraulic yokes only', 'rods to a central column'], 'Fly-by-wire, sidestick.'],
    ['Aircraft', 'What does APU stand for?', 'Auxiliary Power Unit', ['Automatic Pilot Unit', 'Air Pressure Unit', 'Altitude Prediction Unit'], 'Hulpmotor voor stroom en lucht aan de grond.'],
    ['Aircraft', 'What does the turbofan bypass air mainly provide?', 'Most of the thrust efficiently', ['Cabin heating', 'Fuel cooling only', 'Electrical power'], 'Bij hoge bypass levert de fan het grootste deel van de stuwkracht.'],
    ['Aircraft', 'What does an altimeter actually measure?', 'Static pressure', ['Dynamic pressure', 'Radar distance', 'Temperature'], 'Barometrische hoogtemeter.'],
    ['Aircraft', 'What does the airspeed indicator measure?', 'Dynamic pressure (pitot minus static)', ['Static pressure only', 'GPS speed', 'Engine RPM'], 'Pitot − statisch = dynamische druk.'],
    ['Human Factors', 'What does CRM stand for?', 'Crew Resource Management', ['Cockpit Radio Monitoring', 'Crew Rest Minimum', 'Central Route Manager'], 'Samenwerking, communicatie en besluitvorming in de cockpit.'],
    ['Human Factors', 'Hypoxia is', 'a lack of oxygen reaching the body tissues', ['too much oxygen', 'motion sickness', 'an ear problem'], 'Zuurstoftekort.'],
    ['Human Factors', 'The "authority gradient" in a cockpit refers to', 'the balance of power between captain and first officer', ['the climb gradient', 'airspace hierarchy', 'pay scales'], 'Te steil remt speak-up, te vlak remt leiderschap.'],
  ];

  function generate() {
    const [topic, q, a, w, e] = U.pick(B);
    return { topic, stem: `<p>${q}</p>`, ...U.textOptions(a, w), explain: e, marks: 1 };
  }
  return { generate, size: B.length };
})();
