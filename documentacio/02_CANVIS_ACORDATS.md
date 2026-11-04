# Canvis i decisions acordats

Aquest document recull tot el que s'ha decidit **després** de l'especificació original (`01_ESPECIFICACIO_ORIGINAL.md`). Quan hi ha contradicció, **preval aquest document**.

Estat actual: **versió 0.10.0** (3 de novembre de 2026). El número de versió surt a la finestra «Crèdits» (constant `VERSION` de `src/app.html`): cal augmentar-lo a cada versió nova.
- La 0.5 es va construir i provar al xat de claude.ai entre el 29 i el 31 d'octubre de 2026.
- Hi va haver dues línies de treball paral·leles, que la 0.7.0 ajunta:
  - Una «0.6» del 31/10/2026: tecles d'esborrar, imatges de la web o pròpies (apartat 9) i verbs auxiliars sense «?» (apartat 4).
  - Una «0.6» i «0.6.1» del 2/11/2026: lectura en veu alta i mode alumne (apartat 12) i el cursor encallat en esborrar.
- La 0.7.0 hi afegeix les veus descarregables (apartat 12), la selecció sense requadre de línies discontínues (apartat 10) i el doble clic que editava una altra paraula.
- La 0.8.0 hi afegeix els sons de les lletres gravats, «Lletrejar» i el bloqueig de pantalla (apartats 13 i 14), triats de les propostes de `06_ANALISI_LECAA_DOCS.md`.
- La 0.9.0 hi afegeix els colors d'AREMI, el logo nou i la pantalla d'inici (apartat 15).
- La 0.9.1: el panell de la dreta ja no s'obre en esborrar (apartat 2) i pictogrames automàtics a totes les paraules menys les gramaticals (apartat 4).
- La 0.9.2 fa que funcioni bé a mòbils i tauletes (apartat 16).
- La 0.9.3 corregeix la clau Fitzgerald, afegeix «Picto a sobre de la paraula» i obre sempre amb un document en blanc (apartat 17).
- La 0.9.4 troba el pictograma dels femenins i plurals en masculí: verda → verd (apartat 3).
- La 0.9.5 afegeix les imatges recordades (apartat 18).
- La 0.10.0 afegeix el teclat virtual (apartat 19).
- Totes les proves d'acceptació (`tests/run.js`) passen amb un ARASAAC, un Wikimedia Commons i una veu simulats. La cerca d'ARASAAC s'ha verificat amb el servei real; l'aplicació sencera encara no s'ha provat a l'aula amb els serveis reals ni amb les veus reals.

## 1. Distribució
- **Fitxer HTML autònom** (`docs/index.html`), d'uns 1,2 MB, amb tipus de lletra, icones i jsPDF incrustats.
- **No funciona com a artefacte de claude.ai**: aquell entorn bloqueja les connexions a ARASAAC, la impressió i les descàrregues.
- Opcions: obrir el fitxer amb doble clic a Chrome o Edge, o publicar-lo amb GitHub Pages.
- Idea futura: aplicació web instal·lable (PWA) amb memòria cau dels pictogrames ja utilitzats.

## 2. Interpretacions de l'especificació original
- **«Mateixa línia»:** la frase s'escriu en línia i només salta de línia al marge; els pictogrames queden alineats a sota de cada paraula.
- **NOM / DATA i el peu d'atribució** segueixen l'idioma de la interfície.
- **Retrocés després d'una paraula acabada:** entra a editar el text d'aquella paraula, sense tocar el pictograma. Si el text i el pictograma deixen de coincidir, el panell ofereix «Cercar «...»».
- **Tecles d'esborrar (corregit el 31/10/2026, a petició de la mestra):**
  - **Retrocés** mentre s'escriu: esborra les lletres de la paraula anterior, i el pictograma es conserva mentre hi queden lletres. Quan el text ja és buit, un retrocés més elimina el bloc i es continua amb la paraula d'abans. Abans, en aquest punt, el retrocés no feia res.
  - **Suprimir** amb el cursor d'escriptura: esborra la paraula o el salt de línia que hi ha a la dreta. Abans només esborrava salts de línia.
  - **Suprimir o Retrocés amb una paraula seleccionada:** l'esborra i hi deixa el cursor d'escriptura. Ja no se selecciona la paraula anterior, que quedava amb el marc blau ratllat.
  - Si el text es buida amb doble clic o amb «Editar text», el pictograma es conserva igual que abans (regla 1).
  - **Afegit a la 0.6.1 / 0.7.0:** si es **manté la tecla premuda**, el retrocés s'atura quan una paraula amb pictograma queda buida (així no es perd el pictograma per anar massa lluny); cal tornar a prémer la tecla per treure-la, i **Ctrl+Z** recupera la paraula sencera. Les paraules sense pictograma s'esborren seguit.
  - Una paraula **sense pictograma** que es buida amb doble clic o «Editar text» desapareix amb un retrocés més: ja no es queda el cursor encallat dins un requadre buit.
  - **El panell de la dreta no s'obre mentre s'esborra** (error greu corregit a la 0.9.1, a petició de la mestra: «només s'hauria d'obrir quan tu decideixes»). En entrar esborrant a la paraula anterior, ja no se selecciona. El panell només s'obre fent clic en una paraula.
  - **Després d'esborrar, es continua escrivint** (0.9.1): si s'esborren lletres d'una paraula i es torna a escriure, l'espai, un signe de puntuació, el Tab o el Retorn acaben aquella paraula (amb el mateix pictograma, regla 1) i l'escriptura continua al darrere amb una paraula nova. Abans, l'espai quedava dins la mateixa paraula.
  - **Doble clic** (corregit a la 0.7.0): si el primer clic obria el panell i el full es desplaçava, el doble clic editava una altra paraula. Ara s'edita sempre la paraula del primer clic.
