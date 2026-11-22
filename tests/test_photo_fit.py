# a tall species photo is shown whole (fit by height), a wide one fills the frame
import pathlib
exec(open(pathlib.Path(__file__).resolve().parent / 'test_encl.py').read().split("with sync_playwright() as pw:")[0])
SVG = lambda w, h, c: f"<svg xmlns='http://www.w3.org/2000/svg' width='{w}' height='{h}'><rect width='{w}' height='{h}' fill='{c}'/><circle cx='{w//2}' cy='{h//2}' r='{min(w,h)//3}' fill='white'/></svg>"
svg = lambda w, h, c: f"https://zoo.test/img_{w}x{h}_{c}.svg"
PRE = f"""() => {{ const s = __mock.db.species; s[0].info = Object.assign({{}}, s[0].info, {{photo: {{src: "{svg(300, 600, 'teal')}"}}}}); s[1].info = Object.assign({{}}, s[1].info, {{photo: {{src: "{svg(800, 500, 'olive')}"}}}}); }}"""
with sync_playwright() as pw:
    b = pw.chromium.launch(**CHROME, args=["--no-sandbox"])
    for (w, hgt, tag) in [(390, 844, 'm'), (1400, 950, 'd')]:
        p = page(b, w, hgt, pre=PRE)
        for (ww, hh, cc) in [(300, 600, 'teal'), (800, 500, 'olive')]:
            p.route(svg(ww, hh, cc), (lambda body: (lambda r: r.fulfill(status=200, content_type="image/svg+xml", body=body)))(SVG(ww, hh, cc)))
        for i, want in [(0, True), (1, False)]:
            p.evaluate(f"openCard('sp', __mock.db.species[{i}].id)"); p.wait_for_timeout(500)
            tall = p.evaluate("document.querySelector('.sp-photo img').classList.contains('tall')")
            fit = p.evaluate("getComputedStyle(document.querySelector('.sp-photo img')).objectFit")
            print(tag, "species", i, "tall:", tall, fit); assert tall == want
            p.screenshot(path=f"{out}/pf_{tag}_{i}.png", full_page=False)
        p.close()
    b.close()
print("ERRORS:", errors)
