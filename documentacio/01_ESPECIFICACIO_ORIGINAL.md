**APLICACIÓ WEB PER ESCRIURE TEXTOS AMB PICTOGRAMES ARASAAC**

**1. Objectiu**

Crea una aplicació web completa i funcional per elaborar frases i textos adaptats amb pictogrames ARASAAC, inspirada en el funcionament d’AraWord o AraWrite, però ajustada als requisits següents.

L’utilitzaran professionals de l’educació especial, educación infantil i primària, i professionals de la comunicació augmentativa i alternativa per preparar materials per a l’alumnat com a mesura universal i intensiva.

Ha de ser **senzilla, neta, intuïtiva i ràpida**, amb una experiència d’escriptura fluida i una vista real del document en DIN A4.

**Construeix l’aplicació, no només una maqueta o una descripció.** Totes les funcions visibles han de funcionar.

**2. Disseny general**

Organitza la pantalla en:

- **Barra superior fixa:** eines d’escriptura, format, pictogrames i document.

- **Zona central:** full DIN A4 blanc sobre un entorn gris clar.

- **Panell contextual:** opcions del bloc seleccionat, visible només quan sigui necessari.

Prioritza l’espai del document. Evita menús extensos, decoració innecessària i controls duplicats.

Utilitza botons amb icona i etiqueta clara. Mostra visualment quin bloc està seleccionat, però no imprimeixis aquest indicador.

L’ús principal serà en ordinador amb teclat i ratolí. Ha de funcionar també en tauleta.

**3. Idioma**

Inclou un selector visible:

- Català, per defecte.

- Castellà.

El selector ha de canviar els textos de la interfície i l’idioma de les noves cerques a ARASAAC.

Canviar l’idioma **no ha de traduir ni modificar automàticament el document existent**, ni substituir els pictogrames seleccionats. Però si ha de modificar la cerca de pictogrames a ARASAAC en funció de la llengua seleccionada.

Respecta accents, dièresis, apòstrofs, ela geminada i la lletra ñ. Les cerques han de funcionar independentment de si s’escriu amb majúscules o minúscules.

**4. Capçalera del material**

A la part superior del full, incorpora dos camps editables:

**NOM: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ DATA: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_**

En castellà:

**NOMBRE: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ FECHA: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_**

Requisits:

- Permetre escriure el nom de l’alumne.

- Permetre introduir una data o deixar el camp en blanc per completar-lo a mà.

- Incorporar un botó opcional per posar la data d’avui.

- No convertir el nom ni la data en pictogrames.

- Incloure aquesta capçalera en el PDF i en la impressió.

- Mostrar-la a la primera pàgina per defecte.

- Que sigui visible i atractiu a mode de fitxa de treball d’educació primària.

**5. Escriptura i aparició automàtica dels pictogrames**

L’usuari ha de poder escriure de manera contínua, com en un processador de textos, i enganxar frases o textos complets.

Quan es completi una paraula amb un espai, un signe de puntuació o un salt de línia, l’aplicació ha de:

1.  Cercar la paraula a ARASAAC en l’idioma seleccionat.

2.  Recuperar els pictogrames disponibles.

3.  Carregar una primera proposta.

4.  Mostrar **la paraula a dalt i el pictograma a sota**.

Imprescindible que la frase quedi totalment escrita en una mateixa línea i els pictogrames sota de cada paraula amb la seva clau fidzgerald.

S’ha de poder decidir si el pictograma inclou la paraula escrita o no. Això vol dir que hi haurà d’haver un botó al menú superior per decidir si el pictograma porta lletra o no.

També cal processar l’última paraula quan l’usuari deixi d’escriure breument o surti del camp, encara que no hi hagi afegit un espai.

No cal descarregar manualment les imatges ni pujar-les a l’aplicació: s’han d’obtenir i incorporar automàticament des d’ARASAAC.

**Organització del text**

- Cada unitat de contingut serà un bloc amb text i pictograma opcional.

- Els blocs s’ordenaran d’esquerra a dreta i continuaran a la línia següent quan calgui.

- La paraula i el seu pictograma han de mantenir-se sempre junts.

- S’han de conservar els paràgrafs, els salts de línia i la puntuació.

- Els signes de puntuació no han de generar cerques ni pictogrames propis.

- L’arribada dels resultats de cerca no ha de moure el cursor ni interrompre l’escriptura.

Per defecte, intenta posar pictograma a totes les paraules. Permet deixar qualsevol bloc només amb text.

Si no hi ha resultats, conserva la paraula i mostra una indicació discreta en l’editor, amb l’opció de cercar una alternativa. Aquesta indicació no ha d’aparèixer al PDF ni a la impressió.

No substitueixis pictogrames inexistents per emojis, dibuixos inventats o imatges generades.

**6. Botó superior per canviar de pictograma**

Inclou a la barra superior un botó clar i sempre localitzable:

**SEGÜENT PICTOGRAMA**

Funcionament:

1.  L’usuari selecciona una paraula o el seu pictograma.

2.  Prem «Següent pictograma».

3.  La imatge canvia a la següent alternativa disponible per a aquell bloc.

