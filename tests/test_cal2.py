import re, pathlib, sys
exec(open(pathlib.Path(__file__).resolve().parent / 'test_encl.py').read().split("with sync_playwright() as pw:")[0])
PRE = """() => { const db = __mock.db, now = new Date(), D = 864e5, iso = d => new Date(d).toISOString(), y = now.getFullYear(), m = now.getMonth();
  const sp = db.species.find(s => s.latin === 'Afropavo congensis') || db.species[0]; sp.info = Object.assign({}, sp.info, {incub_days: '26'});
  const id = () => crypto.randomUUID(), base = {note: '', created_by: null, created_at: iso(now), updated_at: iso(now)};
  db.collection.push(Object.assign({id: id(), name: 'Павлин', species_id: sp.id, sex: 'f', ring: '', chip: '', born: null, arrived: null, origin: '', encl: '', encl_at: null, status: 'active'}, base));
  const at = d => iso(new Date(y, m, d, 10));
  db.records.push(Object.assign({id: id(), type: 'lay', species_id: sp.id, bird: 'Павлин', event_at: at(3), f: {n: 2}}, base));
  db.records.push(Object.assign({id: id(), type: 'incub', species_id: sp.id, bird: 'Павлин', event_at: at(5), f: {days: 26}}, base));
  db.records.push(Object.assign({id: id(), type: 'tstart', species_id: sp.id, bird: 'Тукан', event_at: at(10), f: {drug: 'Байтрил', days: 7}}, base));
  db.records.push(Object.assign({id: id(), type: 'expo', species_id: sp.id, bird: 'Тукан', event_at: at(10), f: {to: 'Клетка'}}, base));
  db.records.push(Object.assign({id: id(), type: 'obs', species_id: sp.id, bird: 'Тукан', event_at: at(10), f: {}}, base));
  db.records.push(Object.assign({id: id(), type: 'lay', species_id: sp.id, bird: 'Голубь', event_at: at(10), f: {}}, base));
  db.records.push(Object.assign({id: id(), type: 'lay', species_id: sp.id, bird: 'Голубь 2', event_at: at(10), f: {}}, base));
  db.records.push(Object.assign({id: id(), type: 'lay', species_id: sp.id, bird: 'Голубь 3', event_at: at(10), f: {}}, base));
}"""
with sync_playwright() as pw:
    b = pw.chromium.launch(**CHROME, args=["--no-sandbox"])
    for (w, hgt, tag) in [(390, 844, 'm'), (1400, 950, 'd')]:
        p = page(b, w, hgt, pre=PRE)
        p.click(".tab[data-tab=cal]"); p.wait_for_timeout(300)
        print(tag, "list mode title:", p.inner_text("#cal-title"), "| rows:", p.locator("#cal-list .cal-row").count(), "| grid visible:", p.is_visible(".cal-wrap"))
        p.screenshot(path=f"{out}/k_{tag}_list.png", full_page=False)
        p.click("[data-cal-mode=grid]"); p.wait_for_timeout(600)
        print(tag, "grid: months", p.locator(".cal-month").count(), "| cur in view:", p.evaluate("(() => { const r = document.querySelector('.cal-month.cur').getBoundingClientRect(); return Math.round(r.top) })()"), "| list hidden:", p.is_hidden(".cal-listsec"))
        print(tag, "dots in current:", p.locator(".cal-month.cur .cdot").count(), "bars:", p.locator(".cal-month.cur .cbar").count())
        p.screenshot(path=f"{out}/k_{tag}_grid.png", full_page=False)
        n0 = p.locator(".cal-month").count()
        for i in range(12): p.mouse.wheel(0, 1500); p.wait_for_timeout(150)
        print(tag, "after scroll down months:", p.locator(".cal-month").count(), "(was", n0, ")")
        p.click("[data-cal-nav='0']"); p.wait_for_timeout(300)
        p.locator(".cal-month.cur .cbar.k-amber").first.click(); p.wait_for_timeout(150)
        print(tag, "tip:", p.inner_text("#cal-tip").replace("\n", " | "), "| visible:", p.is_visible("#cal-tip"))
        p.screenshot(path=f"{out}/k_{tag}_tip.png", full_page=False)
        p.locator(".cal-month.cur .cbar.k-amber").first.click(); p.wait_for_timeout(400)
        print(tag, "2nd tap ->", p.eval_on_selector(".view:not([hidden])", "e => e.id"))
        p.click(".tab[data-tab=cal]"); p.wait_for_timeout(500)
        p.click("[data-cal-earlier]"); p.wait_for_timeout(300); print(tag, "earlier: months", p.locator(".cal-month").count(), "| cur top stays:", p.evaluate("Math.round(document.querySelector('.cal-month.cur').getBoundingClientRect().top)"))
        print(tag, "mode remembered, cur top:", p.evaluate("Math.round(document.querySelector('.cal-month.cur').getBoundingClientRect().top)"))
        p.close()
    b.close()
print("ERRORS:", errors)
