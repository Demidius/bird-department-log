# Quick structure check (no browser): the module list agrees everywhere.
# index.html scripts == files in js/ == sw.js offline list; docs/codemap.md is up to date.
import re, pathlib, subprocess, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
html = (ROOT / 'index.html').read_text(encoding='utf-8')
sw = (ROOT / 'sw.js').read_text(encoding='utf-8')
in_html = re.findall(r'<script src="(js/[\w-]+\.js)"></script>', html)
on_disk = sorted('js/' + p.name for p in (ROOT / 'js').glob('*.js'))
in_sw = re.findall(r"'(js/[\w-]+\.js)'", sw)
problems = []
if sorted(in_html) != on_disk: problems.append(f'index.html vs js/: {set(in_html) ^ set(on_disk)}')
if in_sw != in_html: problems.append('sw.js SHELL must list the same js/ files in the same order as index.html')
if len(set(in_html)) != len(in_html): problems.append('a module is listed twice in index.html')
if (ROOT / 'app.js').exists(): problems.append('app.js is back: code lives in js/*.js now')
if subprocess.run([sys.executable, str(ROOT / 'tools' / 'codemap.py'), '--check']).returncode:
    problems.append('docs/codemap.md is stale: run python3 tools/codemap.py')
print('modules:', len(in_html))
if problems:
    print('\n'.join(problems)); sys.exit(1)
print('OK')
