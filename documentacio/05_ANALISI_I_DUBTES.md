# Anàlisi del document de referència i dubtes pendents

Escrit el 31/10/2026, a partir de `04_ACTIVITATS_LECTOESCRIPTURA_CAA.md`. **Cap d'aquests dubtes està resolt encara.** Pregunta'ls a la mestra abans d'implementar el generador.

## Conclusions de l'anàlisi
1. **El text de la mestra no basta.** El text de la mestra serveix bé per a la lectura compartida (bloc A) i per a l'escriptura compartida (E4). Els blocs B, C i D, en canvi, necessiten paraules molt controlades: monosíl·labs amb vocal tònica (*sol, mel, nas, fil*), només amb sons apresos i amb distractors que comparteixin sons. Calen **dues fonts de paraules**: el text de la mestra i un **banc propi de paraules senzilles del català amb pictograma ARASAAC**. Totes dues passen pel filtre dels sons apresos.
2. **Perfil d'alumne.** Ha de guardar els sons apresos i el so nou, el mode de resposta, el nombre d'opcions, les paraules conegudes (les imatges han de ser conegudes: Collins et al., 2024) i el registre de dades.
3. **«Sessió del dia».** El document proposa una sessió diària de 20–25 minuts, amb un bloc A, B, C, D i E. El botó hauria de generar la sessió sencera, ajustada al perfil i al text, i el full de registre.
4. **Algunes activitats només tenen tot el sentit en pantalla:** A2 (la lletra destaca i sona), A4 (prémer quan se sent el so), B1 (demora temporal constant) i el registre automàtic. En paper es fan amb una targeta per a l'adult.
5. **IA:** gairebé tot el document es pot fer amb regles. La IA només caldria a A4 (versió del text amb més paraules d'un so) i potser a A1 (repetir dues vegades cada paraula clau).

## Correspondència amb el document
| Activitat | Què generaria PictoEscriu | Font de paraules | Format | Dificultat |
| --- | --- | --- | --- | --- |
| A1 Graella del conte | 4 pictogrames amb paraula, guió de frases obertes, ajudes amb 5 s d'espera i registre 0–4 | Text | Paper | Fàcil |
| A2 So inicial destacat | En paper, lletra inicial en color; en pantalla, destaca i sona | Text | Pantalla | Alta (àudio) |
| A3 Conceptes de l'escrit | Pàgina amb títol i 2–3 zones de colors | Text (cal un camp de títol) | Paper | Fàcil |
| A4 Text carregat d'un so | Analitzar quin so es repeteix; versió amb més paraules del so; targeta de la lletra | Text + IA | Paper / pantalla | Mitjana |
| B1 Lletra-so explícita | Model, pràctica guiada i pràctica independent, amb 2–4 lletres minúscules | Seqüència de sons | Paper; millor en pantalla | Fàcil |
| B2 Veig, veig | Lletra → 4 imatges, i a la inversa | Text + banc | Paper | Fàcil |
| B3 Llibre de lletres | Una pàgina per lletra | Text + banc (fotos?) | Paper | Fàcil |
| B4 Repàs acumulatiu | Barreja dels sons apresos amb el so nou | Perfil | Totes | Mitjana |
| C1 Síntesi | /s/-/o/-/l/ i graella amb distractors que comparteixen sons | Banc | Paper | Mitjana |
| C2 So inicial | Imatge entre 4, i lletra entre 4 | Text + banc | Paper | Fàcil |
| C3 Sí/no d'inici i de rima | Paraula escrita amb un dibuix | Banc + pseudoparaules | Paper | Mitjana |
| D1 Llegir i triar imatge | Paraula CVC i 4 imatges | Banc | Paper | Fàcil |
| D2 Opcions d'una en una | Targeta de l'adult; escombrat en pantalla | Banc | Paper / pantalla | Fàcil |
| D3 On diu...? | 4 paraules escrites | Banc + text | Paper | Fàcil |
| D4 Pseudoparaules | Intercalades a D2 i D3 | Llista revisada | Paper | Mitjana |
| D5 Paraules freqüents | Nom propi i paraules del comunicador | Llista de la mestra | Paper | Fàcil |
| E1 Escriure CVC | Lletres necessàries + 1–2 distractores, retallables | Banc | Paper / pantalla | Fàcil |
| E2 Escriure a partir dels sons | Targeta de l'adult | Banc | Paper | Fàcil |
| E3 Teclat alfabètic | Alfabet per a mirada (ETRAN) o escombrat assistit | — | Paper | Mitjana |
| E4 Escriptura compartida | Frase model a partir del text | Text | Paper | Fàcil |
| Seguiment | Línia base, sondes i escala 0–4 | Perfil | Paper; automàtic en pantalla | Fàcil |

## Dubtes pendents (preguntar a la mestra)
1. **Paper o pantalla primer?** La proposta és començar en paper amb targeta per a l'adult. Si l'aula treballa sobretot amb ordinador i seguidor ocular: el seguidor fa clic per fixació (com Tobii en mode ratolí)? Quants commutadors hi ha i quina tecla envien?
2. **Fotos pròpies?** El document demana fotos del conte i d'objectes, persones i llocs propers (B3). Ara només hi ha ARASAAC. Afegim la possibilitat de posar una foto pròpia a qualsevol paraula?
3. **Banc de paraules senzilles:** n'incloem un, revisable per la mestra, o només s'usa el vocabulari que ella escriu?
4. **Varietat dialectal** de l'alumnat (central, nord-occidental...). Afecta les vocals àtones i quines paraules es consideren fàcils.
5. **A1: so o significat?** La graella ha de tenir les paraules importants del conte, o 4 paraules que comencin pel mateix so (completant-les amb el banc)?
6. **Dades de l'alumnat:** el perfil i el registre es desen només al navegador, amb un àlies o les inicials. D5 demana el nom propi: s'hi escriu igualment?
7. **Àudio:** en paper, els sons els fa l'adult. En pantalla, l'A2 necessita sons gravats, perquè la veu sintètica pronuncia malament els sons aïllats. La mestra o la logopeda els gravarien un cop?

## Primera versió proposada (un cop resolts els dubtes)
Perfil d'alumne, banc de paraules i «Sessió del dia» en paper amb les activitats fàcils: A1, A3, B1, B2, C2, D1, D3, E1, E4 i el full de seguiment.
