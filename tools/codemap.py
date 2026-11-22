#!/usr/bin/env python3
"""Writes docs/codemap.md: which module (js/*.js) declares which top-level names.
Run after adding/removing modules or top-level functions:  python3 tools/codemap.py
tests/test_modules.py fails when the map is out of date."""
import re, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DECL = re.compile(r'^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)|^(?:const|let|var)\s+([A-Za-z_$][\w$]*)', re.M)


def modules():
    html = (ROOT / 'index.html').read_text(encoding='utf-8')
    return re.findall(r'<script src="js/([\w-]+)\.js"></script>', html)


def build():
    out = ['# Карта кода (создаётся `python3 tools/codemap.py`, руками не править)', '',
           'Модули грузятся в этом порядке (index.html). Код, выполняемый при загрузке, может опираться только на модули выше.', '']
    for m in modules():
        src = (ROOT / 'js' / f'{m}.js').read_text(encoding='utf-8')
        first = src.split('\n', 1)[0].lstrip('/ ').strip()
        names = [a or b for a, b in DECL.findall(src)]
        kb = len(src.encode('utf-8')) / 1024
        out.append(f'**{m}.js** ({kb:.0f} КБ) — {first.split("—", 1)[-1].strip()}')
        out.append(', '.join(f'`{n}`' for n in names) if names else '—')
        out.append('')
    return '\n'.join(out)


if __name__ == '__main__':
    text = build()
    target = ROOT / 'docs' / 'codemap.md'
    if '--check' in sys.argv:
        sys.exit(0 if target.exists() and target.read_text(encoding='utf-8') == text else 1)
    target.parent.mkdir(exist_ok=True)
    target.write_text(text, encoding='utf-8')
    print('written', target.relative_to(ROOT))
