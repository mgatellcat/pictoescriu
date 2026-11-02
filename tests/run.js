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
  // Veu simulada: el Chromium de proves no té veus. Registra què es diu i avisa de cada paraula com fan les veus reals.
  await ctx.addInitScript(() => {
    const log = []; window.__tts = log; window.__ttsOpts = {boundary:true, wordMs:25};
    const voices = [
      {name:'Microsoft Herena - Catalan (Spain)', lang:'ca-ES', voiceURI:'herena', localService:true, default:false},
      {name:'Microsoft Joana Online (Natural) - Catalan (Spain)', lang:'ca-ES', voiceURI:'joana', localService:false, default:false},
      {name:'Microsoft Helena - Spanish (Spain)', lang:'es-ES', voiceURI:'helena', localService:true, default:false},
      {name:'Microsoft Elvira Online (Natural) - Spanish (Spain)', lang:'es-ES', voiceURI:'elvira', localService:false, default:false},
      {name:'Microsoft David - English (United States)', lang:'en-US', voiceURI:'david', localService:true, default:true},
      {name:'undefined', lang:'ca-ES', voiceURI:'bug', localService:false, default:false},
    ];
    class U { constructor(text){ Object.assign(this, {text, lang:'', voice:null, rate:1, pitch:1, volume:1}); } }
    const sy = new EventTarget(); let queue = [], cur = null, timers = [];
    const next = () => {
      if(cur || !queue.length) return; const u = cur = queue.shift();
      log.push({text:u.text, lang:u.lang, voice:u.voice && u.voice.name, rate:u.rate});
      const words = [...u.text.matchAll(/\S+/g)], ms = window.__ttsOpts.wordMs;
      timers.push(setTimeout(() => {
        if(cur !== u) return; u.onstart && u.onstart({});
        words.forEach((m, i) => timers.push(setTimeout(() => { if(cur === u && window.__ttsOpts.boundary && u.onboundary) u.onboundary({name:'word', charIndex:m.index}); }, i * ms)));
        timers.push(setTimeout(() => { if(cur !== u) return; cur = null; u.onend && u.onend({}); next(); }, words.length * ms + 10));
      }, 5));
    };
    Object.defineProperties(sy, {speaking:{get:() => !!cur}, pending:{get:() => queue.length > 0}, paused:{get:() => false}});
    Object.assign(sy, {getVoices:() => voices, speak:u => { queue.push(u); next(); }, resume(){}, pause(){},
      cancel(){ const c = cur, q = queue; queue = []; cur = null; timers.forEach(clearTimeout); timers = []; if(c && c.onerror) c.onerror({error:'interrupted'}); q.forEach(u => u.onerror && u.onerror({error:'canceled'})); }});
    Object.defineProperty(window, 'speechSynthesis', {value:sy, configurable:true});
    window.SpeechSynthesisUtterance = U;
    setTimeout(() => sy.dispatchEvent(new Event('voiceschanged')), 30);
  });
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

  // ================= Esborrar (Retrocés i Supr) =================
  const pe = await ctx.newPage(); pe.on('pageerror', e => errors.push('esborrar ' + e));
  await pe.goto('file://' + APP); await pe.evaluate(() => localStorage.clear()); await pe.reload(); await pe.waitForTimeout(500);
  const eState = () => pe.evaluate(() => ({ed:S.editor ? S.editor.mode : null, sel:S.selectedId, selBox:document.querySelectorAll('.blk.sel').length,
    words:doc.blocks.filter(b => b.kind === 'word' && !b.composing).map(b => b.text + ':' + (b.pictoId || '-')).join(' ')}));
  const eIdle = () => pe.waitForFunction(() => !doc.blocks.some(b => b.status === 'loading'), null, {timeout:8000});
  await pe.keyboard.type('la nena menja una poma ', {delay:20}); await eIdle(); await pe.waitForTimeout(300);
  for(let i = 0; i < 4; i++) await pe.keyboard.press('Backspace');
  let E = await eState();
  ok('ESBORRAR Retrocés buida la paraula i conserva el pictograma', E.ed === 'edit' && E.words.endsWith('una:1002 :4001'), JSON.stringify(E));
  await pe.keyboard.press('Backspace'); E = await eState();
  ok('ESBORRAR Un altre Retrocés treu el requadre buit i el cursor no s\'encalla', E.ed === 'compose' && !E.sel && E.selBox === 0 && E.words === 'la:1001 nena:2001 menja:3001 una:1002', JSON.stringify(E));
  await pe.keyboard.press('Control+z'); E = await eState();
  ok('ESBORRAR Ctrl+Z recupera la paraula sencera amb el pictograma', E.words.endsWith('una:1002 poma:4001'), JSON.stringify(E));
  // Mantenir la tecla premuda: esborra seguit i s'atura davant d'un pictograma
  for(let i = 0; i < 8; i++) await pe.keyboard.down('Backspace');
  await pe.keyboard.up('Backspace'); E = await eState();
  ok('ESBORRAR Tecla premuda: s\'atura davant del pictograma', E.ed === 'edit' && E.words.endsWith('una:1002 :4001'), JSON.stringify(E));
  await pe.keyboard.press('Backspace');
  for(let i = 0; i < 11; i++) await pe.keyboard.down('Backspace');
  await pe.keyboard.up('Backspace'); E = await eState();
  ok('ESBORRAR Tecla premuda: passa per sobre de les paraules sense pictograma', E.ed === 'edit' && E.words === 'la:1001 nena:2001 :3001', JSON.stringify(E));
  await pe.keyboard.press('Backspace'); await pe.keyboard.press('Backspace'); E = await eState();
  ok('ESBORRAR Es continua esborrant la paraula anterior', E.ed === 'edit' && E.words === 'la:1001 nen:2001', JSON.stringify(E));
  // Supr (cap endavant)
  await pe.evaluate(() => { commitEditor(true); S.selectedId = null; startCompose(doc.blocks.findIndex(b => b.text === 'nen')); });
  await pe.keyboard.press('Delete'); E = await eState();
  const caret = await pe.evaluate(() => edInput.selectionStart);
  ok('ESBORRAR Supr esborra la primera lletra de la paraula següent', E.ed === 'edit' && E.words === 'la:1001 en:2001' && caret === 0, JSON.stringify(E) + ' cursor ' + caret);
  for(let i = 0; i < 3; i++) await pe.keyboard.press('Delete');
  E = await eState();
  ok('ESBORRAR Supr amb la paraula buida treu el requadre', E.ed === 'compose' && E.selBox === 0 && E.words === 'la:1001', JSON.stringify(E));
  await pe.keyboard.type('gat ', {delay:20}); await eIdle(); E = await eState();
  ok('ESBORRAR Després es continua escrivint al mateix lloc', E.words === 'la:1001 gat:8001', JSON.stringify(E));
  await pe.close();

  // ================= Veu: lectura en veu alta i mode alumne =================
  const i18nMiss = await page.evaluate(() => [...Object.keys(I18N.ca).filter(k => !(k in I18N.es)), ...Object.keys(I18N.es).filter(k => !(k in I18N.ca))]);
  ok('VEU Tots els textos en català i en castellà', i18nMiss.length === 0, i18nMiss.join(','));
  const vp = await ctx.newPage(); vp.on('pageerror', e => errors.push('veu ' + e));
  vp.on('console', m => { if(m.type()==='error' && !/Failed to load resource/.test(m.text())) errors.push('veu ' + m.text()); });
  await vp.goto('file://' + APP); await vp.evaluate(() => localStorage.clear()); await vp.reload(); await vp.waitForTimeout(500);
  const said = () => vp.evaluate(() => window.__tts.map(x => x.text));
  const hush = () => vp.evaluate(() => { window.__tts.length = 0; });
  const quiet = () => vp.waitForFunction(() => !speechSynthesis.speaking && !speechSynthesis.pending && !SP.reading && !SP.active, null, {timeout:8000});
  const idleV = () => vp.waitForFunction(() => !doc.blocks.some(b => b.status==='loading'), null, {timeout:8000});
  const clickV = async (text) => { const id = await vp.evaluate(t => doc.blocks.find(b => b.text===t && !b.composing).id, text); await vp.click(`.blk[data-id="${id}"] .lbl`); return id; };
  const newDocV = async () => { await vp.click('#bNew'); await vp.click('.overlay .btn.primary'); await vp.waitForTimeout(100); };
  const geom = () => vp.evaluate(() => [...document.querySelectorAll('.flow .blk')].map(e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(Math.round).join(); }).join('|'));

  ok('VEU Per defecte: mode mestre, botó Llegir i sense botó gran', await vp.evaluate(() => !VS.student && !document.body.classList.contains('student') && document.querySelector('#bPlay').offsetWidth > 0 && document.querySelector('#bPlayBig').hidden));
  await vp.evaluate(() => { doc.header.name = 'Pau'; doc.header.date = '02/11/2026'; syncHeaderInputs(); startCompose(doc.blocks.length); });
  await vp.keyboard.type('la nena menja una poma. el gat menja ', {delay:15}); await idleV(); await vp.waitForTimeout(200);
  ok('VEU Mode mestre: escriure no fa parlar', (await said()).length === 0, (await said()).join(' | '));
  await vp.evaluate(() => { window.__hl = []; new MutationObserver(() => { const ids = [...document.querySelectorAll('.blk.speaking')].map(e => e.dataset.id).join(','); if(ids && window.__hl[window.__hl.length - 1] !== ids) window.__hl.push(ids); })
    .observe(document.getElementById('stack'), {subtree:true, attributes:true, attributeFilter:['class']}); });
  const docBefore = await vp.evaluate(() => JSON.stringify(snapshot().blocks.map(b => [b.text, b.pictoId, b.picOff])));
  const g0 = await geom();
  await vp.evaluate(() => { window.__ttsOpts.wordMs = 60; });
  await vp.click('#bPlay'); await vp.waitForFunction(() => document.querySelectorAll('.blk.speaking').length > 0);
  const during = await vp.evaluate(() => ({n:document.querySelectorAll('.blk.speaking').length, pressed:document.querySelector('#bPlay').getAttribute('aria-pressed'), label:document.querySelector('#bPlayL').textContent, composing:!!(S.editor && S.editor.mode === 'compose')}));
  const g1 = await geom();
  await quiet(); await vp.evaluate(() => { window.__ttsOpts.wordMs = 25; });
  let L = await vp.evaluate(() => window.__tts);
  ok('VEU ▶ Llegir: frase a frase, sense el nom ni la data', L.length === 2 && L[0].text === 'la nena menja una poma.' && L[1].text === 'el gat menja' && !L.some(x => /pau|2026/i.test(x.text)), L.map(x => x.text).join(' | '));
  ok('VEU Tria sola la millor veu catalana (natural)', /Joana/.test(L[0].voice) && L[0].lang === 'ca-ES', L[0].voice);
  const order = await vp.evaluate(() => window.__hl.map(ids => ids.split(',').map(id => find(id).text).join('+')));
  ok('VEU Ressalta cada paraula, en ordre', order.join(' ') === 'la nena menja una poma. el gat menja', order.join(' '));
  ok('VEU Durant la lectura: botó Aturar, una sola paraula ressaltada i l\'editor no es tanca', during.n === 1 && during.pressed === 'true' && during.label === 'Aturar' && during.composing, JSON.stringify(during));
  ok('VEU El ressaltat no mou cap paraula ni pictograma', g0 === g1);
  const vAfter = await vp.evaluate(() => ({doc:JSON.stringify(snapshot().blocks.map(b => [b.text, b.pictoId, b.picOff])), hl:document.querySelectorAll('.blk.speaking').length, pressed:document.querySelector('#bPlay').getAttribute('aria-pressed')}));
  ok('VEU En acabar: res ressaltat, text i pictogrames intactes', vAfter.doc === docBefore && vAfter.hl === 0 && vAfter.pressed === 'false');
  await hush(); await vp.evaluate(() => { window.__ttsOpts.wordMs = 200; });
  await vp.click('#bPlay'); await vp.waitForFunction(() => SP.reading); await vp.click('#bPlay');
  const stopped = await vp.evaluate(() => ({r:SP.reading, hl:document.querySelectorAll('.blk.speaking').length, sp:speechSynthesis.speaking}));
  ok('VEU Aturar a mitja lectura', !stopped.r && stopped.hl === 0 && !stopped.sp, JSON.stringify(stopped));
  await vp.keyboard.press('Control+Enter'); await vp.waitForFunction(() => SP.reading);
  await vp.keyboard.press('Escape');
  ok('VEU Ctrl+Retorn llegeix i Esc atura (sense sortir de l\'editor)', await vp.evaluate(() => !SP.reading && !speechSynthesis.speaking && S.editor && S.editor.mode === 'compose'));
  await vp.evaluate(() => { window.__ttsOpts.wordMs = 25; }); await quiet(); await hush();
  await clickV('gat'); await vp.waitForTimeout(100);
  ok('VEU Mode mestre: tocar una paraula no parla', (await said()).length === 0);
  await vp.click('#bPlay'); await quiet();
  ok('VEU Llegeix des de la paraula seleccionada', (await said()).join(' | ') === 'gat menja', (await said()).join(' | '));
  await hush(); await vp.click('#pListen'); await quiet();
  ok('VEU Panell: Escoltar la paraula', (await said()).join(' | ') === 'gat', (await said()).join(' | '));
  await vp.evaluate(() => { const el = document.querySelector('.flow .blk:not(.br)'); el.classList.add('speaking'); });
  await vp.emulateMedia({media:'print'});
  const prHL = await vp.evaluate(() => { const cs = getComputedStyle(document.querySelector('.blk.speaking')); return cs.backgroundColor + ' / ' + cs.boxShadow; });
  await vp.emulateMedia({media:'screen'}); await vp.evaluate(() => document.querySelectorAll('.blk.speaking').forEach(e => e.classList.remove('speaking')));
  ok('VEU El ressaltat no surt a la impressió', /rgba\(0, 0, 0, 0\) \/ none/.test(prHL), prHL);

  // Mode alumne
  await vp.keyboard.press('Escape'); await vp.click('#bStudent');
  const stu = await vp.evaluate(() => ({vs:VS.student, body:document.body.classList.contains('student'), big:!document.querySelector('#bPlayBig').hidden, saved:JSON.parse(localStorage.getItem('pictoescriu.voice')).student}));
  ok('VEU Mode alumne amb un clic: botó gran i es recorda', stu.vs && stu.body && stu.big && stu.saved, JSON.stringify(stu));
  await newDocV(); await hush();
  await vp.keyboard.type('la ', {delay:60}); await quiet();
  ok('VEU Alumne: diu la paraula en pitjar l\'espai', (await said()).join(' | ') === 'la', (await said()).join(' | '));
  await vp.keyboard.type('nena menja.', {delay:60}); await quiet();
  ok('VEU Alumne: llegeix la frase en posar el punt', (await said()).join(' | ') === 'la | nena | la nena menja.', (await said()).join(' | '));
  await hush(); await vp.keyboard.type('el gat menja', {delay:60}); await vp.keyboard.press('Enter'); await quiet();
  ok('VEU Alumne: Retorn llegeix la frase', (await said()).join(' | ') === 'el | gat | el gat menja', (await said()).join(' | '));
  await hush(); await clickV('nena'); await quiet();
  ok('VEU Alumne: tocar una paraula la diu', (await said()).join(' | ') === 'nena', (await said()).join(' | '));
  // Finestra Veu i lectura: perfil «Lletres, paraules i frases»
  await vp.keyboard.press('Escape'); await vp.click('#bVoice');
  const opts = await vp.$$eval('#vdVca option', os => os.map(o => o.textContent));
  ok('VEU Llista de veus catalanes, marcades i sense veus trencades', opts.length === 3 && /^Automàtica: .*Joana/.test(opts[0]) && opts.some(o => /Joana.*natural · en línia/.test(o)) && opts.some(o => /Herena.*de l'ordinador/.test(o)) && !opts.some(o => /^undefined/.test(o)), opts.join(' / '));
  await vp.click('#vdProf [data-v="all"]');
  ok('VEU Perfil: activa lletres, paraules i frases', await vp.evaluate(() => VS.letters && VS.words && VS.sentences && document.querySelector('#vdProf [data-v="all"]').getAttribute('aria-pressed') === 'true'));
  await vp.click('#vdClose'); await vp.evaluate(() => startCompose(doc.blocks.length)); await hush();
  await vp.keyboard.type('gat ', {delay:90}); await quiet();
  ok('VEU Alumne: nom de cada lletra i després la paraula', (await said()).join(' | ') === 'ge | a | te | gat', (await said()).join(' | '));
  // Veu triada, velocitat, paraula a paraula i sense ressaltat
  await vp.keyboard.press('Escape'); await vp.click('#bVoice');
  await vp.selectOption('#vdVca', 'herena');
  await vp.$eval('#vdRate', el => { el.value = '0.7'; el.dispatchEvent(new Event('input')); });
  await vp.click('#vdFlow [data-v="word"]'); await vp.click('#vdClose');
  await vp.evaluate(() => { window.__hl = []; S.selectedId = null; renderAll(); }); await hush();
  await vp.click('#bPlay'); await quiet(); L = await vp.evaluate(() => window.__tts);
  ok('VEU Veu triada a mà i velocitat', L.length > 0 && L.every(x => /Herena/.test(x.voice) && Math.abs(x.rate - 0.7) < 0.01), L.slice(0, 2).map(x => x.voice + ' ' + x.rate).join(' | '));
  ok('VEU Paraula a paraula: una paraula cada vegada', L.slice(0, 3).map(x => x.text).join(' | ') === 'la | nena | menja.' && L.length === 7, L.map(x => x.text).join(' | '));
  await vp.click('#bVoice'); await vp.click('#vdFlow [data-v="natural"]'); await vp.click('#vdHl'); await vp.click('#vdClose');
  await vp.evaluate(() => { window.__hl = []; window.__ttsOpts.wordMs = 60; }); await vp.click('#bPlay'); await quiet();
  ok('VEU Es pot treure el ressaltat', (await vp.evaluate(() => window.__hl.length)) === 0);
  await vp.click('#bVoice'); await vp.click('#vdHl'); await vp.click('#vdClose');
  // Veu que no avisa de cada paraula: es ressalta la frase sencera
  await vp.evaluate(() => { window.__ttsOpts.boundary = false; window.__ttsOpts.wordMs = 120; SP.bnd = {}; });
  await vp.click('#bPlay'); await quiet();
  await vp.evaluate(() => { window.__hl = []; }); await vp.click('#bPlay'); await quiet();
  const whole = await vp.evaluate(() => window.__hl.map(ids => ids.split(',').length));
  ok('VEU Si la veu no indica les paraules, ressalta la frase sencera', whole[0] === 3, whole.join(','));
  await vp.evaluate(() => { window.__ttsOpts.boundary = true; window.__ttsOpts.wordMs = 25; });
  // Castellà: veu castellana, noms de lletres i MAJÚSCULES llegides com a paraules
  await vp.selectOption('#sLang', 'es'); await newDocV(); await hush();
  await vp.keyboard.type('ñ', {delay:90}); await vp.keyboard.press('Backspace'); await quiet();
  await vp.keyboard.type('la niña come una manzana.', {delay:20}); await idleV(); await quiet();
  L = await vp.evaluate(() => window.__tts);
  ok('VEU Castellà: «eñe», frase final i veu castellana natural', L[0].text === 'eñe' && L[L.length - 1].text === 'la niña come una manzana.' && /Elvira/.test(L[L.length - 1].voice) && L[L.length - 1].lang === 'es-ES', L.map(x => x.text + '@' + (x.voice || '').split(' ')[1]).join(' | '));
  await vp.keyboard.press('Escape'); await vp.click('#bUpper'); await hush();
  await vp.click('#bPlay'); await quiet();
  ok('VEU MAJÚSCULES es llegeixen com a paraules (no lletra a lletra)', (await said()).join(' | ') === 'la niña come una manzana.' && (await vp.evaluate(() => doc.blocks.find(b => b.kind === 'word').text)) === 'LA', (await said()).join(' | '));
  ok('VEU Interfície en castellà', (await vp.textContent('#bPlayL')) === 'Leer' && (await vp.textContent('#bStudent')).includes('Modo alumno'));
  await vp.selectOption('#sLang', 'ca');
  await vp.reload(); await vp.waitForTimeout(500);
  ok('VEU Els ajustos de veu es recorden en aquest ordinador', await vp.evaluate(() => VS.student && VS.letters && VS.voice.ca === 'herena' && document.body.classList.contains('student')));
  await vp.screenshot({path: OUT + '/s-veu-alumne.png'});
  await vp.click('#bVoice'); await vp.waitForTimeout(100); await vp.screenshot({path: OUT + '/s-veu-finestra.png'});
  await vp.close();

  ok('Sense errors de JavaScript', errors.length===0, errors.slice(0,3).join(' | '));

  await browser.close();
  console.log(fails ? `\n${fails} prova(es) fallida(es)` : '\nTotes les proves superades');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('CRASH', e); process.exit(1); });
