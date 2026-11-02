# Canvis i decisions acordats

Aquest document recull tot el que s'ha decidit **després** de l'especificació original (`01_ESPECIFICACIO_ORIGINAL.md`). Quan hi ha contradicció, **preval aquest document**.

Estat actual: **versió 0.7.0** (2 de novembre de 2026). El número de versió surt a la finestra «Crèdits» (constant `VERSION` de `src/app.html`): cal augmentar-lo a cada versió nova.
- La 0.5 es va construir i provar al xat de claude.ai entre el 29 i el 31 d'octubre de 2026.
- Hi va haver dues línies de treball paral·leles, que la 0.7.0 ajunta:
  - Una «0.6» del 31/10/2026: tecles d'esborrar, imatges de la web o pròpies (apartat 9) i verbs auxiliars sense «?» (apartat 4).
  - Una «0.6» i «0.6.1» del 2/11/2026: lectura en veu alta i mode alumne (apartat 12) i el cursor encallat en esborrar.
- La 0.7.0 hi afegeix les veus descarregables (apartat 12), la selecció sense requadre de línies discontínues (apartat 10) i el doble clic que editava una altra paraula.
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
  - **Doble clic** (corregit a la 0.7.0): si el primer clic obria el panell i el full es desplaçava, el doble clic editava una altra paraula. Ara s'edita sempre la paraula del primer clic.
- **Botó «Amb text»:** mostra o amaga la paraula escrita sobre tots els pictogrames.

## 3. Cerca a ARASAAC (verificada amb el servei real)
Ordre de cerca, a `findPictos()`:
1. `bestsearch` amb la paraula exacta (ja resol plurals: «pomes» → poma).
2. Si no hi ha resultat, `search` filtrada: només paraules clau iguals, o gairebé iguals si la paraula té 3 o més lletres i la diferència és de 2 lletres o menys («menja» → menjar, «beu» → beure).
3. Variants lingüístiques prudents, només amb coincidència exacta: elisions («l'aigua» → aigua), participis («menjat» → menjar), gerundis («dormint» → dormir, «comiendo» → comer). La variant ha de conservar una arrel d'almenys 3 lletres, perquè «beu» no esdevingui «bar».
- Primer van els pictogrames on la paraula és la paraula clau principal: «la» mostra l'article abans que «ella».
- Paraules com «HE» o «vaig» no reben cap pictograma fals: queden només amb text.

## 4. Pictogrames automàtics només a paraules amb contingut (decisió de la mestra)
- Reben pictograma automàtic: **substantius, verbs i adjectius** (tipus ARASAAC 2, 3 i 4).
- Queden només amb text: **articles, preposicions, conjuncions, pronoms personals, noms propis i expressions socials**. La mestra els pot posar pictograma després, amb un clic.
- El panell mostra el pictograma que tindrien, esvaït, amb el botó **«Afegir pictograma»**.
- **Verbs auxiliars (31/10/2026, a petició de la mestra):** *he, has, ha, hem, heu, han, havia…, vaig, vam, van…* (i en castellà *he, has, ha, hemos, han, había…*) també queden només amb text. «vas» no hi és, perquè també és un nom.
- Aquestes paraules (articles, preposicions, pronoms i auxiliars) **ja no mostren el «?»** encara que ARASAAC no en tingui cap pictograma. El «?» queda només per a les paraules amb contingut que no tenen pictograma. Amb «Afegir pictograma» es torna a cercar.
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
- **Nova proposta de colors, de logo i de nom de l'eina** («molt visual, fàcil i semblant a un Word o a OpenOffice», amb un logo amb més impacte en obrir el programa). La mestra passarà el logo de la seva associació per inspirar-s'hi; la frase «50 anys» desapareixerà del logo al gener de 2027.
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
