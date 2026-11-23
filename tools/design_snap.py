# Snapshots of the v2 app as Design-canvas artboards (.dc.html), for the round trip in docs/design.md.
# Runs the app on the test mock (tests/mock_supabase.js + tests/seed_v2.json + a few sample records),
# opens each screen, grows the frame to the full content height and writes the live DOM as static markup.
# Usage: python3 tools/design_snap.py <out_dir> <css_url>   (css_url = v2/app.css uploaded to the canvas as an asset)
import json, pathlib, re, sys, os
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).resolve().parent.parent; T = ROOT / 'tests'; SRC = ROOT / 'v2'
OUT = pathlib.Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True); CSS = sys.argv[2]
mock = (T / 'mock_supabase.js').read_text(); seed = json.loads((T / 'seed_v2.json').read_text())
html = re.sub(r'<script src="https://cdn\.jsdelivr[^>]*></script>', '<script src="https://zoo.test/mock.js"></script>', (SRC / 'index.html').read_text())
SEED_JS = (T / 'test_newui.py').read_text().split('SEED_JS = """', 1)[1].split('"""', 1)[0]

SAMPLE_JS = """(() => { const db = __mock.db, me = __mock.users[0].id, A = db.collection, P = db.enclosures, D = 864e5, now = Date.now(), id = () => crypto.randomUUID();
  const pr = db.profiles.find(x => x.id === me); pr.display_name = 'Demid'; pr.login = 'demid';
  const R = (type, bird, f, note, ago, sp) => { const r = {id: id(), type, bird, species_id: sp === undefined ? (A.find(a => a.name === bird) || {}).species_id || null : sp, f, note, event_at: new Date(now - ago).toISOString(), created_by: me, created_at: new Date().toISOString()}; db.records.push(r); return r; };
  R('expo', A[5].name, {from: P[1].name, to: P[7].name, why: 0, by: ['Demid'], byId: [me]}, '', 3 * D);
  const inj = R('obs', A[1].name, {k: 'injury', what: [0], where: [1], sev: 1}, 'Lekkie otarcie na skrzydle', 0.2 * D);
  db.comments.push({id: id(), record_id: inj.id, parent_id: null, body: 'Sprawdzę wieczorem', created_by: me, created_at: new Date().toISOString()});
  R('obs', A[22].name, {k: 'obs', beh: [0], tone: 0}, 'Aktywny, je normalnie', 0.1 * D);
  R('obs', '—', {k: 'dept', kind: 5, t: -2, sky: 2, prec: [4], wind: 1}, '', 0.05 * D, null);
  R('obs', P[2].name, {k: 'env', what: [3], place: P[2].name}, '', 1 * D, null);
  for (let i = 0; i < 14; i++) R('obs', P[2].name, {k: 'temp', t: Math.round((19 + 3 * Math.sin(i / 2)) * 10) / 10, place: P[2].name}, '', i * D + 3e7, null);
  R('birth', A[2].name, {n: 1, par: [A[0].name, A[2].name], kids: [A[3].name]}, '', 15 * D);
  A[3].parents = [A[0].id, A[2].id];
  db.collection.push({id: id(), name: 'Owocożer wspaniały - grupa', species_id: A[28].species_id, sex: '', ring: '', chip: '', encl: P[7].name, encl_at: new Date(now - 30 * D).toISOString(), status: 'active', note: '', names: [], locked: [], grp: {m: 0, f: 0, u: 0, j: 0, unk: true, about: 'ok. 20'}, parents: [], created_by: me, created_at: new Date().toISOString()});
  return loadAll().then(render); })()"""

