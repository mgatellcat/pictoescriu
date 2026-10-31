# PictoEscriu · instruccions per a Claude Code

## Qui hi treballa
- La persona que fa servir aquest repositori és **mestre de Tecnologia a l'Aula (LTA)** en un centre d'educació especial de Catalunya. Treballa amb alumnat que es comunica amb CAA i accedeix amb **commutador** i **seguidor ocular**.
- **No és programador.** Explica-ho tot en català planer, sense jerga. Abans d'un canvi gran, explica què faràs i espera la confirmació.
- **Respon sempre en català.** Tota la interfície de l'aplicació és en català i castellà.
- Prefereix resultats **acabats i a punt per fer servir**: quan acabis un canvi, construeix l'aplicació, passa les proves i digues com provar-ho.

## Què és PictoEscriu
Aplicació web per escriure frases i textos amb pictogrames d'ARASAAC (estil AraWord), per preparar materials en DIN A4 per a l'alumnat. Funciona amb un sol fitxer HTML autònom: es pot obrir amb doble clic a Chrome o Edge, o publicar a GitHub Pages.

Documentació a `documentacio/`, en aquest ordre:
1. `01_ESPECIFICACIO_ORIGINAL.md`: el prompt inicial de la mestra (requisits complets i proves d'acceptació).
2. `02_CANVIS_ACORDATS.md`: **tots els canvis i decisions posteriors**. Prevalen sobre l'especificació original.
3. `03_PROPOSTA_GENERADOR_ACTIVITATS.md`: proposta, basada en evidència, d'un generador d'activitats de lectoescriptura.
4. `04_ACTIVITATS_LECTOESCRIPTURA_CAA.md`: document de referència de la mestra sobre activitats amb alumnat usuari de CAA.
5. `05_ANALISI_I_DUBTES.md`: anàlisi del document 04 i set dubtes **pendents de resposta** abans d'implementar el generador.

## Estructura del codi
- `src/app.html`: tot el codi de l'aplicació (HTML, CSS i JavaScript en un fitxer). Conté tres marcadors que omple el build: `/*__ICONS__*/{}`, `/*__FONTS_JSON__*/{}` i `/*__JSPDF__*/`.
- `assets/fonts.json`: tipus de lletra incrustats (TTF en base64, subconjunt llatí): roboto, andika, atkinson, lexend, comic, dyslexic. Cada un amb `family` i `faces` (normal, bold, italic, bolditalic quan n'hi ha).
- `assets/icons.json`: icones Lucide (contingut SVG).
- `vendor/jspdf.umd.min.js`: jsPDF 2.5.1, per generar el PDF amb text seleccionable.
- `docs/index.html`: **l'aplicació construïda**. No l'editis a mà: es regenera.
- `tests/run.js`: proves d'acceptació amb Playwright i un ARASAAC simulat (`tests/fixtures/*.png`).

## Ordres
- Construir: `python3 scripts/build.py`
- Proves: `npm install`, i si Chromium no hi és, `npx playwright install chromium`. Després, `npm test`.
- **Després de cada canvi:** build, proves, i commit de `src/` i `docs/index.html` junts.

## Regles que no es poden trencar
1. **Text i pictograma són independents.** Editar el text d'un bloc mai elimina, substitueix ni torna a cercar el pictograma (exemple obligatori: escriure «menjar», esborrar-ho i escriure «HE MENJAT» conserva el mateix pictograma).
2. **La frase escrita no canvia mai per opcions de visualització.** La «paraula dins el pictograma» és un text a part, dins el requadre.
3. **Pantalla, PDF i impressió han de coincidir**: mateixes mides en mm, marges de 15 mm, mateixos salts de pàgina. El PDF es dibuixa llegint les posicions reals del DOM.
4. **Pictogrames automàtics només per a substantius, verbs i adjectius** (tipus de paraula ARASAAC 2, 3 i 4). Articles, preposicions, conjuncions, pronoms, noms propis i expressions socials queden només amb text, amb el botó «Afegir pictograma».
5. **ARASAAC** (verificat amb el servei real el 30/10/2026):
   - Cerca exacta: `https://api.arasaac.org/api/pictograms/{ca|es}/bestsearch/{paraula}` (404 si no hi ha resultats).
   - Cerca àmplia: `.../search/{paraula}`. És molt sorollosa («la» → 476 resultats), cal filtrar per paraula clau igual o gairebé igual.
   - Imatges: `https://static.arasaac.org/pictograms/{id}/{id}_500.png` (CORS obert: es poden incrustar al PDF).
   - `keywords[].type`: 1 nom propi, 2 nom comú, 3 verb, 4 descriptiu, 5 contingut social, 6 miscel·lània.
6. **Atribució obligatòria** (llicència CC BY-NC-SA): Sergio Palao, ARASAAC, Govern d'Aragó, als crèdits i al peu de cada pàgina. Les imatges de Wikimedia Commons hi afegeixen títol, autor i llicència (`footText()`).
7. **Privacitat:** a ARASAAC només s'envien les paraules que cal cercar, i a Wikimedia Commons (cerca d'imatges de la web) només la paraula que es cerca; mai el nom ni la data de la capçalera. Tot es desa localment.
8. Les cadenes de la interfície són a l'objecte `I18N` (`ca` i `es`): qualsevol text nou ha de tenir les dues versions.
9. **No es pot publicar com a artefacte de claude.ai**: aquell entorn bloqueja ARASAAC, la impressió i les descàrregues. Es distribueix com a fitxer HTML o via GitHub Pages.

## Com proposar canvis
- Abans de canviar comportaments ja acordats (vegeu `02_CANVIS_ACORDATS.md`), pregunta.
- Si afegeixes una funció nova, afegeix-hi proves a `tests/run.js`.
- Si prens una decisió nova amb la persona, afegeix-la a `documentacio/02_CANVIS_ACORDATS.md`.
