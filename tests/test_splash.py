import re, pathlib, sys, json
exec(open(pathlib.Path(__file__).resolve().parent / 'test_encl.py').read().split("with sync_playwright() as pw:")[0])
with sync_playwright() as pw:
    b = pw.chromium.launch(**CHROME, args=["--no-sandbox"])
    p = page(b, 390, 844)
    print("ready after load:", p.evaluate("document.body.classList.contains('ready')"))
    p.evaluate("document.body.classList.remove('ready')"); p.wait_for_timeout(500)
    p.screenshot(path=str(out)+"/splash1.png"); p.wait_for_timeout(330); p.screenshot(path=str(out)+"/splash2.png")
    p.evaluate("document.body.classList.add('ready')"); p.wait_for_timeout(500)
    # back navigation
    p.click(".tab[data-tab=menu]"); p.wait_for_timeout(100); p.click("[data-view=species]"); p.wait_for_timeout(150)
    sid = p.evaluate("__mock.db.species[0].id"); p.click("#species-body [data-sp='%s']" % sid); p.wait_for_timeout(150)
    print("tab:", p.evaluate("document.querySelector('.view:not([hidden])').id"), "hist:", p.evaluate("history.length"))
    p.go_back(); p.wait_for_timeout(200); print("after back:", p.evaluate("document.querySelector('.view:not([hidden])').id"))
    p.go_back(); p.wait_for_timeout(200); print("after back:", p.evaluate("document.querySelector('.view:not([hidden])').id"))
    p.go_back(); p.wait_for_timeout(200); print("after back:", p.evaluate("document.querySelector('.view:not([hidden])').id"))
    p.click("#species-body [data-sp]") if p.evaluate("document.querySelector('.view:not([hidden])').id")=='view-species' else None
    # sheet open + back
    p.evaluate("openBirdForm(null)"); p.wait_for_timeout(200); p.fill("#bf-name", "x")
    p.go_back(); p.wait_for_timeout(250); print("sheet back -> confirm shown:", p.is_visible("#cfm"), "| url still app:", p.url.endswith('/') or 'index' in p.url)
    p.click("#cfm-ok"); p.wait_for_timeout(200); print("sheet open:", p.locator(".sheet.open").count(), "tab:", p.evaluate("document.querySelector('.view:not([hidden])').id"))
    for i in range(6):
        p.go_back(); p.wait_for_timeout(200)
        if p.is_visible("#cfm"): print("exit confirm after", i+1, "backs:", p.inner_text("#cfm-t")); break
    p.click("#cfm-no"); p.wait_for_timeout(200); print("stayed, tab:", p.evaluate("document.querySelector('.view:not([hidden])').id"), "cfm hidden:", not p.is_visible("#cfm"))
    p.close(); b.close()
print("ERRORS:", errors)