4.  En arribar a l’última alternativa, torna a la primera.

Mostra un indicador del tipus **2 de 5**.

Aquest canvi:

- Només afecta el bloc seleccionat.

- No modifica el text que s’hi mostra.

- No modifica altres aparicions de la mateixa paraula.

- Conserva la mida i el format del bloc.

Si només hi ha una alternativa, desactiva el botó i indica-ho.

Afegeix també l’opció **«Veure alternatives»**, que obri una graella de miniatures per escollir directament.

Inclou **«Cercar un altre pictograma»**, per buscar amb una paraula diferent sense canviar el text del document.

**7. Requisit fonamental: editar el text sense perdre el pictograma**

**El text visible i el pictograma han de ser independents.**

Un cop un bloc tingui un pictograma assignat, l’usuari ha de poder:

- Editar-ne el text.

- Esborrar totes les lletres.

- Escriure una altra paraula.

- Escriure una expressió de diverses paraules.

- Deixar el pictograma sense text.

**Cap d’aquestes accions ha d’eliminar, substituir o tornar a cercar automàticament el pictograma existent.**

Exemple obligatori:

1.  Escric «menjar».

2.  Apareix un pictograma de menjar.

3.  Edito el text d’aquell bloc i esborro «menjar».

4.  El pictograma continua visible.

5.  Escric «HE MENJAT».

6.  Es conserva exactament el mateix pictograma.

**Interacció**

- Un clic selecciona el bloc.

- Un doble clic sobre el text, o el botó «Editar text», permet modificar-ne l’etiqueta.

- Durant aquesta edició, els espais permeten escriure una expressió dins del mateix bloc.

- En l’escriptura contínua de contingut nou, els espais separen paraules i creen nous blocs.

Diferencia clarament aquestes accions:

- **Esborrar text:** deixa el pictograma.

- **Treure pictograma:** deixa el text.

- **Eliminar bloc:** elimina text i pictograma.

- **Cercar pictograma segons el text actual:** actualitza la cerca només quan l’usuari ho demana.

Quan el cursor sigui dins del text, Retrocés i Suprimir han d’editar lletres. Si el text queda buit, el pictograma s’ha de conservar.

Implementa **Desfer i Refer** per recuperar canvis de text, pictogrames, format i eliminacions.

**8. Majúscules, minúscules i format**

Utilitza **Roboto** com a tipografia principal, amb una alternativa similar si no està disponible.

Inclou controls per a:

- Mida de lletra.

- Color de lletra, negre per defecte.

- Negreta.

- Cursiva.

- Convertir a MAJÚSCULES.

- Convertir a minúscules.

Ha de quedar clar si el canvi s’aplica al bloc seleccionat o a tot el document. Inclou una acció explícita **«Aplicar a tot el document»**.

La conversió de majúscules i minúscules:

- Ha de funcionar per a frases i textos sencers.

- Ha de respectar els caràcters del català i del castellà.

- No ha de canviar els pictogrames.

- No ha de reiniciar les cerques.

Inclou una mida general ajustable per als pictogrames, mantenint-ne la proporció i sense retallar-los.

El text ha d’estar centrat sobre el pictograma corresponent. Si una etiqueta és llarga, permet distribuir-la en diverses línies sense superposicions ni reduccions automàtiques excessives.

**9. Clau Fitzgerald**

Aplica la clau Fitzgerald als pictogrames.

Per defecte, utilitza **un marc de color al voltant del pictograma, amb fons blanc**, mantenint el full blanc i el color del text independent.

Categories:

- **Groc:** persones, noms propis i pronoms personals.

- **Verd:** verbs i accions.

- **Blau:** qualitats i descriptius.

- **Taronja:** substantius que no corresponguin a la categoria de persones.

- **Rosa:** expressions socials.

- **Sense color de categoria:** miscel·lània, com articles, preposicions i conjuncions.

Comprova aquesta correspondència amb la documentació oficial d’ARASAAC.

Utilitza les dades disponibles per proposar la categoria. No pressuposis que el servei proporciona sempre una classificació completa o inequívoca.

Permet corregir manualment la categoria de cada bloc mitjançant un selector amb el nom i el color. Si no es pot determinar, utilitza una categoria neutra i permet ajustar-la.

Inclou opcions per:

- Mostrar la clau com a marc, opció predeterminada.

- Mostrar-la com a fons.

- Desactivar-la.

Una correcció manual s’ha de conservar. Canviar entre alternatives visuals del mateix concepte no l’ha de sobreescriure.

**10. Vista real DIN A4**

El document ha de mostrar-se des del principi com un full **DIN A4 de 210 × 297 mm**, en orientació vertical per defecte.

Requisits:

- Fons del full sempre blanc.

- Marges inicials de 15 mm.

- Vista de pàgina completa.

- Zoom per ampliar o reduir la visualització.

- El zoom no modifica les dimensions reals del document.

- Si el contingut no hi cap, es creen més pàgines A4 automàticament.

- Cap bloc de text i pictograma pot quedar dividit entre pàgines.

