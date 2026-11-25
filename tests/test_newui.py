# New phone interface (v2/): add flow, per-type forms, transfer, arrival, comments, edits, Back button.
# Test data: the species, places and animals of the department (names only) plus a few made-up records.
import json, pathlib, re, sys, os
from playwright.sync_api import sync_playwright
HERE = pathlib.Path(__file__).resolve().parent; src = HERE.parent / 'v2'; out = pathlib.Path(sys.argv[1]); out.mkdir(exist_ok=True)
CHROME = {'executable_path': os.environ['CHROME']} if os.environ.get('CHROME') else {}
mock = (HERE / 'mock_supabase.js').read_text()
seed = json.loads((HERE / 'seed_v2.json').read_text())
html = re.sub(r'<script src="https://cdn\.jsdelivr[^>]*></script>', '<script src="https://zoo.test/mock.js"></script>', (src / 'index.html').read_text())
errors = []

SEED_JS = """(s => {
  const db = __mock.db, me = __mock.users[0].id, id = () => crypto.randomUUID(), now = Date.now(), D = 864e5;
  const sp = {}; for (const [lat, v] of Object.entries(s.SP)) { const r = {id: id(), name_pl: v[0], name_ru: v[1], name_en: v[2], latin: lat, note: '', info: Object.assign({group: s.MAM.includes(lat) ? 'mammal' : 'bird'}, v[3] ? {iucn: v[3]} : {}, v[4] ? {incub_days: v[4]} : {}), created_by: me, created_at: new Date().toISOString()}; sp[lat] = r; db.species.push(r); }
  const b = {id: id(), name: s.B, kind: 'building', parent_id: null, active: true, names: [], locked: [], created_by: me, created_at: new Date().toISOString()}; db.enclosures.push(b);
  const pl = s.PL.map(p => { const r = {id: id(), name: p[0], kind: 'aviary', parent_id: b.id, active: true, names: [{l: 'ru', v: p[1]}], locked: [], created_by: me, created_at: new Date().toISOString()}; db.enclosures.push(r); return r; });
  for (const a of s.AN) db.collection.push({id: id(), name: a[3], species_id: sp[a[1]].id, sex: a[2] || '', ring: a[4] || '', chip: '', encl: pl[a[0]].name, encl_at: new Date(now - 90 * D).toISOString(), status: 'active', note: '', names: [], locked: [], grp: null, parents: [], created_by: me, created_at: new Date().toISOString()});
  const an = n => db.collection.find(x => x.name === n);
  const rec = (type, bird, f, note, ago) => db.records.push({id: id(), type, bird, species_id: an(bird).species_id, f, note, event_at: new Date(now - ago).toISOString(), created_by: me, created_at: new Date().toISOString()});
  const A = db.collection;
  rec('tstart', A[34].name, {drug: 'Meloksykam', dose: '0,2 ml', route: 'p.o.', freq: 0, days: 7}, 'test', 2 * D);
  rec('obs', A[20].name, {k: 'watch', why: 2, freq: 3, until: 1}, 'test watch', 1 * D);
  rec('incub', A[13].name, {}, '', 5 * D);
})"""

def page(b, w=390, h=844, pre=None):
    p = b.new_page(viewport={"width": w, "height": h}, locale="pl-PL")
    p.on("pageerror", lambda e: errors.append(str(e)))
    p.on("console", lambda m: m.type == "error" and "ERR_" not in m.text and errors.append(m.text))
    p.route("**/fonts.g*/**", lambda r: r.abort())
    p.route("https://zoo.test/mock.js", lambda r: r.fulfill(status=200, content_type="text/javascript", body=mock))
    p.route("https://zoo.test/v2/", lambda r: r.fulfill(status=200, content_type="text/html", body=html))
    p.route("https://zoo.test/v2/app.css", lambda r: r.fulfill(status=200, content_type="text/css", body=(src / 'app.css').read_text()))
    for fn in re.findall(r'<script src="(js/[^"]+\.js)"></script>', html):
        body = (src / fn).read_text()
        p.route("https://zoo.test/v2/" + fn, (lambda bb: (lambda r: r.fulfill(status=200, content_type="text/javascript", body=bb)))(body))
    p.goto("https://zoo.test/v2/"); p.wait_for_timeout(300)
    p.evaluate(SEED_JS + "(" + json.dumps(seed) + ")")
    if pre: p.evaluate(pre)
    p.fill("#lgl", "diomid13a@gmail.com"); p.fill("#lgp", "secret123"); p.click("#loginf button[type=submit]"); p.wait_for_timeout(400)
    if p.is_visible("[data-claim]"): p.click("[data-claim]"); p.wait_for_timeout(500)
    return p

