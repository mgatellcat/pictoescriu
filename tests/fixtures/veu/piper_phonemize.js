// Convertidor simulat per a les proves (no és eSpeak NG): cada lletra és un so i l'espai és el 3
window.createPiperPhonemize = async function(opts){
  var w = await fetch(opts.locateFile('piper_phonemize.wasm')), d = await fetch(opts.locateFile('piper_phonemize.data'));
  if(!w.ok || !d.ok) throw new Error('falten fitxers');
  window.__ph = window.__ph || [];
  return {callMain: function(args){
    var lang = args[args.indexOf('-l') + 1], text = JSON.parse(args[args.indexOf('--input') + 1])[0].text;
    window.__ph.push(lang + ':' + text);
    var ids = [1, 0];
    for(var ch of text){ ids.push(ch === ' ' ? 3 : 20 + (ch.codePointAt(0) % 50), 0); }
    ids.push(2);
    opts.print(JSON.stringify({phoneme_ids: ids}));
  }};
};
