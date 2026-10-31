#!/usr/bin/env python3
"""Construeix PictoEscriu en un sol fitxer HTML autonom.

Entrada:  src/app.html (codi de l'aplicacio amb tres marcadors)
          assets/icons.json, assets/fonts.json, vendor/jspdf.umd.min.js
Sortida:  docs/index.html (l'aplicacio que obre la mestra; GitHub Pages la publica)

Us:  python3 scripts/build.py
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

src = (ROOT / "src" / "app.html").read_text(encoding="utf-8")
icons = (ROOT / "assets" / "icons.json").read_text(encoding="utf-8")
fonts = (ROOT / "assets" / "fonts.json").read_text(encoding="utf-8")
jspdf = (ROOT / "vendor" / "jspdf.umd.min.js").read_text(encoding="utf-8")

assert "</script" not in jspdf.lower(), "jsPDF no pot contenir </script>"
jspdf = jspdf.replace("//# sourceMappingURL=jspdf.umd.min.js.map", "")

for marker, value in [("/*__ICONS__*/{}", icons), ("/*__FONTS_JSON__*/{}", fonts), ("/*__JSPDF__*/", jspdf)]:
    assert src.count(marker) == 1, f"Falta el marcador {marker} a src/app.html (o hi apareix mes d'un cop)"
    src = src.replace(marker, value)

out = ROOT / "docs" / "index.html"
out.parent.mkdir(exist_ok=True)
out.write_text(src, encoding="utf-8")
print(f"Construit {out.relative_to(ROOT)} ({len(src) // 1024} KB)")