- **Botó «Amb text»:** mostra o amaga la paraula escrita sobre tots els pictogrames.

## 3. Cerca a ARASAAC (verificada amb el servei real)
Ordre de cerca, a `findPictos()`:
1. `bestsearch` amb la paraula exacta (ja resol plurals: «pomes» → poma).
2. Si no hi ha resultat, `search` filtrada: només paraules clau iguals, o gairebé iguals si la paraula té 3 o més lletres i la diferència és de 2 lletres o menys («menja» → menjar, «beu» → beure).
3. Variants lingüístiques prudents, només amb coincidència exacta: elisions («l'aigua» → aigua), participis («menjat» → menjar), gerundis («dormint» → dormir, «comiendo» → comer). La variant ha de conservar una arrel d'almenys 3 lletres, perquè «beu» no esdevingui «bar».
- **Femení i plural → masculí singular** (0.9.4, a petició de la mestra: «la poma és verda» deixava «verda» sense pictograma, perquè ARASAAC té «verd»). També amb coincidència exacta, i només si les altres variants no han trobat res. El text escrit no canvia.
  - Català: verda/verdes → verd, petita → petit, groga/grogues → groc, blanques → blanc, nova/noves → nou, roja/roges → roig, grossa → gros.
  - Castellà: roja/rojas → rojo, blanca → blanco, trabajadora → trabajador.
- Primer van els pictogrames on la paraula és la paraula clau principal: «la» mostra l'article abans que «ella».
- Paraules com «HE» o «vaig» no reben cap pictograma fals: queden només amb text.

## 4. Pictogrames automàtics a totes les paraules menys les gramaticals (decisió de la mestra, 3/11/2026)
- **Canvi del 3/11/2026:** «només volem que no s'escriguin automàticament articles, preposicions, nexes, conjuncions…; la resta de paraules, totes».
  - **Sense pictograma automàtic**, només text: articles, preposicions, conjuncions i nexes (*i, o, però, que, si, perquè, doncs*…), pronoms febles (*em, et, es, ens, us, li, hi, ho*; en castellà *me, te, se, nos, os, le, les, lo*) i verbs auxiliars (*he, ha, vaig, van*…). La llista és `FUNC` a `src/app.html`.
  - **Amb pictograma automàtic:** totes les altres paraules, també els **pronoms personals** (*jo, tu*), els **noms propis** i les **expressions** (*hola, gràcies, sí, adéu*).
  - La comparació respecta els accents: «es» (pronom) va sense pictograma i «és» (verb) en porta; «si» (conjunció) va sense i «sí» en porta.
  - Abans (fins a la 0.9.0) només en portaven els substantius, els verbs i els adjectius.
- Les paraules gramaticals **no mostren el «?»** encara que ARASAAC no en tingui. El «?» queda per a les altres paraules que no tenen pictograma.
- El panell mostra el pictograma que tindrien, esvaït, amb el botó **«Afegir pictograma»**.
- **Verbs auxiliars (31/10/2026, a petició de la mestra):** *he, has, ha, hem, heu, han, havia…, vaig, vam, van…* (i en castellà *he, has, ha, hemos, han, había…*) també queden només amb text. «vas» no hi és, perquè també és un nom.
- Flags del bloc: `picOff` (sense pictograma), `autoOff` (tret automàticament), `userPic` (la mestra ha decidit, i la cerca no ho tornarà a canviar).

## 5. Separació entre paraules
- **Separació visual de doble espai**, proporcional a la mida de lletra: `padding` de 0,25 em a cada costat del bloc (mínim 1,2 mm).
- Les paraules sense pictograma queden **a la mateixa línia de text** que la resta. Es manté una caixa invisible de l'alçada del pictograma, d'amplada zero.
- Error corregit: la caixa invisible s'aplanava (`flex-shrink`) i la paraula baixava a l'altura dels pictogrames. Ara `.lbl` i `.pic` tenen `flex: none`.

## 6. Tipus de lletra
- Selector a la barra: Roboto (per defecte), Andika (lectura inicial), Atkinson Hyperlegible (baixa visió), Lexend (lectura fàcil), Comic Neue, OpenDyslexic (dislèxia) i Arial.
- Incrustats en TTF, amb subconjunt llatí que inclou la ela geminada, «¿», «¡», «« »», ç i ñ. Al PDF el text és seleccionable.
- Lexend no té cursiva: amb aquesta lletra, el botó de cursiva es desactiva.
- **Lletra lligada: no inclosa.** jsPDF no aplica les unions contextuals; caldria convertir aquell text en imatge dins el PDF. Pendent, si la mestra ho demana.

## 7. Paraula dins el pictograma
- Panell → «Paraula dins el pictograma»: posició (sense paraula, a dalt o a baix), lletra (MAJÚSCULES o minúscules), text editable i «Aplicar a tot el document».
- Va **dins del requadre** de color, com els pictogrames d'ARASAAC amb text. El requadre manté la mida i el dibuix es fa més petit.
- Per defecte, és la paraula de la frase; es pot canviar sense tocar la frase.
- La mida s'ajusta sola perquè no es talli.
- **Desfet:** una primera versió movia la paraula de la frase a sobre o a sota del pictograma. La mestra no ho volia: **la frase no es modifica mai**.

## 8. Capçaleres
- El botó «Capçalera» obre una galeria amb 7 estils: Clàssica (per defecte), Llapis i regle, Núvols i sol, Viatge a l'espai, Suro amb notes, Festa amb banderoles i Jardí.
- També hi ha «Sense capçalera» i l'opció **«Versió per pintar (blanc i negre)»**.
- Són dibuixos SVG propis, en mm, generats per `headSVG()`. Al PDF es rasteritzen a 300 ppp i el text NOM/DATA s'hi escriu a sobre en format vectorial.

## 9. Imatges de la web o pròpies (acordat el 31/10/2026)
- Si una paraula no té pictograma (per exemple, «barça»), o si se'n vol un altre, el panell té l'apartat **«Imatge de la web o pròpia»**, sota «Cercar un altre pictograma». Hi ha tres maneres de posar una imatge:
  1. **Cercar a la web**, a **Wikimedia Commons**: imatges de lliure ús, que es poden posar dins el PDF. No es fa servir Google Imatges, perquè demana un compte de pagament i no deixa posar les imatges dins el PDF.
  2. **Pujar una imatge** de l'ordinador.
  3. **Enganxar una imatge** copiada (botó o Ctrl+V amb la paraula seleccionada).
- La imatge ocupa el requadre del pictograma, amb el mateix marc de color, la mateixa mida i la mateixa paraula dins el pictograma. El text de la frase no canvia mai.
- Es converteix en un quadrat de 360 px, sense retallar-la, i es desa dins el projecte (`own` del bloc). Funciona sense connexió i surt igual a la pantalla, al PDF i en imprimir.
- Triar després un pictograma d'ARASAAC, o prémer «Treure la imatge», torna al pictograma.
- **Privacitat:** a Wikimedia Commons només s'envia la paraula que es cerca. Mai el nom ni la data.
- **Crèdits:** les imatges de Wikimedia surten al peu de pàgina, sota el text d'ARASAAC: «Altres imatges: Wikimedia Commons («títol», autor, llicència)». Les imatges pujades o enganxades no porten crèdit: la mestra n'és responsable.
- Si el document és massa gran per desar-lo automàticament al navegador, surt un avís per desar-lo amb «Desar».
- La cerca a Wikimedia s'ha provat amb un servei simulat. **Encara cal provar-la amb el servei real.**

## 10. Altres
- Zoom en una barreta flotant a baix a l'esquerra.
- Barra superior compacta en tauletes (menys de 1180 px).
- **Selecció sense requadre de línies blaves discontínues** (0.7.0, a petició de la mestra): la paraula seleccionada només es marca amb un fons blau suau; mentre s'escriu o s'esborra no hi ha cap requadre, només la ratlla del cursor.

## 11. Pendent / idees
- **Generador d'activitats de lectoescriptura:** vegeu `03_PROPOSTA_GENERADOR_ACTIVITATS.md` i, **sobretot**, els dubtes de `05_ANALISI_I_DUBTES.md`, que s'han de resoldre amb la mestra abans d'implementar-lo.
- Convertir-la en PWA instal·lable.
- Lletra lligada.
- ~~Fotos pròpies en lloc de pictogrames~~: fet (apartat 9).
- **Veu, fase 2** (vegeu l'apartat 12):
  - **Sons de les lletres gravats** per la mestra i la logopeda (també ny, ll, qu, gu, ix, tx, l·l…). Les veus sintètiques diuen el nom de la lletra, no el so.
  - **Lectura fonema a fonema** de com s'ha escrit una paraula i, després, **lectura global**.
  - ~~Veus descarregables~~: fet a la 0.7.0 (Ona i Sharvard). Més endavant, potser **Matxa** del Projecte Aina (més natural; accents central, nord-occidental i valencià; CC BY-NC; uns 140 MB).
- ~~Colors i logo~~: fet a la 0.9.0 (apartat 15).
- **Nom (3/11/2026):** «PictoEscriu» es manté si ningú més el fa servir. Comprovat a la web: no s'ha trobat cap altra eina amb aquest nom; n'hi ha una de semblant, el mètode «PictoEscritura / PictoEscriptura» de VoxPrima.
- **Família d'aplicacions (pendent):** caldrà un nom de col·lecció amb sigles, com el de la UTAC, perquè hi haurà més aplicacions. Propostes: EICA, MIRA, PAS, ECA i AREMI Tec. Pendent que la mestra en triï un.
- **Aplicacions noves previstes:** control amb la mirada, a partir de treball fet amb ChatGPT que la mestra ha d'importar, i activitats per a commutador (vegeu els documents 03, 04 i 05).
- **Propostes a partir de LECAA Docs** (UTAC, UB): vegeu `06_ANALISI_LECAA_DOCS.md`. Pendents de triar.

## 12. Veu: lectura en veu alta i mode alumne (versions 0.6 i 0.7.0, 2 de novembre de 2026)
Decisions de la mestra:
- **Botó ▶ Llegir**, sempre a la barra. Llegeix tot el document o, si hi ha una paraula seleccionada, des d'aquella. El mateix botó fa ■ Aturar. Dreceres: **Ctrl+Retorn** llegeix o atura; **Esc** atura.
- **Ressalta la paraula que es llegeix** (text i pictograma junts, en groc per defecte; es pot triar el color o treure-ho). La pàgina es mou sola per seguir la lectura. El ressaltat **no canvia cap mida** i **no surt ni al PDF ni a la impressió**.
- **Mai es llegeix el nom ni la data** de la capçalera.
- El text s'envia a la veu en minúscules, perquè «HE MENJAT» es llegeixi com a paraules i no lletra per lletra. **La frase escrita no canvia.**
- **Mode mestre (per defecte):** només el botó ▶. Escriure no fa parlar i tocar una paraula només la selecciona.
- **Mode alumne:** s'activa amb **un sol clic** al botó «Mode alumne» de la barra (també des de la finestra «Veu»). Apareix un **botó ▶ gran** a baix a la dreta, pensat per a commutador i seguidor ocular. El botó ▶ de la barra no treu el cursor de l'editor: l'alumne pot continuar escrivint.
- **Ajuda mentre escriu** (només en mode alumne), cada opció es pot activar per separat:
  - **Lletra:** el nom de la lletra en pitjar-la («ema», «be alta», «ce trencada»; en castellà «eme», «eñe»…). **No** el so: els sons es gravaran amb la logopeda més endavant.
  - **Paraula:** en pitjar l'espai, diu la paraula acabada i la ressalta.
  - **Frase:** en posar . ? ! o en pitjar Retorn, llegeix la frase sencera.
  - **Tocar una paraula** per escoltar-la.
  - Perfils ràpids: «Només el botó ▶», «Paraules», «Paraules i frases» (**per defecte en mode alumne**) i «Lletres, paraules i frases».
- **Panell del bloc:** botó **Escoltar** per sentir aquella paraula, en qualsevol mode.
- **Veus:** les del navegador i de l'ordinador, gratuïtes. L'aplicació tria sola la millor: primer les veus naturals d'Edge (Microsoft, en línia), després les millorades d'Apple, les de Google i les de l'ordinador. A la finestra «Veu» es pot triar una altra veu per al català i per al castellà, provar-la i canviar la velocitat. Les veus amb el nom «undefined» (error conegut d'Edge) s'amaguen.
- **Privacitat (acceptat per la mestra):** si es fa servir una veu «en línia», el text que es llegeix s'envia a Microsoft o Google per convertir-lo en veu. El nom i la data no es llegeixen ni s'envien mai. Les veus descarregables no envien res (vegeu més avall).
- **Dues maneres de llegir amb el botó ▶:** «Natural (frase sencera)», per defecte, i «Paraula a paraula». Algunes veus (sobretot les de Google a Chrome) no diuen quina paraula estan llegint: amb «Natural», l'aplicació ho detecta i ressalta la frase sencera. Amb «Paraula a paraula» el ressaltat sempre és exacte, però sona menys fluid. El botó «Provar» de la finestra «Veu» avisa de com es comporta cada veu.
- **On es desa:** els ajustos de veu es desen **a cada ordinador** (cada ordinador té veus diferents), no dins el projecte.
- **Barra superior:** per fer lloc als botons nous, per sota de 1600 px d'amplada Desfer, Refer, Crèdits i Veu només mostren la icona, i per sota de 1366 px també Nou, Obrir, Desar i el nom del programa. Per sota de 900 px, «Exportar PDF» i «Imprimir» també només mostren la icona. Totes les icones tenen el nom en passar-hi el ratolí.
- Si l'ordinador no té veu en català o en castellà, l'aplicació ho avisa amb el botó **«Baixar-la»**.

### Veus gratuïtes descarregables (versió 0.7.0, decisió de la mestra: «vull que funcioni tot amb Chrome»)
- Perquè **funcioni a qualsevol ordinador i amb Chrome**, encara que l'ordinador no tingui veu catalana, a la finestra «Veu» hi ha un botó per baixar:
  - **Ona** (català central, dona). Uns **93 MB** la primera vegada: 63 MB de la veu i 30 MB del motor.
  - **Sharvard** (castellà, amb veu de **dona** i d'**home**). Uns 77 MB, o 106 MB si el motor encara no s'havia baixat.
- **Es baixa una sola vegada a cada ordinador i navegador** i queda guardada al navegador (Cache Storage), també obrint el fitxer amb doble clic. Després **funciona sense internet** i **el text no surt de l'ordinador**. Es pot esborrar des de la mateixa finestra.
- Ordre de preferència automàtic: veus naturals d'Edge → **veus baixades** → veus de Google → veus de l'ordinador. Es pot triar a mà.
- Amb la veu baixada, el ressaltat de la lectura «Natural» és **aproximat**: es calcula pel nombre de sons de cada paraula. Amb «Paraula a paraula» és exacte.
- La primera vegada que es fa servir, la veu tarda uns segons a preparar-se («Preparant la veu…»). Mentre es prepara cada frase, la pantalla es pot aturar una fracció de segon.
- **Seguretat:** el motor es baixa en versions fixes (ONNX Runtime 1.18.0 i piper-wasm 1.0.0, de jsDelivr o unpkg) i se'n comprova l'**empremta SHA-256** abans d'executar-lo. Les empremtes es van verificar amb la integritat oficial dels paquets npm. Si un fitxer no és l'original, no s'executa i surt un avís.
- Les veus es baixen de Hugging Face (`rhasspy/piper-voices`, amb una còpia de reserva a `diffusionstudio/piper-voices`).
- **Crèdits:** Ona (Universitat Politècnica de Catalunya, corpus FestCat; CC BY-SA) i Sharvard (corpus de V. Aubanel, M. L. García Lecumberri i M. Cooke; CC BY), fetes amb Piper (Rhasspy). Funcionen amb ONNX Runtime (Microsoft, MIT) i eSpeak NG.
- **Proves:** les proves automàtiques fan servir un motor simulat (`tests/fixtures/veu/`); l'entorn de desenvolupament no permet executar el motor real. **Cal provar la veu real a l'ordinador de l'escola.**

## 13. Sons de les lletres gravats i «Lletrejar» (versió 0.8.0, 2/11/2026)
Decisions de la mestra: **els sons els gravem nosaltres** (no es fan servir els de LECAA). El que demanava era «fonema a fonema i després lectura global».
- **Gravar:** «Veu» → «Sons de les lletres» → «Gravar els sons…». Hi ha una fila per a cada so, en català i en castellà, amb les lletres que el fan i una paraula d'exemple. «Gravar» fa servir el micròfon, s'atura sol als 2,5 segons i després sona perquè es pugui comprovar. També es pot escoltar, tornar a gravar o esborrar.
- Es guarden al navegador (Cache Storage). **«Desar en un fitxer»** crea `sons-pictoescriu.json`, i **«Obrir un fitxer de sons»** el carrega en un altre ordinador. Així només cal gravar-los una vegada.
- En reproduir-los, es retalla el silenci del principi i del final.
- **«Lletrejar»** (panell de la paraula; en mode alumne, també en tocar una paraula si es tria «La lletreja i després la diu»):
  - Marca en taronja cada lletra o grup de lletres mentre en sona el so gravat.
  - Si un so encara no està gravat, en diu el nom.
  - La h no sona.
  - Al final llegeix la paraula sencera.
  - La marca només surt a la pantalla, no canvia cap mida i no surt al PDF ni a la impressió.
- **Mode alumne, lletra en pitjar-la:** es pot triar **el nom** («ema») o **el so gravat** (/m/). Si el so no està gravat, en diu el nom.
- **Taula lletra → so:** el so més habitual de cada lletra o grup.
  - En català: ny, ll, l·l, rr, ss, qu i gu (davant e, i), tx, ix (darrere vocal), tj/tg; c i g suaus davant e, i; ç; j; x; r inicial forta; v = b; y = i.
  - En castellà: ch, ll = y, rr, qu, gu; c/z = /θ/; g/j = /x/; ñ; x = /ks/; r inicial forta; y final = i.
  - **Pendent de validar amb la logopeda** (`spellUnits()` i `SOUNDS` de `src/app.html`). No té en compte les vocals neutres ni altres canvis segons la posició.

## 14. Bloqueig de pantalla per a l'alumne (versió 0.8.0, 2/11/2026)
Decisió de la mestra: **sense contrasenya**; es desbloqueja prement un cadenat **7 vegades seguides**.
- Botó **«Bloquejar»** (cadenat) a la barra:
  - Posa la pantalla completa i amaga la barra de botons, el panell de la paraula i el zoom.
  - L'alumne pot escriure i, en mode alumne, fer servir el botó ▶ gran.
  - Les dreceres de desar, obrir i imprimir (Ctrl+S, Ctrl+O, Ctrl+P) no funcionen.
- **Desbloquejar:** cadenat petit a la cantonada de dalt a la dreta. Cal prémer-lo 7 vegades seguides, amb menys d'1,5 segons entre toc i toc. Des del tercer toc es veuen uns puntets amb els que falten; si s'atura, es torna a començar.
- Es manté després de tornar a obrir el fitxer. Si es surt de la pantalla completa (Esc), la barra continua amagada i apareix un botó per tornar-hi.
- És una protecció per a l'aula, no una barrera de seguretat.

## 15. Colors d'AREMI, logo i pantalla d'inici (versió 0.9.0, 3/11/2026)
Decisions de la mestra, a partir del logo de la seva associació, **AREMI** (paràlisi cerebral i pluridiscapacitat). La frase «50 anys» del logo d'AREMI desapareixerà al gener de 2027; PictoEscriu no la fa servir.
- **Colors:** els del logo d'AREMI, **blau marí `#24386A`** i **taronja `#EB6B24`** (mesurats sobre la imatge del logo).
- **Variant A, triada entre dues propostes («molt visual, fàcil i semblant a un Word»):**
  - La primera fila de la barra és blau marí, amb una línia taronja a sota.
  - La segona fila és una cinta clara.
  - Els botons importants (**Llegir**, **Exportar PDF**, **Imprimir** i el botó ▶ gran) són taronja.
  - La resta d'accents (selecció, botons marcats, enllaços) són blau marí.
- **Logo nou de PictoEscriu:** un cercle taronja amb una targeta blanca que conté un punt blau (el pictograma) i ratlles (el text). És un dibuix propi; no fa servir el logo d'AREMI.
- **Pantalla d'inici:** en obrir el programa surt uns 2 segons amb el logo, «PictoEscriu», «Escriure i llegir amb pictogrames» i la versió. Desapareix sola, en tocar-la o en prémer una tecla; si es prem una lletra, la lletra ja s'escriu.
- No canvia res dels fulls: la capçalera «Clàssica», la clau Fitzgerald, el PDF i la impressió són iguals que abans.
- **Nom de l'eina:** pendent. La mestra ha demanat propostes de noms nous.

## 16. Mòbils i tauletes: iPhone, iPad i Android (versió 0.9.2, 3/11/2026)
Decisió de la mestra: «amb iPhone no funciona; també hauria de funcionar amb Android»; i publicar-la amb GitHub Pages.
- **Com s'obre a cada aparell:**
  - A l'iPhone, l'iPad i Android, un fitxer .html baixat no s'obre bé. S'hi ha d'entrar per l'**adreça web**: https://mgatellcat.github.io/pictoescriu/ (GitHub Pages, carpeta `docs/` de la branca `main`).
  - Es pot posar com a icona amb «Afegir a la pantalla d'inici».
  - A l'ordinador continua funcionant el fitxer amb doble clic.
- **Mòbil (pantalla de 640 px o menys):**
  - La segona fila de la barra (pictogrames i format) s'amaga i s'obre amb el botó **«Format»**. Així la pàgina té més lloc.
  - Abans, a les pantalles de menys de 820 px, alguns botons quedaven tallats fora de la pantalla. Ara els botons passen a la línia següent.
- **iPhone i iPad:**
  - En tocar per escriure, la pantalla no s'amplia sola (el zoom amb dos dits continua funcionant).
  - Les veus baixades i els sons gravats sonen encara que l'interruptor de silenci estigui activat (Safari 16.4 o posterior).
  - La pantalla completa del bloqueig funciona a l'iPad. A l'iPhone, Safari no en té: la barra s'amaga igualment i no surt el botó de pantalla completa.
- Si el teclat no s'obre en tocar el full, es torna a intentar en el «clic».
- Els textos d'ajuda de les veus expliquen com afegir una veu a Windows, Mac, iPhone, iPad i Android, i parlen d'«aparell» en lloc d'«ordinador».
- **Proves:** es fan amb Chromium simulant un Pixel 7 i un iPhone 13, i tauletes de 600 i 768 px. **No s'ha pogut provar amb Safari de debò** (el motor de l'iPhone): cal provar-ho en un iPhone o iPad real.

## 17. Clau Fitzgerald, picto a sobre i document en blanc en obrir (versió 0.9.3, 3/11/2026)
- **Error corregit: la llista «Clau» no feia res** (passava des de la 0.5). En canviar l'opció, la còpia per poder desfer tornava a posar la llista en el valor antic abans de llegir-lo. Ara «Marc de color», «Fons de color» i «Sense clau» funcionen, també al PDF, i es poden desfer.
- **Opció nova «Picto»: «A sota de la paraula» (per defecte) o «A sobre de la paraula»** (petició de la mestra: «que s'escrigui el picto a dalt de la frase, sense clau Fitzgerald, com a nova opció»).
  - És independent de la clau. Per tenir el pictograma a dalt i sense colors, cal triar «A sobre» i «Sense clau».
  - Totes les paraules de la línia queden alineades, també les que no tenen pictograma.
  - Pantalla, PDF i impressió coincideixen.
  - Es desa amb el document (`settings.picPos`) i es manté en fer un document nou, com la clau i la mida dels pictogrames.
- **En obrir, sempre un document en blanc** (decisió de la mestra). Abans s'obria l'últim esborrany.
  - L'últim document es guarda a part i en obrir surt l'avís «Document nou en blanc», amb el botó **«Recuperar l'últim»** (15 segons). El document guardat a part només es reemplaça quan se n'ha escrit un altre.
  - Es mantenen els ajustos dels pictogrames (mida, clau, posició, «Amb text»). La resta (lletra, capçalera…) torna als valors per defecte, com amb «Nou».

## 18. Imatges recordades (versió 0.9.5, 3/11/2026)
Proposta de la mestra: si una paraula no té pictograma i s'hi posa una imatge, que la propera vegada surti sola, però que es pugui canviar. Opció triada: **es recorda sola, a cada aparell, i es passa a altres aparells amb un fitxer** (no al núvol, per privacitat: hi pot haver fotos de l'alumnat).
- **Què es recorda:** una imatge pròpia (pujada, enganxada o de Wikimedia), o un pictograma d'ARASAAC triat a mà («Següent pictograma», les alternatives o «Cercar un altre pictograma»). La propera vegada que s'escriu la paraula, surt sola.
- **Clau:** la paraula en minúscules i amb accents, separada per idioma («Marc», «MARC» i «marc» són la mateixa).
- **Canviar-la:** si es tria una altra imatge o un altre pictograma, es recorda el nou. Amb **«Oblidar»** (panell) es torna a la cerca d'ARASAAC. «Treure la imatge» també oblida la imatge pròpia.
- **Panell:** avís «Imatge recordada per a «…»» i botó **«Imatges recordades…»**, amb la llista de totes les paraules, per esborrar-ne, **desar-les en un fitxer** (`imatges-pictoescriu.json`) i **obrir-les en un altre aparell**.
- Es guarden al navegador (Cache Storage). Funcionen sense internet. **Els documents ja fets no canvien**: només afecta les paraules que s'escriuen de nou (regla 1).

## 19. Teclat virtual (versió 0.10.0, 3/11/2026)
Petició de la mestra:
- teclat QWERTY amb les tecles una mica separades, quadrades i amb les cantonades arrodonides (2 punts), en Arial negreta;
- números, Retorn, Esborrar, Majúscula, Majúscula fixa, Espai, punt i coma;
- el document sempre visible;
- la mida es pot canviar estirant les cantonades i es pot fixar.

Mida: proposta acceptada (Petita, Mitjana o Gran).
- **Botó «Teclat»** a la barra. El teclat surt a baix, centrat, i la zona del document s'escurça perquè **no el tapi mai**. També funciona amb la pantalla bloquejada.
- **Tecles:**
  - 1 a 0 i **Esborrar**;
  - Q a P;
  - A a L i **Ç** (en castellà, **Ñ**);
  - **Maj** (només la lletra següent), Z a M, **coma** i **punt**;
  - **Bloq Maj** (majúscules fixes, amb la tecla il·luminada), **À É…**, **Espai** i **Retorn**.
- La tecla **«À É…»** canvia les dues primeres files per lletres accentuades i signes:
  - en català: à è é í ï ò ó ú ü i el punt volat;
  - en castellà: á é í ó ú ü ñ ¿ ¡ ?;
  - a la fila de sota, ! ? : ; ' - ( ) « ».
- Escriu exactament com el teclat de l'ordinador: pictogrames, esborrar com en un processador de textos i veu del mode alumne. També escriu als camps NOM i DATA si hi ha el cursor.
- A la tauleta, amb el teclat obert no surt el teclat del sistema.
- **Mides:** Petita (tecla d'1,5 cm, ratolí o bona motricitat fina), **Mitjana (2 cm, per defecte)** i Gran (2,8 cm, seguidor ocular o dificultats motrius greus). També es pot **estirar per les cantonades** de dalt.
  - El teclat no passa mai de l'amplada de la pantalla ni de la meitat de l'alçada (aprox.), perquè el document es continuï veient. En pantalles petites, «Gran» queda limitada.
  - El **cadenat** fixa la mida: amaga les cantonades, els botons de mida i el botó de tancar.
  - Es recorda en cada aparell (`pictoescriu.kbd`).
- Amb el seguidor ocular funciona amb el clic del programa pont (per exemple, Tobii amb clic per permanència).
- **Barra superior:** per fer-hi lloc, «Capçalera» només mostra la icona per sota de 1600 px, i «Exportar PDF» i «Imprimir», per sota de 1180 px. Per sota de 900 px s'amaga el logo petit.
- **Pendent / idees:** teclat reduït amb tecles més grans (menys tecles o per freqüència), temps de mirada propi i pas per tecles amb commutador (amb les activitats per a commutador).


## 20. Teclat amb predicció (versió 0.11.0, 3/11/2026)
Petició de la mestra: un segon teclat amb caselles de predicció de paraules, sense la fila de números i més atractiu. Decisions:
- **Sempre QWERTY**, amb **3 caselles de predicció** a dalt. No hi ha botó «Netejar», però sí **«Esborrar paraula»** (l'última).
- **Configurador** a la barra del teclat: **[Complet | Amb predicció]** i **«Pictos»** (pictogrames a les caselles, opcional i desactivat per defecte). Amb el cadenat, el configurador s'amaga.
- **Tecles:**
  - Q a P i **Esborrar lletra**;
  - A a L, Ç (en castellà, Ñ) i **Esborrar paraula**;
  - **Maj**, Z a M, coma, punt i interrogant;
  - **Bloq Maj**, **123** (números i signes), **À É…**, **Espai**, **Retorn** i **▶ Llegir** (taronja, llegeix el text com el botó de dalt).
- **Majúscules:** en minúscules, prediccions i escriptura en minúscules. Amb **Bloq Maj**, tot en majúscules. Amb **Maj** (o si la paraula ja comença amb majúscula), només la primera lletra.
- **Com prediu:**
  - paraules que comencen igual que el que s'escriu, sense tenir en compte els accents («poma» també surt amb «pò»);
  - **primer les paraules que ja s'han escrit en aquest aparell** (les aprèn soles i es desen a `pictoescriu.learn`), després les més freqüents de la llengua;
  - sense res escrit, surten les paraules apreses més usades.
- **Llista de paraules:** 15.000 paraules freqüents en català i 15.000 en castellà, de **wordfreq** (Robyn Speer; dades CC BY-SA 4.0), sense paraulotes. Va dins el fitxer (`assets/words.json`) i funciona sense internet. Citada als crèdits.
- **Esborrar paraula:** esborra la paraula que s'està escrivint; si no n'hi ha, esborra l'anterior sencera amb el pictograma (es pot desfer).
- **Pictos a les caselles:** la imatge recordada per a aquella paraula o el primer pictograma d'ARASAAC. Les paraules gramaticals no en porten. Només s'envia a ARASAAC la paraula proposada.
- **Aspecte:** fons blau d'AREMI, tecles clares amb ombra, esborrar en vermell suau, Retorn en verd suau, Llegir en taronja, tecles de funció en gris blavós i caselles blanques.
- **Pendent / idees:** predicció de la paraula següent (segons l'anterior), i que la predicció es pugui triar amb commutador o pas per tecles.

## 21. Barra de dalt quieta i teclat Gran més ample (versió 0.11.1, 3/11/2026)
La mestra va detectar dos problemes:
- **La barra de dalt es movia mentre s'escrivia.** «Exportar PDF» i «Imprimir» saltaven de lloc. La causa era l'avís «Cercant pictogrames…», que apareixia un moment en acabar cada paraula i empenyia els botons. Ara és només una rodeta, amb el lloc sempre reservat, i el text surt si s'hi posa el ratolí a sobre.
- **«Gran» no feia res en pantalles baixes** (portàtils de 1366×768). El teclat no pot passar d'aproximadament la meitat de l'alçada, i com que les tecles eren quadrades també quedaven estretes. Ara:
  - l'amplada i l'alçada de les tecles van per separat;
  - **«Gran» ocupa tota l'amplada de la pantalla** i pot arribar al 60 % de l'alçada;
  - si l'alçada no dona per a més, les tecles es fan més baixes però continuen sent amples.

## 22. Les paraules no es parteixen mai (versió 0.11.2, 4/11/2026)
La mestra va veure «CARAME / L» escrivint amb lletra gran en majúscules: la paraula es partia en dues línies i el pictograma pujava. Cada bloc tenia una amplada màxima (2,3 vegades el pictograma) i, si la paraula hi passava, es tallava per on fos. Ara **una paraula sola no es parteix mai**: el bloc s'eixampla tant com calgui. Les expressions de diverses paraules («HE MENJAT») continuen podent passar a dues línies, però només entre paraules.