- No hi ha d’haver contingut fora dels marges, imatges tallades o textos superposats.

La previsualització, el PDF i la impressió han de compartir els mateixos criteris de maquetació, mides, marges i salts de pàgina.

**11. Exportar PDF i imprimir**

Inclou dos botons diferents:

**EXPORTAR PDF**  
**IMPRIMIR**

**Exportar PDF**

- Ha de descarregar un PDF real, sense dependre del diàleg d’impressió.

- Totes les pàgines han de ser DIN A4.

- Ha de conservar text, pictogrames, colors, capçalera i format.

- Ha d’incloure les imatges i la tipografia necessàries.

- El text ha de ser seleccionable sempre que sigui tècnicament possible.

- Espera que les fonts i els pictogrames hagin acabat de carregar.

- Si alguna imatge falla, informa’n i permet reintentar; no generis silenciosament un material incomplet.

**Imprimir**

- Ha d’obrir el diàleg d’impressió del navegador.

- Ha de preparar el document per imprimir en A4.

- Ha d’ocultar barres, botons, panells, seleccions i avisos de l’editor.

- Ha de mantenir els salts de pàgina de la previsualització.

No prometis controlar opcions que depenen del navegador o de la impressora. Si cal, mostra una nota breu per seleccionar A4, escala 100 % i desactivar les capçaleres i els peus del navegador.

**12. Desar i recuperar materials**

A més del PDF, permet:

- Crear un document nou.

- Desar un projecte editable.

- Obrir un projecte desat.

- Recuperar l’últim esborrany mitjançant desament automàtic local.

El projecte editable ha de conservar:

- Nom i data.

- Text i ordre dels blocs.

- Pictogrames seleccionats i identificadors d’ARASAAC.

- Paraules de cerca, separades del text visible.

- Categories Fitzgerald i correccions manuals.

- Format de text, mides i salts de paràgraf.

El PDF no substitueix el projecte editable.

No requereixis registre per crear materials. Desa localment per defecte i no enviïs el nom de l’alumne ni la data a ARASAAC: només els termes necessaris per cercar pictogrames.

**13. Integració real amb ARASAAC**

Consulta la documentació oficial vigent abans d’implementar la integració.

- Verifica els endpoints, els codis d’idioma i l’estructura de les respostes.

- Utilitza pictogrames reals d’ARASAAC.

- No inventis identificadors, rutes ni resultats.

- Comprova que la cerca i la càrrega d’imatges funcionen des de l’aplicació desplegada.

- Resol les restriccions de càrrega entre dominis si n’hi ha.

- Reutilitza resultats i imatges ja carregats per evitar peticions innecessàries.

- Evita que una resposta antiga sobreescrigui una selecció més recent.

Quan una forma flexionada no doni resultats, intenta una cerca lingüísticament adequada sense modificar el text visible. Si no es pot resoldre amb fiabilitat, ofereix la cerca manual.

Inclou l’atribució corresponent a Sergio Palao, ARASAAC i el Govern d’Aragó, amb la llicència aplicable. Mostra-la a l’apartat de crèdits i en un peu discret dels materials exportats i impresos, reservant-hi espai.

**14. Criteris tècnics essencials**

Modela cada bloc amb una identitat estable i dades independents per a:

- Text visible.

- Terme de cerca.

- Pictograma seleccionat.

- Alternatives disponibles.

- Categoria Fitzgerald.

- Format.

No reconstrueixis tots els blocs a cada pulsació: això podria perdre seleccions manuals, canviar pictogrames o desplaçar el cursor.

Prioritza:

- Escriptura fluida.

- Conservació de les decisions de l’usuari.

- Edició accessible amb teclat.

- Botons amb etiquetes comprensibles.

- Indicadors discrets de càrrega.

- Missatges d’error útils i possibilitat de reintentar.

**15. Proves d’acceptació**

Abans de donar l’aplicació per acabada, comprova:

1.  Escriure «La nena menja una poma» i obtenir propostes de pictogrames.

2.  Fer el mateix en castellà.

3.  Seleccionar una paraula amb diverses alternatives i canviar-les des del botó superior.

4.  Esborrar tot el text d’un bloc i comprovar que el pictograma es conserva.

5.  Escriure «HE MENJAT» sobre un pictograma ja assignat sense modificar-lo.

6.  Convertir tot el document a majúscules i després a minúscules sense perdre imatges.

7.  Canviar color, mida, negreta i cursiva.

8.  Corregir manualment una categoria Fitzgerald.

9.  Enganxar un text amb diversos paràgrafs.

10. Crear contingut de més d’una pàgina i comprovar que tots els fulls són A4.

11. Exportar i imprimir mantenint la distribució de la previsualització.

12. Desar i reobrir un projecte conservant tots els canvis.

13. Gestionar una paraula sense resultats i una fallada de connexió sense perdre contingut.

14. Desfer l’eliminació d’un bloc complet.

**Resultat esperat:** una eina pràctica per escriure, ajustar pictogrames i preparar materials imprimibles en pocs passos. Prioritza que aquestes funcions siguin fiables abans d’afegir funcionalitats no sol·licitades.