def shot(p, name): p.screenshot(path=str(out / (name + ".png")))
def overflow(p): return p.evaluate("[...document.querySelectorAll('#app *')].filter(e => e.getBoundingClientRect().right > innerWidth + 1 && getComputedStyle(e).position !== 'fixed' && !e.closest('.chiprow,.bl-chips.nowrap,.dlist')).map(e => e.className).slice(0, 5)")
def recs(p): return p.evaluate("__mock.db.records.map(r => [r.type, (r.f || {}).k || '', r.bird, r.note])")
def click(p, sel, i=0, t=180): p.locator(sel).nth(i).click(); p.wait_for_timeout(t)

with sync_playwright() as pw:
    b = pw.chromium.launch(**CHROME, args=["--no-sandbox"])
    p = page(b)
    print("now header:", p.inner_text(".hd h1"), "| tasks:", p.locator(".bl-task").count())
    shot(p, "n01_now"); print("overflow now:", overflow(p))

    # 1. multi-select two animals -> injury for both, with common and individual notes
    click(p, "[data-fab]"); click(p, "[data-menu=animal]")
    ids = p.evaluate("__mock.db.collection.slice(0, 2).map(a => a.id)")
    click(p, f'[data-ck="{ids[0]}"]'); click(p, f'[data-ck="{ids[1]}"]')
    shot(p, "n02_who_multi")
    click(p, "[data-gomulti]"); shot(p, "n03_what_multi")
    click(p, "[data-kind=injury]")
    click(p, '[data-fv=what][data-i="0"]'); click(p, '[data-fv=sev][data-i="1"]')
    p.fill('[data-in=note]', 'Wspólne'); click(p, f'[data-pa="{ids[1]}"]'); p.fill(f'[data-in="pa.{ids[1]}.note"]', 'Tylko drugi')
    shot(p, "n04_injury_multi"); click(p, "[data-save]", t=600)
    r = recs(p); print("injury records:", [x for x in r if x[1] == 'injury'])

    # 2. animal card -> add -> new prescription -> Now -> give dose -> undo
    a0 = p.evaluate("__mock.db.collection[5].id")
    click(p, "[data-scr=more]"); click(p, "[data-scr=animals]"); click(p, f'.scroll [data-ani="{a0}"]'); shot(p, "n05_card")
    click(p, "[data-add=an]"); click(p, "[data-kind=tstart]")
    click(p, "[data-medtoggle]"); shot(p, "n06_medcombo"); click(p, "[data-med]")
    click(p, '[data-fv=freq][data-i="1"]'); click(p, '[data-fv=days][data-n="5"]'); click(p, "[data-save]", t=500)
    print("tstart:", p.evaluate("__mock.db.records.filter(r => r.type === 'tstart').map(r => r.f)"))
    click(p, "[data-scr=now]"); n_dose = p.locator("[data-dose]").count(); print("dose buttons:", n_dose); shot(p, "n07_now_after")
    click(p, "[data-dose]", t=400); print("toast:", p.inner_text("#toast")); click(p, "#toast [data-undo]", t=500)
    print("tdose after undo:", len([x for x in recs(p) if x[0] == 'tdose']))
    # treatment menu -> end
    click(p, "[data-tmenu]"); shot(p, "n08_tmenu"); click(p, "[data-tend]"); click(p, '[data-tendr="0"]'); click(p, "[data-tendok]", t=500)
    print("tend:", [x for x in recs(p) if x[0] == 'tend'])

    # 3. watch -> score
    if p.locator("[data-score]").count(): click(p, '[data-score][data-n="4"]', t=500); print("score rec:", [x for x in recs(p) if x[1] == 'score'])

    # 4. transfer with wing clip and weighing per individual
    click(p, "[data-scr=more]"); click(p, "[data-scr=animals]"); a1 = p.evaluate("__mock.db.collection.find(a => a.name.startsWith('Paw') || true).id")
    a1 = p.evaluate("__mock.db.collection[20].id"); click(p, f'.scroll [data-ani="{a1}"]')
    click(p, "[data-add=an]"); click(p, "[data-kind=expo]")
    print("who preselected:", p.locator('[data-mvby][aria-pressed=true]').count())
    click(p, "[data-mvopen]"); click(p, "[data-mvto]", 1); click(p, '[data-fv=why][data-i="0"]')
    click(p, '[data-mvproc=wing]'); click(p, f'[data-mvw="{a1}"][data-v="2"]'); click(p, '[data-mvproc=weigh]'); p.fill(f'[data-in="mv.w.{a1}"]', '1,25')
    click(p, '[data-mvproc=mark]'); click(p, f'[data-mk="{a1}"][data-v="0"]'); p.fill(f'[data-in="mv.mkv.{a1}"]', 'PL-TEST 01')
    shot(p, "n09_transfer"); click(p, "[data-save]", t=600)
    print("expo:", p.evaluate("__mock.db.records.filter(r => r.type === 'expo').map(r => r.f)"))
    print("ring now:", p.evaluate(f"__mock.db.collection.find(a => a.id === '{a1}').ring"))
    print("card place:", p.inner_text(".bl-facts div:nth-child(2) dd"))

    # 5. place card -> record about the enclosure
    click(p, "[data-scr=more]"); click(p, "[data-scr=places]"); p.evaluate("st.folded.clear(); render()"); shot(p, "n10_places")
    pid = p.evaluate("__mock.db.enclosures[2].id"); click(p, f'[data-plc="{pid}"]'); shot(p, "n11_place")
    click(p, "[data-add=pl]"); click(p, "[data-kind=env]"); click(p, '[data-fv=what][data-i="3"]'); click(p, "[data-save]", t=500)
    print("place rec:", [x for x in recs(p) if x[1] == 'env'])

    # 6. free note
    click(p, "[data-fab]"); click(p, "[data-menu=free]"); click(p, '[data-fv=kind][data-i="1"]'); p.fill('[data-in=note]', 'Deratyzacja w budynku'); click(p, "[data-save]", t=500)
    print("dept rec:", [x for x in recs(p) if x[1] == 'dept'])

    # 7. arrival of a new animal
    click(p, "[data-scr=more]"); click(p, "[data-scr=animals]"); click(p, "[data-arrive]")
    p.fill("#spin", "nikobar"); p.wait_for_timeout(300); click(p, "[data-spsel]")
    click(p, '[data-fv=sx0][data-s=f]'); click(p, '[data-fv=from][data-i="0"]'); click(p, "[data-fv=to]", 0); shot(p, "n12_arrive"); click(p, "[data-save]", t=600)
    print("arrived:", p.evaluate("__mock.db.collection.slice(-1).map(a => [a.name, a.sex, a.encl, a.status])"), "| screen:", p.inner_text(".ahero h1"))

    # 8. record card: comment and reply
    click(p, "[data-scr=logs]"); shot(p, "n13_journal"); click(p, "[data-rec]")
    p.fill("#cin", "Pierwszy komentarz"); click(p, "[data-send]", t=300)
    click(p, "[data-reply]"); p.fill("#cin", "Odpowiedź"); click(p, "[data-send]", t=300)
    print("comments:", p.evaluate("__mock.db.comments.map(c => [c.body, !!c.parent_id])")); shot(p, "n14_reccard")
    click(p, "[data-editrec]"); shot(p, "n15_edit_rec"); p.fill('[data-in=note]', 'Poprawione'); click(p, "[data-save]", t=500)
    print("edited note present:", 'Poprawione' in [x[3] for x in recs(p)])

    # 9. species card and edit
    click(p, "[data-back]"); click(p, "[data-scr=more]"); click(p, "[data-scr=species]"); click(p, "[data-sp]"); shot(p, "n16_species")
    click(p, ".topbar [data-edform=sp]"); click(p, '[data-eset="info.iucn"]', 2); click(p, '[data-lock]', 0); p.fill('[data-etr=range]', 'Afryka'); click(p, "[data-edsave]", t=500)
    print("species info:", p.evaluate("(() => { const s = __mock.db.species.find(x => x.info.range); return s && [s.name_pl, s.info.iucn, s.info.locked, s.info.range]; })()"))

    # 10. calendar, months
    click(p, "[data-scr=cal]"); shot(p, "n17_cal"); click(p, '[data-mon="-1"]'); print("month:", p.inner_text(".calhead h2")); click(p, '[data-mon="0"]')

    # 11. Back button walks the screens; at the start it asks before leaving
    click(p, "[data-scr=more]"); click(p, "[data-scr=animals]"); click(p, ".scroll [data-ani]")
    p.go_back(); p.wait_for_timeout(250); print("after back:", p.inner_text(".hd h1"))
    click(p, "[data-fab]"); click(p, "[data-menu=animal]"); p.go_back(); p.wait_for_timeout(250); print("sheet after back:", p.locator(".bl-sheet,.dial").count(), "| screen:", p.inner_text(".hd h1"))
    for i in range(60):
        p.go_back(); p.wait_for_timeout(80)
        if p.locator(".cfbox").count(): break
    print("exit question:", p.locator(".cfbox").count())
    click(p, 'button[data-cf=no]')

    # 12. Russian, dark theme, overflow on every main screen
    click(p, "[data-scr=more]"); click(p, '[data-lang=ru]'); click(p, '[data-thm=dark]'); shot(p, "n18_more_ru_dark")
    for s in ['now', 'logs', 'cal', 'more']:
        click(p, f'[data-scr={s}]'); o = overflow(p)
        if o: print("overflow", s, o)
    click(p, "[data-scr=now]"); shot(p, "n19_now_ru_dark")

    # 13. without the comments table (real base before the migration) the app still works
    p2 = page(b, pre="delete __mock.db.comments")
    click(p2, "[data-scr=logs]"); click(p2, "[data-rec]"); print("no comments block:", p2.locator(".cbar").count() == 0)

    # 14. read-only account sees no "+"
    p3 = page(b, pre="__mock.db.profiles.push({id: __mock.users[0].id, login: 'demid', display_name: 'Demid', role: 'viewer', active: true, created_at: new Date().toISOString()})")
    print("viewer fab:", p3.locator("[data-fab]").count())

    # 15. birth: parents and the young are chosen in the form; the young card gets the parents
    p4 = page(b)
    kid = p4.evaluate("__mock.db.collection.find(a => /młode/.test(a.name)).id")
    click(p4, "[data-scr=more]"); click(p4, "[data-scr=animals]"); click(p4, f'.scroll [data-ani="{kid}"]')
    click(p4, "[data-add=an]"); click(p4, "[data-kind=birth]")
    print("young preselected:", p4.locator('[data-brd=kids][aria-pressed=true]').count(), "| parent chips:", p4.locator('[data-brd=par]').count())
    click(p4, '[data-brd=par]', 0); click(p4, '[data-brd=par]', 1); shot(p4, "n20_birth")
    click(p4, "[data-save]", t=600)
    print("birth f:", p4.evaluate("__mock.db.records.filter(r => r.type === 'birth').map(r => r.f)"))
    print("young parents:", p4.evaluate(f"__mock.db.collection.find(a => a.id === '{kid}').parents.length"))

    # 16. temperature in an enclosure: from "+" -> place -> what, and from the card; chart with readings
    pid = p4.evaluate("__mock.db.enclosures[2].id")
    click(p4, "[data-scr=more]"); click(p4, "[data-scr=places]"); p4.evaluate("st.folded.clear(); render()"); click(p4, f'[data-plc="{pid}"]')
    print("temp empty block:", p4.locator(".scroll [data-tadd]").count())
    click(p4, "[data-add=pl]"); print("temp in what:", p4.locator("[data-kind=temp]").count()); click(p4, "[data-kind=temp]")
    click(p4, "[data-save]"); print("empty err:", p4.inner_text("#ferr"))
    p4.fill(".tval", "21,5"); click(p4, "[data-save]", t=500)
    click(p4, ".scroll [data-tadd]"); p4.fill(".tval", "3"); click(p4, "[data-tsign]"); click(p4, "[data-save]", t=500)
    print("temps:", p4.evaluate("__mock.db.records.filter(r => r.f && r.f.k === 'temp').map(r => [r.type, r.f.t, r.f.place])"))
    print("points:", p4.locator(".tchart .tm").count(), "| tiles:", p4.inner_text(".ttiles").replace(chr(10), ' '))
    box = p4.locator(".tchart svg").bounding_box(); p4.mouse.move(box["x"] + box["width"] - 20, box["y"] + 60); p4.wait_for_timeout(150)
    print("tooltip:", p4.inner_text(".ttip").replace(chr(10), ' ')); shot(p4, "n21_temp")
    print("overflow temp:", overflow(p4))
    p4.evaluate("""(() => { const me = __mock.users[0].id, pl = __mock.db.enclosures[2].name; for (let i = 1; i < 25; i++) __mock.db.records.push({id: crypto.randomUUID(), type: 'obs', bird: pl, species_id: null, f: {k: 'temp', t: Math.round((18 + 4 * Math.sin(i / 3) + (i % 4) * 0.4) * 10) / 10, place: pl}, note: '', event_at: new Date(Date.now() - i * 864e5 - 3e7).toISOString(), created_by: me, created_at: new Date().toISOString()}); return LOAD.records().then(render); })()""")
    p4.wait_for_timeout(300); box = p4.locator(".tchart svg").bounding_box(); p4.mouse.move(box["x"] + box["width"] * 0.5, box["y"] + 60); p4.wait_for_timeout(150)
    p4.locator(".tbox").scroll_into_view_if_needed(); shot(p4, "n22_temp_series"); print("series points:", p4.locator(".tchart .tm").count())
    # 17. fresh data: button next to the account; someone else's change shows up by itself, a failed load highlights the button
    p5 = page(b)
    print("sync button:", p5.locator(".hd [data-sync]").count())
    ext = """(() => { const db = __mock.db, a = db.collection[0], me = __mock.users[0].id;
      db.records.push({id: crypto.randomUUID(), type: 'obs', bird: a.name, species_id: a.species_id, f: {}, note: 'EXTERNAL-1', event_at: new Date().toISOString(), created_by: me, created_at: new Date().toISOString()});
      db.change_log.push({id: db.change_log.length + 1, at: new Date().toISOString(), kind: 'user', entity: 'records', action: 'insert'}); })()"""
    p5.evaluate(ext.replace('EXTERNAL-1', 'Z innego telefonu'))
    p5.evaluate("document.dispatchEvent(new Event('visibilitychange'))"); p5.wait_for_timeout(500)
    print("auto loaded:", p5.evaluate("D.rec.some(r => r.note === 'Z innego telefonu')"))
    p5.evaluate("window._lr = LOAD.records; LOAD.records = async () => { throw new Error('net'); }; 0")
    p5.evaluate(ext.replace('EXTERNAL-1', 'Drugi'))
    p5.evaluate("syncAll()"); p5.wait_for_timeout(500)
    print("stale:", p5.locator(".hd .sync.stale").count()); p5.locator(".hd").screenshot(path=str(out / "n23_sync_stale.png"))
    p5.evaluate("LOAD.records = window._lr; 0"); click(p5, "[data-sync]", t=600)
    print("after button:", p5.locator(".hd .sync.stale").count(), p5.evaluate("D.rec.some(r => r.note === 'Drugi')"), "| toast:", p5.inner_text("#toast"))
    click(p5, "[data-scr=cal]"); print("overflow cal:", overflow(p5)); p5.locator(".hd").screenshot(path=str(out / "n24_sync_cal.png"))
    # 18. weather in a free note: "Weather" swaps the fields; saved with a number temperature; title and details read it
    click(p5, "[data-fab]"); click(p5, "[data-menu=free]")
    print("kinds order:", p5.locator("[data-fv=kind]").all_inner_texts())
    click(p5, '[data-fv=kind][data-i="5"]'); print("weather fields:", p5.locator(".tval").count(), "| weekly toggle:", p5.locator('[data-fv=rep]').count())
    click(p5, "[data-save]"); print("empty err:", p5.inner_text("#ferr"))
    p5.fill(".tval", "3"); click(p5, "[data-tsign]"); click(p5, '[data-fv=sky][data-i="2"]'); click(p5, '[data-fv=prec][data-i="4"]'); click(p5, '[data-fv=prec][data-i="3"]'); click(p5, '[data-fv=wind][data-i="2"]')
    shot(p5, "n25_weather"); click(p5, "[data-save]", t=600)
    print("weather f:", p5.evaluate("__mock.db.records.filter(r => r.f && r.f.kind === 5).map(r => [r.type, r.bird, r.f])"))
    click(p5, "[data-scr=logs]"); print("journal title:", p5.locator(".scroll [data-rec]").first.inner_text().replace(chr(10), ' | '))
    click(p5, ".scroll [data-rec]"); shot(p5, "n26_weather_card"); print("card:", p5.inner_text(".scroll").replace(chr(10), ' | ')[:260])
    click(p5, "[data-editrec]"); click(p5, '[data-fv=kind][data-i="1"]'); print("switched, weather fields:", p5.locator(".tval").count()); click(p5, "[data-save]", t=500)
    print("after switch:", p5.evaluate("__mock.db.records.filter(r => r.f && r.f.k === 'dept').map(r => r.f).pop()"))
    # 19. group without an exact count: arrival with the toggle and an estimate; the card and the list read it; the edit can switch it off
    click(p5, "[data-back]"); click(p5, "[data-scr=more]"); click(p5, "[data-scr=animals]"); click(p5, "[data-arrive]")
    p5.fill("#spin", "owocożer wsp"); p5.wait_for_timeout(300); click(p5, "[data-spsel]"); click(p5, '[data-fv=cnt][data-i="4"]')
    print("toggle:", p5.locator("[data-gunk]").count(), "| counters:", p5.locator(".grpin").count())
    click(p5, "[data-gunk]"); print("after toggle counters:", p5.locator(".grpin").count(), "| about:", p5.locator('[data-in="fv.gabout"]').count())
    p5.fill('[data-in="fv.gabout"]', "ok. 20"); p5.fill('[data-in="fv.n0"]', "Owocożer wspaniały - grupa"); click(p5, '[data-fv=to]', 0); shot(p5, "n27_group_unk"); click(p5, "[data-save]", t=700)
    g = p5.evaluate("(() => { const a = __mock.db.collection.find(x => x.name === 'Owocożer wspaniały - grupa'); return a && [a.grp, a.sex]; })()"); print("saved group:", g)
    print("card:", p5.inner_text(".bl-facts").replace(chr(10), ' | ')[:120]); shot(p5, "n28_group_card")
    click(p5, "[data-edform=an]"); print("edit about:", p5.locator('[data-ein="grp.about"]').input_value())
    click(p5, "[data-gunk]"); p5.fill('[data-ein="grp.m"]', "2"); p5.fill('[data-ein="grp.f"]', "3"); click(p5, "[data-edsave]", t=600)
    print("after edit:", p5.evaluate("__mock.db.collection.find(x => x.name === 'Owocożer wspaniały - grupa').grp"))
    click(p5, "[data-edform=an]"); click(p5, "[data-gunk]"); click(p5, "[data-edsave]", t=600)
    print("unknown again:", p5.evaluate("__mock.db.collection.find(x => x.name === 'Owocożer wspaniały - grupa').grp"))
    click(p5, "[data-back]"); p5.fill("#q", "wspaniały - grupa") if p5.locator("#q").count() else None; p5.wait_for_timeout(300)
    print("list row:", [t.replace(chr(10), ' ') for t in p5.locator(".scroll [data-ani]").all_inner_texts() if 'grup' in t][:2])
    # 20. avatars: the newest card photo replaces the letters (animal lists, card hero, place tree); no photo — letters stay
    p6 = page(b)
    p6.evaluate("""(() => { const db = __mock.db, me = __mock.users[0].id, A = db.collection, P = db.enclosures;
      const img = c => 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="' + c + '"/></svg>');
      const add = (t, id, c) => { const path = me + '/' + crypto.randomUUID() + '.jpg'; db.photos.push({id: crypto.randomUUID(), owner_type: t, owner_id: id, path, created_by: me, created_at: new Date().toISOString()}); __mock.files.set(path.replace('.jpg', '_t.jpg'), img(c)); };
      add('bird', A[34].id, 'red'); add('bird', A[34].id, 'blue'); add('encl', P[2].id, 'green');
      return LOAD.photos().then(render); })()""")
    p6.wait_for_timeout(600)
    a34 = p6.evaluate("__mock.db.collection[34].id"); a33 = p6.evaluate("__mock.db.collection[33].id")
    click(p6, "[data-scr=more]"); click(p6, "[data-scr=animals]"); p6.wait_for_timeout(300)
    print("list photo:", p6.locator(f'.scroll [data-ani="{a34}"] .bl-av img').count(), "| no photo keeps letters:", p6.inner_text(f'.scroll [data-ani="{a33}"] .bl-av'))
    print("newest:", 'blue' in (p6.get_attribute(f'.scroll [data-ani="{a34}"] .bl-av img', 'src') or ''))
    click(p6, f'.scroll [data-ani="{a34}"]'); print("hero photo:", p6.locator('.ahero .bl-av img').count())
    click(p6, "[data-scr=more]"); click(p6, "[data-scr=places]"); p6.evaluate("st.folded.clear(); render()"); pid = p6.evaluate("__mock.db.enclosures[2].id")
    print("place row photo:", p6.locator(f'[data-plc="{pid}"] .bl-av img').count(), "| other place icon:", p6.locator('.trow .bl-av svg').count() > 0)
    shot(p6, "n29_avatars")
    print("ERRORS:", errors)
    b.close()
