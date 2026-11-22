import re, pathlib, sys
exec(open(pathlib.Path(__file__).resolve().parent / 'test_encl.py').read().split("with sync_playwright() as pw:")[0])
PRE = """() => { const s = __mock.db.species[0]; s.info = Object.assign({}, s.info, {photo: {src: 'https://upload.example.org/a.jpg', credit: 'X'}, diet_zoo: 'Старый текст'}); }"""
import base64
_JPG = base64.b64decode("/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==")
IMGS = []
for _n in ("p1.jpg", "p2.jpg"):
    (out / _n).write_bytes(_JPG); IMGS.append(str(out / _n))
with sync_playwright() as pw:
    b = pw.chromium.launch(**CHROME, args=["--no-sandbox"])
    for w, h, tag in [(390, 844, 'm'), (1280, 900, 'd')]:
        p = page(b, w, h, pre=PRE)
        p.click(".tab[data-tab=menu]"); p.click("[data-view=species]"); p.wait_for_timeout(150)
        p.click("#species-body [data-sp='%s']" % p.evaluate("__mock.db.species[0].id")); p.wait_for_timeout(150)
        p.click("#sp-body [data-sp-edit]"); p.wait_for_timeout(200)
        p.evaluate("document.getElementById('sp-more').open = true")
        print("locks in form:", p.locator("#sp-form input[name=lk]").count(), "| hint:", p.inner_text(".lk-all-box")[:60])
        p.fill("#sfi-diet_zoo", "У нас: мышь 2 шт. в день"); p.click("#sp-form .lk:has(input[value=diet_zoo])"); p.click("#sp-form .lk:has(input[value=name_en])")
        print("all after 2:", p.is_checked("#sp-form input[value='*']"))
        p.screenshot(path=f"{out}/lk_top_{tag}.png"); p.locator("#sp-form .fld:has(#sfi-diet_zoo)").screenshot(path=f"{out}/lk_field_{tag}.png")
        p.check("#sp-form input[value='*']"); print("all checks all:", p.locator("#sp-form input[name=lk]:checked").count(), "/", p.locator("#sp-form input[name=lk]").count())
        p.uncheck("#sp-form input[value='*']"); p.click("#sp-form .lk:has(input[value=diet_zoo])"); p.click("#sp-form .lk:has(input[value=note])")
        print("photo tiles before:", p.locator("#sp-ph .ph").count(), "| wiki main:", p.locator("#sp-ph .ph-star.on").count())
        p.set_input_files("#sp-ph input[type=file]", IMGS); p.wait_for_timeout(800)
        print("photo tiles after upload:", p.locator("#sp-ph .ph").count())
        p.locator("#sp-ph [data-star]").nth(1).click(); p.wait_for_timeout(100)
        p.screenshot(path=f"{out}/lk_form_{tag}.png", full_page=False)
        p.click("#sp-save"); p.wait_for_timeout(800)
        sp = p.evaluate("JSON.stringify({l: __mock.db.species[0].info.locked, m: __mock.db.species[0].info.main, d: __mock.db.species[0].info.diet_zoo, ph: __mock.db.photos.map(x => x.id)})")
        print("db:", sp)
        print("card lock marks:", p.locator("#sp-body .lk-i").count(), "| main is dept:", p.locator("#sp-body .sp-photo > .ph-open img[data-path]").count(), "| strip:", p.locator("#sp-body .sp-strip .ph-open").count())
        p.screenshot(path=f"{out}/lk_card_{tag}.png", full_page=False)
        # remove wiki photo and one uploaded
        p.click("#sp-body [data-sp-edit]"); p.wait_for_timeout(200)
        p.click("#sp-ph [data-rmw]"); p.wait_for_timeout(100)
        print("after wiki rm tiles:", p.locator("#sp-ph .ph").count(), "| src field:", repr(p.input_value("#sfi-photo-src")))
        p.click("#sp-save"); p.wait_for_timeout(600)
        print("db photo:", p.evaluate("JSON.stringify(__mock.db.species[0].info.photo || null)"), "| strip now:", p.locator("#sp-body .sp-strip .ph-open").count())
        p.click(".tab[data-tab=menu]"); p.click("[data-view=species]"); p.wait_for_timeout(200)
        print("list thumb is dept:", p.locator("#species-body [data-sp='%s'] img[data-path]" % p.evaluate("__mock.db.species[0].id")).count())
        p.close()
    b.close()
print("ERRORS:", errors)
