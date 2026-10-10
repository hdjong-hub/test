# CAE Assessment Trainer (Generation easyJet)

Oefenapp voor de CAE Stage 2 (ADAPT) assessment van het Generation easyJet Pilot Training Programme,
plus voorbereiding op Stage 3. Werkt met joystick, throttle en voetpedalen via de Gamepad API.
Geen installatie of internet nodig.

## Starten

1. Download of clone deze repository.
2. Sluit joystick, pedalen en eventueel throttle aan.
3. Open `index.html` in **Chrome** of **Edge** (dubbelklikken werkt).
4. Ga naar **Controller**, druk op een knop van elk apparaat zodat de browser het ziet, en koppel per functie de juiste as.
   Controleer in de live test de richtingen en zet zo nodig "Omkeren" aan.

Liever via een lokale server? `python -m http.server` in deze map en open `http://localhost:8000`.

## Onderdelen

| Onderdeel | Gebaseerd op (kandidaatverslagen en CAE) | Modus |
|---|---|---|
| Maths | 30 min, geen rekenmachine, vragen van 1/2/5 punten, hoofdrekenen en snelheid-afstand-tijd | examen + oefenen |
| Physics | 30 min, GCSE-niveau, circuits, momenten, golven, energie, gaswetten, formuleblad | examen + oefenen |
| Technical reasoning | meerkeuze technisch redeneren met tekeningen (tandwielen, katrollen, hefbomen) | examen + oefenen |
| Cognitive | 5 seconden geheugen, patronen, reeksen, mentale rotatie, koers/zon, instrumenten, snelheid | examen + oefenen |
| Aviation knowledge | basis luchtvaartkennis (optioneel) | examen + oefenen |
| Ball game | bal in het midden houden, twist + pitch, assen instelbaar, 3 min gescoord, extra pedaalvariant | psychomotoriek |
| FAST multitask | route vliegen, groene knop bij verkeer, rode knop bij waypoints, ATC-spraak, vragen, 2 runs | psychomotoriek |
| Fixed wing | PFD-vliegsimulatie: hoogte, snelheid en koers volgen met stick, throttle en pedalen | psychomotoriek |
| Stage 3 | competenties, groepsopdracht-tips, interviewvragen met timer | voorbereiding |

Alle vragen worden willekeurig gegenereerd, dus je krijgt steeds nieuwe sommen.
Resultaten worden lokaal in de browser bewaard (pagina **Voortgang**).

## Toetsenbord (als reserve)

Pijltjes = stick, `Q`/`E` = twist, `Z`/`X` = pedalen, `W`/`S` = gas, `G`/spatie = groene knop, `R`/Enter = rode knop, `1`-`4` = antwoorden.

## Disclaimer

Onafhankelijke oefentool, niet verbonden aan CAE, easyJet of Symbiotics. Inhoud is gebaseerd op openbare
informatie en ervaringen van kandidaten (zie de pagina **Info** in de app voor bronnen). Het echte format kan afwijken.