SER_JS = r"""(() => {
  const V = new Set(['area','base','br','col','embed','hr','img','input','link','meta','source','track','wbr']);
  const ea = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/\{\{/g, '{&#123;');
  const et = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\{\{/g, '{&#123;');
  function s(n) {
    if (n.nodeType === 3) return et(n.nodeValue);
    if (n.nodeType !== 1) return '';
    const t = n.localName; if (t === 'script' || t === 'style') return '';
    let a = '';
    for (const at of n.attributes) { if (/^on/i.test(at.name) || (t === 'input' && at.name === 'value')) continue; a += ' ' + at.name + '="' + ea(at.value) + '"'; }
    if (t === 'input' && n.type !== 'file' && n.value) a += ' value="' + ea(n.value) + '"';
    if (V.has(t)) return '<' + t + a + '>';
    const inner = t === 'textarea' ? et(n.value) : [...n.childNodes].map(s).join('');
    return '<' + t + a + '>' + inner + '</' + t + '>';
  }
  const tt = document.getElementById('toast'); if (tt) { tt.innerHTML = ''; tt.className = 'toast'; }
  return s(document.getElementById('shell'));
})()"""
# with a sheet open only the sheet body counts (the screen behind it would grow forever)
EXTRA_JS = "(() => { const sh = document.querySelectorAll('.bl-sheet .shbody, .bl-sheet .scroll'); const l = sh.length ? sh : document.querySelectorAll('.scroll'); return Math.max(0, ...[...l].map(x => x.scrollHeight - x.clientHeight)); })()"

def page(b):
    p = b.new_page(viewport={"width": 390, "height": 844}, locale="pl-PL")
    p.route("**/fonts.g*/**", lambda r: r.abort())
    p.route("https://zoo.test/mock.js", lambda r: r.fulfill(status=200, content_type="text/javascript", body=mock))
    p.route("https://zoo.test/v2/", lambda r: r.fulfill(status=200, content_type="text/html", body=html))
    p.route("https://zoo.test/v2/app.css", lambda r: r.fulfill(status=200, content_type="text/css", body=(SRC / 'app.css').read_text()))
    for fn in re.findall(r'<script src="(js/[^"]+\.js)"></script>', html):
        body = (SRC / fn).read_text()
        p.route("https://zoo.test/v2/" + fn, (lambda bb: (lambda r: r.fulfill(status=200, content_type="text/javascript", body=bb)))(body))
    p.goto("https://zoo.test/v2/"); p.wait_for_timeout(300)
    p.evaluate(SEED_JS + "(" + json.dumps(seed) + ")")
    p.fill("#lgl", "diomid13a@gmail.com"); p.fill("#lgp", "secret123"); p.click("#loginf button[type=submit]"); p.wait_for_timeout(400)
    if p.is_visible("[data-claim]"): p.click("[data-claim]"); p.wait_for_timeout(500)
    p.evaluate(SAMPLE_JS); p.wait_for_timeout(300)
    return p

def c(p, sel, i=0, t=200): p.locator(sel).nth(i).click(); p.wait_for_timeout(t)
def ev(p, js): return p.evaluate(js)
an = lambda i: f"__mock.db.collection[{i}].id"
def card(p, i): c(p, "[data-scr=more]"); c(p, "[data-scr=animals]"); c(p, f'.scroll [data-ani="{ev(p, an(i))}"]')
def place(p): c(p, "[data-scr=more]"); c(p, "[data-scr=places]"); c(p, f'[data-plc="{ev(p, "__mock.db.enclosures[2].id")}"]')
def dark(p): c(p, "[data-scr=more]"); c(p, '[data-thm=dark]'); c(p, "[data-scr=now]")
def who(p): c(p, "[data-fab]"); c(p, "[data-menu=animal]"); ids = ev(p, "__mock.db.collection.slice(0, 2).map(a => a.id)"); c(p, f'[data-ck="{ids[0]}"]'); c(p, f'[data-ck="{ids[1]}"]'); return ids
def injury(p):
    ids = who(p); c(p, "[data-gomulti]"); c(p, "[data-kind=injury]"); c(p, '[data-fv=what][data-i="0"]'); c(p, '[data-fv=sev][data-i="1"]')
    p.fill('[data-in=note]', 'Kulawizna lewej nogi'); c(p, f'[data-pa="{ids[1]}"]'); p.fill(f'[data-in="pa.{ids[1]}.note"]', 'Tylko lekko')
def med(p): card(p, 5); c(p, "[data-add=an]"); c(p, "[data-kind=tstart]"); c(p, "[data-medtoggle]")
def transfer(p):
    a1 = ev(p, an(20)); card(p, 20); c(p, "[data-add=an]"); c(p, "[data-kind=expo]"); c(p, "[data-mvopen]"); c(p, "[data-mvto]", 1); c(p, '[data-fv=why][data-i="0"]')
    c(p, '[data-mvproc=wing]'); c(p, f'[data-mvw="{a1}"][data-v="2"]'); c(p, '[data-mvproc=weigh]'); p.fill(f'[data-in="mv.w.{a1}"]', '1,25')
