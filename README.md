# PictoEscriu

Aplicació web per escriure frases i textos amb **pictogrames d'ARASAAC**, en la línia d'AraWord, i preparar materials en DIN A4 per a l'alumnat d'educació especial i usuari de comunicació augmentativa i alternativa (CAA).

## Com s'obre
- **Amb l'adreça web (qualsevol aparell):** https://mgatellcat.github.io/pictoescriu/ . Funciona a l'ordinador (Windows, Mac, Chromebook, Linux) i també a l'**iPhone, l'iPad i el mòbil o la tauleta Android**. Al mòbil o la tauleta, es pot posar com a icona amb «Afegir a la pantalla d'inici». La publica GitHub Pages a partir de la carpeta `docs/` de la branca `main`.
- **Amb el fitxer, només a l'ordinador:** descarrega `docs/index.html` i obre'l amb doble clic a Chrome o Edge. A l'iPhone, l'iPad i Android un fitxer .html baixat no s'obre bé: cal fer servir l'adreça web.
- Cal connexió a internet per cercar pictogrames.

## Què fa
- Escriptura contínua: cada paraula rep automàticament un pictograma d'ARASAAC (substantius, verbs i adjectius). La resta es pot afegir després.
- Botó **Següent pictograma**, alternatives i cerca d'un altre pictograma sense canviar el text.
- Text i pictograma independents: pots editar la paraula sense perdre el pictograma.
- Clau Fitzgerald (marc o fons, o sense clau), amb correcció manual, i pictograma a sota o a sobre de la paraula.
- Paraula dins el pictograma (a dalt o a baix, en majúscules o en minúscules).
- 7 tipus de lletra, entre els quals Andika, Atkinson Hyperlegible, Lexend i OpenDyslexic.
- 7 capçaleres per a primària, també en versió per pintar.
- Fulls A4 reals, exportació a PDF amb text seleccionable, impressió, desar i obrir projectes, i desament automàtic.
- **Lectura en veu alta** (botó ▶) amb la paraula ressaltada, i **mode alumne**: la veu diu la lletra, la paraula o la frase mentre s'escriu, i es pot tocar una paraula per escoltar-la. Fa servir les veus del navegador o, a qualsevol ordinador i també amb Chrome, les **veus gratuïtes descarregables** Ona (català) i Sharvard (castellà), que després funcionen sense internet.
- **Sons de les lletres** gravats per la mestra o la logopeda (es poden passar a un altre ordinador amb un fitxer) i botó **«Lletrejar»**: cada lletra amb el seu so, marcada, i després la paraula sencera.
- **Bloqueig de pantalla** per a l'alumne: pantalla completa sense la barra de botons; es desbloqueja prement el cadenat 7 vegades seguides.
- Colors d'AREMI (blau marí i taronja), logo propi i pantalla d'inici.
- **Imatges recordades:** la imatge o el pictograma triat per a una paraula surt sol el proper cop; es poden passar a un altre aparell amb un fitxer.
- Interfície en català i castellà.

## Per a qui vulgui continuar el desenvolupament
- Instruccions per a Claude Code: [`CLAUDE.md`](CLAUDE.md)
- Documentació i decisions: carpeta [`documentacio/`](documentacio/)
- Construir: `python3 scripts/build.py` · Proves: `npm install && npm test`

## Crèdits i llicències
- **Pictogrames:** Sergio Palao. Origen: ARASAAC (https://arasaac.org). Llicència: CC BY-NC-SA. Propietat: Govern d'Aragó. L'ús ha de ser no comercial.
- **Tipus de lletra:** Roboto (Apache 2.0); Andika, Atkinson Hyperlegible, Lexend, Comic Neue i OpenDyslexic (SIL Open Font License), via Fontsource.
- **Icones:** Lucide (ISC).
- **Generador de PDF:** jsPDF 2.5.1 (MIT, vegeu `vendor/jspdf-LICENSE`).
- **Veus descarregables** (no van dins el fitxer; es baixen si la mestra ho demana): Ona (UPC, corpus FestCat; CC BY-SA) i Sharvard (corpus de V. Aubanel, M. L. García Lecumberri i M. Cooke; CC BY), fetes amb Piper (Rhasspy). Motor: ONNX Runtime 1.18.0 (MIT) i piper-wasm 1.0.0 amb eSpeak NG.
