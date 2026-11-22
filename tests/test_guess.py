# expected (calculated) dates: incubation -> expected hatching and nest leaving; birth -> estimated fertilisation
import pathlib
exec(open(pathlib.Path(__file__).resolve().parent / 'test_encl.py').read().split("with sync_playwright() as pw:")[0])
PRE = """() => { const db = __mock.db, now = new Date(), iso = d => new Date(d).toISOString(), y = now.getFullYear(), m = now.getMonth();
  const sp = db.species.find(s => s.latin === 'Afropavo congensis') || db.species[0]; sp.info = Object.assign({}, sp.info, {incub_days: '10', fledge_days: '5'});
  const mm = db.species.find(s => s !== sp); mm.info = Object.assign({}, mm.info, {group: 'mammal', gest_days: '7'}); window.__mm = mm.id; window.__sp = sp.id;
  const id = () => crypto.randomUUID(), base = {note: '', created_by: null, created_at: iso(now), updated_at: iso(now)};
  const at = d => iso(new Date(y, m, d, 10));
  db.records.push(Object.assign({id: id(), type: 'incub', species_id: sp.id, bird: 'Павлин', event_at: at(2), f: {days: 10}}, base));
  db.records.push(Object.assign({id: id(), type: 'hatch', species_id: sp.id, bird: 'Голубь', event_at: at(4), f: {n: 2}}, base));
  db.records.push(Object.assign({id: id(), type: 'birth', species_id: mm.id, bird: 'Мара', event_at: at(25), f: {n: 1}}, base));
}"""
PRE2 = PRE[:PRE.rindex("}")] + "  db.records.push(Object.assign({id: id(), type: 'hatch', species_id: sp.id, bird: 'Павлин', event_at: at(11), f: {n: 1}}, base));\n}"
day = lambda p, d: p.evaluate(f"(() => {{ const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), {d}).getTime(); }})()")
with sync_playwright() as pw:
    b = pw.chromium.launch(**CHROME, args=["--no-sandbox"])
    for (w, hgt, tag) in [(390, 844, 'm'), (1400, 950, 'd')]:
        p = page(b, w, hgt, pre=PRE)
        p.click(".tab[data-tab=cal]"); p.wait_for_timeout(300)
        p.click("[data-cal-mode=list]"); p.wait_for_timeout(300)
        rows = p.locator("#cal-list .cal-row:has(.guess)").all_inner_texts()
        print(tag, "list guesses:", [r.replace("\n", " ") for r in rows])
        assert len(rows) == 4, rows   # hatch 12, nest 17 (Павлин), nest 9 (Голубь), fertilisation 18 (Мара)
        ig = p.evaluate("calItems().filter(x => x.k.startsWith('gincub')).map(x => x.txt + ' @' + new Date(x.s).getDate())"); print(tag, "incub start from hatch:", ig)
        assert len(ig) == 1 and "Голубь" in ig[0]   # Павлин has a recorded incubation, so no guess for it
        p.click("[data-cal-mode=grid]"); p.wait_for_timeout(500)
        cur = ".cal-month.cur"
        print(tag, "grid guess dots:", p.locator(f"{cur} .cdot.guess").count())
        p.screenshot(path=f"{out}/gs_{tag}_grid.png", full_page=False)
        p.locator(f"{cur} button.cn[data-day='{day(p, 12)}']").click(); p.wait_for_timeout(400)
        txt = p.inner_text("#dy-body"); print(tag, "day 12 expected:", "przewid. klucie" in txt)
        assert "przewid. klucie" in txt
        p.screenshot(path=f"{out}/gs_{tag}_day12.png", full_page=False)
        esc_close(p)
        p.locator(f"{cur} button.cn[data-day='{day(p, 18)}']").click(); p.wait_for_timeout(400)
        assert "przewid. zapłodnienie" in p.inner_text("#dy-body"); esc_close(p)
        # recording the real hatching removes the expected one
        p.close(); p = page(b, w, hgt, pre=PRE2)
        p.click(".tab[data-tab=cal]"); p.wait_for_timeout(300); p.click("[data-cal-mode=list]"); p.wait_for_timeout(300)
        rows2 = p.locator("#cal-list .cal-row:has(.guess)").all_inner_texts()
        print(tag, "after real hatch:", [r.replace("\n", " ") for r in rows2])
        assert not any("klucie" in r for r in rows2) and len(rows2) == 3, rows2
        # birth event in the breeding sheet + species fields
        p.click(".tab[data-tab=now]"); p.wait_for_timeout(200)
        p.evaluate("openSheet('breed')"); p.wait_for_timeout(300)
        print(tag, "birth button:", p.is_visible("#sheet-breed [data-new=birth]"))
        p.screenshot(path=f"{out}/gs_{tag}_breed.png", full_page=False)
        p.click("#sheet-breed [data-new=birth]"); p.wait_for_timeout(300)
        print(tag, "birth form fields:", p.locator("#sheet-form .fld label").all_inner_texts())
        esc_close(p)
        p.evaluate("openCard('sp', window.__mm)"); p.wait_for_timeout(400)
        print(tag, "mammal card has gestation:", "Ciąża" in p.inner_text("body"))
        p.close()
    b.close()
print("ERRORS:", errors)