def birth(p): card(p, 3); c(p, "[data-add=an]"); c(p, "[data-kind=birth]"); c(p, '[data-brd=par]', 0); c(p, '[data-brd=par]', 1)
def temp(p): place(p); c(p, "[data-add=pl]"); c(p, "[data-kind=temp]"); p.fill(".tval", "21,5")
def weather(p):
    c(p, "[data-fab]"); c(p, "[data-menu=free]"); c(p, '[data-fv=kind][data-i="5"]'); p.fill(".tval", "-2")
    c(p, '[data-fv=sky][data-i="2"]'); c(p, '[data-fv=prec][data-i="4"]'); c(p, '[data-fv=wind][data-i="1"]')
def free(p): c(p, "[data-fab]"); c(p, "[data-menu=free]"); c(p, '[data-fv=kind][data-i="1"]'); p.fill('[data-in=note]', 'Deratyzacja w budynku')
def arrive(p, grp=False):
    c(p, "[data-scr=more]"); c(p, "[data-scr=animals]"); c(p, "[data-arrive]")
    p.fill("#spin", "nikobar" if not grp else "owocożer wsp"); p.wait_for_timeout(300); c(p, "[data-spsel]")
    if grp: c(p, '[data-fv=cnt][data-i="4"]'); c(p, "[data-gunk]"); p.fill('[data-in="fv.gabout"]', "ok. 20"); c(p, '[data-fv=to]', 0)
    else: c(p, '[data-fv=sx0][data-s=f]'); c(p, '[data-fv=from][data-i="0"]'); c(p, "[data-fv=to]", 0)
def grp_card(p): c(p, "[data-scr=more]"); c(p, "[data-scr=animals]"); c(p, f'.scroll [data-ani="{ev(p, "__mock.db.collection.slice(-1)[0].id")}"]')
def rec_card(p): rid = ev(p, "D.rec.find(r => r.note === 'Lekkie otarcie na skrzydle').id"); c(p, "[data-scr=logs]"); c(p, f'[data-rec="{rid}"]')
def species(p): sid = ev(p, "__mock.db.species.find(s => s.latin === 'Goura cristata').id"); c(p, "[data-scr=more]"); c(p, "[data-scr=species]"); c(p, f'[data-sp="{sid}"]')

