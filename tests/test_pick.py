# long selects (species, animals, parents, places) open a list with search; the keyboard is not opened by itself
import pathlib
exec(open(pathlib.Path(__file__).resolve().parent / 'test_encl.py').read().split("with sync_playwright() as pw:")[0])
with sync_playwright() as pw:
    b = pw.chromium.launch(**CHROME, args=["--no-sandbox"])
    for (w, hgt, tag) in [(390, 844, 'm'), (1400, 950, 'd')]:
        p = page(b, w, hgt)
        p.click(".tab[data-tab=add]"); p.click("[data-new=obs]"); p.wait_for_timeout(200)
        p.click("#fld-sp"); p.wait_for_timeout(200)
        print(tag, "picker open:", p.is_visible("#pick"), "| title:", p.inner_text("#pick-t"), "| items:", p.locator("#pick-list .pick-o").count(), "| search not focused:", p.evaluate("document.activeElement.id") != "pick-q")
        assert p.is_visible("#pick") and p.evaluate("document.activeElement.id") != "pick-q"
        p.screenshot(path=f"{out}/pk_{tag}_open.png", full_page=False)
        latin = p.evaluate("__mock.db.species[3].latin"); pl = p.evaluate("__mock.db.species[3].name_pl")
        p.fill("#pick-q", latin.split()[0][:5].lower()); p.wait_for_timeout(100)
        found = p.eval_on_selector_all("#pick-list .pick-o", "e => e.map(x => x.textContent)"); print(tag, "search by latin", latin, "->", found)
        assert pl in found
        p.screenshot(path=f"{out}/pk_{tag}_search.png", full_page=False)
        p.click(f"#pick-list .pick-o:text-is('{pl}')"); p.wait_for_timeout(150)
        print(tag, "picked:", p.evaluate("(() => { const s = document.querySelector('#fld-sp'); return s.selectedOptions[0].textContent; })()"), "| closed:", not p.is_visible("#pick"))
        assert not p.is_visible("#pick")
        p.click("#fld-sp"); p.wait_for_timeout(150); p.keyboard.press("Escape"); p.wait_for_timeout(150)
        print(tag, "Esc closes only the list:", not p.is_visible("#pick"), p.is_visible("#sheet-form.open")); assert p.is_visible("#sheet-form.open")
        p.click("#fld-sex") if p.locator("#fld-sex").count() else None
        esc_close(p); p.close()
    # phone with touch: a tap opens the list, a scroll does not
    ctx = b.new_context(viewport={"width": 390, "height": 844}, has_touch=True, is_mobile=True, locale="ru-RU")
    class TB:
        def new_page(self, **kw): return ctx.new_page()
    p = page(TB(), 390, 844)
    p.tap(".tab[data-tab=add]"); p.tap("[data-new=obs]"); p.wait_for_timeout(300)
    p.tap("#fld-sp"); p.wait_for_timeout(300)
    print("touch: tap opens list:", p.is_visible("#pick"), "| keyboard target not search:", p.evaluate("document.activeElement.id") != "pick-q")
    assert p.is_visible("#pick")
    p.tap("#pick-q"); print("touch: tap on search focuses it:", p.evaluate("document.activeElement.id") == "pick-q")
    p.close(); ctx.close()
    b.close()
print("ERRORS:", errors)
