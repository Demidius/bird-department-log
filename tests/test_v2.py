import re, pathlib, sys, json, urllib.parse
exec(open(pathlib.Path(__file__).resolve().parent / 'test_encl.py').read().split("with sync_playwright() as pw:")[0])
PRE = """() => { const s = __mock.db.species[0]; s.info = Object.assign({}, s.info, {breeding: 'Гнездо на дереве.', incub_days: 28, incub_range: '26–28', locked: []});
  const t0 = Date.now();
  __mock.db.change_log.push({id: 1, at: new Date(t0 - 3e5).toISOString(), actor: null, kind: 'dev', ver: 1, entity: 'app', action: 'note', label: '', fields: [], summary: 'Календарь'},
   {id: 2, at: new Date(t0 - 2e5).toISOString(), actor: null, kind: 'dev', ver: 2, entity: 'app', action: 'note', label: '', fields: [], summary: 'Замки'},
   {id: 3, at: new Date(t0 - 1e5).toISOString(), actor: null, kind: 'ai', entity: 'species', action: 'update', label: 'Пава', fields: ['info'], summary: ''}); }"""
def tr_route(route):
    q = urllib.parse.parse_qs(urllib.parse.urlparse(route.request.url).query)
    route.fulfill(status=200, content_type='application/json', headers={'Access-Control-Allow-Origin': '*'},
        body=json.dumps({'responseStatus': 200, 'responseData': {'translatedText': '[' + q['langpair'][0] + '] ' + q['q'][0]}}))
with sync_playwright() as pw:
    b = pw.chromium.launch(**CHROME, args=["--no-sandbox"])
    for w, h, tag in [(390, 844, 'm'), (1280, 900, 'd')]:
        p = page(b, w, h, pre=PRE)
        p.route("https://api.mymemory.translated.net/**", tr_route)
        sid = p.evaluate("__mock.db.species[0].id")
        p.click(".tab[data-tab=menu]"); p.click("[data-view=species]"); p.wait_for_timeout(150)
        p.click("#species-body [data-sp='%s']" % sid); p.wait_for_timeout(150)
        print("card (PL ui) breeding note:", p.locator("#sp-body .si-card:has-text('Гнездо') .tr-note").inner_text(), "| incub fact:", [x for x in p.locator("#sp-body .sp-facts dd").all_inner_texts() if '28' in x])
        p.click("#sp-body [data-sp-edit]"); p.wait_for_timeout(200)
        p.evaluate("document.getElementById('sp-more').open = true")
        print("PL field empty:", repr(p.input_value("#sfi-breeding")), "| note:", p.locator("#sp-form .fld:has(#sfi-breeding) .tr-note").inner_text())
        p.fill("#sfi-breeding", "Gniazdo na drzewie. Dwa jaja.")
        p.click("#sp-form [data-trl=ru]"); print("RU field:", repr(p.input_value("#sfi-breeding")))
        p.click("#sp-form [data-trl=pl]"); print("PL kept:", repr(p.input_value("#sfi-breeding")))
        p.locator(".tr-switch").screenshot(path=f"{out}/tr_sw_{tag}.png")
        p.click("#sp-save"); p.wait_for_timeout(800)
        print("db breeding:", json.dumps(p.evaluate("__mock.db.species[0].info.breeding"), ensure_ascii=False))
        p.evaluate("document.querySelector('[data-lang=en]').click()"); p.wait_for_timeout(200)
        print("EN card:", p.locator("#sp-body .si-card:has-text('[pl|en]')").inner_text().replace('\n', ' / '))
        p.screenshot(path=f"{out}/tr_card_{tag}.png")
        # edit EN by hand, then PL again: EN must stay
        p.click("#sp-body [data-sp-edit]"); p.wait_for_timeout(200); p.evaluate("document.getElementById('sp-more').open = true")
        p.fill("#sfi-breeding", "Nest in a tree, hand fixed."); p.click("#sp-save"); p.wait_for_timeout(600)
        p.evaluate("document.querySelector('[data-lang=pl]').click()"); p.wait_for_timeout(200)
        p.click("#sp-body [data-sp-edit]"); p.wait_for_timeout(200); p.evaluate("document.getElementById('sp-more').open = true")
        p.fill("#sfi-breeding", "Gniazdo w dziupli."); p.click("#sp-save"); p.wait_for_timeout(600)
        print("after 2 edits:", json.dumps(p.evaluate("__mock.db.species[0].info.breeding"), ensure_ascii=False))
        # bird locks
        p.click(".tab[data-tab=menu]"); p.wait_for_timeout(100)
        p.evaluate("openBirdForm(null)"); p.wait_for_timeout(200)
        print("bird locks:", p.locator("#bird-form input[name=lk]").count())
        p.fill("#bf-name", "Test" + tag); p.select_option("#bf-sp", sid); p.fill("#bf-note", "Важно")
        p.click("#bird-form .lk:has(input[value=note])"); p.click("#bf-save"); p.wait_for_timeout(600)
        print("bird db locked:", p.evaluate("JSON.stringify(__mock.db.collection.slice(-1)[0].locked)"))
        p.screenshot(path=f"{out}/bird_lk_{tag}.png")
        p.evaluate("openEnclForm(null)"); p.wait_for_timeout(200)
        print("place locks:", p.locator("#encl-form input[name=lk]").count())
        p.evaluate("closeSheets()")
        p.click(".tab[data-tab=menu]"); p.click("[data-view=log]"); p.wait_for_timeout(200)
        print("chips:", p.locator("#lg-chips .chip").all_inner_texts(), "| ver:", p.inner_text("#app-ver") if p.locator("#app-ver").count() else None)
        p.click("#lg-chips [data-lgf=ai]"); print("ai rows:", p.locator("#log-body .lg-row").count(), p.locator("#log-body .lg-row").first.inner_text().replace('\n', ' '))
        p.click("#lg-chips [data-lgf=dev]"); p.screenshot(path=f"{out}/log_{tag}.png")
        p.close()
    b.close()
print("ERRORS:", errors)
