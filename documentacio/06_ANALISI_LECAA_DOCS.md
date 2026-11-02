# Anàlisi de LECAA Docs i propostes per a PictoEscriu

Escrit el 2/11/2026, a petició de la mestra. **Cap proposta s'ha implementat encara:** cal triar-les abans.

## Què és LECAA Docs
- Processador de textos senzill de la **UTAC** (Unitat de Tècniques Augmentatives de Comunicació, Universitat de Barcelona). Té lectura en veu alta i pictogrames ARASAAC i està pensat per ajudar els usuaris de CAA a aprendre a escriure.
- Web: https://utacub.github.io/lecaa_docs/ · Codi: https://github.com/utacub/lecaa_docs (versió 0.6.0, últim canvi el 2/11/2026).
- Sis idiomes (català, castellà, euskera, gallec, anglès i francès). Es pot fer servir com a web instal·lable, com a fitxer únic o com a app d'escriptori (Windows, macOS, Linux).
- És gratuït i programari lliure (**GPL-3.0**). Les locucions (sons de les lletres), els logos i els pictogrames **no** van dins aquesta llicència.
- És germà de **LECAA** (activitats de lectoescriptura) i de **LECAA Tecla**.

## El que ja tenen tots dos
| | LECAA Docs | PictoEscriu |
|---|---|---|
| Lectura en veu alta amb ressaltat | Sí (frase i, si el motor ho permet, paraula) | Sí (paraula; aproximada amb les veus baixades) |
| Veu mentre s'escriu: lletra, paraula, frase | Sí | Sí (mode alumne) |
| Nom de la lletra | Sí | Sí |
| **So** de la lletra (locucions gravades) | **Sí: veus d'Anna i Jordi (català) i Anna (castellà)** | No (pendent: gravar amb la logopeda) |
| Veus gratuïtes descarregables (Piper) | Ona; Davefx i Sharvard (castellà) | Ona; Sharvard (castellà) |
| Pictogrames ARASAAC automàtics només a paraules amb contingut | Sí, a sobre de la paraula | Sí, a sota de la paraula, amb clau Fitzgerald |
| Majúscules llegides com a paraules | Sí (des del 2/11/2026) | Sí |
| Lletres per a la lectura (Andika, Atkinson, Lexend, OpenDyslexic) | Sí | Sí |

## On PictoEscriu ja va per davant (per a preparar materials)
- Fulls A4 exactes: la pantalla, el PDF i la impressió coincideixen.
- Clau Fitzgerald, paraula dins el pictograma, capçaleres NOM/DATA i versió per pintar.
- Imatges de la web (Wikimedia Commons) o pròpies.
- Text i pictograma independents.

Són eines **complementàries**: LECAA Docs perquè l'alumne escrigui lliurement; PictoEscriu per preparar materials amb pictogrames.

## Propostes per a PictoEscriu

### Prioritat alta (encaixen amb el que ja has demanat)
1. **Sons de les lletres i «Lletreja».** A LECAA Docs, si selecciones una paraula, apareix el botó «Lletreja», que ressalta cada lletra mentre en diu el **so** (gravat) i després es pot llegir la paraula sencera. És exactament la idea «fonema a fonema i després lectura global».
   - Es necessita una taula lletra → so amb els dígrafs (ny, ll, l·l, ix, tx, qu, gu…; la h no sona). La faríem nosaltres.
   - Els sons poden venir de dos llocs:
     - **(a)** gravar-los amb la logopeda, tal com ja estava previst;
     - **(b)** demanar permís a la UTAC per fer servir les locucions d'Anna i Jordi. El seu repositori no en dona cap llicència, i sense permís no es poden copiar.
2. **Protecció del tecleig** (molt útil amb commutador i dificultats motrius):
   - **Ajust motriu:** ignorar la mateixa tecla si es repeteix en menys d'un temps que es pot configurar.
   - **No acceptar tecles mentre parla la veu** (opcional).
   - **Usos indeguts:** 3 tecles alhora, 3 tecles en menys de 60 ms, la mateixa lletra 3 vegades o una tecla mantinguda. En aquests casos surt un missatge de calma («Pensa bé cada lletra que escrius») durant uns segons. Cada detecció es pot desactivar.
3. **Mode alumne a pantalla completa amb contrasenya.** Amaga les barres i la configuració, i només la mestra en pot sortir. És una protecció per a l'aula, no una barrera de seguretat.

### Prioritat mitjana
4. **Pictogrames que s'esvaeixen** (només a la pantalla, mai al PDF). Es pot triar entre «Sempre», «Uns segons» o «Només en tocar la paraula». És una manera de retirar l'ajut del pictograma de mica en mica, per afavorir la lectura de la paraula escrita.
5. **Veus baixades sense aturar la pantalla.** LECAA Docs fa la feina de la veu en segon pla (un «worker»). Així la pantalla no es congela mentre prepara la frase. També ofereix **Davefx**, una altra veu masculina castellana.
6. **Funcionar sense internet i com a app instal·lable (PWA)**, amb l'opció de desar tots els pictogrames (uns 70 MB). Ja era a la nostra llista de pendents.
7. **«Els meus documents»:** llista dels documents desats al navegador, amb la data i les primeres paraules.
8. **Lletra lligada amb Playwrite ES** (model escolar, llicència lliure). Era pendent. Caldria comprovar que surt bé al PDF.

### Prioritat baixa
9. Desar en **.docx** editable, amb els pictogrames.
10. **«Per què funciona així»:** un text dins l'app amb la recerca en què es basa cada opció. Nosaltres ja tenim la base als documents 03 i 04.
11. Dir el nom dels signes de puntuació («coma», «punt») i «majúscula» davant d'una lletra majúscula.
12. A la lectura: **pausa**, i llegir només la selecció.

## Llicències: què es pot aprofitar
- **Les idees** es poden aprofitar lliurement.
- **El codi** és GPL-3.0. Copiar-ne parts obligaria a publicar PictoEscriu amb la mateixa llicència. Proposo escriure el codi de nou.
- **Les locucions i els logos** de la UTAC i de LECAA necessiten **permís** de la UTAC.

## Preguntes per a la mestra
1. Quines propostes vols? Recomano començar per la 1 (amb la logopeda o, si la UTAC ho permet, amb les seves locucions), la 2 i la 3.
2. Sons de les lletres: gravacions pròpies, o demanem permís a la UTAC?
3. Vols que PictoEscriu sigui programari lliure (per exemple, GPL-3.0, com LECAA Docs)? Facilitaria col·laborar-hi.
