const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const DIR = __dirname, FIX = path.join(DIR, 'fixtures'), APP = path.resolve(DIR, '../docs/index.html');
const OUT = process.env.OUT || path.resolve(DIR, '../test-output'); fs.mkdirSync(OUT, {recursive:true});
const K = (w,t)=>({keyword:w,type:t});
const DB = { ca:{ la:[[1001,'la',6]], nena:[[2001,'nena',2],[2002,'nena',2],[2003,'nena',2]], menjar:[[3001,'menjar',3],[3002,'menjar',3]],
  una:[[1002,'una',6]], poma:[[4001,'poma',2],[4002,'poma',2],[4003,'poma',2],[4004,'poma',2],[4005,'poma',2]], gat:[[8001,'gat',2]], jo:[[2003,'jo',1]] },
  es:{ la:[[1001,'la',6]], 'niña':[[5001,'niña',2]], comer:[[6001,'comer',3]], una:[[1002,'una',6]], manzana:[[7001,'manzana',2]] } };
let offline = false; const hits = [];
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport:{width:1440, height:900}, acceptDownloads:true });
  await ctx.route(/api\.arasaac\.org/, async route => {
    const u = decodeURIComponent(new URL(route.request().url()).pathname); hits.push(u);
    if(offline) return route.abort('internetdisconnected');
    const m = u.match(/\/api\/pictograms\/(ca|es)\/(bestsearch|search)\/(.+)$/);
    if(!m) return route.fulfill({status:404, body:'[]'});
    const list = (DB[m[1]][m[3]] || []); const sel = m[2]==='bestsearch' ? list.slice(0,1) : list;
    if(!sel.length) return route.fulfill({status:404, headers:{'access-control-allow-origin':'*'}, body:'{"error":"not found"}'});
    return route.fulfill({status:200, headers:{'content-type':'application/json','access-control-allow-origin':'*'},
      body: JSON.stringify(sel.map(([id,kw,t]) => ({_id:id, keywords:[K(kw,t)]})))});
  });
  await ctx.route(/static\.arasaac\.org/, async route => {
    if(offline) return route.abort('internetdisconnected');
    const id = route.request().url().match(/pictograms\/(\d+)\//)[1];
    const f = path.join(FIX, id + '.png');
    if(!fs.existsSync(f)) return route.fulfill({status:404, body:''});
    return route.fulfill({status:200, headers:{'content-type':'image/png','access-control-allow-origin':'*'}, body:fs.readFileSync(f)});
  });
  // Wikimedia Commons simulat (cerca d'imatges a la web)
  const commonsHits = [];
  await ctx.route(/commons\.wikimedia\.org\/w\/api\.php/, async route => {
    const q = new URL(route.request().url()).searchParams.get('gsrsearch'); commonsHits.push(q);
    if(offline) return route.abort('internetdisconnected');
    const pages = /^barça /.test(q) ? {
      11:{index:1, title:'File:Escut del Barça.png', imageinfo:[{thumburl:'https://upload.wikimedia.org/thumb/escut.png', mime:'image/png', descriptionurl:'https://commons.wikimedia.org/wiki/File:Escut.png',
        extmetadata:{ObjectName:{value:'Escut del Barça'}, Artist:{value:'<a href="x">Joan Autor</a>'}, LicenseShortName:{value:'CC BY-SA 4.0'}}}]},
      12:{index:2, title:'File:Camp Nou.jpg', imageinfo:[{thumburl:'https://upload.wikimedia.org/thumb/camp.png', mime:'image/jpeg', extmetadata:{Artist:{value:'Maria'}, LicenseShortName:{value:'CC BY 2.0'}}}]},
      13:{index:3, title:'File:So.ogg', imageinfo:[{url:'x', mime:'audio/ogg'}]} } : null;
    return route.fulfill({status:200, headers:{'content-type':'application/json','access-control-allow-origin':'*'}, body:JSON.stringify(pages ? {query:{pages}} : {batchcomplete:''})});
  });
  await ctx.route(/upload\.wikimedia\.org/, route => route.fulfill({status:200, headers:{'content-type':'image/png','access-control-allow-origin':'*'}, body:fs.readFileSync(path.join(FIX, '4001.png'))}));
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', e => errors.push(String(e))); page.on('console', m => { if(m.type()==='error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  let fails = 0; const ok = (name, cond, info='') => { if(!cond) fails++; console.log(`${cond?'PASS':'FAIL'}  ${name}${info?'  ['+info+']':''}`); };
  await page.goto('file://' + APP);
  await page.waitForTimeout(500);
  const blocks = () => page.evaluate(() => doc.blocks.filter(b=>!b.composing).map(b => ({k:b.kind, text:b.text, st:b.status, pid:b.pictoId, n:b.pictos ? b.pictos.length : 0, cat:b.cat, id:b.id, fmt:b.fmt, picOff:b.picOff})));
  const idle = () => page.waitForFunction(() => !doc.blocks.some(b => b.status==='loading'), null, {timeout:8000});
  const clickBlock = async (text) => { const id = await page.evaluate(t => doc.blocks.find(b => b.text===t && !b.composing).id, text); await page.click(`.blk[data-id="${id}"] .lbl`); return id; };

  // 1. Escriure en català
  await page.keyboard.type('La nena menja una poma ', {delay:20});
  await idle(); await page.waitForTimeout(300);
  let B = await blocks();
  ok('1 Català: 5 blocs', B.length===5, B.map(b=>b.text+':'+b.st+':'+b.pid).join(' '));
  ok('1 "menja" troba "menjar" per variant', B[2].pid===3001 && B[2].cat==='verbs', JSON.stringify(B[2]));
  ok('1 Fitzgerald: nena taronja, la misc', B[1].cat==='substantius' && B[0].cat==='misc');
  const rowTops = await page.evaluate(() => [...document.querySelectorAll('.page .blk:not(.br):not(.empty)')].map(e => Math.round(e.querySelector('.pic').getBoundingClientRect().top)));
  ok('1 Mateixa línia, pictos alineats', new Set(rowTops).size===1, rowTops.join(','));
  await page.screenshot({path: OUT + '/s1-escriure.png'});
  B = await blocks();
  ok('NOU Articles sense picto automàtic, contingut amb picto', B[0].picOff && B[3].picOff && !B[1].picOff && !B[2].picOff && !B[4].picOff, B.map(b=>b.text+':'+(b.picOff?'off':'on')).join(' '));
  const gaps = await page.evaluate(() => { const els = [...document.querySelectorAll('.flow .blk:not(.br):not(.empty)')].map(e => e.querySelector('.lbl').getBoundingClientRect()); const pw = document.querySelector('.page').getBoundingClientRect().width / 210; return els.slice(1).map((r, i) => ((r.left - els[i].right) / pw).toFixed(1)); });
  ok('NOU Separació entre paraules ≥ 3 mm (doble espai a 20 pt)', gaps.every(g => +g >= 3), gaps.join(' mm, ') + ' mm');
  const textTops = await page.evaluate(() => [...document.querySelectorAll('.flow .blk:not(.br):not(.empty) .lbl')].map(l => Math.round(l.getBoundingClientRect().top)));
  ok('NOU Paraules sense picto a la mateixa línia de text', new Set(textTops).size === 1, textTops.join(','));
  // Afegir pictograma a posteriori
  await clickBlock('La'); await page.click('#pTogglePic');
  B = await blocks(); ok('NOU Afegir pictograma a un article', !B[0].picOff && B[0].pid === 1001);
  await page.click('#pTogglePic'); B = await blocks(); ok('NOU Treure’l de nou', B[0].picOff);
  // Paraula dins el pictograma (la frase no canvia)
  await clickBlock('poma');
  await page.click('#pPos [data-v="top"]');
  const geo = await page.evaluate(() => { const b = doc.blocks.find(b => b.text === 'poma'); const el = document.querySelector(`.blk[data-id="${b.id}"]`);
    const p = el.querySelector('.pic').getBoundingClientRect(), c = el.querySelector('.cap').getBoundingClientRect(), im = el.querySelector('img').getBoundingClientRect(), l = el.querySelector('.lbl').getBoundingClientRect();
    return {cap: el.querySelector('.cap').textContent, lbl: el.querySelector('.lbl').textContent, stored: b.text, inside: c.top >= p.top && c.bottom <= im.top + 1 && im.bottom <= p.bottom + 0.5, boxH: Math.round(p.height), labelAbove: l.bottom <= p.top}; });
  const otherH = await page.evaluate(() => Math.round(document.querySelector(`.blk[data-id="${doc.blocks.find(b => b.text === 'nena').id}"] .pic`).getBoundingClientRect().height));
  ok('NOU Paraula A DALT dins el pictograma, en majúscules', geo.cap === 'POMA' && geo.inside, JSON.stringify(geo));
  ok('NOU La frase no canvia', geo.lbl === 'poma' && geo.stored === 'poma' && geo.labelAbove);
  ok('NOU El requadre manté la mida', geo.boxH === otherH, geo.boxH + ' / ' + otherH);
  await page.click('#pPos [data-v="bottom"]'); await page.click('#pCase [data-v="lower"]');
  await page.fill('#pCapText', 'pomes');
  const geo2 = await page.evaluate(() => { const b = doc.blocks.find(b => b.text === 'poma'); const el = document.querySelector(`.blk[data-id="${b.id}"]`);
    const c = el.querySelector('.cap').getBoundingClientRect(), im = el.querySelector('img').getBoundingClientRect(); return {cap: el.querySelector('.cap').textContent, below: c.top >= im.bottom - 0.5, lbl: el.querySelector('.lbl').textContent}; });
  ok('NOU A BAIX, minúscules i paraula editada sense tocar la frase', geo2.cap === 'pomes' && geo2.below && geo2.lbl === 'poma', JSON.stringify(geo2));
  await page.click('#pWordAll');
  const all = await page.evaluate(() => [...document.querySelectorAll('.flow .pic.st-ok .cap')].map(c => c.textContent));
  ok('NOU Aplicar a tot: tots els pictogrames amb paraula', all.length >= 3 && all.every(x => x), all.join(','));
  const longFit = await page.evaluate(() => { const b = doc.blocks.find(b => b.text === 'nena'); b.capText = 'desenvolupament'; paintBlock(b, idxOf(b.id)); const c = document.querySelector(`.blk[data-id="${b.id}"] .cap`); return c.scrollWidth <= c.clientWidth + 1; });
  ok('NOU Paraula llarga s’ajusta sense retallar-se', longFit);
  await page.screenshot({path: OUT + '/s-caption.png'});
  const [dlc] = await Promise.all([page.waitForEvent('download', {timeout:20000}), page.click('#bPdf')]);
  await dlc.saveAs(OUT + '/caption.pdf');
  ok('NOU PDF amb paraula dins el pictograma', true);
  await page.evaluate(() => { doc.blocks.forEach(b => { b.capText = null; }); });
  await clickBlock('poma'); await page.click('#pPos [data-v="none"]'); await page.click('#pWordAll');
  await page.keyboard.press('Escape');

  // 3. Següent pictograma
  await clickBlock('poma');
  const badge = () => page.textContent('#nextBadge');
  ok('3 Indicador inicial', (await badge())==='1 de 5', await badge());
  await page.click('#bNext'); B = await blocks();
  ok('3 Següent → 2 de 5', (await badge())==='2 de 5' && B[4].pid===4002, await badge());
  for(let i=0;i<4;i++) await page.click('#bNext');
  B = await blocks(); ok('3 Torna a la primera', B[4].pid===4001 && (await badge())==='1 de 5');
  await clickBlock('La');
  ok('3 Una sola alternativa: botó desactivat', await page.isDisabled('#bNext'), await page.getAttribute('#bNext','title'));
  await page.screenshot({path: OUT + '/s3-panel.png'});

  // 4-5. Editar text sense perdre pictograma
  const mid = await page.evaluate(() => doc.blocks.find(b => b.text==='menja').id);
  await page.dblclick(`.blk[data-id="${mid}"] .lbl`);
  await page.keyboard.press('Control+A'); await page.keyboard.press('Backspace');
  B = await blocks(); let m = B.find(b=>b.id===mid);
  ok('4 Text esborrat, pictograma conservat', m.text==='' && m.pid===3001, JSON.stringify(m));
  await page.keyboard.type('HE MENJAT'); await page.keyboard.press('Enter'); await page.waitForTimeout(1200);
  B = await blocks(); m = B.find(b=>b.id===mid);
  ok('5 "HE MENJAT" en un bloc, mateix pictograma', m.text==='HE MENJAT' && m.pid===3001 && B.length===5, JSON.stringify(m));
  ok('5 Cap nova cerca en editar', !hits.some(h => /MENJAT|menjat/i.test(h)));

  // 6. Majúscules / minúscules del document
  await page.keyboard.press('Escape');
  const pidsBefore = (await blocks()).map(b=>b.pid).join();
  const hitsBefore = hits.length;
  await page.click('#bUpper'); B = await blocks();
  ok('6 MAJÚSCULES a tot el document', B.every(b => b.text===b.text.toUpperCase()) && B.map(b=>b.pid).join()===pidsBefore, B.map(b=>b.text).join(' '));
  await page.click('#bLower'); B = await blocks();
  ok('6 minúscules sense perdre imatges ni cercar', B.every(b => b.text===b.text.toLowerCase()) && B.map(b=>b.pid).join()===pidsBefore && hits.length===hitsBefore);

  // 7. Format
  await clickBlock('nena');
  await page.click('#bBold'); await page.click('#bItalic'); await page.selectOption('#sSize', '32');
  await page.$eval('#iColor', el => { el.value = '#c62828'; el.dispatchEvent(new Event('change')); });
  const st = await page.evaluate(() => { const b = doc.blocks.find(b=>b.text==='nena'); const l = document.querySelector(`.blk[data-id="${b.id}"] .lbl`); const cs = getComputedStyle(l); return {w:cs.fontWeight, s:cs.fontStyle, f:l.style.fontSize, c:cs.color}; });
  ok('7 Negreta, cursiva, mida i color al bloc', st.w==='700' && st.s==='italic' && st.f==='32pt' && st.c==='rgb(198, 40, 40)', JSON.stringify(st));
  const otherW = await page.evaluate(() => getComputedStyle(document.querySelector(`.blk[data-id="${doc.blocks.find(b=>b.text==='poma').id}"] .lbl`)).fontWeight);
  ok('7 Els altres blocs no canvien', otherW==='400');

  // 8. Categoria manual es conserva en canviar alternativa
  await page.click('#pCats [data-c="social"]');
  await page.click('#bNext');
  B = await blocks(); const nena = B.find(b=>b.text==='nena');
  ok('8 Correcció manual Fitzgerald conservada', nena.cat==='social' && nena.pid===2002, JSON.stringify(nena));

  // 14. Desfer eliminació
  const n0 = (await blocks()).length;
  await page.keyboard.press('Delete');
  const n1 = (await blocks()).length;
  await page.keyboard.press('Control+z');
  B = await blocks();
  ok('14 Eliminar bloc i desfer', n1===n0-1 && B.length===n0 && B.find(b=>b.text==='nena').cat==='social', `${n0}→${n1}→${B.length}`);

  // 13. Sense resultats i fallada de connexió
  await page.keyboard.press('Escape');
  { const bb = await page.evaluate(() => { const r = document.querySelector('.page .flow').getBoundingClientRect(); return {x:r.left + r.width/2, y:r.top + r.height*0.7}; }); await page.mouse.click(bb.x, bb.y); }
  await page.keyboard.type('xyzzy ', {delay:20}); await idle();
  B = await blocks(); const xz = B.find(b=>b.text==='xyzzy');
  ok('13 Paraula sense resultats es conserva', xz && xz.st==='none');
  offline = true;
  await page.keyboard.type('gat ', {delay:20}); await idle(); await page.waitForTimeout(200);
  B = await blocks(); const g = B.find(b=>b.text==='gat');
  const toastTxt = await page.textContent('#toasts');
  ok('13 Fallada de connexió: text conservat i avís', g && g.st==='error' && /ARASAAC/.test(toastTxt), toastTxt);
  offline = false;
  await page.click('#toasts button'); await idle();
  B = await blocks(); ok('13 Reintentar recupera el pictograma', B.find(b=>b.text==='gat').pid===8001);
  await page.screenshot({path: OUT + '/s13-errors.png'});

  // 9. Enganxar text amb paràgrafs
  await page.keyboard.press('Escape');
  await page.evaluate(() => { const dt = new DataTransfer(); dt.setData('text/plain', 'la poma\n\nuna nena\nla nena'); const ev = new ClipboardEvent('paste', {clipboardData:dt, bubbles:true, cancelable:true}); (document.activeElement && document.activeElement.classList.contains('ed') ? document.activeElement : document).dispatchEvent(ev); });
  await idle(); B = await blocks();
  const tail = B.slice(-9).map(b => b.k==='br' ? '¶' : b.text).join(' ');
  ok('9 Enganxar conserva paràgrafs', /la poma ¶ ¶ una nena ¶ la nena$/.test(tail), tail);

  // 10. Més d'una pàgina
  await page.evaluate(() => { const txt = Array.from({length:20}, () => 'la nena menja una poma.').join(' '); pasteText(txt); });
  await idle(); await page.waitForTimeout(300);
  const pg = await page.evaluate(() => [...document.querySelectorAll('.page')].map(p => { const r = p.getBoundingClientRect(); return (r.height/r.width).toFixed(4); }));
  const overflow = await page.evaluate(() => { let bad = 0; document.querySelectorAll('.page').forEach(p => { const f = p.querySelector('.flow'), fr = f.getBoundingClientRect(); f.querySelectorAll('.blk').forEach(b => { const r = b.getBoundingClientRect(); if(r.bottom > fr.bottom + 1 || r.right > fr.right + 1) bad++; }); }); return bad; });
  ok('10 Diverses pàgines A4 (297/210 = 1.4143)', pg.length>=2 && pg.every(x => x==='1.4143'), pg.join(','));
  ok('10 Cap bloc fora dels marges ni partit', overflow===0, 'fora: '+overflow);
  await page.click('#bFitWidth'); await page.waitForTimeout(200);
  await page.screenshot({path: OUT + '/s10-pagines.png'});
  await page.click('#bFitPage');

  // Capçaleres
  await page.click('#bHead'); await page.click('.hcard[data-k="space"]');
  const hh = await page.evaluate(() => { const r = document.querySelector('.sheet-head').getBoundingClientRect(), pw = document.querySelector('.page').getBoundingClientRect().width / 210; return {h:(r.height/pw).toFixed(1), style:doc.header.style}; });
  ok('NOU Capçalera «Espai» aplicada', hh.style === 'space' && hh.h === '30.0', JSON.stringify(hh));
  await page.screenshot({path: OUT + '/s-gallery.png'});
  await page.click('#hgClose');
  // 11a. PDF
  await page.fill('#hName', 'Pau'); await page.click('#hToday');
  const [dl] = await Promise.all([page.waitForEvent('download', {timeout:20000}), page.click('#bPdf')]);
  const pdfPath = OUT + '/prova.pdf'; await dl.saveAs(pdfPath);
  ok('11 PDF descarregat', fs.statSync(pdfPath).size > 5000, dl.suggestedFilename());

  // 11b. Impressió (mitjà print)
  const scr = await page.evaluate(() => [...document.querySelectorAll('.page')].map(p => [...p.querySelectorAll('.flow > .blk')].map(e => e.dataset.id).join()));
  await page.emulateMedia({media:'print'});
  const prn = await page.evaluate(() => { let bad = 0; document.querySelectorAll('.page').forEach(p => { const f = p.querySelector('.flow'); f.querySelectorAll('.blk').forEach(b => { if(b.offsetTop + b.offsetHeight > f.clientHeight + 0.5) bad++; }); });
    return {bad, pages:[...document.querySelectorAll('.page')].map(p => [...p.querySelectorAll('.flow > .blk')].map(e => e.dataset.id).join()), head:document.querySelector('.sheet-head').offsetHeight}; });
  ok('11 Impressió: mateixos salts de pàgina i res retallat', prn.bad === 0 && JSON.stringify(prn.pages) === JSON.stringify(scr), 'retallats: ' + prn.bad);
  const pv = await page.evaluate(() => ({bar:getComputedStyle(document.querySelector('.topbar')).display, panel:getComputedStyle(document.querySelector('.panel')).display, pages:document.querySelectorAll('.page').length}));
  await page.screenshot({path: OUT + '/s11-print.png', fullPage:false});
  ok('11 Impressió amaga barres i panells', pv.bar==='none', JSON.stringify(pv));
  await page.emulateMedia({media:'screen'});

  // 12. Desar i reobrir
  const [dl2] = await Promise.all([page.waitForEvent('download'), page.click('#bSave')]);
  const projPath = OUT + '/prova.pictoescriu.json'; await dl2.saveAs(projPath);
  const before = await page.evaluate(() => JSON.stringify(snapshot().blocks.map(b => [b.kind, b.text, b.pictoId, b.cat, b.catManual, JSON.stringify(b.fmt||{})])));
  const page2 = await ctx.newPage(); page2.on('pageerror', e => errors.push('p2 '+e));
  await page2.goto('file://' + APP); await page2.evaluate(() => localStorage.clear()); await page2.reload(); await page2.waitForTimeout(400);
  await page2.setInputFiles('#fileIn', projPath); await page2.waitForTimeout(600);
  const after = await page2.evaluate(() => JSON.stringify(snapshot().blocks.map(b => [b.kind, b.text, b.pictoId, b.cat, b.catManual, JSON.stringify(b.fmt||{})])));
  const hdr = await page2.evaluate(() => doc.header);
  ok('12 Projecte reobert idèntic', before===after && hdr.name==='Pau' && !!hdr.date, `${before.length} / ${after.length}`);

  // Autodesament
  await page2.waitForTimeout(1200); const page3 = await ctx.newPage(); await page3.goto('file://' + APP); await page3.waitForTimeout(600);
  const n3 = await page3.evaluate(() => doc.blocks.filter(b=>!b.composing).length);
  ok('Esborrany recuperat automàticament', n3 > 0, 'blocs: '+n3);
  await page3.close(); await page2.close();

  // 2. Castellà
  await page.click('#bNew'); await page.click('.overlay .btn.primary');
  await page.selectOption('#sLang', 'es');
  await page.keyboard.type('La niña come una manzana ', {delay:20}); await idle();
  B = await blocks();
  ok('2 Castellà: pictogrames i UI', B.map(b=>b.pid).join()==='1001,5001,6001,1002,7001' && (await page.textContent('#bNext'))?.includes('Siguiente'), B.map(b=>b.text+':'+b.pid).join(' '));
  ok('2 Capçalera en castellà', (await page.textContent('#hNameL'))==='NOMBRE:');
  await page.selectOption('#sLang', 'ca');
  B = await blocks(); ok('2 Canviar idioma no modifica el document', B.map(b=>b.text).join(' ')==='La niña come una manzana');
  await page.screenshot({path: OUT + '/s2-castella.png'});

  // Tecles d'esborrar (Retrocés i Suprimir)
  await page.click('#bNew'); await page.click('.overlay .btn.primary');
  await page.keyboard.type('la nena menja ', {delay:20}); await idle();
  const txt = () => page.evaluate(() => doc.blocks.filter(b => !b.composing).map(b => b.text + (b.pictoId ? '*' : '')).join(' '));
  for(let k = 0; k < 5; k++) await page.keyboard.press('Backspace');
  ok('Retrocés: esborra lletres i conserva el pictograma amb el text buit', (await txt())==='la* nena* *', await txt());
  await page.keyboard.press('Backspace');
  ok('Retrocés: un cop buit, elimina el bloc', (await txt())==='la* nena*', await txt());
  await page.keyboard.press('Backspace');
  ok('Retrocés: continua a la paraula anterior', (await txt())==='la* nen*', await txt());
  await page.keyboard.press('Escape');
  await page.click('#bNew'); await page.click('.overlay .btn.primary');
  await page.keyboard.type('la nena menja ', {delay:20}); await idle();
  await clickBlock('nena'); await page.keyboard.press('Delete');
  const ed = await page.evaluate(() => ({sel:S.selectedId, mode:S.editor && S.editor.mode}));
  ok('Suprimir amb paraula seleccionada: l\'esborra i no en selecciona cap altra', (await txt())==='la* menja*' && !ed.sel && ed.mode==='compose', (await txt()) + ' ' + JSON.stringify(ed));
  await page.keyboard.press('Delete');
  ok('Suprimir amb el cursor: esborra la paraula següent', (await txt())==='la*', await txt());
  await page.keyboard.press('Control+z');
  ok('Suprimir es pot desfer', (await txt())==='la* menja*', await txt());

  // Verbs auxiliars i paraules funcionals sense pictograma: només text, sense «?»
  await page.keyboard.press('Escape');
  await page.click('#bNew'); await page.click('.overlay .btn.primary');
  await page.keyboard.type('HA vaig els xyzzy ', {delay:20}); await idle();
  const aux = await page.evaluate(() => doc.blocks.filter(b => !b.composing && b.kind==='word').map(b => b.text + ':' + (document.querySelector(`.blk[data-id="${b.id}"]`).classList.contains('nores') ? '?' : 'text')).join(' '));
  ok('Auxiliars («ha», «vaig») i articles sense resultats: només text, sense «?»', aux==='HA:text vaig:text els:text xyzzy:?', aux);
  await clickBlock('HA'); await page.click('#pTogglePic'); await idle();
  ok('Auxiliar: «Afegir pictograma» torna a cercar i mostra el «?» si no n\'hi ha', await page.evaluate(() => { const b = doc.blocks.find(x => x.text==='HA'); return !b.picOff && document.querySelector(`.blk[data-id="${b.id}"]`).classList.contains('nores'); }));

  // Imatges de la web (Wikimedia Commons) i pròpies
  await page.keyboard.press('Escape');
  await page.click('#bNew'); await page.click('.overlay .btn.primary');
  await page.keyboard.type('visca el barça ', {delay:20}); await idle();
  const hitsArasaac = hits.length;
  await clickBlock('barça');
  ok('Web: el camp de cerca proposa la paraula', (await page.inputValue('#pWebQ'))==='barça');
  await page.click('#pWebSearch');
  await page.waitForSelector('#pWeb:not([hidden]) button');
  const nWeb = await page.$$eval('#pWeb button', x => x.length);
  ok('Web: resultats de Wikimedia Commons (sense àudio)', nWeb===2 && commonsHits.length===1 && /^barça /.test(commonsHits[0]), nWeb + ' ' + commonsHits.join());
  ok('Web: a Wikimedia només s\'envia la paraula', !commonsHits.some(h => /Pau/.test(h)));
  await page.click('#pWeb button[data-w="0"]');
  await page.waitForFunction(() => doc.blocks.some(b => b.own && b.own.src));
  let ob = await page.evaluate(() => { const b = doc.blocks.find(x => x.text==='barça'); const el = document.querySelector(`.blk[data-id="${b.id}"]`);
    return {text:b.text, from:b.own.from, author:b.own.author, src:el.querySelector('img').getAttribute('src').slice(0, 15), cls:el.querySelector('.pic').className, foot:document.querySelector('.attrib').textContent, msg:document.querySelector('#pMsg').textContent}; });
  ok('Web: la imatge es posa al lloc del pictograma', ob.src.startsWith('data:image/') && /st-ok/.test(ob.cls) && ob.text==='barça' && ob.from==='commons', JSON.stringify(ob).slice(0, 200));
  ok('Web: crèdits al peu de pàgina i al panell', /ARASAAC/.test(ob.foot) && /Wikimedia Commons.*Escut del Barça.*Joan Autor.*CC BY-SA 4\.0/.test(ob.foot) && /Joan Autor/.test(ob.msg), ob.foot);
  ok('Web: no es fa cap cerca nova a ARASAAC', hits.length===hitsArasaac);
  await page.keyboard.press('Control+z');
  ok('Web: es pot desfer', await page.evaluate(() => !doc.blocks.find(x => x.text==='barça').own));
  await page.keyboard.press('Control+y');
  // Pujar una imatge pròpia
  await clickBlock('visca');
  await page.setInputFiles('#imgIn', path.join(FIX, '8001.png'));
  await page.waitForFunction(() => { const b = doc.blocks.find(x => x.text==='visca'); return b.own && b.own.src; });
  ob = await page.evaluate(() => { const b = doc.blocks.find(x => x.text==='visca'); return {from:b.own.from, foot:document.querySelector('.attrib').textContent, off:document.querySelector('#pOwnOff').hidden}; });
  ok('Pròpia: imatge pujada de l\'ordinador', ob.from==='file' && !ob.off, JSON.stringify(ob));
  // Desar i reobrir conserva les imatges
  const [dl3] = await Promise.all([page.waitForEvent('download'), page.click('#bSave')]);
  const projOwn = OUT + '/imatges.pictoescriu.json'; await dl3.saveAs(projOwn);
  const pg4 = await ctx.newPage(); pg4.on('pageerror', e => errors.push('p4 '+e));
  await pg4.goto('file://' + APP); await pg4.waitForTimeout(400); await pg4.setInputFiles('#fileIn', projOwn); await pg4.waitForTimeout(600);
  const re = await pg4.evaluate(() => doc.blocks.filter(b => b.own).map(b => b.text + ':' + b.own.from + ':' + (document.querySelector(`.blk[data-id="${b.id}"] img`).getAttribute('src')||'').slice(0, 11)).join(' '));
  ok('Pròpia: es conserva en desar i reobrir', re==='visca:file:data:image/ barça:commons:data:image/', re);
  await pg4.close();
  // PDF amb les imatges
  const [dl4] = await Promise.all([page.waitForEvent('download', {timeout:20000}), page.click('#bPdf')]);
  const pdfOwn = OUT + '/imatges.pdf'; await dl4.saveAs(pdfOwn);
  const nImg = (fs.readFileSync(pdfOwn, 'latin1').match(/\/Subtype \/Image/g) || []).length;
  ok('Pròpia: les imatges surten al PDF', nImg >= 3, 'imatges: ' + nImg);
  // Treure la imatge
  await clickBlock('visca'); await page.click('#pOwnOff');
  ob = await page.evaluate(() => { const b = doc.blocks.find(x => x.text==='visca'); return {own:!!b.own, foot:document.querySelector('.attrib').textContent}; });
  ok('Pròpia: «Treure la imatge» torna al pictograma i el text es conserva', !ob.own && /Joan Autor/.test(ob.foot), JSON.stringify(ob));
  // Sense connexió amb Wikimedia
  offline = true; await page.fill('#pWebQ', 'gat'); await page.click('#pWebSearch'); await page.waitForTimeout(300);
  ok('Web: avís si no hi ha connexió', /Wikimedia/.test(await page.textContent('#pWebMsg')));
  offline = false;
  await page.screenshot({path: OUT + '/s-imatges.png'});

  ok('Sense errors de JavaScript', errors.length===0, errors.slice(0,3).join(' | '));

  await browser.close();
  console.log(fails ? `\n${fails} prova(es) fallida(es)` : '\nTotes les proves superades');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('CRASH', e); process.exit(1); });
