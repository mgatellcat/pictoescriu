# PictoEscriu

Aplicació web per escriure frases i textos amb **pictogrames d'ARASAAC**, en la línia d'AraWord, i preparar materials en DIN A4 per a l'alumnat d'educació especial i usuari de comunicació augmentativa i alternativa (CAA).

## Com s'obre
- **Al teu ordinador:** descarrega `docs/index.html` i obre'l amb doble clic a Chrome o Edge. Cal connexió a internet per cercar pictogrames.
- **Amb una adreça web:** activa GitHub Pages (Settings → Pages → Branch `main`, carpeta `/docs`). L'aplicació quedarà publicada a `https://<el-teu-usuari>.github.io/<nom-del-repositori>/`.

## Què fa
- Escriptura contínua: cada paraula rep automàticament un pictograma d'ARASAAC (substantius, verbs i adjectius). La resta es pot afegir després.
- Botó **Següent pictograma**, alternatives i cerca d'un altre pictograma sense canviar el text.
- Text i pictograma independents: pots editar la paraula sense perdre el pictograma.
- Clau Fitzgerald (marc o fons), amb correcció manual.
- Paraula dins el pictograma (a dalt o a baix, en majúscules o en minúscules).
- 7 tipus de lletra, entre els quals Andika, Atkinson Hyperlegible, Lexend i OpenDyslexic.
- 7 capçaleres per a primària, també en versió per pintar.
- Fulls A4 reals, exportació a PDF amb text seleccionable, impressió, desar i obrir projectes, i desament automàtic.
- **Lectura en veu alta** (botó ▶) amb la paraula ressaltada, i **mode alumne**: la veu diu la lletra, la paraula o la frase mentre s'escriu, i es pot tocar una paraula per escoltar-la. Fa servir les veus del navegador o, a qualsevol ordinador i també amb Chrome, les **veus gratuïtes descarregables** Ona (català) i Sharvard (castellà), que després funcionen sense internet.
- **Sons de les lletres** gravats per la mestra o la logopeda (es poden passar a un altre ordinador amb un fitxer) i botó **«Lletrejar»**: cada lletra amb el seu so, marcada, i després la paraula sencera.
- **Bloqueig de pantalla** per a l'alumne: pantalla completa sense la barra de botons; es desbloqueja prement el cadenat 7 vegades seguides.
- Colors d'AREMI (blau marí i taronja), logo propi i pantalla d'inici.
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
