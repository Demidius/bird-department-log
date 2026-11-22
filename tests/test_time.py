# a record needs only the date; the time of day is added on request ("+ Podaj godzinę")
import pathlib
exec(open(pathlib.Path(__file__).resolve().parent / 'test_encl.py').read().split("with sync_playwright() as pw:")[0])
with sync_playwright() as pw:
    b = pw.chromium.launch(**CHROME, args=["--no-sandbox"])
    for (w, hgt, tag) in [(390, 844, 'm'), (1400, 950, 'd')]:
        p = page(b, w, hgt)
        lab = p.evaluate("__mock.db.species[0].name_pl"); add_bird(p, "Samica A", lab)
        def new_obs(note, time=None):
            p.click(".tab[data-tab=add]"); p.click("[data-new=obs]"); p.wait_for_timeout(200)
            p.select_option("#fld-birdsel", label="Samica A"); p.fill("#fld-note", note)
            if time: p.click("#fld-time-tg"); p.fill("#fld-time", time)
            p.click("#f-save"); p.wait_for_timeout(400)
        p.click(".tab[data-tab=add]"); p.click("[data-new=obs]"); p.wait_for_timeout(200)
        print(tag, "time hidden by default:", not p.is_visible("#fld-time"), "| date:", p.input_value("#fld-date"))
        p.screenshot(path=f"{out}/tm_{tag}_form.png", full_page=False); esc_close(p)
        new_obs("bez godziny")
        r1 = p.evaluate("__mock.db.records.find(r => r.note === 'bez godziny')"); print(tag, "no time:", r1["f"], "hour:", p.evaluate(f"new Date('{r1['event_at']}').getHours()"))
        assert r1["f"].get("nt") == 1
        new_obs("z godziną", "08:15")
        r2 = p.evaluate("__mock.db.records.find(r => r.note === 'z godziną')"); print(tag, "with time:", r2["f"], p.evaluate(f"new Date('{r2['event_at']}').toTimeString().slice(0,5)"))
        assert "nt" not in r2["f"]
        p.click(".tab[data-tab=logs]"); p.wait_for_timeout(300)
        times = p.eval_on_selector_all("#logs-body .rec time", "e => e.map(x => x.innerText)"); print(tag, "shown times:", times)
        assert "" in times and any(":" in x for x in times)
        p.locator("#logs-body .rec:has-text('bez godziny')").click(); p.wait_for_timeout(300)
        print(tag, "edit keeps no time:", not p.is_visible("#fld-time")); assert not p.is_visible("#fld-time")
        esc_close(p); p.close()
    b.close()
print("ERRORS:", errors)