S = [  # file, title, section, steps
    ('Main', 'Сейчас', 0, lambda p: None),
    ('Journal', 'Журнал', 0, lambda p: c(p, "[data-scr=logs]")),
    ('Calendar', 'Календарь', 0, lambda p: c(p, "[data-scr=cal]")),
    ('More', 'Ещё', 0, lambda p: c(p, "[data-scr=more]")),
    ('Animals', 'Животные', 0, lambda p: (c(p, "[data-scr=more]"), c(p, "[data-scr=animals]"))),
    ('Places', 'Вольеры', 0, lambda p: (c(p, "[data-scr=more]"), c(p, "[data-scr=places]"))),
    ('AnimalCard', 'Карточка животного', 1, lambda p: card(p, 34)),
    ('GroupCard', 'Группа без численности', 1, grp_card),
    ('PlaceCard', 'Карточка вольера · температура', 1, place),
    ('SpeciesCard', 'Карточка вида', 1, species),
    ('RecordCard', 'Карточка записи · комментарии', 1, rec_card),
    ('AddMenu', '«+» — куда записать', 2, lambda p: c(p, "[data-fab]")),
    ('WhoPicker', 'Выбор животных', 2, who),
    ('WhatAnimal', 'Что записать — животное', 2, lambda p: (card(p, 34), c(p, "[data-add=an]"))),
    ('WhatPlace', 'Что записать — вольер', 2, lambda p: (place(p), c(p, "[data-add=pl]"))),
    ('TreatmentMenu', 'Меню лечения', 2, lambda p: c(p, "[data-tmenu]")),
    ('Injury', 'Травма · несколько животных', 3, injury),
    ('Medication', 'Назначение лекарства', 3, med),
    ('Transfer', 'Перенос', 3, transfer),
    ('Birth', 'Роды · родители', 3, birth),
    ('Temperature', 'Температура вольера', 3, temp),
    ('Weather', 'Погода', 3, weather),
    ('FreeNote', 'Свободная запись', 3, free),
    ('Arrival', 'Поступление', 3, arrive),
    ('ArrivalGroup', 'Поступление группы без численности', 3, lambda p: arrive(p, True)),
    ('EditAnimal', 'Правка карточки', 3, lambda p: (card(p, 34), c(p, ".topbar [data-edform=an]"))),
    ('NowDark', 'Сейчас — тёмная', 4, dark),
    ('AnimalDark', 'Карточка животного — тёмная', 4, lambda p: (dark(p), card(p, 34))),
    ('WeatherDark', 'Погода — тёмная', 4, lambda p: (dark(p), weather(p))),
]
# Prototype: tap areas laid over each artboard (<a href> to another artboard), so Play walks through the app like on the phone.
# [selector, target]; only the topmost visible element under its centre gets one (sheets cover the screen behind).
NAV = [['[data-scr=now]', 'Main'], ['[data-scr=logs]', 'Journal'], ['[data-scr=cal]', 'Calendar'], ['[data-scr=more]', 'More'], ['[data-fab]', 'AddMenu']]
SAVE = lambda t: [['[data-save]', t], ['[data-close]', t], ['[data-edsave]', t]]
LINKS = {
    'Main': [['[data-tmenu]', 'TreatmentMenu'], ['[data-ani]', 'AnimalCard'], ['[data-rec]', 'RecordCard']],
    'Journal': [['[data-rec]', 'RecordCard']],
    'Calendar': [['[data-rec]', 'RecordCard']],
    'More': [['[data-scr=animals]', 'Animals'], ['[data-scr=places]', 'Places'], ['[data-scr=species]', 'SpeciesCard'], ['[data-thm=dark]', 'NowDark']],
    'Animals': [['[data-back]', 'More'], ['[data-arrive]', 'Arrival'], ['.scroll [data-ani*="-"]', 'AnimalCard']],
    'Places': [['[data-back]', 'More'], ['[data-plc]', 'PlaceCard']],
    'AnimalCard': [['[data-back]', 'Animals'], ['[data-add=an]', 'WhatAnimal'], ['[data-edform=an]', 'EditAnimal'], ['[data-rec]', 'RecordCard'], ['[data-ani]', 'AnimalCard']],
    'GroupCard': [['[data-back]', 'Animals'], ['[data-add=an]', 'WhatAnimal'], ['[data-rec]', 'RecordCard']],
    'PlaceCard': [['[data-back]', 'Places'], ['[data-add=pl]', 'WhatPlace'], ['[data-tadd]', 'Temperature'], ['[data-ani]', 'AnimalCard'], ['[data-rec]', 'RecordCard']],
    'SpeciesCard': [['[data-back]', 'More'], ['[data-ani]', 'AnimalCard']],
    'RecordCard': [['[data-back]', 'Journal'], ['[data-ani]', 'AnimalCard']],
    'AddMenu': [['[data-menu=animal]', 'WhoPicker'], ['[data-menu=places]', 'Places'], ['[data-menu=free]', 'FreeNote'], ['[data-close]', 'Main']],
    'WhoPicker': [['[data-gomulti]', 'Injury'], ['[data-close]', 'Main'], ['[data-step]', 'AddMenu']],
    'WhatAnimal': [['[data-kind=injury]', 'Injury'], ['[data-kind=tstart]', 'Medication'], ['[data-kind=expo]', 'Transfer'], ['[data-kind=birth]', 'Birth'], ['[data-kind=hatch]', 'Birth'], ['[data-close]', 'AnimalCard'], ['[data-step]', 'AnimalCard']],
    'WhatPlace': [['[data-kind=temp]', 'Temperature'], ['[data-close]', 'PlaceCard'], ['[data-step]', 'PlaceCard']],
    'TreatmentMenu': [['[data-close]', 'Main']],
    'Injury': SAVE('Main') + [['[data-step]', 'WhoPicker']],
    'Medication': SAVE('AnimalCard') + [['[data-step]', 'WhatAnimal']],
    'Transfer': SAVE('AnimalCard') + [['[data-step]', 'WhatAnimal']],
    'Birth': SAVE('AnimalCard') + [['[data-step]', 'WhatAnimal']],
    'Temperature': SAVE('PlaceCard') + [['[data-step]', 'WhatPlace']],
    'Weather': SAVE('Journal') + [['[data-fv=kind]:not([data-i="5"])', 'FreeNote']],
    'FreeNote': SAVE('Journal') + [['[data-fv=kind][data-i="5"]', 'Weather']],
    'Arrival': SAVE('AnimalCard') + [['[data-fv=cnt][data-i="4"]', 'ArrivalGroup']],
    'ArrivalGroup': SAVE('GroupCard') + [['[data-fv=cnt]:not([data-i="4"])', 'Arrival']],
    'EditAnimal': SAVE('AnimalCard'),
    'NowDark': [['[data-ani]', 'AnimalDark'], ['[data-fab]', 'WeatherDark'], ['[data-scr=more]', 'More']],
    'AnimalDark': [['[data-back]', 'NowDark']],
    'WeatherDark': SAVE('NowDark'),
}
LINK_JS = r"""(L => {
  const sh = document.getElementById('shell').getBoundingClientRect(), seen = new Set(), out = [];
  const ea = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  for (const [sel, to] of L) for (const el of document.querySelectorAll(sel)) {
    const r = el.getBoundingClientRect(); if (r.width < 4 || r.height < 4) continue;
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    if (!hit || !(el === hit || el.contains(hit)) || seen.has(el)) continue; seen.add(el);
    const lab = (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60) || to;
    out.push(`<a href="${to}.dc.html" aria-label="${ea(lab)}" style="position: absolute; left: ${Math.round(r.left - sh.left)}px; top: ${Math.round(r.top - sh.top)}px; width: ${Math.round(r.width)}px; height: ${Math.round(r.height)}px; z-index: 60; border-radius: 12px"></a>`);
  }
  return out.join('\n');
})"""

