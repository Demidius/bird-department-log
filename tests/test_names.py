import re, pathlib, sys
exec(open(pathlib.Path(__file__).resolve().parent / 'test_encl.py').read().split("with sync_playwright() as pw:")[0])
PRE = """() => { const db = __mock.db, iso = d => new Date(d).toISOString();
  db.change_log.push({id: 1, at: iso(Date.now() - 3600e3), actor: null, kind: 'dev', entity: '', entity_id: null, action: 'note', label: '', fields: [], extra: null, summary: 'Календарь добавлен'});
  db.change_log.push({id: 2, at: iso(Date.now() - 600e3), actor: null, kind: 'user', entity: 'enclosures', entity_id: null, action: 'update', label: 'Авиарий 1', fields: ['capacity', 'names'], extra: null, summary: ''});
  db.change_log.push({id: 3, at: iso(Date.now() - 500e3), actor: null, kind: 'user', entity: 'records', entity_id: null, action: 'insert', label: 'Павлин', fields: [], extra: {type: 'incub'}, summary: ''});
}"""
with sync_playwright() as pw:
    b = pw.chromium.launch(**CHROME, args=["--no-sandbox"])
    p = page(b, 390, 844, pre=PRE)
    # place with Polish + English names
    p.click(".tab[data-tab=menu]"); p.click("[data-view=encls]"); p.click("#view-encls [data-encl-new]"); p.wait_for_timeout(150)
    p.fill("#ef-name", "Авиарий 1")
    p.click("#ef-fields [data-nm-add]"); print("first new lang:", p.locator("#ef-fields .nm-row select").nth(0).input_value())
    p.locator("#ef-fields .nm-row input").nth(0).fill("Ptaszarnia 1")
    p.click("#ef-fields [data-nm-add]"); print("second lang:", p.locator("#ef-fields .nm-row select").nth(1).input_value())
    p.locator("#ef-fields .nm-row input").nth(1).fill("Aviary 1")
    p.click("#ef-fields [data-nm-add]"); p.locator("#ef-fields .nm-row [data-nm-rm]").nth(2).click(); print("rows after remove:", p.locator("#ef-fields .nm-row").count())
    p.screenshot(path=str(out)+"/n_form.png")
    p.click("#ef-save"); p.wait_for_timeout(300)
    print("db names:", p.evaluate("JSON.stringify(__mock.db.enclosures[0].names)"), "| meta:", p.inner_text("#encl-body .sp-meta"))
    # animal with Polish name
    p.click(".tab[data-tab=menu]"); p.click("[data-view=coll]"); p.click("#view-coll [data-bird-new]"); p.wait_for_timeout(150)
    p.fill("#bf-name", "Павлин"); p.click("#bf-fields [data-nm-add]"); p.locator("#bf-fields .nm-row input").nth(0).fill("Paw Kongo")
    p.select_option("#bf-sp", index=1); p.select_option("#bf-encl", value="Авиарий 1"); p.click("#bf-save"); p.wait_for_timeout(300)
    print("bird h1:", p.inner_text("#bird-body h1"), "| meta:", p.inner_text("#bird-body .sp-meta"))
    # switch to Polish
    p.click(".tab[data-tab=menu]"); p.click("#view-menu [data-lang=pl]"); p.wait_for_timeout(200)
    p.click("[data-view=coll]"); print("PL coll row:", p.inner_text("#coll-body .row .rt").replace("\n", " | "))
    p.click("#coll-body .row"); p.wait_for_timeout(150); print("PL bird h1:", p.inner_text("#bird-body h1"), "| meta:", p.inner_text("#bird-body .sp-meta"), "| place:", p.eval_on_selector_all("#bird-body .facts dd", "e => e.map(x => x.innerText)"))
    # record via Polish name gets stored under main name
    p.click(".tab[data-tab=add]"); p.click("[data-sheet=breed]"); p.click("#sheet-breed [data-new=incub]"); p.wait_for_timeout(150)
    p.select_option("#fld-birdsel", value="__other"); p.fill("#fld-bird", "Paw Kongo"); p.dispatch_event("#fld-bird", "change"); p.click("#f-save"); p.wait_for_timeout(300)
    print("record stored as:", p.evaluate("__mock.db.records.map(r => r.bird)"), "| shown:", p.eval_on_selector_all("#logs-body .rec .bird, #now-body .rec .bird", "e => e.map(x => x.innerText)"))
    # log
    p.click(".tab[data-tab=menu]"); p.click("[data-view=log]"); p.wait_for_timeout(200)
    print("log:", p.eval_on_selector_all("#log-body .lg-row", "e => e.map(x => x.innerText.replace(/\\n/g,' '))"))
    p.click(".tab[data-tab=menu]"); p.click("#view-menu [data-lang=ru]"); p.click("[data-view=log]"); p.wait_for_timeout(200)
    print("log RU:", p.eval_on_selector_all("#log-body .lg-row", "e => e.map(x => x.innerText.replace(/\\n/g,' '))"))
    p.click("#log-body .lg-row [data-lg-del]"); print("armed:", p.inner_text("#log-body .lg-del.armed"))
    p.click("#log-body .lg-del.armed"); p.wait_for_timeout(300); print("rows after delete:", p.locator("#log-body .lg-row").count(), "| db:", p.evaluate("__mock.db.change_log.length"))
    p.screenshot(path=str(out)+"/n_log.png", full_page=True)
    b.close()
print("ERRORS:", errors)
