const { chromium, devices } = require('playwright');
const fs = require('fs'); const path = require('path'); const crypto = require('crypto');
const DIR = __dirname, FIX = path.join(DIR, 'fixtures'), APP = path.resolve(DIR, '../docs/index.html');
const OUT = process.env.OUT || path.resolve(DIR, '../test-output'); fs.mkdirSync(OUT, {recursive:true});
const K = (w,t)=>({keyword:w,type:t});
const DB = { ca:{ la:[[1001,'la',6]], nena:[[2001,'nena',2],[2002,'nena',2],[2003,'nena',2]], menjar:[[3001,'menjar',3],[3002,'menjar',3]],
  una:[[1002,'una',6]], poma:[[4001,'poma',2],[4002,'poma',2],[4003,'poma',2],[4004,'poma',2],[4005,'poma',2]], gat:[[8001,'gat',2]], jo:[[2003,'jo',1]],
    hola:[[2002,'hola',5]], 'sí':[[3002,'sí',5]], si:[[1002,'si',6]], es:[[1001,'es',6]],
    verd:[[4002,'verd',4]], groc:[[4003,'groc',4]], nou:[[4004,'nou',4]], roig:[[4005,'roig',4]] },
  es:{ la:[[1001,'la',6]], 'niña':[[5001,'niña',2]], comer:[[6001,'comer',3]], una:[[1002,'una',6]], manzana:[[7001,'manzana',2]], rojo:[[4005,'rojo',4]] } };