SECTIONS = ['Главные экраны', 'Карточки', 'Добавление записи', 'Формы', 'Тёмная тема']

TPL = """<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
<link rel="stylesheet" href="{css}">
</head>
<body>
<x-dc>
<helmet>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&amp;family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet">
<style>
body{{margin:0}}
[data-taps] a{{pointer-events:auto;display:block}}
</style>
</helmet>
<div data-theme="{theme}" style="position: relative; width: 390px; height: {h}px; overflow: hidden; transform: translateZ(0); background: var(--bg); color: var(--ink); font-family: var(--font-text)">
{body}
<div data-taps="1" style="position: absolute; inset: 0; z-index: 60; pointer-events: none">
{links}
</div>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":390,"height":{h}}}}}'>
class Component extends DCLogic {{
renderVals() {{ return {{}}; }}
}}
</script>
</body>
</html>
"""

meta = []
with sync_playwright() as pw:
    b = pw.chromium.launch(**({'executable_path': os.environ['CHROME']} if os.environ.get('CHROME') else {}), args=["--no-sandbox"])
    for f, title, sec, steps in S:
        p = page(b); steps(p); p.wait_for_timeout(350)
        h = 844
        for _ in range(4):
            extra = ev(p, EXTRA_JS)
            if extra <= 1: break
            sheet = p.locator('.bl-sheet').count() > 0
            h = min(1600 if sheet else 2400, int((h + extra) / (0.94 if sheet else 1)) + 8); p.set_viewport_size({"width": 390, "height": h}); p.wait_for_timeout(250)
        theme = ev(p, "document.documentElement.dataset.theme || 'light'")
        lk = p.evaluate(LINK_JS + '(' + json.dumps(LINKS.get(f, []) + NAV) + ')')  # screen links first: they win over the bottom bar
        (OUT / f'{f}.dc.html').write_text(TPL.format(title=title, css=CSS, theme=theme, h=h, body=ev(p, SER_JS), links=lk))
        meta.append({'file': f + '.dc.html', 'title': title, 'section': sec, 'h': h}); print(f, h); p.close()
    b.close()
(OUT / '_meta.json').write_text(json.dumps({'sections': SECTIONS, 'boards': meta}, ensure_ascii=False))
