# Proposta: generador d'activitats de lectoescriptura

Versió editable original (amb l'arbre de tria dibuixat): https://claude.ai/artifact/1WvnKBK3cj8t8BJte6RbBT · 30/10/2026

> Abans d'implementar-la, cal resoldre els dubtes de `05_ANALISI_I_DUBTES.md`. Allà es proposa començar pel document de referència de la mestra (`04_ACTIVITATS_LECTOESCRIPTURA_CAA.md`), que concreta i prioritza una part d'aquesta proposta.

## Resum
PictoEscriu pot generar activitats de lectura i escriptura a partir de les frases i el vocabulari de la mestra, ordenades segons com s'aprèn a llegir. La proposta és un assistent **Crear activitats** amb:
- **Arbre de tria** per àrees: fonologia, semàntica, sintaxi, lectura i escriptura.
- **Sis nivells d'aprenentatge** (N0–N5), basats en el model de doble ruta i en les fases d'Ehri.
- **31 tipus d'activitat**: 19 amb regles (fiables, sense cost) i 12 amb IA (sempre amb revisió de la mestra).
- **Índex de dificultats:** dificultats observables que porten a l'activitat adequada, i nivell de dificultat automàtic per a cada ítem.
- **Principis d'aprenentatge integrats:** instrucció explícita, opcions graduals, repàs acumulatiu i espaiat, i registre del progrés.

Cada activitat es pot fer amb pictograma o sense, i amb resposta parlada, assenyalant, amb la mirada o amb commutador.

## Com s'aprèn a llegir i a escriure
- **Visió simple de la lectura:** comprensió lectora = descodificació × comprensió oral (punt de partida de Palazón, 2025).
- **Doble ruta.** La fonològica converteix grafies en sons i serveix per a paraules noves i pseudoparaules. La lèxica reconeix la paraula sencera i dona la velocitat. En ortografies transparents es comença per la fonològica, i la lèxica creix amb l'experiència (Ardila i Cuetos, 2016). Les representacions ortogràfiques es formen descodificant moltes vegades: és l'autoaprenentatge (Castles et al., 2018).
- **Fases d'Ehri:** prealfabètica → alfabètica parcial → alfabètica completa → alfabètica consolidada.
- **Escriptura:** planificació, textualització (sintaxi, ruta fonològica i ruta ortogràfica, motor) i revisió (González Seijas, 2003). Per a l'alumnat usuari de CAA, el motor és seleccionar lletres.
- **Català:** la lectura és força transparent; l'escriptura ho és menys (vocals àtones, *b/v*, *g/j*, *s/ss/z/c/ç*), i per això hi pesa més la ruta ortogràfica.

## Evidència i implicacions
| Font | Troballa clau | Implicació |
| --- | --- | --- |
| Palazón (2025), pròleg d'H. Ruiz | Calen programes específics amb protocol, bastida que es retira i seguiment, no activitats genèriques; instrucció explícita | Seqüències per nivell, amb ajuda decreixent i registre |
| Ripoll i Aguado (2014), metanàlisi | 39 estudis, g = 0,71 en comprensió; estratègies combinades amb altres suports 0,96; resumir i fer-se preguntes; com més durada, més efecte | Comprensió amb idea principal, preguntes i resum, i vocabulari del mateix text |
| Ripoll i Zevallos (2025), metanàlisi | Amb consciència fonològica, la comprensió millora significativament més | Consciència fonològica als primers nivells |
| Suárez-Coalla, Avdyli i Cuetos (2014) | La dislèxia en castellà és sobretot lentitud; amb 6 exposicions no n'hi ha prou | Banc de paraules amb repàs espaiat |
| Suárez-Coalla et al. (2016) | Errors ortogràfics que sonen bé; cal treballar regles i representacions | Activitats de ruta ortogràfica |
| Suárez-Coalla, Martínez-García i Cuetos (2017) | Els morfemes freqüents ajuden a llegir i escriure paraules noves | Famílies de paraules |
| Castejón, González-Pumariega i Cuetos (2019) | Fluïdesa amb lectures repetides; avaluar precisió, velocitat i prosòdia | Lectura repetida amb registre |
| Chimenti, Arnés i Tonani (2025) | Escriptura: ensenyament explícit, modelatge, pràctica, retroacció, autoregulació | Model → pràctica guiada → pràctica independent |
| Castles, Rastle i Nation (2018) | Lletra-so explícita i en l'ordre propi de la llengua; la comprensió depèn del vocabulari i del coneixement | Seqüència de sons del català; vocabulari lligat al text |
| H. Ruiz (2021; 2025) | Evocació, espaiat, connexió amb el que ja se sap, retroacció, motivació | Repassos espaiats que parteixen del text conegut |
| Erickson i Koppenhaver (2020) | Repetició amb varietat, lectura diària, frases predictibles, expectatives altes | Variar els exemples amb el mateix vocabulari |

## Seqüència d'aprenentatge (N0–N5)
| Nivell | Fase d'Ehri | Lectura | Escriptura | Llenguatge oral |
| --- | --- | --- | --- | --- |
| N0 Base oral i emergent | Prealfabètica | Lectura compartida amb graella | E5 | S1, S2, X2 amb pictograma |
| N1 Consciència sil·làbica i rima | Prealfabètica | F1, F2, F3 | — | X1 amb pictograma |
| N2 Consciència fonèmica i lletra-so | Alfabètica parcial | F4, F5, F6, L1, L2 | — | — |
| N3 Descodificació | Alfabètica completa | L3, L4, L5 | E1, E2 | — |
| N4 Ruta lèxica i fluïdesa | Consolidada | L6, L7 | E3, E4 | S4 |
| N5 Comprensió i composició | Consolidada | L8, L9, L10 | E6 | S3, S5, X1, X3, X4 sense pictograma |

Ordre de les paraules en la descodificació: síl·labes CV i paraules CV-CV → monosíl·labs CVC amb vocal tònica → síl·labes VC i paraules de 3 síl·labes → síl·labes CCV → dígrafs (*ny, ll, ix, rr, ss, qu, gu, l·l, ig, tx*).

## Índex de dificultats
| Àrea | Què observa la mestra | Procés | Activitats |
| --- | --- | --- | --- |
| Llenguatge oral | No entén o no fa servir les paraules clau | Vocabulari | S1, S2, S5 |
| Llenguatge oral | Frases desordenades o sense concordança | Morfosintaxi | X1, X2, X3 |
| Consciència fonològica | No compta síl·labes; no detecta rimes | Sil·làbica i intrasil·làbica | F1, F2, F3 |
| Consciència fonològica | No identifica el so inicial; no uneix sons | Fonèmica | F4, F5, F6 |
| Lletra-so | Confon *b/d, m/n, p/b* | Grafema-fonema | L1, L2 |
| Lectura | Endevina per la primera lletra o la imatge | Alfabètica parcial | L3, L4, L5 |
| Lectura | Falla amb pseudoparaules o en fa lexicalitzacions | Ruta fonològica | L3, L5, F5 |
| Lectura | Lectura sil·labejant i lenta | Ruta lèxica i fluïdesa | L6, L7, S4 |
| Lectura | Descodifica però no entén | Comprensió | S1, X4, L8–L10 |
| Escriptura | Omissions, substitucions, inversions | Ruta fonològica | F6, E1, E2 |
| Escriptura | Errors que sonen bé (*baixell*) | Ruta ortogràfica | E3, E4, S4 |
| Escriptura | Unions i separacions incorrectes de paraules | Concepte de paraula | X1, E5 |
| Escriptura | No construeix frases ni textos | Sintaxi i planificació | E5, E6 |

**Dificultat de cada ítem (1–5):** estructura sil·làbica, llargada, familiaritat (paraula del text o nova), sons apresos (els no apresos s'exclouen), vocals tòniques o àtones, consistència ortogràfica, nombre d'opcions (2 a 4), similitud dels distractors, amb pictograma o sense, i triar o produir.

## Catàleg (31 activitats)
Cada activitat genera: fitxa per a l'alumne (graella 2×2, ETRAN o fila, amb la resposta correcta en posicions diferents), targeta per a l'adult (consigna, model, resposta, ajudes) i full de registre.

| Codi | Activitat | Nivell | Què genera | Generació |
| --- | --- | --- | --- | --- |
| S1 | Graella de vocabulari | N0 | 4–8 cel·les amb substantius, verbs i adjectius del text | Regles |
| S2 | Paraula ↔ imatge | N0 / N3 | Paraula i 2–4 pictogrames del text, i a la inversa | Regles |
| X2 | Frase oberta | N0 / N4 | Frase amb la paraula clau buida i 2–4 opcions | Regles |
| E5 | Frase predictible | N0 | «M'agrada ___», «Veig ___» | Regles |
| F1 | Comptar síl·labes | N1 | Pictograma amb caselles, una per síl·laba | Regles |
| F2 | Unir i separar síl·labes | N1 | L'adult diu *ca-sa* → l'alumne tria la imatge | Regles |
| F3 | Rimes | N1 | «Acaben igual?» i «quina rima?» | Regles + IA |
| X1 | Ordenar la frase | N1 / N5 | Frase del text desordenada | Regles |
| F4 | So inicial | N2 | «Quina comença per /m/?» | Regles |
| F5 | Síntesi de fonemes | N2 | /s/-/o/-/l/ i graella amb distractors que comparteixen sons | Regles |
| F6 | Segmentació fonèmica | N2 | Quants sons té, i formar-la amb lletres | Regles |
| L1 | Lletra-so | N2 | «Quina fa /m/?»: model, pràctica guiada, pràctica independent | Regles |
| L2 | Veig, veig de sons | N2 | Lletra → imatge, i a la inversa | Regles |
| L3 | Lectura de síl·labes | N3 | Síl·labes del text amb sons apresos | Regles |
| L4 | On diu...? | N3 | 4 paraules escrites sense imatge | Regles |
| L5 | Pseudoparaules | N3 | *sol* → *sil* | Regles + IA |
| E1 | Escriure amb lletres | N3 | Lletres necessàries + 1–2 distractores | Regles |
| E2 | La lletra que falta | N3 | Paraula amb una lletra buida | Regles |
| L6 | Lectura repetida | N4 | Frases per rellegir en dies diferents, amb registre | Regles |
| L7 | Paraules ràpides | N4 | Targetes amb repàs espaiat | Regles |
| E4 | Mira, tapa i escriu | N4 | Escriure la paraula de memòria | Regles |
| S4 | Famílies de paraules | N4 | *pa, panet, paner* | IA |
| E3 | Quina està ben escrita? | N4 | *vaixell / baixell* | Regles + IA |
| S3 | Classificar i trobar l'intrús | N5 (N0 amb pictograma) | Categories | IA |
| S5 | Endevinalles | N5 | «És una fruita, és rodona...» | IA |
| X3 | Concordança | N5 | *la nena menja / mengen* | IA |
| X4 | Frase i imatge | N5 | Quina frase explica la imatge? | IA |
| L8 | Preguntes literals | N5 | Qui? Què? On? | IA |
| L9 | Preguntes inferencials | N5 | Per què...? Què passarà? | IA |
| L10 | Idea principal i resum | N5 | Triar el millor resum entre tres | IA |
| E6 | Text guiat | N5 | Plantilla Qui? On? Què passa? amb pictogrames | IA |

## Paper de la IA
- **Genera:** textos descodificables (només amb sons apresos), repetició amb varietat, preguntes, resums, endevinalles, categories, famílies de paraules, errors versemblants i pseudoparaules.
- **Tres filtres:** resposta en format estructurat (JSON), validació amb regles (sons apresos, llargada, pictograma ARASAAC disponible) i revisió de la mestra a la vista prèvia.
- **Opcions tècniques:**
  - **A. Sense IA:** només les 19 activitats de regles.
  - **B. Copiar i enganxar amb Claude** (recomanada per començar): PictoEscriu prepara la instrucció, la mestra l'enganxa en un xat de Claude i la resposta s'importa.
  - **C. Connexió directa:** amb una clau d'API d'Anthropic desada al navegador; té cost per ús.
- **Privacitat:** només s'envia el text; mai el nom ni la data.

## Pla per fases
1. Base de l'assistent, perfil de l'alumne i 10 activitats de regles (S1, S2, X1, X2, E5, F1, F4, L1, L4, E1), amb registre i formats en paper.
2. Regles del català (separació sil·làbica, so inicial, vocals àtones) i índex de dificultat: F2, F3, F5, F6, L2, L3, L5, E2.
3. IA amb l'opció B: L8–L10, S3–S5, X3–X4, E3, E6 i textos descodificables.
4. Ruta lèxica, fluïdesa i repàs espaiat: banc de paraules per alumne, L6, L7, E4.
5. Mode pantalla accessible: escombrat per commutador, mirada i registre automàtic.

## Referències
- Ardila, A. i Cuetos, F. (2016). Applicability of dual-route reading models to Spanish. *Psicothema, 28*(1), 71–75. https://portalinvestigacion.uniovi.es/documentos/5e57af512999527d991b2a59
- Castejón, L. A., González-Pumariega, S. i Cuetos, A. (2019). Enseñar fluidez lectora en el aula: de la investigación a la práctica. *Ocnos, 18*(2), 75–84. https://portalinvestigacion.uniovi.es/documentos/5e57af902999527d991b417f
- Castles, A., Rastle, K. i Nation, K. (2018). Ending the reading wars. *Psychological Science in the Public Interest, 19*(1). https://www.psychologicalscience.org/publications/ending-the-reading-wars-reading-acquisition-from-novice-to-expert.html
- Chimenti, M. A., Arnés, V. i Tonani, J. (2025). Intervención en dificultades de aprendizaje de la escritura en español: una revisión sistemática. *Revista de Investigación en Logopedia, 15*(1), e95797.
- Ehri, L. C. Fases de la lectura de paraules (resum de la UFLI). https://ufli.education.ufl.edu/wp-content/uploads/2022/01/EhriPhases.pdf
- Erickson, K. A. i Koppenhaver, D. A. (2020). *Comprehensive literacy for all.* Brookes.
- González Seijas, R. M. (2003). *Psicothema, 15*(3), 458–463. https://www.psicothema.com/pii?pii=1088
- Palazón López, J. (2025). *Intervenciones especializadas para la mejora de la lectura, la escritura, el lenguaje y el habla.* Pirámide.
- Ripoll, J. C. i Aguado, G. (2014). La mejora de la comprensión lectora en español: un meta-análisis. *Revista de Psicodidáctica, 19*(1), 27–44.
- Ripoll, J. C. i Aguado, G. (2015). *Enseñar a leer: cómo hacer lectores competentes.* EOS.
- Ripoll, J. C. i Zevallos, D. S. (2025). *Revista de Investigación en Logopedia, 15*, 117–132. https://revistas.ucm.es/index.php/RLOG/en/article/view/95760
- Ruiz Martín, H. (2021). *¿Cómo aprendemos?* (3a ed.). Graó.
- Ruiz Martín, H. (2025). *Com aprenem a llegir i com ensenyar a llegir segons la ciència.* Traspaso.
- Suárez-Coalla, P., Avdyli, R. i Cuetos, F. (2014). *Frontiers in Psychology.* https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2014.01409/full
- Suárez-Coalla, P., Martínez-García, C. i Cuetos, F. (2017). *Frontiers in Psychology, 8.* https://www.frontiersin.org/articles/10.3389/fpsyg.2017.01952/text
- Suárez-Coalla, P., Villanueva, N., González-Pumariega, S. i González-Nosti, M. (2016). *Infancia y Aprendizaje, 39*(2), 291–311.