let offline = false; const hits = [];
(async () => {
  // Micròfon simulat (un xiulet) per provar la gravació dels sons
  const browser = await chromium.launch({args:['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']});
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
    Object.assign(sy, {getVoices:() => voices.filter(v => !(window.__ttsHide && v.lang.startsWith(window.__ttsHide))), speak:u => { queue.push(u); next(); }, resume(){}, pause(){},
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
  const n3a = await page3.evaluate(() => doc.blocks.filter(b=>!b.composing).length), t3 = await page3.textContent('#toasts');
  ok('En obrir, document en blanc i avís per recuperar l\'últim', n3a === 0 && /Document nou en blanc/.test(t3) && /Recuperar l'últim/.test(t3), 'blocs: ' + n3a + ' ' + t3);
  await page3.click('#toasts button:has-text("Recuperar")'); await page3.waitForTimeout(200);
  const n3 = await page3.evaluate(() => doc.blocks.filter(b=>!b.composing).length);
  ok('«Recuperar l\'últim» torna el document anterior', n3 > 0, 'blocs: '+n3);
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

  await page.click('#bCredits');
  ok('La versió surt als crèdits', /versió 0\.11\.2/.test(await page.textContent('.overlay')));
  await page.click('.overlay .btn.primary');

  // ================= Esborrar (Retrocés i Supr) =================
  const pe = await ctx.newPage(); pe.on('pageerror', e => errors.push('esborrar ' + e));
  await pe.goto('file://' + APP); await pe.evaluate(async () => { localStorage.clear(); await caches.delete('pictoescriu-imatges-1'); }); await pe.reload(); await pe.waitForTimeout(500);
  await pe.click('#bNew'); await pe.click('.overlay .btn.primary'); await pe.waitForTimeout(100);   // sempre amb un document nou (una altra pàgina pot haver desat un esborrany)
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
  // Supr amb el cursor d'escriptura: esborra la paraula sencera de la dreta (acordat el 31/10/2026)
  await pe.evaluate(() => { commitEditor(true); S.selectedId = null; startCompose(doc.blocks.findIndex(b => b.text === 'nen')); });
  await pe.keyboard.press('Delete'); E = await eState();
  ok('ESBORRAR Supr esborra la paraula de la dreta, sense requadre', E.ed === 'compose' && E.selBox === 0 && E.words === 'la:1001', JSON.stringify(E));
  await pe.keyboard.type('gat ', {delay:20}); await eIdle(); E = await eState();
  ok('ESBORRAR Després es continua escrivint al mateix lloc', E.words === 'la:1001 gat:8001', JSON.stringify(E));
  // Text buidat amb doble clic: el pictograma es conserva (regla 1); sense pictograma, el requadre buit desapareix
  const gid = await pe.evaluate(() => doc.blocks.find(b => b.text === 'gat').id);
  await pe.dblclick(`.blk[data-id="${gid}"] .lbl`); await pe.keyboard.press('Control+A'); await pe.keyboard.press('Backspace'); await pe.keyboard.press('Backspace');
  E = await eState();
  ok('ESBORRAR Doble clic i text buidat: Retrocés no treu el pictograma', E.ed === 'edit' && E.words === 'la:1001 :8001', JSON.stringify(E));
  await pe.keyboard.type('GAT'); await pe.keyboard.press('Enter'); await pe.keyboard.press('Escape');
  await pe.evaluate(() => startCompose(doc.blocks.length)); await pe.keyboard.type('xyzzy ', {delay:20}); await eIdle();
  const xid = await pe.evaluate(() => doc.blocks.find(b => b.text === 'xyzzy').id);
  await pe.click(`.blk[data-id="${xid}"] .lbl`); await pe.waitForTimeout(150); await pe.dblclick(`.blk[data-id="${xid}"] .lbl`); await pe.keyboard.press('Control+A'); await pe.keyboard.press('Backspace'); await pe.keyboard.press('Backspace');
  E = await eState();
  ok('ESBORRAR Paraula sense pictograma buidada: el requadre buit desapareix', E.ed === 'compose' && E.selBox === 0 && E.words === 'la:1001 GAT:8001', JSON.stringify(E));
  // El panell de la dreta no s'obre mentre s'esborra; després es continua escrivint
  await pe.click('#bNew'); await pe.click('.overlay .btn.primary'); await pe.waitForTimeout(100);
  await pe.keyboard.type('la nena menja ', {delay:20}); await eIdle(); await pe.waitForTimeout(200);
  await pe.evaluate(() => { window.__panel = 0; new MutationObserver(() => { if(document.body.classList.contains('panel-open')) window.__panel++; }).observe(document.body, {attributes:true, attributeFilter:['class']}); });
  await pe.keyboard.press('Backspace'); await pe.keyboard.press('Backspace');
  E = await eState();
  ok('ESBORRAR Esborrant, el panell de la dreta no s\'obre ni hi ha cap paraula seleccionada', E.ed === 'edit' && !E.sel && E.selBox === 0 && /men:3001$/.test(E.words) && await pe.evaluate(() => window.__panel === 0 && document.querySelector('#panel').hidden), JSON.stringify(E));
  await pe.keyboard.type('ja una poma ', {delay:20}); await eIdle(); await pe.waitForTimeout(200);
  E = await eState();
  ok('ESBORRAR Després d\'esborrar, l\'espai acaba la paraula i es continua escrivint (es conserva el pictograma)', E.ed === 'compose' && E.words === 'la:1001 nena:2001 menja:3001 una:1002 poma:4001' && await pe.evaluate(() => window.__panel === 0), JSON.stringify(E));
  for(let i = 0; i < 12; i++) await pe.keyboard.press('Backspace');
  ok('ESBORRAR Esborrant moltes paraules seguides el panell continua tancat', await pe.evaluate(() => window.__panel === 0 && !document.body.classList.contains('panel-open')));
  // Pictogrames automàtics: totes les paraules menys les gramaticals
  await pe.click('#bNew'); await pe.click('.overlay .btn.primary'); await pe.waitForTimeout(100);
  await pe.keyboard.type('jo dic hola i sí, si vols. es diu i és ', {delay:20}); await eIdle(); await pe.waitForTimeout(300);
  const PW = await pe.evaluate(() => doc.blocks.filter(b => b.kind === 'word' && !b.composing).map(b => b.text + ':' + (b.picOff ? 'text' : (b.pictoId ? 'picto' : '?'))).join(' '));
  ok('PICTOS Pronoms, expressions i paraules amb contingut porten pictograma; articles, conjuncions i pronoms febles no', PW === 'jo:picto dic:? hola:picto i:text sí,:picto si:text vols.:? es:text diu:? i:text és:?', PW);
  const cats = await pe.evaluate(() => ['jo', 'hola', 'sí,'].map(t => doc.blocks.find(b => b.text === t).cat).join(','));
  ok('PICTOS Clau Fitzgerald: pronom groc, expressions roses', cats === 'persones,social,social', cats);
  // Femení → masculí: ARASAAC té els adjectius en masculí
  await pe.click('#bNew'); await pe.click('.overlay .btn.primary'); await pe.waitForTimeout(100);
  await pe.keyboard.type('poma verda pomes verdes groga nova roja ', {delay:20}); await eIdle(); await pe.waitForTimeout(300);
  const FM = await pe.evaluate(() => doc.blocks.filter(b => b.kind === 'word' && !b.composing).map(b => b.text + ':' + (b.picOff ? 'text' : b.pictoId || '?') + ':' + (b.cat || '')).join(' '));
  ok('PICTOS Femenins i plurals troben el pictograma en masculí (verda → verd)', /verda:4002:descriptius/.test(FM) && /verdes:4002/.test(FM) && /groga:4003/.test(FM) && /nova:4004/.test(FM) && /roja:4005/.test(FM), FM);
  ok('PICTOS El text escrit no canvia', await pe.evaluate(() => doc.blocks.filter(b => !b.composing).map(b => b.text).join(' ')) === 'poma verda pomes verdes groga nova roja');
  // Imatges recordades
  await pe.click('#bNew'); await pe.click('.overlay .btn.primary'); await pe.waitForTimeout(100);
  await pe.keyboard.type('xyzzy poma ', {delay:20}); await eIdle(); await pe.waitForTimeout(200);
  const blkId = t => pe.evaluate(t => doc.blocks.find(b => b.text === t && !b.composing).id, t);
  await pe.click(`.blk[data-id="${await blkId('xyzzy')}"] .lbl`);
  await pe.setInputFiles('#imgIn', path.join(FIX, '8001.png')); await pe.waitForFunction(() => doc.blocks.some(b => b.text === 'xyzzy' && b.own && b.own.src));
  await pe.click(`.blk[data-id="${await blkId('poma')}"] .lbl`); await pe.click('#bNext'); await pe.waitForTimeout(150);
  const memNote = await pe.evaluate(() => !document.querySelector('#pMem').hidden && document.querySelector('#pMem').textContent);
  ok('RECORDADES Avís al panell en triar un pictograma', /Imatge recordada per a «poma»/.test(memNote || ''), String(memNote));
  await pe.keyboard.press('Escape'); await pe.evaluate(() => startCompose(doc.blocks.length));
  await pe.keyboard.type('XYZZY poma ', {delay:20}); await eIdle(); await pe.waitForTimeout(300);
  let RM = await pe.evaluate(() => doc.blocks.filter(b => b.kind === 'word' && !b.composing).map(b => b.text + ':' + (b.own && b.own.src ? 'pròpia' : b.pictoId)).join(' '));
  ok('RECORDADES La paraula torna a sortir amb la imatge pròpia i el pictograma triat (també en majúscules)', RM === 'xyzzy:pròpia poma:4002 XYZZY:pròpia poma:4002', RM);
  await pe.click(`.blk[data-id="${await pe.evaluate(() => doc.blocks.filter(b => b.text === 'poma').pop().id)}"] .lbl`); await pe.click('#pMemForget'); await pe.keyboard.press('Escape');
  await pe.evaluate(() => startCompose(doc.blocks.length)); await pe.keyboard.type('poma ', {delay:20}); await eIdle(); await pe.waitForTimeout(300);
  RM = await pe.evaluate(() => doc.blocks.filter(b => b.text === 'poma').map(b => b.pictoId).join(','));
  ok('RECORDADES «Oblidar» torna a la cerca d\'ARASAAC (els documents no canvien)', RM === '4002,4002,4001', RM);
  await pe.click(`.blk[data-id="${await blkId('xyzzy')}"] .lbl`); await pe.click('#pMemList'); await pe.waitForSelector('#memOv');
  const cards = await pe.$$eval('#memOv .memcard b', x => x.map(e => e.textContent).join(','));
  const [dlm] = await Promise.all([pe.waitForEvent('download'), pe.click('#mdExport')]); const memFile = OUT + '/imatges.json'; await dlm.saveAs(memFile);
  const mj = JSON.parse(fs.readFileSync(memFile, 'utf8'));
  ok('RECORDADES Llista i fitxer per passar-les a un altre aparell', cards === 'xyzzy' && mj.kind === 'imatges' && mj.items.length === 1 && /^data:image\//.test(mj.items[0].own.src), cards + ' ' + mj.items.length);
  await pe.click('#mdClose');
  const pm = await ctx.newPage(); await pm.goto('file://' + APP); await pm.evaluate(async () => { localStorage.clear(); await caches.delete('pictoescriu-imatges-1'); }); await pm.reload(); await pm.waitForTimeout(2600);
  await pm.keyboard.type('poma ', {delay:20}); await pm.waitForTimeout(800);
  await pm.click(`.blk[data-id="${await pm.evaluate(() => doc.blocks.find(b => b.text === 'poma').id)}"] .lbl`); await pm.click('#pMemList');
  await pm.setInputFiles('#memIn', memFile); await pm.waitForFunction(() => MEM.map.size === 1); await pm.click('#mdClose'); await pm.keyboard.press('Escape');
  await pm.evaluate(() => startCompose(doc.blocks.length)); await pm.keyboard.type('xyzzy ', {delay:20}); await pm.waitForTimeout(300);
  ok('RECORDADES Obrir el fitxer en un altre aparell', await pm.evaluate(() => { const b = doc.blocks.find(x => x.text === 'xyzzy'); return !!(b && b.own && b.own.src); }));
  await pm.close();
  // Clau Fitzgerald i posició del pictograma
  await pe.click('#bNew'); await pe.click('.overlay .btn.primary'); await pe.waitForTimeout(100);
  await pe.keyboard.type('la nena menja ', {delay:20}); await eIdle(); await pe.waitForTimeout(200); await pe.keyboard.press('Escape');
  const fz = () => pe.evaluate(() => { const b = doc.blocks.find(x => x.text === 'nena'), cs = getComputedStyle(document.querySelector(`.blk[data-id="${b.id}"] .pic`)); return doc.settings.fitz + ':' + cs.borderTopColor + '/' + cs.backgroundColor; });
  const f1 = await fz(); await pe.selectOption('#sFitz', 'bg'); const f2 = await fz(); await pe.selectOption('#sFitz', 'off'); const f3 = await fz();
  ok('CLAU Marc de color, fons de color i sense clau canvien de debò', /^frame:rgb\(240, 124, 0\)\/rgb\(255, 255, 255\)$/.test(f1) && /^bg:rgb\(240, 124, 0\)\/rgb\(240, 124, 0\)$/.test(f2) && /^off:rgba\(0, 0, 0, 0\)\/rgb\(255, 255, 255\)$/.test(f3), [f1, f2, f3].join(' | '));
  await pe.keyboard.press('Control+z');
  ok('CLAU Es pot desfer', await pe.evaluate(() => doc.settings.fitz === 'bg' && document.querySelector('#sFitz').value === 'bg'));
  const geoPic = () => pe.evaluate(() => ['la', 'nena', 'menja'].map(t => { const el = document.querySelector(`.blk[data-id="${doc.blocks.find(x => x.text === t).id}"]`), l = el.querySelector('.lbl').getBoundingClientRect(), p = el.querySelector('.pic').getBoundingClientRect(); return {t, picAbove:p.bottom <= l.top + 0.5, picBelow:p.top >= l.bottom - 0.5, lblTop:Math.round(l.top)}; }));
  await pe.selectOption('#sPicPos', 'above'); await pe.waitForTimeout(150);
  let G = await geoPic();
  ok('PICTO A SOBRE El pictograma surt damunt de la paraula i la frase queda alineada', G[1].picAbove && G[2].picAbove && new Set(G.map(x => x.lblTop)).size === 1, JSON.stringify(G));
  const [dlA] = await Promise.all([pe.waitForEvent('download', {timeout:20000}), pe.click('#bPdf')]);
  await dlA.saveAs(OUT + '/picto-a-sobre.pdf');
  ok('PICTO A SOBRE El PDF es fa igual', fs.statSync(OUT + '/picto-a-sobre.pdf').size > 3000);
  await pe.click('#bNew'); await pe.click('.overlay .btn.primary'); await pe.waitForTimeout(100);
  ok('PICTO A SOBRE Es manté en fer un document nou', await pe.evaluate(() => doc.settings.picPos === 'above' && document.querySelector('#sPicPos').value === 'above'));
  await pe.selectOption('#sPicPos', 'below'); await pe.keyboard.type('la nena ', {delay:20}); await eIdle(); await pe.waitForTimeout(150);
  G = await pe.evaluate(() => { const el = document.querySelector(`.blk[data-id="${doc.blocks.find(x => x.text === 'nena').id}"]`); return el.querySelector('.pic').getBoundingClientRect().top >= el.querySelector('.lbl').getBoundingClientRect().bottom - 0.5; });
  ok('PICTO A SOTA Torna a la posició de sempre', G);
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

  // ================= Veus descarregables (Ona i Sharvard) =================
  // El motor real no s'executa a les proves: se'n serveix un de simulat i se'n comprova el circuit (descàrrega, empremta, memòria, lectura i ressaltat)
  const VF = path.join(FIX, 'veu'), vfile = n => fs.readFileSync(path.join(VF, n));
  const VMAP = {'ort.wasm.min.js':'ort.js', 'ort-wasm-simd.wasm':'fals.bin', 'piper_phonemize.js':'piper_phonemize.js', 'piper_phonemize.wasm':'fals.bin', 'piper_phonemize.data':'fals.bin',
    'ca_ES-upc_ona-medium.onnx':'fals.bin', 'ca_ES-upc_ona-medium.onnx.json':'ona.json', 'es_ES-sharvard-medium.onnx':'fals.bin', 'es_ES-sharvard-medium.onnx.json':'sharvard.json'};
  const VSHA = {'ort.js':'ort.js', 'ort-wasm-simd.wasm':'fals.bin', 'piper_phonemize.js':'piper_phonemize.js', 'piper_phonemize.wasm':'fals.bin', 'piper_phonemize.data':'fals.bin'};
  for(const k in VSHA) VSHA[k] = crypto.createHash('sha256').update(vfile(VSHA[k])).digest('base64');
  let tamper = false, pvOffline = false; const pvHits = [];
  await ctx.route(/cdn\.jsdelivr\.net|unpkg\.com|huggingface\.co/, route => {
    const u = route.request().url(); pvHits.push(u);
    if(pvOffline) return route.abort('internetdisconnected');
    const name = decodeURIComponent(u.split('/').pop()), f = VMAP[name];
    if(!f) return route.fulfill({status:404, body:''});
    let body = vfile(f); if(tamper && name === 'ort.wasm.min.js') body = Buffer.concat([body, Buffer.from('\n/* canviat */')]);
    return route.fulfill({status:200, headers:{'access-control-allow-origin':'*', 'content-type':'application/octet-stream'}, body});
  });
  const pp = await ctx.newPage(); pp.on('pageerror', e => errors.push('veu baixada ' + e));
  pp.on('console', m => { if(m.type()==='error' && !/Failed to load resource|ERR_INTERNET_DISCONNECTED/.test(m.text())) errors.push('veu baixada ' + m.text()); });
  await pp.goto('file://' + APP); await pp.evaluate(async () => { localStorage.clear(); await caches.delete('pictoescriu-veus-1'); }); await pp.reload(); await pp.waitForTimeout(500);
  const ppQuiet = () => pp.waitForFunction(() => !SP.reading && !SP.active && !PV.src, null, {timeout:15000});
  await pp.evaluate(() => { window.__ttsHide = 'ca'; loadVoices(); });
  await pp.keyboard.type('la nena menja una poma. el gat ', {delay:15}); await pp.waitForFunction(() => !doc.blocks.some(b => b.status === 'loading'));
  await pp.click('#bPlay'); await pp.waitForTimeout(300);
  let T = await pp.textContent('#toasts');
  ok('VEU BAIXADA Ordinador sense veu catalana: avís i botó «Baixar-la»', /no té veu en català/.test(T) && /Baixar-la/.test(T), T);
  await pp.click('#toasts button:has-text("Baixar-la")'); await pp.waitForSelector('[data-pvdl="ca"]');
  let V = await pp.evaluate(() => ({msg:document.querySelector('#vdMca').textContent, btn:document.querySelector('[data-pvdl="ca"]').textContent, focus:document.activeElement && document.activeElement.dataset.pvdl}));
  ok('VEU BAIXADA La finestra «Veu» ofereix Ona, amb la mida', /Baixa aquí sota la veu gratuïta Ona/.test(V.msg) && /Ona \(uns 93 MB\)/.test(V.btn) && V.focus === 'ca', JSON.stringify(V));
  tamper = true; await pp.click('[data-pvdl="ca"]'); await pp.waitForFunction(() => PV.st.ca === 'error', null, {timeout:15000});
  V = await pp.evaluate(() => ({ort:!!window.ort, msg:document.querySelector('.pvrow.dl').textContent}));
  ok('VEU BAIXADA Un fitxer modificat no s\'executa', !V.ort && /no era l'original/.test(V.msg), JSON.stringify(V));
  tamper = false; await pp.evaluate(sha => PV.ENGINE.forEach(f => { f.sha = sha[f.k]; }), VSHA);
  await pp.click('[data-pvdl="ca"]'); await pp.waitForFunction(() => PV.st.ca === 'ready', null, {timeout:15000}); await pp.waitForTimeout(150);
  V = await pp.evaluate(async () => ({ready:document.querySelector('.pvrow.ok') && document.querySelector('.pvrow.ok').textContent, opts:[...document.querySelectorAll('#vdVca option')].map(o => o.textContent),
    keys:(await (await caches.open('pictoescriu-veus-1')).keys()).length}));
  ok('VEU BAIXADA Ona baixada i guardada al navegador', /Veu Ona baixada/.test(V.ready) && /^Automàtica: Ona$/.test(V.opts[0]) && V.opts.includes('Ona · baixada · sense internet') && V.keys === 7, JSON.stringify(V));
  await pp.click('#vdClose');
  await pp.evaluate(() => { window.__tts.length = 0; window.__hl = []; new MutationObserver(() => { const ids = [...document.querySelectorAll('.blk.speaking')].map(e => e.dataset.id).join(','); if(ids && window.__hl[window.__hl.length - 1] !== ids) window.__hl.push(ids); })
    .observe(document.getElementById('stack'), {subtree:true, attributes:true, attributeFilter:['class']}); });
  await pp.click('#bPlay'); await pp.waitForFunction(() => SP.reading); await ppQuiet();
  V = await pp.evaluate(() => ({ph:window.__ph.join(' | '), runs:window.ort.__runs.length, paths:window.ort.__paths, sys:window.__tts.length, hl:window.__hl.map(ids => ids.split(',').map(id => find(id).text).join('+')).join(' ')}));
  ok('VEU BAIXADA ▶ Llegir amb Ona: frase a frase, sense veus del sistema', V.ph === 'ca:la nena menja una poma. | ca:el gat' && V.runs === 2 && V.sys === 0, JSON.stringify(V));
  ok('VEU BAIXADA Ressalta cada paraula en ordre', V.hl === 'la nena menja una poma. el gat', V.hl);
  ok('VEU BAIXADA El motor fa servir la còpia guardada', /^ort-wasm-simd\.wasm blob:/.test(V.paths), V.paths);
  // Sense internet: tornar a obrir l'aplicació
  pvOffline = true; const pvBefore = pvHits.length;
  await pp.reload(); await pp.waitForTimeout(600); await pp.evaluate(() => { window.__ttsHide = 'ca'; loadVoices(); });
  await pp.waitForFunction(() => PV.st.ca === 'ready');
  await pp.click('#toasts button:has-text("Recuperar")'); await pp.waitForTimeout(200);
  await pp.click('#bPlay'); await pp.waitForFunction(() => SP.reading); await ppQuiet();
  V = await pp.evaluate(() => ({ph:(window.__ph || []).length, runs:window.ort ? window.ort.__runs.length : 0}));
  ok('VEU BAIXADA Sense internet funciona igual en tornar a obrir', V.ph === 2 && V.runs === 2 && pvHits.length === pvBefore, JSON.stringify(V) + " peticions " + (pvHits.length - pvBefore));
  // Mode alumne: nom de les lletres amb Ona
  await pp.click('#bStudent'); await pp.click('#bVoice'); await pp.click('#vdProf [data-v="all"]'); await pp.click('#vdClose');
  await pp.evaluate(() => { window.__ph.length = 0; startCompose(doc.blocks.length); });
  await pp.keyboard.type('gat ', {delay:250}); await ppQuiet();
  V = await pp.evaluate(() => window.__ph.join(' | '));
  ok('VEU BAIXADA Mode alumne: lletres i paraula amb Ona', V === 'ca:ge | ca:a | ca:te | ca:gat', V);
  // Castellà: Sharvard, de dona i d'home
  pvOffline = false;
  await pp.keyboard.press('Escape'); await pp.click('#bVoice');
  await pp.click('[data-pvdl="es"]'); await pp.waitForFunction(() => PV.st.es === 'ready', null, {timeout:15000}); await pp.waitForTimeout(150);
  V = await pp.evaluate(() => [...document.querySelectorAll('#vdVes option')].map(o => o.textContent));
  ok('VEU BAIXADA Sharvard de dona i d\'home a la llista castellana', V.includes('Sharvard (dona) · baixada · sense internet') && V.includes('Sharvard (home) · baixada · sense internet'), V.join(' / '));
  await pp.selectOption('#vdVes', 'piper:es:1'); await pp.click('#vdClose');
  await pp.evaluate(() => { window.ort.__runs.length = 0; doc.blocks.filter(b => b.kind === 'word').forEach(b => { b.lang = 'es'; }); });
  await pp.click('#bPlay'); await pp.waitForFunction(() => SP.reading); await ppQuiet();
  V = await pp.evaluate(() => window.ort.__runs.map(r => r.sid).join(','));
  ok('VEU BAIXADA Sharvard (home) fa servir la veu masculina', /^0(,0)*$/.test(V), V);
  // Esborrar Ona: el motor es conserva perquè el fa servir Sharvard
  await pp.click('#bVoice'); await pp.click('[data-pvrm="ca"]'); await pp.waitForFunction(() => PV.st.ca === 'none');
  V = await pp.evaluate(async () => (await (await caches.open('pictoescriu-veus-1')).keys()).map(r => r.url.split('/').pop()).sort().join(','));
  ok('VEU BAIXADA Esborrar Ona treu només la veu', !/ona/.test(V) && /ort\.js/.test(V) && /sharvard/.test(V), V);
  await pp.click('#vdClose'); await pp.click('#bCredits');
  ok('VEU BAIXADA Crèdits de les veus', /Ona \(Universitat Politècnica de Catalunya/.test(await pp.textContent('.overlay')));
  await pp.click('.overlay .btn.primary');
  await pp.close();

  // ================= Sons de les lletres, «Lletrejar» i bloqueig de pantalla =================
  const ps = await ctx.newPage(); ps.on('pageerror', e => errors.push('sons ' + e));
  ps.on('console', m => { if(m.type()==='error' && !/Failed to load resource/.test(m.text())) errors.push('sons ' + m.text()); });
  await ps.goto('file://' + APP); await ps.evaluate(async () => { localStorage.clear(); await caches.delete('pictoescriu-sons-1'); }); await ps.reload(); await ps.waitForTimeout(500);
  const psQuiet = () => ps.waitForFunction(() => !SP.reading && !SP.active && !SND.src && !speechSynthesis.speaking, null, {timeout:15000});
  const UN = await ps.evaluate(() => { const f = (w, l) => spellUnits(w, l).filter(u => u.letter).map(u => u.txt + '=' + (u.snd || '·')).join(' ');
    return [f('guerra','ca'), f('quilo','ca'), f('caixa','ca'), f('hola','ca'), f('col·legi','ca'), f('cotxe','ca'), f('cinc','ca'), f('rosa','ca'), f('platja','ca'), f("l'aigua",'ca'),
      f('chico','es'), f('guerra','es'), f('cielo','es'), f('jamón','es'), f('llave','es'), f('hoy','es'), f('niño','es')]; });
  const UNX = ['gu=g e=e rr=rr a=a', 'qu=k i=i l=l o=o', 'c=k a=a ix=sh a=a', 'h=· o=o l=l a=a', 'c=k o=o l·l=l e=e g=zh i=i', 'c=k o=o tx=tsh e=e', 'c=s i=i n=n c=k', 'r=rr o=o s=s a=a', 'p=p l=l a=a tj=dzh a=a', 'l=l a=a i=i g=g u=u a=a',
    'ch=ch i=i c=k o=o', 'gu=g e=e rr=rr a=a', 'c=th i=i e=e l=l o=o', 'j=x a=a m=m ó=o n=n', 'll=y a=a v=b e=e', 'h=· o=o y=i', 'n=n i=i ñ=ny o=o'];
  const unBad = UN.map((x, i) => x === UNX[i] ? '' : x + ' ≠ ' + UNX[i]).filter(Boolean);
  ok('SONS Taula lletra → so (dígrafs, c/g suaus, h muda, r inicial)', unBad.length === 0, unBad.join(' | '));
  // Gravar amb el micròfon
  await ps.click('#bVoice'); await ps.click('#vdSnd'); await ps.click('[data-rec="m"]');
  await ps.waitForFunction(() => SND.have.ca.has('m'), null, {timeout:10000}); await ps.waitForTimeout(200);
  let SV = await ps.evaluate(() => ({row:document.querySelector('[data-rec="m"]').closest('.sndrow').className, btn:document.querySelector('[data-rec="m"]').textContent}));
  ok('SONS Gravar un so amb el micròfon', /has/.test(SV.row) && /Tornar a gravar/.test(SV.btn), JSON.stringify(SV));
  // Obrir un fitxer de sons
  const wav = (hz, ms) => { const sr = 16000, pad = Math.round(sr * 0.15), n = Math.round(sr * ms / 1000), tot = n + 2 * pad, b = Buffer.alloc(44 + tot * 2);
    b.write('RIFF', 0); b.writeUInt32LE(36 + tot * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(tot * 2, 40);
    for(let i = 0; i < n; i++) b.writeInt16LE(Math.round(Math.sin(2 * Math.PI * hz * i / sr) * 12000), 44 + (pad + i) * 2);
    return 'data:audio/wav;base64,' + b.toString('base64'); };
  const sndFile = OUT + '/sons-prova.json';
  fs.writeFileSync(sndFile, JSON.stringify({app:'PictoEscriu', kind:'sons', format:1, sons:{ca:{a:wav(440, 200), r:wav(330, 200), zz:wav(200, 100)}, es:{ny:wav(500, 200)}}}));
  await ps.setInputFiles('#sndIn', sndFile); await ps.waitForFunction(() => SND.have.ca.has('a') && SND.have.ca.has('r') && SND.have.es.has('ny'), null, {timeout:8000});
  SV = await ps.evaluate(() => ({msg:document.querySelector('#sdMsg').textContent, ca:[...SND.have.ca].sort().join(','), es:[...SND.have.es].join(',')}));
  ok('SONS Obrir un fitxer de sons (i ignorar els desconeguts)', /S'han afegit 3 sons/.test(SV.msg) && SV.ca === 'a,m,r' && SV.es === 'ny', JSON.stringify(SV));
  const [dls] = await Promise.all([ps.waitForEvent('download'), ps.click('#sdExport')]);
  const sndOut = OUT + '/sons-desats.json'; await dls.saveAs(sndOut);
  const sj = JSON.parse(fs.readFileSync(sndOut, 'utf8'));
  ok('SONS Desar els sons en un fitxer per a un altre ordinador', dls.suggestedFilename() === 'sons-pictoescriu.json' && /^data:audio\//.test(sj.sons.ca.m) && /^data:audio\/wav/.test(sj.sons.ca.a) && !!sj.sons.es.ny, Object.keys(sj.sons.ca).join(','));
  await ps.click('#sdClose'); await ps.click('#vdClose');
  // «Lletrejar» des del panell
  await ps.evaluate(() => startCompose(doc.blocks.length)); await ps.keyboard.type('mare ', {delay:20}); await ps.waitForTimeout(300);
  await ps.evaluate(() => { window.__played = []; const o = sndPlay; window.sndPlay = (l, k) => { window.__played.push(k); return o(l, k); };
    window.__marks = []; new MutationObserver(() => { const m = document.querySelector('.lbl .spell-on'); if(m && window.__marks[window.__marks.length - 1] !== m.textContent) window.__marks.push(m.textContent); })
      .observe(document.getElementById('stack'), {subtree:true, childList:true, characterData:true}); window.__tts.length = 0; });
  const mareId = await ps.evaluate(() => doc.blocks.find(b => b.text === 'mare').id);
  await ps.click(`.blk[data-id="${mareId}"] .lbl`); await ps.click('#pSpell'); await ps.waitForFunction(() => SP.reading); await psQuiet();
  SV = await ps.evaluate(() => ({played:window.__played.join(','), marks:window.__marks.join(','), tts:window.__tts.map(x => x.text).join('|'), lbl:document.querySelector('.lbl .spell-on') ? 'queda' : 'net', text:doc.blocks.find(b => b.text === 'mare') ? 'mare' : '?'}));
  ok('SONS Lletrejar: cada lletra amb el seu so i marcada, i després la paraula', SV.played === 'm,a,r' && SV.marks === 'm,a,r,e' && SV.tts === 'e|mare' && SV.lbl === 'net' && SV.text === 'mare', JSON.stringify(SV));
  // Mode alumne: so de la lletra en pitjar-la, i tocar una paraula per lletrejar-la
  await ps.keyboard.press('Escape'); await ps.click('#bVoice'); await ps.click('#vdStudent'); await ps.click('#vdLetters'); await ps.click('#vdLK [data-v="sound"]'); await ps.click('#vdTK [data-v="spell"]'); await ps.click('#vdClose');
  await ps.evaluate(() => { window.__played.length = 0; window.__tts.length = 0; startCompose(doc.blocks.length); });
  await ps.keyboard.type('ma', {delay:300}); await psQuiet();
  SV = await ps.evaluate(() => window.__played.join(','));
  ok('SONS Mode alumne: el so gravat de cada lletra en pitjar-la', SV === 'm,a', SV);
  await ps.keyboard.press('Escape'); await ps.evaluate(() => { window.__played.length = 0; });
  await ps.click(`.blk[data-id="${mareId}"] .lbl`); await ps.waitForFunction(() => SP.reading); await psQuiet();
  SV = await ps.evaluate(() => window.__played.join(','));
  ok('SONS Mode alumne: tocar una paraula la lletreja', SV === 'm,a,r', SV);
  // Bloqueig de pantalla
  await ps.keyboard.press('Escape'); await ps.click('#bLock'); await ps.waitForTimeout(150);
  SV = await ps.evaluate(() => ({locked:document.body.classList.contains('locked'), bar:getComputedStyle(document.querySelector('.topbar')).display, lockbar:!document.querySelector('#lockBar').hidden, ls:localStorage.getItem('pictoescriu.locked'), ed:S.editor && S.editor.mode}));
  ok('BLOQUEIG Amaga la barra i deixa escriure', SV.locked && SV.bar === 'none' && SV.lockbar && SV.ls === 'true' && SV.ed === 'compose', JSON.stringify(SV));
  const noDl = ps.waitForEvent('download', {timeout:800}).then(() => true, () => false);
  await ps.keyboard.press('Control+s');
  ok('BLOQUEIG Les dreceres de la barra no funcionen (Ctrl+S)', !(await noDl));
  await ps.click(`.blk[data-id="${mareId}"] .lbl`); await ps.waitForTimeout(150);
  ok('BLOQUEIG El panell de la paraula no surt', await ps.evaluate(() => getComputedStyle(document.querySelector('.panel')).display === 'none'));
  for(let i = 0; i < 3; i++) await ps.click('#bUnlock');
  const dots = await ps.textContent('#lockDots');
  await ps.waitForTimeout(1900);
  SV = await ps.evaluate(() => ({locked:document.body.classList.contains('locked'), dots:document.querySelector('#lockDots').textContent}));
  ok('BLOQUEIG Tres tocs només mostren el compte, i es reinicia', dots === '●●●○○○○' && SV.locked && SV.dots === '', dots + ' ' + JSON.stringify(SV));
  await ps.reload(); await ps.waitForTimeout(700);
  ok('BLOQUEIG Continua bloquejat en tornar a obrir', await ps.evaluate(() => document.body.classList.contains('locked') && !document.querySelector('#lockBar').hidden && getComputedStyle(document.querySelector('.topbar')).display === 'none'));
  for(let i = 0; i < 7; i++) await ps.click('#bUnlock');
  SV = await ps.evaluate(() => ({locked:document.body.classList.contains('locked'), bar:getComputedStyle(document.querySelector('.topbar')).display, ls:localStorage.getItem('pictoescriu.locked')}));
  ok('BLOQUEIG Set tocs seguits al cadenat el desbloquegen', !SV.locked && SV.bar !== 'none' && SV.ls === 'false', JSON.stringify(SV));
  await ps.close();

  // ================= Colors d'AREMI, logo i pantalla d'inici =================
  const pc = await ctx.newPage(); pc.on('pageerror', e => errors.push('colors ' + e));
  await pc.goto('file://' + APP); await pc.waitForTimeout(300);
  let C = await pc.evaluate(() => { const sp = document.querySelector('#splash'); return {on:!!sp && !sp.classList.contains('out') && getComputedStyle(sp).display !== 'none', txt:sp ? sp.textContent : '', logo:!!(sp && sp.querySelector('circle[fill="#EB6B24"]'))}; });
  ok('COLORS Pantalla d\'inici amb el logo, el nom i la versió', C.on && /PictoEscriu/.test(C.txt) && /Escriure i llegir amb pictogrames/.test(C.txt) && /versió 0\.11\.2/.test(C.txt) && C.logo, JSON.stringify(C));
  await pc.waitForTimeout(2700);
  C = await pc.evaluate(() => ({splash:!!document.querySelector('#splash'), bar:getComputedStyle(document.querySelector('.topbar .row')).backgroundColor, play:getComputedStyle(document.querySelector('#bPlay')).backgroundColor,
    pdf:getComputedStyle(document.querySelector('#bPdf')).backgroundColor, logo:!!document.querySelector('.brand circle[fill="#EB6B24"]')}));
  ok('COLORS La pantalla d\'inici desapareix sola', !C.splash);
  ok('COLORS Barra blava d\'AREMI, botons importants taronja i logo nou', C.bar === 'rgb(36, 56, 106)' && C.play === 'rgb(235, 107, 36)' && C.pdf === 'rgb(235, 107, 36)' && C.logo, JSON.stringify(C));
  await pc.reload(); await pc.waitForTimeout(300); await pc.keyboard.press('h');
  ok('COLORS Una tecla treu la pantalla d\'inici i la lletra s\'escriu', await pc.evaluate(() => { const sp = document.querySelector('#splash'); return (!sp || sp.classList.contains('out')) && edInput.value === 'h'; }));
  await pc.close();

  // ================= Mòbils i tauletes (Android i iPhone simulats amb Chromium) =================
  const tbOver = pg => pg.evaluate(() => [...document.querySelectorAll('.topbar .btn, .topbar select, .topbar input, .topbar .scope')]
    .filter(e => e.offsetParent && e.getBoundingClientRect().right > innerWidth + 1).map(e => e.id || e.className.split(' ')[0]).join(','));
  for(const [name, dev] of [['Android', devices['Pixel 7']], ['iPhone', devices['iPhone 13']]]){
    const mc = await browser.newContext({...dev});
    await mc.route(/arasaac\.org/, r => r.fulfill({status:404, headers:{'access-control-allow-origin':'*'}, body:'{}'}));
    const mp = await mc.newPage(); mp.on('pageerror', e => errors.push(name + ' ' + e));
    await mp.goto('file://' + APP); await mp.waitForTimeout(2700);
    let M = await mp.evaluate(() => ({row2:getComputedStyle(document.querySelector('.topbar .row + .row')).display, tools:!!document.querySelector('#bTools').offsetParent, bar:document.querySelector('#topbar').offsetHeight, vp:document.querySelector('meta[name=viewport]').content}));
    const o1 = await tbOver(mp);
    ok(`MÒBIL ${name}: cap botó fora de la pantalla i la barra de format amagada`, o1 === '' && M.row2 === 'none' && M.tools && M.bar < 160, o1 + ' ' + JSON.stringify(M));
    await mp.tap('#bTools'); await mp.waitForTimeout(150);
    const o2 = await tbOver(mp), row2 = await mp.evaluate(() => getComputedStyle(document.querySelector('.topbar .row + .row')).display);
    ok(`MÒBIL ${name}: el botó «Format» mostra les eines, totes dins la pantalla`, row2 !== 'none' && o2 === '', o2 + ' ' + row2);
    await mp.tap('#bTools');
    const box = await (await mp.$('.page')).boundingBox(); await mp.tap('.page', {position:{x:box.width / 2, y:box.height * 0.45}});
    await mp.keyboard.type('hola gat ', {delay:20}); await mp.waitForTimeout(300);
    ok(`MÒBIL ${name}: tocar el full i escriure`, (await mp.evaluate(() => doc.blocks.filter(b => !b.composing).map(b => b.text).join(' '))) === 'hola gat');
    if(name === 'iPhone') ok('MÒBIL iPhone: sense zoom automàtic en escriure', /maximum-scale=1/.test(M.vp), M.vp);
    await mc.close();
  }
  for(const w of [600, 768]){
    const tp = await browser.newPage({viewport:{width:w, height:900}}); await tp.goto('file://' + APP); await tp.waitForTimeout(400);
    const o = await tbOver(tp); ok(`TAULETA ${w} px: cap botó fora de la pantalla`, o === '', o); await tp.close();
  }

  // ================= Teclat virtual =================
  const pk = await ctx.newPage(); pk.on('pageerror', e => errors.push('teclat ' + e));
  await pk.goto('file://' + APP); await pk.evaluate(async () => { localStorage.clear(); await caches.delete('pictoescriu-imatges-1'); }); await pk.reload(); await pk.waitForTimeout(2600);
  const vk = async (...keys) => { for(const k of keys) await pk.click(`.vk[data-k="${k}"]`); };
  const kwords = () => pk.evaluate(() => doc.blocks.filter(b => !b.composing).map(b => b.kind === 'br' ? '¶' : b.text).join(' ') + ' [' + edInput.value + ']');
  await pk.click('#bKbd'); await pk.waitForTimeout(300);
  let KV = await pk.evaluate(() => ({on:!document.querySelector('#vkb').hidden && document.body.classList.contains('kbd-on'), im:edInput.inputMode, ws:document.querySelector('#ws').getBoundingClientRect().bottom, kb:document.querySelector('#vkb').getBoundingClientRect().top, keys:document.querySelectorAll('.vk').length, font:getComputedStyle(document.querySelector('.vk[data-k="q"]')).fontFamily + ' ' + getComputedStyle(document.querySelector('.vk[data-k="q"]')).fontWeight, rad:getComputedStyle(document.querySelector('.vk[data-k="q"]')).borderTopLeftRadius}));
  ok('TECLAT Es mostra a baix, el document queda a sobre sense tapar-lo i sense el teclat del sistema', KV.on && KV.im === 'none' && KV.ws <= KV.kb + 1 && KV.keys >= 45, JSON.stringify(KV));
  ok('TECLAT Tecles en Arial negreta i cantonades arrodonides', /Arial/.test(KV.font) && /700/.test(KV.font) && /2\.6|2\.7/.test(KV.rad), KV.font + ' ' + KV.rad);
  await vk('h', 'o', 'l', 'a', ' ', 'Shift', 'm', 'a', ' ', 'Caps', 'g', 'a', 't', 'Caps', ' ', '1', '2', ' ');
  ok('TECLAT Lletres, espai, Majúscula (una lletra), Bloq Maj i números', (await kwords()) === 'hola Ma GAT 12 []', await kwords());
  await vk('Acc', 'à', 'Acc', 'p', 'Backspace', 'Backspace', 'Enter', 'p', 'a', '.');
  ok('TECLAT Accents, Esborrar, Retorn i punt', (await kwords()) === 'hola Ma GAT 12 ¶ pa. []', await kwords());
  await vk('Backspace');
  ok('TECLAT Esborrar també entra a la paraula anterior', (await kwords()).endsWith('[pa]') || (await kwords()).endsWith('pa []'), await kwords());
  const uOf = () => pk.evaluate(() => parseFloat(getComputedStyle(document.querySelector('#vkb')).getPropertyValue('--u')));
  await pk.click('#vkSize [data-v="s"]'); const uS = await uOf(); await pk.click('#vkSize [data-v="l"]'); const uL = await uOf(); await pk.click('#vkSize [data-v="m"]'); const uM = await uOf();
  ok('TECLAT Mides Petita, Mitjana i Gran', uS < uM && uM <= uL && Math.round(uS) === 57, [uS, uM, uL].join(' < '));
  const hb = await (await pk.$('#vkHr')).boundingBox(); await pk.mouse.move(hb.x + 10, hb.y + 10); await pk.mouse.down(); await pk.mouse.move(hb.x + 10, hb.y - 60, {steps:5}); await pk.mouse.up();
  const uD = await uOf();
  ok('TECLAT Es pot fer més gran estirant la cantonada', uD > uM, uM + ' → ' + uD);
  await pk.click('#vkLock');
  KV = await pk.evaluate(() => ({h:getComputedStyle(document.querySelector('#vkHr')).display, sz:getComputedStyle(document.querySelector('#vkSize')).display, st:JSON.parse(localStorage.getItem('pictoescriu.kbd'))}));
  ok('TECLAT El cadenat fixa la mida (no es pot estirar ni canviar)', KV.h === 'none' && KV.sz === 'none' && KV.st.locked && KV.st.on, JSON.stringify(KV));
  await pk.reload(); await pk.waitForTimeout(2800);
  ok('TECLAT Es recorda obert, amb la mida fixada', await pk.evaluate(() => !document.querySelector('#vkb').hidden && document.querySelector('#vkb').classList.contains('locked')));
  await pk.click('#hName'); await vk('Shift', 'p', 'a', 'u');
  ok('TECLAT També escriu al camp NOM', (await pk.inputValue('#hName')) === 'Pau', await pk.inputValue('#hName'));
  await pk.click('#vkLock'); await pk.click('#vkClose');
  ok('TECLAT Es pot amagar', await pk.evaluate(() => document.querySelector('#vkb').hidden && !document.body.classList.contains('kbd-on') && edInput.inputMode === ''));
  await pk.close();

  // ================= Teclat amb predicció =================
  const tp = await ctx.newPage(); tp.on('pageerror', e => errors.push('predicció ' + e));
  await tp.goto('file://' + APP); await tp.evaluate(async () => { localStorage.clear(); await caches.delete('pictoescriu-imatges-1'); }); await tp.reload(); await tp.waitForTimeout(2600);
  const tpk = async (...keys) => { for(const k of keys) await tp.click(`.vk[data-k="${k}"]`); };
  const tpw = () => tp.evaluate(() => doc.blocks.filter(b => !b.composing).map(b => b.kind === 'br' ? '¶' : b.text).join(' ') + ' [' + edInput.value + ']');
  const tpreds = () => tp.evaluate(() => [...document.querySelectorAll('.vkpred')].map(b => b.textContent));
  await tp.click('#bKbd'); await tp.waitForTimeout(200); await tp.click('#vkType [data-v="pred"]'); await tp.waitForTimeout(200);
  let TPV = await tp.evaluate(() => ({pred:document.querySelector('#vkb').classList.contains('pred'), boxes:document.querySelectorAll('.vkpred').length, nums:!!document.querySelector('.vk[data-k="1"]'), q:!!document.querySelector('.vk[data-k="q"]'), delw:!!document.querySelector('.vk[data-k="DelWord"]'), read:!!document.querySelector('.vk[data-k="Read"]'), bg:getComputedStyle(document.querySelector('#vkb')).backgroundColor, ws:document.querySelector('#ws').getBoundingClientRect().bottom, kb:document.querySelector('#vkb').getBoundingClientRect().top}));
  ok('PREDICCIÓ QWERTY amb 3 caselles, sense fila de números, Esborrar paraula i Llegir', TPV.pred && TPV.boxes === 3 && !TPV.nums && TPV.q && TPV.delw && TPV.read && TPV.ws <= TPV.kb + 1, JSON.stringify(TPV));
  ok('PREDICCIÓ Colors d\'AREMI (fons blau)', TPV.bg === 'rgb(36, 56, 106)', TPV.bg);
  await tpk('p', 'o');
  let TPL = await tpreds();
  ok('PREDICCIÓ «po» proposa paraules que comencen per «po», en minúscules', TPL.length === 3 && TPL.every(w => w.startsWith('po')) && TPL.every(w => w === w.toLowerCase()), TPL.join(','));
  // Triar una predicció: posa la paraula sencera i un espai, i el pictograma
  await tpk('m'); await tp.click('.vkpred:text-is("poma")'); await tp.waitForTimeout(900);
  ok('PREDICCIÓ Triar una casella escriu la paraula i un espai, amb pictograma', (await tpw()) === 'poma []' && await tp.evaluate(() => doc.blocks.find(b => b.text === 'poma').pictoId === 4001), await tpw());
  // La paraula escrita s'aprèn i surt primer
  await tpk('p', 'o'); TPL = await tpreds();
  ok('PREDICCIÓ Les paraules ja escrites surten primer', TPL[0] === 'poma', TPL.join(','));
  await tpk('Caps'); TPL = await tpreds();
  ok('PREDICCIÓ Amb Bloq Maj, les prediccions en majúscules', TPL[0] === 'POMA' && TPL.every(w => w === w.toUpperCase()), TPL.join(','));
  await tp.click('.vkpred[data-p="0"]'); await tpk('Caps');
  ok('PREDICCIÓ I s\'escriuen en majúscules', (await tpw()) === 'poma POMA []', await tpw());
  await tpk('Shift', 'p', 'o'); TPL = await tpreds();
  ok('PREDICCIÓ Amb Majúscula, només la primera lletra', TPL[0] === 'Poma' && (await tpw()).endsWith('[Po]'), TPL.join(',') + ' ' + await tpw());
  await tpk('DelWord');
  ok('PREDICCIÓ Esborrar paraula esborra la que s\'escriu', (await tpw()) === 'poma POMA []', await tpw());
  await tpk('DelWord');
  ok('PREDICCIÓ Esborrar paraula esborra l\'anterior sencera', (await tpw()) === 'poma []', await tpw());
  await tpk('Num');
  ok('PREDICCIÓ La tecla 123 mostra els números', await tp.evaluate(() => !!document.querySelector('.vk[data-k="1"]') && !document.querySelector('.vk[data-k="q"]')));
  await tpk('Num');
  await tp.evaluate(() => { window.__tts.length = 0; }); await tpk('Read'); await tp.waitForTimeout(400);
  ok('PREDICCIÓ Llegir llegeix el text', await tp.evaluate(() => window.__tts.some(u => /poma/i.test(u.text))), JSON.stringify(await tp.evaluate(() => window.__tts.map(u => u.text))));
  await tp.waitForTimeout(400);
  await tp.click('#vkPics'); await tpk('p', 'o'); await tp.waitForTimeout(800);
  TPV = await tp.evaluate(() => { const b = document.querySelector('.vkpred'); return {w:b.textContent, img:b.querySelector('img') && b.querySelector('img').src}; });
  ok('PREDICCIÓ Opció de pictogrames a les caselles', TPV.w === 'poma' && /4001/.test(TPV.img || ''), JSON.stringify(TPV));
  await tp.reload(); await tp.waitForTimeout(2600);
  ok('PREDICCIÓ Recorda el tipus de teclat i les paraules apreses', await tp.evaluate(() => KB.st.type === 'pred' && KB.st.predPics && (KB.learn.ca.poma || 0) >= 1));
  await tp.click('#vkLock');
  ok('PREDICCIÓ Amb el cadenat, el configurador s\'amaga', await tp.evaluate(() => getComputedStyle(document.querySelector('#vkType')).display === 'none' && getComputedStyle(document.querySelector('#vkPics')).display === 'none'));
  await tp.close();

  // ================= Portàtil de 1366×768: barra de dalt quieta i teclat Gran més ample =================
  const lp = await browser.newPage({viewport:{width:1366, height:768}}); lp.on('pageerror', e => errors.push('portàtil ' + e));
  await lp.route(/api\.arasaac\.org/, async r => { await new Promise(z => setTimeout(z, 250)); r.fulfill({status:404, body:'[]'}); });
  await lp.goto('file://' + APP); await lp.evaluate(() => localStorage.clear()); await lp.reload(); await lp.waitForTimeout(2600);
  await lp.click('#bKbd'); await lp.click('#vkType [data-v="pred"]');
  const barPos = () => lp.evaluate(() => ['#bPdf', '#bPrint', '#sLang'].map(q => { const r = document.querySelector(q).getBoundingClientRect(); return Math.round(r.left) + ',' + Math.round(r.top); }).join(' ') + ' h' + document.querySelector('#topbar').offsetHeight);
  const bp0 = await barPos(); let moved = '';
  for(const k of ['l', 'a', ' ', 'n', 'e', 'n', 'a', ' ']){ await lp.click(`.vk[data-k="${k}"]`); for(let i = 0; i < 3; i++){ await lp.waitForTimeout(90); const b = await barPos(); if(b !== bp0) moved = b; } }
  ok('PORTÀTIL La barra de dalt no es mou mentre s\'escriu (avís «Cercant…»)', !moved, bp0 + ' → ' + moved);
  const kbW = () => lp.evaluate(() => Math.round(document.querySelector('#vkb').getBoundingClientRect().width));
  await lp.click('#vkSize [data-v="m"]'); const wM = await kbW(); await lp.click('#vkSize [data-v="l"]'); const wL = await kbW();
  const fitsL = await lp.evaluate(() => { const r = document.querySelector('#vkb').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.top > document.querySelector('#topbar').offsetHeight; });
  ok('PORTÀTIL «Gran» és més ample que «Mitjana» i ocupa gairebé tota l\'amplada', wL > wM + 100 && wL > 1366 * .9 && fitsL, wM + ' → ' + wL);
  await lp.close();

  // ================= Paraules llargues amb lletra gran: no es parteixen =================
  const wp = await ctx.newPage(); wp.on('pageerror', e => errors.push('paraula llarga ' + e));
  await wp.goto('file://' + APP); await wp.evaluate(() => localStorage.clear()); await wp.reload(); await wp.waitForTimeout(2600);
  await wp.click('.flow'); await wp.keyboard.type('GELAT CARAMEL XOCOLATA ', {delay:20}); await wp.keyboard.press('Escape'); await wp.waitForTimeout(600);
  await wp.evaluate(() => { S.selectedId = null; setFmt('size', 48); }); await wp.waitForTimeout(400);
  const WL = await wp.evaluate(() => [...document.querySelectorAll('.blk')].filter(e => /^(GELAT|CARAMEL|XOCOLATA)$/.test(e.querySelector('.lbl').textContent)).map(e => { const l = e.querySelector('.lbl'), lh = parseFloat(getComputedStyle(l).lineHeight) || parseFloat(getComputedStyle(l).fontSize) * 1.2; return {t:l.textContent, lines:Math.round(l.getBoundingClientRect().height / lh), fits:l.scrollWidth <= e.clientWidth + 1, pic:Math.round(e.querySelector('.pic').getBoundingClientRect().top)}; }));
  ok('PARAULA Una paraula llarga amb lletra gran no es parteix en dues línies', WL.length === 3 && WL.every(w => w.lines === 1 && w.fits), JSON.stringify(WL));
  ok('PARAULA I els pictogrames queden alineats', new Set(WL.filter(w => w.t !== 'XOCOLATA').map(w => w.pic)).size === 1, JSON.stringify(WL));
  await wp.close();

  ok('Sense errors de JavaScript', errors.length===0, errors.slice(0,3).join(' | '));

  await browser.close();
  console.log(fails ? `\n${fails} prova(es) fallida(es)` : '\nTotes les proves superades');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('CRASH', e); process.exit(1); });
