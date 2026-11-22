# menu -> missing data: kinds of data with the species lacking them; tap a species -> its form at that field
import pathlib
exec(open(pathlib.Path(__file__).resolve().parent / 'test_encl.py').read().split("with sync_playwright() as pw:")[0])
PRE = """() => { const sp = __mock.db.species; sp[0].info = Object.assign({}, sp[0].info, {fledge_days: 12}); }"""
with sync_playwright() as pw:
    b = pw.chromium.launch(**CHROME, args=["--no-sandbox"])
    for (w, hgt, tag) in [(390, 844, 'm'), (1400, 950, 'd')]:
        p = page(b, w, hgt, pre=PRE)
        p.click(".tab[data-tab=menu]"); p.wait_for_timeout(200)
        print(tag, "menu row:", p.inner_text("#gaps-count"))
        p.click("[data-view=gaps]"); p.wait_for_timeout(300)
        kinds = p.eval_on_selector_all("#gaps-body details summary", "e => e.map(x => x.innerText.replace(/\\n/g, ' '))")
        print(tag, "kinds with gaps:", kinds[:6], "... total", len(kinds), "| complete:", p.locator("#gaps-body .gap-ok").count())
        n_sp = p.evaluate("__mock.db.species.length")
        fl = p.locator("#gaps-body details[data-gap=fledge_days]")
        cnt = int(fl.locator(".nc").inner_text()); print(tag, "fledge missing:", cnt, "of", n_sp); assert cnt == n_sp - 1
        assert not fl.locator(".gap-list").is_visible()
        fl.locator("summary").click(); p.wait_for_timeout(200)
        print(tag, "opens list:", fl.locator(".gap-list .row").count())
        p.screenshot(path=f"{out}/gp_{tag}_list.png", full_page=False)
        first = fl.locator(".gap-list .row").first; sid = first.get_attribute("data-gap-sp")
        first.click(); p.wait_for_timeout(700)
        print(tag, "form open:", p.is_visible("#sheet-sp.open") or p.is_visible(".sheet.open"), "| field flashed:", p.evaluate("!!document.querySelector('#sfi-fledge_days').closest('.fld.flash')"))
        p.screenshot(path=f"{out}/gp_{tag}_form.png", full_page=False)
        p.fill("#sfi-fledge_days", "20"); p.click("#sp-save"); p.wait_for_timeout(500)
        if p.is_visible(".sheet.open"): esc_close(p)
        p.click(".tab[data-tab=menu]"); p.click("[data-view=gaps]"); p.wait_for_timeout(300)
        cnt2 = int(p.locator("#gaps-body details[data-gap=fledge_days] .nc").inner_text()); print(tag, "after filling:", cnt2); assert cnt2 == cnt - 1
        print(tag, "stays open:", p.evaluate("document.querySelector('#gaps-body details[data-gap=fledge_days]').open"))
        p.close()
    b.close()
print("ERRORS:", errors)
