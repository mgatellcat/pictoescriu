# Canvis i decisions acordats

Aquest document recull tot el que s'ha decidit **després** de l'especificació original (`01_ESPECIFICACIO_ORIGINAL.md`). Quan hi ha contradicció, **preval aquest document**.

Estat actual: versió 0.5, construïda i provada al xat de claude.ai entre el 29 i el 31 d'octubre de 2026. Totes les proves d'acceptació (`tests/run.js`) passen amb un ARASAAC simulat. La cerca d'ARASAAC s'ha verificat amb el servei real; l'aplicació sencera encara no s'ha provat a l'aula amb ARASAAC real.

## 1. Distribució
- **Fitxer HTML autònom** (`docs/index.html`), d'uns 1,2 MB, amb tipus de lletra, icones i jsPDF incrustats.
- **No funciona com a artefacte de claude.ai**: aquell entorn bloqueja les connexions a ARASAAC, la impressió i les descàrregues.
- Opcions: obrir el fitxer amb doble clic a Chrome o Edge, o publicar-lo amb GitHub Pages.
- Idea futura: aplicació web instal·lable (PWA) amb memòria cau dels pictogrames ja utilitzats.

## 2. Interpretacions de l'especificació original
- **«Mateixa línia»:** la frase s'escriu en línia i només salta de línia al marge; els pictogrames queden alineats a sota de cada paraula.
- **NOM / DATA i el peu d'atribució** segueixen l'idioma de la interfície.
- **Retrocés després d'una paraula acabada:** entra a editar el text d'aquella paraula, sense tocar el pictograma. Si el text i el pictograma deixen de coincidir, el panell ofereix «Cercar «...»».
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

## 9. Altres
- Zoom en una barreta flotant a baix a l'esquerra.
- Barra superior compacta en tauletes (menys de 1180 px).

## 10. Pendent / idees
- **Generador d'activitats de lectoescriptura:** vegeu `03_PROPOSTA_GENERADOR_ACTIVITATS.md` i, **sobretot**, els dubtes de `05_ANALISI_I_DUBTES.md`, que s'han de resoldre amb la mestra abans d'implementar-lo.
- Convertir-la en PWA instal·lable.
- Lletra lligada.
- Fotos pròpies en lloc de pictogrames (pendent de decidir: dubte 2).
